import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import {
  propagateToDependents,
  propagateToPredecessors,
  type CascadeShift,
  type DependencyGraphEvent,
  type DependencyLink,
} from "~/validation/dependency";
import type { KernelEvent, Module, WriteOp } from "../types";

interface DependencyEvent extends KernelEvent {
  title?: string;
  dependsOn?: Array<DependencyLink>;
}

export interface DependencyModuleOptions {
  timeZone?: Temporal.TimeZoneLike;
  priority?: number;
}

function epochMs(value: unknown, timeZone: Temporal.TimeZoneLike): number {
  return Temporal.PlainDateTime.from(
    toPlainDateTimeString(value as string | Date | number),
  ).toZonedDateTime(timeZone).epochMilliseconds;
}

function toGraph(events: Array<DependencyEvent>): Array<DependencyGraphEvent> {
  return events.map((e) => ({
    id: e.id,
    title: e.title ?? e.id,
    start: toPlainDateTimeString(e.start),
    end: toPlainDateTimeString(e.end),
    dependsOn: e.dependsOn,
  }));
}

function withSource(
  graph: Array<DependencyGraphEvent>,
  sourceId: string,
  after: DependencyEvent,
): Array<DependencyGraphEvent> {
  return graph.map((event) =>
    event.id === sourceId
      ? {
          ...event,
          start: toPlainDateTimeString(after.start),
          end: toPlainDateTimeString(after.end),
        }
      : event,
  );
}

function applyShifts(
  graph: Array<DependencyGraphEvent>,
  shifts: Array<CascadeShift>,
): Array<DependencyGraphEvent> {
  if (shifts.length === 0) return graph;
  const byId = new Map(shifts.map((shift) => [shift.id, shift]));
  return graph.map((event) => {
    const shift = byId.get(event.id);
    return shift
      ? { ...event, start: shift.newStart, end: shift.newEnd }
      : event;
  });
}

export function dependencyModule<E extends KernelEvent>(
  options: DependencyModuleOptions = {},
): Module<E> {
  const timeZone = options.timeZone ?? "UTC";

  return {
    name: "dependency",
    contributions: [
      {
        pipeline: "write",
        kind: "transform",
        stage: "schedule",
        priority: options.priority,
        run: (batch, ctx) => {
          const extraOps: Array<WriteOp<E>> = [];

          for (const op of batch.ops) {
            if (op.kind !== "update") continue;

            const startChanged =
              epochMs(op.after.start, timeZone) !==
              epochMs(op.before.start, timeZone);
            const endChanged =
              epochMs(op.after.end, timeZone) !==
              epochMs(op.before.end, timeZone);
            if (!startChanged && !endChanged) continue;

            const graph = withSource(
              toGraph(ctx.getEvents() as Array<DependencyEvent>),
              op.id,
              op.after as DependencyEvent,
            );
            const visited = new Set([op.id]);
            const shifts: Array<CascadeShift> = [];

            if (startChanged) {
              shifts.push(
                ...propagateToPredecessors({
                  sourceId: op.id,
                  events: graph,
                  timeZone,
                  visited,
                }),
              );
            }

            shifts.push(
              ...propagateToDependents({
                sourceId: op.id,
                events: applyShifts(graph, shifts),
                timeZone,
                visited,
              }),
            );

            for (const shift of shifts) {
              const before = ctx.getEvent(shift.id);
              if (!before) continue;
              extraOps.push({
                kind: "update",
                id: shift.id,
                before,
                after: {
                  ...before,
                  start: shift.newStart,
                  end: shift.newEnd,
                },
              });
            }
          }

          if (extraOps.length === 0) return batch;
          return { ...batch, ops: [...batch.ops, ...extraOps] };
        },
      },
    ],
  };
}
