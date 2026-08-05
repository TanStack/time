import { toPlainDateTimeString } from "~/date/parse";
import { recurrenceModule } from "~/kernel/modules";
import {
  masterIdOf,
  nextOccurrenceDate,
  previousOccurrenceDate,
} from "~/recurrence";
import type { KernelEvent } from "~/kernel";
import type { RecurrenceApi } from "~/kernel/modules";
import type { Event, EventDateTimeInput, Resource } from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

export interface RecurrenceNavigationApi {
  goToNextOccurrence: (eventId: string, fromDate?: EventDateTimeInput) => void;
  goToPreviousOccurrence: (
    eventId: string,
    fromDate?: EventDateTimeInput,
  ) => void;
}

export function eventRecurrenceFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  RecurrenceApi<TEvent & KernelEvent>,
  RecurrenceNavigationApi
> {
  const resolveMaster = (
    host: CalendarHost<TResource, TEvent>,
    eventId: string,
  ): TEvent | undefined =>
    host.getEvent(eventId) ?? host.getEvent(masterIdOf(eventId));

  const cursor = (
    host: CalendarHost<TResource, TEvent>,
    fromDate?: EventDateTimeInput,
  ): string =>
    fromDate
      ? toPlainDateTimeString(fromDate).slice(0, 10)
      : host.getActiveDate();

  return {
    name: "recurrence",
    module: recurrenceModule<TEvent & KernelEvent>(),
    api: (host) => ({
      goToNextOccurrence: (eventId, fromDate) => {
        const master = resolveMaster(host, eventId);
        if (!master) return;

        const next = nextOccurrenceDate<TResource, TEvent>(
          master,
          cursor(host, fromDate),
        );
        if (next) host.goToSpecificPeriod(next);
      },
      goToPreviousOccurrence: (eventId, fromDate) => {
        const master = resolveMaster(host, eventId);
        if (!master) return;

        const previous = previousOccurrenceDate<TResource, TEvent>(
          master,
          cursor(host, fromDate),
        );
        if (previous) host.goToSpecificPeriod(previous);
      },
    }),
  };
}
