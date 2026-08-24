import { Temporal } from '@js-temporal/polyfill'
import { toInstantDate } from '../withDateOperation'
import type { DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface FromUnixTimeOptions extends DateOptions {}

export function fromUnixTime(timestamp: number, options?: FromUnixTimeOptions): Date {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {}

  const instant = Temporal.Instant.fromEpochMilliseconds(timestamp * 1000)
  const zdt = instant.toZonedDateTimeISO(timeZone).withCalendar(calendar)

  return toInstantDate(zdt)
}
