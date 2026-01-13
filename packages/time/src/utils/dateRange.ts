import { Temporal } from '@js-temporal/polyfill'
import { parseDate } from './parseDate'
import type { DateRange } from '../calendar/types'

export interface ParsedDateRange {
  start: Temporal.PlainDate | null
  end: Temporal.PlainDate | null
}

interface ParseDateRangeParams {
  range: DateRange | undefined
  calendar: Temporal.CalendarLike
}

/**
 * Parses and validates a date range, converting input dates to Temporal.PlainDate.
 * @param {ParseDateRangeParams} params - The parameters for parsing the date range.
 * @returns {ParsedDateRange} The parsed date range with Temporal.PlainDate values.
 * @throws {Error} If the date range is invalid or start is after end.
 */
export function parseDateRange({
  range,
  calendar,
}: ParseDateRangeParams): ParsedDateRange {
  const rangeStart = range?.start ? parseDate(range.start) : null
  const rangeEnd = range?.end ? parseDate(range.end) : null

  if ((rangeStart && !rangeStart.success) || (rangeEnd && !rangeEnd.success)) {
    throw new Error('Invalid date range')
  }

  const parsedRangeStart = rangeStart?.success
    ? Temporal.PlainDate.from(
        rangeStart.data.toISOString().split('T')[0]!,
      ).withCalendar(calendar)
    : null

  const parsedRangeEnd = rangeEnd?.success
    ? Temporal.PlainDate.from(
        rangeEnd.data.toISOString().split('T')[0]!,
      ).withCalendar(calendar)
    : null

  if (
    parsedRangeStart &&
    parsedRangeEnd &&
    Temporal.PlainDate.compare(parsedRangeStart, parsedRangeEnd) > 0
  ) {
    throw new Error('Invalid date range: start must be before or equal to end')
  }

  return {
    start: parsedRangeStart,
    end: parsedRangeEnd,
  }
}

interface ConstrainDateToRangeParams {
  date: Temporal.PlainDate
  range: ParsedDateRange
}

/**
 * Constrains a date to be within the specified range.
 * If the date is before the range start, returns the start date.
 * If the date is after the range end, returns the end date.
 * @param {ConstrainDateToRangeParams} params - The parameters for constraining the date.
 * @returns {Temporal.PlainDate} The constrained date.
 */
export function constrainDateToRange({
  date,
  range,
}: ConstrainDateToRangeParams): Temporal.PlainDate {
  if (!range.start && !range.end) {
    return date
  }

  let constrainedDate = date

  if (range.start) {
    if (Temporal.PlainDate.compare(constrainedDate, range.start) < 0) {
      constrainedDate = range.start
    }
  }

  if (range.end) {
    if (Temporal.PlainDate.compare(constrainedDate, range.end) > 0) {
      constrainedDate = range.end
    }
  }

  return constrainedDate
}

interface IsDateInRangeParams {
  date: Temporal.PlainDate
  range: ParsedDateRange
}

/**
 * Checks if a date is within the specified range.
 * @param {IsDateInRangeParams} params - The parameters for checking the date.
 * @returns {boolean} True if the date is within the range, false otherwise.
 */
export function isDateInRange({ date, range }: IsDateInRangeParams): boolean {
  if (!range.start && !range.end) {
    return true
  }

  if (range.start && Temporal.PlainDate.compare(date, range.start) < 0) {
    return false
  }

  if (range.end && Temporal.PlainDate.compare(date, range.end) > 0) {
    return false
  }

  return true
}
