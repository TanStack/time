import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface IsAfterOptions extends DateOptions {}

export function isAfter(date1: DateInput, date2: DateInput, options?: IsAfterOptions): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {}

  const zdt1 = toZonedDateTime(date1, timeZone, calendar)
  const zdt2 = toZonedDateTime(date2, timeZone, calendar)

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) > 0
}
