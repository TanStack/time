import { toPlainDateTimeString } from "~/date/parse";
import { checkDuration, workingMinutesBetween } from "~/validation/duration";
import type { WorkingTimeConfig } from "~/validation/availability";
import type {
  DurationConflict,
  DurationResourceInput,
} from "~/validation/duration";
import type { Conflict, KernelEvent, Module } from "../types";

interface DurationKernelEvent extends KernelEvent {
  title?: string;
  resources?: Array<DurationResourceInput | string>;
  calendarId?: string;
  duration?: number;
  effort?: number;
}

export interface DurationModuleOptions {
  resources:
    | Array<DurationResourceInput>
    | (() => Array<DurationResourceInput>);
  workingTime: WorkingTimeConfig | (() => WorkingTimeConfig);
  priority?: number;
}

export interface DurationQuery {
  id?: string;
  title: string;
  start: string;
  end: string;
  resources?: Array<DurationResourceInput | string>;
  calendarId?: string;
  duration?: number;
  effort?: number;
}

export interface DurationModuleApi {
  evaluateDuration: (event: DurationQuery) => Array<DurationConflict>;
  getWorkingDuration: (range: {
    start: string;
    end: string;
    resources?: Array<DurationResourceInput | string>;
    calendarId?: string;
  }) => number;
}

function toConflict(conflict: DurationConflict): Conflict {
  return {
    code: `duration/${conflict.reason}`,
    message: conflict.message,
    eventIds: [conflict.eventId],
    detail: conflict,
  };
}

export function durationModule<E extends KernelEvent>(
  options: DurationModuleOptions,
): Module<E, DurationModuleApi> {
  const knownResources = (): Array<DurationResourceInput> =>
    typeof options.resources === "function"
      ? options.resources()
      : options.resources;

  const workingTime = (): WorkingTimeConfig =>
    typeof options.workingTime === "function"
      ? options.workingTime()
      : options.workingTime;

  const resolveResources = (
    resources: Array<DurationResourceInput | string> | undefined,
  ): Array<DurationResourceInput> => {
    const known = knownResources();
    return (resources ?? []).map((resource) =>
      typeof resource === "string"
        ? (known.find((candidate) => candidate.id === resource) ?? {
            id: resource,
          })
        : resource,
    );
  };

  const evaluate = (event: DurationKernelEvent): Array<DurationConflict> =>
    checkDuration({
      event: {
        id: event.id,
        title: event.title ?? event.id,
        start: toPlainDateTimeString(event.start),
        end: toPlainDateTimeString(event.end),
        calendarId: event.calendarId,
        duration: event.duration,
        effort: event.effort,
      },
      resources: resolveResources(event.resources),
      workingTime: workingTime(),
    });

  return {
    name: "duration",
    api: () => ({
      evaluateDuration: (event) =>
        evaluate(event as unknown as DurationKernelEvent),
      getWorkingDuration: (range) =>
        workingMinutesBetween(
          {
            start: toPlainDateTimeString(range.start),
            end: toPlainDateTimeString(range.end),
          },
          resolveResources(range.resources),
          workingTime(),
          range.calendarId,
        ),
    }),
    contributions: [
      {
        pipeline: "write",
        kind: "validate",
        stage: "duration-validate",
        priority: options.priority,
        run: (batch) => {
          const conflicts: Array<Conflict> = [];

          for (const op of batch.ops) {
            if (op.kind === "remove" || op.kind === "intent") continue;
            const event = (
              op.kind === "add" ? op.event : op.after
            ) as DurationKernelEvent;

            for (const conflict of evaluate(event)) {
              conflicts.push(toConflict(conflict));
            }
          }

          return conflicts;
        },
      },
    ],
  };
}
