import { Temporal } from "@js-temporal/polyfill";
import {
  formatMinutesToTime,
  getWeekday,
  MINUTES_IN_DAY,
  parseHmToMinutes,
  type MinuteRange,
} from "./minutes";
import type {
  WorkingCalendar,
  WorkingInterval,
  WorkingTimeRange,
} from "./types";

export function resolveCalendarChain(
  calendarId: string | undefined,
  calendars: Array<WorkingCalendar> | null | undefined,
): Array<WorkingCalendar> {
  if (!calendarId || !calendars || calendars.length === 0) return [];

  const chain: Array<WorkingCalendar> = [];
  const seen = new Set<string>();
  let cursor: string | undefined = calendarId;

  while (cursor) {
    if (seen.has(cursor)) {
      throw new Error(
        `Working calendar cycle: ${[...seen, cursor].join(" -> ")}`,
      );
    }
    seen.add(cursor);

    const calendar = calendars.find((candidate) => candidate.id === cursor);
    if (!calendar) break;

    chain.unshift(calendar);
    cursor = calendar.parentId;
  }

  return chain;
}

export function hasWorkingCalendar(
  calendarId: string | undefined,
  calendars: Array<WorkingCalendar> | null | undefined,
): boolean {
  return resolveCalendarChain(calendarId, calendars).length > 0;
}

function specificity(interval: WorkingInterval): number {
  const dated =
    interval.startDate !== undefined || interval.endDate !== undefined;
  if (interval.recurrent) return dated ? 1 : 0;
  return 2;
}

function spanOn(interval: WorkingInterval, day: string): MinuteRange | null {
  if (interval.startDate && day < interval.startDate) return null;
  if (interval.endDate && day > interval.endDate) return null;

  if (interval.recurrent) {
    if (!interval.recurrent.weekdays.includes(getWeekday(day))) return null;

    const startMinutes = parseHmToMinutes(interval.recurrent.startTime);
    const endMinutes = parseHmToMinutes(interval.recurrent.endTime);
    return endMinutes > startMinutes ? { startMinutes, endMinutes } : null;
  }

  const isFirstDay = !interval.startDate || day === interval.startDate;
  const isLastDay = !interval.endDate || day === interval.endDate;
  const startMinutes =
    isFirstDay && interval.startTime ? parseHmToMinutes(interval.startTime) : 0;
  const endMinutes =
    isLastDay && interval.endTime
      ? parseHmToMinutes(interval.endTime)
      : MINUTES_IN_DAY;

  return endMinutes > startMinutes ? { startMinutes, endMinutes } : null;
}

export function resolveDayMinutes(
  calendarId: string | undefined,
  date: string,
  calendars: Array<WorkingCalendar> | null | undefined,
): Array<MinuteRange> {
  const chain = resolveCalendarChain(calendarId, calendars);
  if (chain.length === 0) return [];

  const day = date.slice(0, 10);
  const canvas = new Uint8Array(MINUTES_IN_DAY);

  const ordered = chain
    .flatMap((calendar, level) =>
      calendar.intervals.map((interval, index) => ({ interval, level, index })),
    )
    .sort(
      (a, b) =>
        specificity(a.interval) - specificity(b.interval) ||
        a.level - b.level ||
        a.index - b.index,
    );

  for (const { interval } of ordered) {
    const span = spanOn(interval, day);
    if (!span) continue;

    canvas.fill(interval.isWorking ? 1 : 0, span.startMinutes, span.endMinutes);
  }

  const ranges: Array<MinuteRange> = [];
  let openedAt = -1;
  for (let minute = 0; minute < MINUTES_IN_DAY; minute++) {
    if (canvas[minute] === 1) {
      if (openedAt === -1) openedAt = minute;
    } else if (openedAt !== -1) {
      ranges.push({ startMinutes: openedAt, endMinutes: minute });
      openedAt = -1;
    }
  }
  if (openedAt !== -1) {
    ranges.push({ startMinutes: openedAt, endMinutes: MINUTES_IN_DAY });
  }

  return ranges;
}

function dayOf(value: string): string {
  return value.slice(0, 10);
}

function minutesOf(value: string): number {
  if (value.length < 16) return 0;
  return parseHmToMinutes(value.slice(11, 16));
}

export function getWorkingTime(
  calendarId: string | undefined,
  range: WorkingTimeRange,
  calendars: Array<WorkingCalendar> | null | undefined,
): Array<WorkingTimeRange> {
  const chain = resolveCalendarChain(calendarId, calendars);
  if (chain.length === 0) return [];

  const startDay = dayOf(range.start);
  const endDay = dayOf(range.end);
  if (endDay < startDay) return [];

  const startMinutes = minutesOf(range.start);
  const endMinutes = minutesOf(range.end);
  const firstDate = Temporal.PlainDate.from(startDay);
  const lastDate = Temporal.PlainDate.from(endDay);

  const absolute: Array<MinuteRange> = [];
  let cursor = firstDate;
  let dayIndex = 0;

  while (Temporal.PlainDate.compare(cursor, lastDate) <= 0) {
    const day = cursor.toString({ calendarName: "never" });
    const isFirst = dayIndex === 0;
    const isLast = day === endDay;

    const lowerBound = isFirst ? startMinutes : 0;
    const upperBound = isLast ? endMinutes : MINUTES_IN_DAY;

    if (upperBound > lowerBound) {
      for (const span of resolveDayMinutes(calendarId, day, calendars)) {
        const from = Math.max(span.startMinutes, lowerBound);
        const to = Math.min(span.endMinutes, upperBound);
        if (to <= from) continue;

        const offset = dayIndex * MINUTES_IN_DAY;
        const previous = absolute[absolute.length - 1];
        if (previous && previous.endMinutes === offset + from) {
          previous.endMinutes = offset + to;
        } else {
          absolute.push({
            startMinutes: offset + from,
            endMinutes: offset + to,
          });
        }
      }
    }

    cursor = cursor.add({ days: 1 });
    dayIndex++;
  }

  const toStamp = (value: number): string => {
    const date = firstDate.add({ days: Math.floor(value / MINUTES_IN_DAY) });
    const time = formatMinutesToTime(value % MINUTES_IN_DAY);
    return `${date.toString({ calendarName: "never" })}T${time}:00`;
  };

  return absolute.map((span) => ({
    start: toStamp(span.startMinutes),
    end: toStamp(span.endMinutes),
  }));
}
