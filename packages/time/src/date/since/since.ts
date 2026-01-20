import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput, DateOptions } from '../types'

export interface SinceOptions extends DateOptions {
  unit: Temporal.DateTimeUnit
}

/**
 * since
 * Returns the duration from the first date/time instance since the second date/time instance
 * (equivalent to: how long has it been since the second date, from the first date's perspective)
 */
export function since(start: DateInput, end: DateInput, options: SinceOptions) {
  const defaults = getDateDefaults()
  const { timeZone = defaults.timeZone, calendar = defaults.calendar } = options

  const startZdt = toZonedDateTime(start, timeZone, calendar)
  const endZdt = toZonedDateTime(end, timeZone, calendar)
  const duration = endZdt.since(startZdt)
  return duration.total({ unit: options.unit, relativeTo: startZdt })
}
