import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface IsLeapYearOptions extends DateOptions {}

/**
 * isLeapYear
 * Returns true if the year of the given date is a leap year
 */
export function isLeapYear(
  date: DateInput,
  options?: IsLeapYearOptions,
): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {}

  return toZonedDateTime(date, timeZone, calendar).inLeapYear
}
