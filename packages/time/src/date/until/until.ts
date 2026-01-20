import { Temporal } from '@js-temporal/polyfill'
import { validateDate } from '../validateDate'
import { getDateDefaults } from '../dateDefaults'
import type { DateInput, DateOptions } from '../types'

export interface UntilOptions extends DateOptions {
  unit: Temporal.DateTimeUnit
}

function toZonedDateTime(
  input: DateInput,
  timeZone: string,
  calendar: string,
): Temporal.ZonedDateTime {
  if (input instanceof Temporal.ZonedDateTime) {
    return input
  }

  let dateString: string

  if (typeof input === 'string') {
    if (input.includes('[') && input.includes(']')) {
      return Temporal.ZonedDateTime.from(input)
    }
    const date = validateDate({ date: input })
    dateString = date.toISOString()
  } else if (typeof input === 'number') {
    const date = validateDate({ date: input })
    dateString = date.toISOString()
  } else if (input instanceof Date) {
    const date = validateDate({ date: input })
    dateString = date.toISOString()
  } else {
    throw new Error(`Invalid date input type: ${typeof input}`)
  }

  const zonedDateTimeString = `${dateString}[${timeZone}][u-ca=${calendar}]`
  return Temporal.ZonedDateTime.from(zonedDateTimeString)
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
