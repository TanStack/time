import { startOf } from '../startOf'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export type CountUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export interface CountOptions extends DateOptions {
  unit: CountUnit
}

export function count(start: DateInput, end: DateInput, options: CountOptions): number {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { unit, timeZone = defaultTimeZone, calendar = defaultCalendar } = options

  const anchor = (date: DateInput) =>
    toZonedDateTime(startOf(date, { unit, timeZone, calendar }), timeZone, calendar)

  const startZdt = anchor(start)
  const endZdt = anchor(end)

  const duration = startZdt.until(endZdt)
  return duration.total({ unit, relativeTo: startZdt })
}
