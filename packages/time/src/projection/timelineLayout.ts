import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";

const HOURS_IN_DAY = 24;

export interface TimelineSpanEvent {
  id: string;
  start: string | Date | number;
  end: string | Date | number;
}

export interface TimelineSpanLayout {
  index: number;
  id: string;
  startFraction: number;
  endFraction: number;
  durationFraction: number;
  lane: number;
  isStartClipped: boolean;
  isEndClipped: boolean;
}

export interface TimelineRangeInput<E extends TimelineSpanEvent> {
  events: Array<E>;
  firstDay: string;
  totalDays: number;
}

export interface TimelineRangeLayout {
  items: Array<TimelineSpanLayout>;
  laneCount: number;
}

const hoursFromFirstDay = (
  value: string | Date | number,
  firstDay: Temporal.PlainDate,
): number => {
  const dt = Temporal.PlainDateTime.from(toPlainDateTimeString(value));
  const dayOffset = firstDay.until(dt.toPlainDate()).days;
  return (
    dayOffset * HOURS_IN_DAY + dt.hour + dt.minute / 60 + dt.second / 3600
  );
};

export function layoutTimelineRange<E extends TimelineSpanEvent>(
  input: TimelineRangeInput<E>,
): TimelineRangeLayout {
  const firstDay = Temporal.PlainDate.from(input.firstDay.slice(0, 10));
  const totalHours = input.totalDays * HOURS_IN_DAY;

  const items: Array<TimelineSpanLayout> = [];
  const lanes: Array<Array<{ start: number; end: number }>> = [];

  input.events.forEach((event, index) => {
    const rawStart = hoursFromFirstDay(event.start, firstDay) / totalHours;
    const rawEnd = hoursFromFirstDay(event.end, firstDay) / totalHours;

    const startFraction = Math.max(0, rawStart);
    const endFraction = Math.min(1, rawEnd);
    if (endFraction - startFraction <= 0) return;

    let lane = lanes.findIndex(
      (placed) =>
        !placed.some(
          (item) => startFraction < item.end && endFraction > item.start,
        ),
    );
    if (lane === -1) lane = lanes.length;
    (lanes[lane] ??= []).push({ start: startFraction, end: endFraction });

    items.push({
      index,
      id: event.id,
      startFraction,
      endFraction,
      durationFraction: endFraction - startFraction,
      lane,
      isStartClipped: rawStart < 0,
      isEndClipped: rawEnd > 1,
    });
  });

  return { items, laneCount: Math.max(1, lanes.length) };
}

export function currentTimeFraction(input: {
  isoDates: Array<string>;
  now: { isoDate: string; hour: number; minute: number };
}): number | null {
  const dayIndex = input.isoDates.indexOf(input.now.isoDate);
  if (dayIndex < 0) return null;

  const hourFraction = input.now.hour + input.now.minute / 60;
  return (
    (dayIndex * HOURS_IN_DAY + hourFraction) /
    (input.isoDates.length * HOURS_IN_DAY)
  );
}
