import { toPlainDateTimeString } from "~/date/parse";
import { checkConstraint } from "~/validation/constraints";
import type {
  ConstraintConflict,
  SchedulingConstraint,
} from "~/validation/constraints";
import type { Conflict, KernelEvent, Module } from "../types";

interface ConstrainedKernelEvent extends KernelEvent {
  title?: string;
  constraint?: SchedulingConstraint;
}

export interface ConstraintModuleOptions {
  priority?: number;
}

export interface ConstraintQuery {
  id?: string;
  title: string;
  start: string;
  end: string;
  constraint?: SchedulingConstraint;
}

export interface ConstraintModuleApi {
  evaluateConstraint: (event: ConstraintQuery) => ConstraintConflict | null;
}

function evaluate(event: ConstrainedKernelEvent): ConstraintConflict | null {
  return checkConstraint({
    id: event.id,
    title: event.title ?? event.id,
    start: toPlainDateTimeString(event.start),
    end: toPlainDateTimeString(event.end),
    constraint: event.constraint,
  });
}

function toConflict(conflict: ConstraintConflict): Conflict {
  return {
    code: `constraint/${conflict.type}`,
    message: conflict.message,
    eventIds: [conflict.eventId],
    detail: conflict,
  };
}

export function constraintModule<E extends KernelEvent>(
  options: ConstraintModuleOptions = {},
): Module<E, ConstraintModuleApi> {
  return {
    name: "constraint",
    api: () => ({
      evaluateConstraint: (event) =>
        checkConstraint({
          id: event.id,
          title: event.title,
          start: toPlainDateTimeString(event.start),
          end: toPlainDateTimeString(event.end),
          constraint: event.constraint,
        }),
    }),
    contributions: [
      {
        pipeline: "write",
        kind: "validate",
        stage: "constraint-validate",
        priority: options.priority,
        run: (batch) => {
          const conflicts: Array<Conflict> = [];

          for (const op of batch.ops) {
            if (op.kind === "remove" || op.kind === "intent") continue;
            const event = (
              op.kind === "add" ? op.event : op.after
            ) as ConstrainedKernelEvent;

            const conflict = evaluate(event);
            if (conflict) conflicts.push(toConflict(conflict));
          }

          return conflicts;
        },
      },
    ],
  };
}
