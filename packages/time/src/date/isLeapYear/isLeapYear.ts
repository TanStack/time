import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface IsLeapYearOptions extends DateOptions {}

export function isLeapYear(date: DateInput, options?: IsLeapYearOptions): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {}

  return toZonedDateTime(date, timeZone, calendar).inLeapYear
}
