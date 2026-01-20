import { Temporal } from '@js-temporal/polyfill'
import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'

export interface IsBeforeOptions extends DateOptions {}

/**
 * isBefore
 * Returns true if the first date/time instance is before the second date/time instance
 */
export function isBefore(
  date1: DateInput,
  date2: DateInput,
  options?: IsBeforeOptions,
): boolean {
  const defaults = getDateDefaults()
  const { timeZone = defaults.timeZone, calendar = defaults.calendar } =
    options ?? {}

  const zdt1 = toZonedDateTime(date1, timeZone, calendar)
  const zdt2 = toZonedDateTime(date2, timeZone, calendar)

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) < 0
}
