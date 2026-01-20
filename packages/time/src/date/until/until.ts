import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput, DateOptions } from '../types'

export interface UntilOptions extends DateOptions {
  unit: Temporal.DateTimeUnit
}

/**
 * until
 * Returns the duration from the first date/time instance until the second date/time instance
 */
export function until(start: DateInput, end: DateInput, options: UntilOptions) {
  const defaults = getDateDefaults()
  const timeZone = options.timeZone ?? defaults.timeZone
  const calendar = options.calendar ?? defaults.calendar

  const startZdt = toZonedDateTime(start, timeZone, calendar)
  const endZdt = toZonedDateTime(end, timeZone, calendar)

  const duration = startZdt.until(endZdt)
  const unit = options.unit

  return duration.total({
    unit,
    relativeTo: startZdt,
  })
}
