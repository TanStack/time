import { startOf } from '../startOf'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export type EqualsUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export interface EqualsOptions extends DateOptions {}

export function equals(
  date1: DateInput,
  date2: DateInput,
  unit: EqualsUnit,
  options?: EqualsOptions,
): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {}

  const anchor = (date: DateInput) => {
    const start = startOf(date, { unit, timeZone, calendar })
    return unit === 'week' ? startOf(start, { unit: 'day', timeZone, calendar }) : start
  }

  return anchor(date1).getTime() === anchor(date2).getTime()
}
