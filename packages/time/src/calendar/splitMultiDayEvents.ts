import { Temporal } from "@js-temporal/polyfill";
import type { Event, Resource } from "./types";
import { endOf, startOf, toPlainDateTimeString } from "~/date";

export const splitMultiDayEvents = <
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  event: TEvent,
  timeZone: Temporal.TimeZoneLike,
): Array<TEvent> => {
  const startDate = Temporal.PlainDateTime.from(
    toPlainDateTimeString(event.start),
  ).toZonedDateTime(timeZone);
  const endDate = Temporal.PlainDateTime.from(
    toPlainDateTimeString(event.end),
  ).toZonedDateTime(timeZone);
  const events: Array<TEvent> = [];

  let currentDay = startDate;
  while (Temporal.ZonedDateTime.compare(currentDay, endDate) < 0) {
    const startOfDay = startOf(currentDay, { unit: "day" }).asZonedDateTime();
    const endOfDay = endOf(currentDay, { unit: "day" }).asZonedDateTime();

    const eventStart =
      Temporal.ZonedDateTime.compare(currentDay, startDate) === 0
        ? startDate
        : startOfDay;
    const eventEnd =
      Temporal.ZonedDateTime.compare(endDate, endOfDay) < 0
        ? endDate
        : endOfDay;

    events.push({
      ...event,
      start: eventStart.toPlainDateTime().toString(),
      end: eventEnd.toPlainDateTime().toString(),
      _originalStart: event.start,
      _originalEnd: event.end,
    });

    currentDay = startOfDay.add({ days: 1 });
  }

  return events;
};
