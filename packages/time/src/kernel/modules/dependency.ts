import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import {
  computeCascade,
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
            const deltaMs =
              epochMs(op.after.start, timeZone) -
              epochMs(op.before.start, timeZone);
            if (deltaMs === 0) continue;

            const shifts = computeCascade({
              sourceId: op.id,
              deltaMs,
              events: toGraph(ctx.getEvents() as Array<DependencyEvent>),
              timeZone,
            });

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
