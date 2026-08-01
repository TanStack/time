import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import { splitEventsByDay, type SplittableEvent } from "./splitMultiDay";

export type DayBuckets<E> = Map<string, Array<E>>;

export function bucketByDay<E extends SplittableEvent>(
  events: Array<E>,
  timeZone: Temporal.TimeZoneLike,
): DayBuckets<E> {
  const buckets: DayBuckets<E> = new Map();

  for (const event of splitEventsByDay(events, timeZone)) {
    const dateKey = Temporal.PlainDateTime.from(
      toPlainDateTimeString(event.start),
    )
      .toPlainDate()
      .toString({ calendarName: "never" });

    let bucket = buckets.get(dateKey);
    if (!bucket) {
      bucket = [];
      buckets.set(dateKey, bucket);
    }
    bucket.push(event);
  }

  return buckets;
}

export interface DayView<E> {
  isoDate: string;
  events: Array<E>;
  allDayEvents: Array<E>;
  isToday: boolean;
  isInCurrentPeriod: boolean;
}

export interface BuildDaysInput<E extends SplittableEvent> {
  isoDates: Array<string>;
  events: Array<E>;
  timeZone: Temporal.TimeZoneLike;
  today?: string;
  isInCurrentPeriod?: (isoDate: string) => boolean;
}

export function buildDays<E extends SplittableEvent>(
  input: BuildDaysInput<E>,
): Array<DayView<E>> {
  const buckets = bucketByDay(input.events, input.timeZone);
  const today =
    input.today ?? Temporal.Now.plainDateISO().toString({ calendarName: "never" });

  return input.isoDates.map((isoDate) => {
    const dailyEvents = buckets.get(isoDate) ?? [];
    const events: Array<E> = [];
    const allDayEvents: Array<E> = [];

    for (const event of dailyEvents) {
      if (event.allDay) allDayEvents.push(event);
      else events.push(event);
    }

    return {
      isoDate,
      events,
      allDayEvents,
      isToday: isoDate === today,
      isInCurrentPeriod: input.isInCurrentPeriod?.(isoDate) ?? true,
    };
  });
}
