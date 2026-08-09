import { toPlainDateTimeString } from "~/date/parse";
import { constraintModule } from "~/kernel/modules";
import type { KernelEvent } from "~/kernel";
import type { ConstraintModuleApi } from "~/kernel/modules";
import type { ConstraintConflict } from "~/validation/constraints";
import type { Event, Resource, SchedulingConstraint } from "../types";
import type { CalendarFeature } from "./types";

export interface ConstraintApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  checkEventConstraint: (
    event: TEvent,
    newStart?: string,
    newEnd?: string,
    newConstraint?: SchedulingConstraint,
  ) => ConstraintConflict | null;
}

export function schedulingConstraintFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  ConstraintModuleApi,
  ConstraintApi<TResource, TEvent>,
  "constraint"
> {
  return {
    name: "constraint",
    module: () => constraintModule<TEvent & KernelEvent>(),
    api: (_host, module) => ({
      checkEventConstraint: (event, newStart, newEnd, newConstraint) =>
        module.evaluateConstraint({
          id: event.id,
          title: event.title,
          start: newStart ?? toPlainDateTimeString(event.start),
          end: newEnd ?? toPlainDateTimeString(event.end),
          constraint: newConstraint ?? event.constraint,
        }),
    }),
  };
}
