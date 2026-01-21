import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

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
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {}

  const zdt1 = toZonedDateTime(date1, timeZone, calendar)
  const zdt2 = toZonedDateTime(date2, timeZone, calendar)

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) < 0
}
