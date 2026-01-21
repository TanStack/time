import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'

export interface IsLeapYearOptions extends DateOptions {}

/**
 * isLeapYear
 * Returns true if the year of the given date is a leap year
 */
export function isLeapYear(date: DateInput, options?: IsLeapYearOptions): boolean {
  const defaults = getDateDefaults()
  const { timeZone = defaults.timeZone, calendar = defaults.calendar } = options ?? {}

  return toZonedDateTime(date, timeZone, calendar).inLeapYear
}
