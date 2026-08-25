import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface IsPastOptions extends DateOptions {}

export function isPast(date: DateInput, options?: IsPastOptions): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const now = Temporal.Now.zonedDateTimeISO(timeZone).withCalendar(calendar)

  return Temporal.ZonedDateTime.compare(zdt, now) < 0
}
