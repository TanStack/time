import { Temporal } from '@js-temporal/polyfill'
import { getDateDefaults } from '../dateDefaults'
import { normalizeWeek } from '../helpers'
import { startOf } from '../startOf/startOf'
import type { DateInput, DateOptions } from '../types'

export type IsSameOrBeforeUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export interface IsSameOrBeforeOptions extends DateOptions {
  unit: IsSameOrBeforeUnit
}

/**
 * isSameOrBefore
 * Returns true if the first date/time instance is the same as or before the second date/time instance at the specified unit level
 */
export function isSameOrBefore(
  date1: DateInput,
  date2: DateInput,
  options: IsSameOrBeforeOptions,
): boolean {
  const defaults = getDateDefaults()
  const { timeZone = defaults.timeZone, calendar = defaults.calendar } = options

  const startOf1 = startOf(date1, { unit: options.unit, timeZone, calendar })
  const startOf2 = startOf(date2, { unit: options.unit, timeZone, calendar })
  const zdt1 = startOf1.asZonedDateTime()
  const zdt2 = startOf2.asZonedDateTime()

  if (options.unit === 'week') {
    const normalized1 = normalizeWeek(zdt1)
    const normalized2 = normalizeWeek(zdt2)
    return Temporal.ZonedDateTime.compare(normalized1, normalized2) <= 0
  }

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) <= 0
}
