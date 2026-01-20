import { Temporal } from '@js-temporal/polyfill'
import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'

export interface IsAfterOptions extends DateOptions {}

/**
 * isAfter
 * Returns true if the first date/time instance is after the second date/time instance
 */
export function isAfter(
  date1: DateInput,
  date2: DateInput,
  options?: IsAfterOptions,
): boolean {
  const defaults = getDateDefaults()
  const timeZone = options?.timeZone ?? defaults.timeZone
  const calendar = options?.calendar ?? defaults.calendar

  const zdt1 = toZonedDateTime(date1, timeZone, calendar)
  const zdt2 = toZonedDateTime(date2, timeZone, calendar)

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) > 0
}
