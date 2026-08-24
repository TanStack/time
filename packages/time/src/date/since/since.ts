import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput, DateOptions } from '../types'
import { toZonedDateTime } from '~/date/helpers'
import { getDateTimeDefaults } from '~/utils'

export interface SinceOptions extends DateOptions {
  unit: Temporal.DateTimeUnit
}

export function since(start: DateInput, end: DateInput, options: SinceOptions) {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options

  const startZdt = toZonedDateTime(start, timeZone, calendar)
  const endZdt = toZonedDateTime(end, timeZone, calendar)
  const duration = endZdt.since(startZdt)
  return duration.total({ unit: options.unit, relativeTo: startZdt })
}
