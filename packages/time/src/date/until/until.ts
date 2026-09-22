import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput, DateOptions } from '../types'
import { toZonedDateTime } from '~/date/helpers'
import { getDateTimeDefaults } from '~/utils'

export interface UntilOptions extends DateOptions {
  unit: Temporal.DateTimeUnit
}

/**
 * until
 * Returns the duration from the first date/time instance until the second date/time instance
 */
export function until(start: DateInput, end: DateInput, options: UntilOptions) {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options

  const startZdt = toZonedDateTime(start, timeZone, calendar)
  const endZdt = toZonedDateTime(end, timeZone, calendar)

  const duration = startZdt.until(endZdt)
  const unit = options.unit

  return duration.total({
    unit,
    relativeTo: startZdt,
  })
}
