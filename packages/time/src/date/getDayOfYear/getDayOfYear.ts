import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface GetDayOfYearOptions extends DateOptions {}

export function getDayOfYear(date: DateInput, options?: GetDayOfYearOptions): number {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  return zdt.dayOfYear
}
