import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'
import { startOf } from '~/date/startOf/startOf'

export type IsSameOrAfterUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export interface IsSameOrAfterOptions extends DateOptions {
  unit: IsSameOrAfterUnit
}

export function isSameOrAfter(
  date1: DateInput,
  date2: DateInput,
  options: IsSameOrAfterOptions,
): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options

  const anchor = (date: DateInput) => {
    const start = startOf(date, { unit: options.unit, timeZone, calendar })
    return options.unit === 'week' ? startOf(start, { unit: 'day', timeZone, calendar }) : start
  }

  return anchor(date1).getTime() >= anchor(date2).getTime()
}
