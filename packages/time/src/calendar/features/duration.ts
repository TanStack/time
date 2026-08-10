import { toPlainDateTimeString } from "~/date/parse";
import { durationModule } from "~/kernel/modules";
import type { KernelEvent } from "~/kernel";
import type { DurationModuleApi } from "~/kernel/modules";
import type { DurationConflict } from "~/validation/duration";
import type { Event, Resource } from "../types";
import type { CalendarFeature } from "./types";

export interface DurationApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getWorkingDuration: (
    event: TEvent,
    newStart?: string,
    newEnd?: string,
  ) => number;
  checkEventDuration: (
    event: TEvent,
    newStart?: string,
    newEnd?: string,
    newResources?: Array<TResource | string>,
  ) => Array<DurationConflict>;
}

export function eventDurationFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  DurationModuleApi,
  DurationApi<TResource, TEvent>,
  "duration"
> {
  const spanOf = (event: TEvent, newStart?: string, newEnd?: string) => ({
    start: newStart ?? toPlainDateTimeString(event.start),
    end: newEnd ?? toPlainDateTimeString(event.end),
  });

  return {
    name: "duration",
    module: (ctx) =>
      durationModule<TEvent & KernelEvent>({
        resources: () => ctx.getResources(),
        workingTime: () => ctx.getWorkingTime(),
      }),
    api: (_host, module) => ({
      getWorkingDuration: (event, newStart, newEnd) =>
        module.getWorkingDuration({
          ...spanOf(event, newStart, newEnd),
          resources: event.resources,
          calendarId: event.calendarId,
        }),
      checkEventDuration: (event, newStart, newEnd, newResources) =>
        module.evaluateDuration({
          id: event.id,
          title: event.title,
          ...spanOf(event, newStart, newEnd),
          resources: newResources ?? event.resources,
          calendarId: event.calendarId,
          duration: event.duration,
          effort: event.effort,
        }),
    }),
  };
}
