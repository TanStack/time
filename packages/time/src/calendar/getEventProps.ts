import { Temporal } from "@js-temporal/polyfill";
import { layoutDaySegments, toLayoutStyle } from "~/projection";
import { toPlainDateTimeString } from "~/date/parse";
import type { LayoutOptions, LayoutOrientation } from "~/projection";
import type { CalendarStore, Event, EventDateTimeInput } from "./types";

interface GetEventPropsOptions extends LayoutOptions {
  timeZone: Temporal.TimeZoneLike;
  orientation?: LayoutOrientation;
  /**
   * Segments sharing the event's day. Every event of a day must be laid out against the same
   * list, otherwise their column counts disagree and the boxes do not line up.
   */
  daySegments?: Array<Event>;
}

const toZonedDateTime = (
  dateInput: EventDateTimeInput,
  timeZone: Temporal.TimeZoneLike,
): Temporal.ZonedDateTime =>
  Temporal.PlainDateTime.from(toPlainDateTimeString(dateInput)).toZonedDateTime(
    timeZone,
  );

const hasTimeOverlap = (
  aStart: Temporal.ZonedDateTime,
  aEnd: Temporal.ZonedDateTime,
  bStart: Temporal.ZonedDateTime,
  bEnd: Temporal.ZonedDateTime,
): boolean => {
  const compare = Temporal.ZonedDateTime.compare;
  return compare(aStart, bEnd) < 0 && compare(aEnd, bStart) > 0;
};

const getFullEventTimes = (
  segments: Array<Event>,
  timeZone: Temporal.TimeZoneLike,
  fallback: Event,
): { start: string; end: string } => {
  if (segments.length <= 1) {
    return {
      start: toPlainDateTimeString(fallback.start),
      end: toPlainDateTimeString(fallback.end),
    };
  }

  const sorted = [...segments].sort((a, b) =>
    Temporal.ZonedDateTime.compare(
      toZonedDateTime(a.start, timeZone),
      toZonedDateTime(b.start, timeZone),
    ),
  );

  return {
    start: toPlainDateTimeString(sorted[0]?.start ?? fallback.start),
    end: toPlainDateTimeString(sorted[sorted.length - 1]?.end ?? fallback.end),
  };
};

const dayKeyOf = (value: EventDateTimeInput): string =>
  toPlainDateTimeString(value).slice(0, 10);

const sameSegment = (a: Event, b: Event): boolean =>
  a.id === b.id &&
  toPlainDateTimeString(a.start) === toPlainDateTimeString(b.start);

export const getEventProps = (
  eventMap: Map<string, Array<Event>>,
  event: Event,
  state: CalendarStore,
  options: GetEventPropsOptions,
) => {
  const { timeZone } = options;
  const allEvents = [...eventMap.values()].flat();

  const segmentStart = toZonedDateTime(event.start, timeZone);
  const segmentEnd = toZonedDateTime(event.end, timeZone);

  const segments = allEvents.filter((e) => e.id === event.id);
  const isSplitEvent = segments.length > 1;
  const { start, end } = getFullEventTimes(segments, timeZone, event);

  const overlappingEvents = allEvents.filter((e) => {
    if (e.id === event.id) return false;
    const eStart = toZonedDateTime(e.start, timeZone);
    const eEnd = toZonedDateTime(e.end, timeZone);
    return hasTimeOverlap(segmentStart, segmentEnd, eStart, eEnd);
  });

  const baseProps = { isSplitEvent, overlappingEvents, start, end };

  const isTimeGridView =
    state.viewMode.unit === "week" || state.viewMode.unit === "day";

  if (!isTimeGridView) {
    return baseProps;
  }

  const daySegments = (
    options.daySegments ?? eventMap.get(dayKeyOf(event.start)) ?? []
  ).filter((e) => Boolean(e.allDay) === Boolean(event.allDay));
  const knownIndex = daySegments.findIndex((e) => sameSegment(e, event));
  const laidOut = knownIndex >= 0 ? daySegments : [...daySegments, event];
  const index = knownIndex >= 0 ? knownIndex : laidOut.length - 1;

  const layout = layoutDaySegments(laidOut, options)[index]!;

  return {
    ...baseProps,
    layout,
    style: toLayoutStyle(layout, options.orientation),
  };
};
