import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface GetWeekOptions extends DateOptions {}

export function getWeek(date: DateInput, options?: GetWeekOptions): number {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  return zdt.weekOfYear ?? 0
}
