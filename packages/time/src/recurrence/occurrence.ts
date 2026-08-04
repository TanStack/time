import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import { expandRecurringEvent } from "./expandRecurringEvent";
import type { Event, Resource } from "~/calendar/types";

const OCCURRENCE_ID = /^(.+)_\d+$/;

const DEFAULT_HORIZON_YEARS = 4;

const isoDateOf = (value: string | Date | number): string =>
  toPlainDateTimeString(value).slice(0, 10);

export function masterIdOf(eventId: string): string {
  return eventId.match(OCCURRENCE_ID)?.[1] ?? eventId;
}

export function nextOccurrenceDate<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  master: TEvent,
  fromIsoDate: string,
  horizonYears: number = DEFAULT_HORIZON_YEARS,
): string | null {
  if (!master.recurrence) return null;

  const from = Temporal.PlainDate.from(fromIsoDate);
  const occurrences = expandRecurringEvent<TResource, TEvent>(
    master,
    from.add({ days: 1 }).toString({ calendarName: "never" }),
    from.add({ years: horizonYears }).toString({ calendarName: "never" }),
  );

  const first = occurrences[0];
  return first ? isoDateOf(first.start) : null;
}

export function previousOccurrenceDate<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(master: TEvent, fromIsoDate: string): string | null {
  if (!master.recurrence) return null;

  const masterStart = isoDateOf(master.start);
  if (masterStart >= fromIsoDate) return null;

  const earlier = expandRecurringEvent<TResource, TEvent>(
    master,
    masterStart,
    fromIsoDate,
  )
    .map((occurrence) => isoDateOf(occurrence.start))
    .filter((isoDate) => isoDate < fromIsoDate);

  return earlier.at(-1) ?? null;
}
