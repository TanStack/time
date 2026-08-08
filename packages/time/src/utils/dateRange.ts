import { Temporal } from "@js-temporal/polyfill";
import type { DateInput } from "../date/types";
import type { DateRange } from "../calendar/types";

export interface ParsedDateRange {
  start: Temporal.PlainDate | null;
  end: Temporal.PlainDate | null;
}

function toPlainDate(
  input: DateInput,
  calendar: Temporal.CalendarLike,
): Temporal.PlainDate {
  if (input instanceof Temporal.PlainDate) {
    return input.withCalendar(calendar);
  }
  if (input instanceof Temporal.ZonedDateTime) {
    return input.toPlainDate().withCalendar(calendar);
  }
  if (input instanceof Date) {
    return Temporal.PlainDate.from({
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
    }).withCalendar(calendar);
  }
  if (typeof input === "number") {
    const date = new Date(input);
    return Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }).withCalendar(calendar);
  }
  return Temporal.PlainDate.from(input).withCalendar(calendar);
}

interface ParseDateRangeOptions {
  range?: DateRange;
  calendar: Temporal.CalendarLike;
}

export function parseDateRange({
  range,
  calendar,
}: ParseDateRangeOptions): ParsedDateRange {
  if (!range) {
    return { start: null, end: null };
  }

  return {
    start: range.start ? toPlainDate(range.start, calendar) : null,
    end: range.end ? toPlainDate(range.end, calendar) : null,
  };
}

interface IsDateInRangeOptions {
  date: Temporal.PlainDate;
  range: ParsedDateRange;
}

export function isDateInRange({ date, range }: IsDateInRangeOptions): boolean {
  const { start, end } = range;

  if (start && Temporal.PlainDate.compare(date, start) < 0) {
    return false;
  }

  if (end && Temporal.PlainDate.compare(date, end) > 0) {
    return false;
  }

  return true;
}

interface ConstrainDateToRangeOptions {
  date: Temporal.PlainDate;
  range: ParsedDateRange;
}

export function constrainDateToRange({
  date,
  range,
}: ConstrainDateToRangeOptions): Temporal.PlainDate {
  const { start, end } = range;

  if (start && Temporal.PlainDate.compare(date, start) < 0) {
    return start;
  }

  if (end && Temporal.PlainDate.compare(date, end) > 0) {
    return end;
  }

  return date;
}
