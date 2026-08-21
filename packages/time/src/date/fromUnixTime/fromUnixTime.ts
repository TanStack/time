import { Temporal } from '@js-temporal/polyfill'
import { createDateOperationResult } from '../withDateOperation'
import type { DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface FromUnixTimeOptions extends DateOptions {}

export function fromUnixTime(timestamp: number, options?: FromUnixTimeOptions) {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {}

  const instant = Temporal.Instant.fromEpochMilliseconds(timestamp * 1000)
  const zdt = instant.toZonedDateTimeISO(timeZone).withCalendar(calendar)

  return createDateOperationResult(zdt, {
    timeZone,
    calendar,
    returnFormat: 'standard',
  })
}
