import { Temporal } from '@js-temporal/polyfill'
import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions, Range } from '../types'

export interface IntersectsOptions extends DateOptions {
  range: Range
}

/**
 * intersects
 * Returns true if the date/time instance intersects with the range (i.e., is within or equal to the range boundaries)
 * @param date - The date to check
 * @param options - Options including range, timeZone and calendar
 */
export function intersects(
  date: DateInput,
  options: IntersectsOptions,
): boolean {
  const defaults = getDateDefaults()
  const {
    range: { start, end },
    timeZone = defaults.timeZone,
    calendar = defaults.calendar,
  } = options

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const zdtStart = toZonedDateTime(start, timeZone, calendar)
  const zdtEnd = toZonedDateTime(end, timeZone, calendar)

  const compareStart = Temporal.ZonedDateTime.compare(zdt, zdtStart)
  const compareEnd = Temporal.ZonedDateTime.compare(zdt, zdtEnd)

  return compareStart >= 0 && compareEnd <= 0
}
