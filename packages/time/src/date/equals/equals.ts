import { getDateDefaults } from '../dateDefaults'
import { normalizeWeek } from '../helpers'
import { startOf } from '../startOf/startOf'
import type { DateInput, DateOptions } from '../types'

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

/**
 * equals
 * Returns true if two date/time instances are equal at the specified unit level
 */
export function equals(
  date1: DateInput,
  date2: DateInput,
  unit: EqualsUnit,
  options?: EqualsOptions,
): boolean {
  const defaults = getDateDefaults()
  const timeZone = options?.timeZone ?? defaults.timeZone
  const calendar = options?.calendar ?? defaults.calendar

  const startOf1 = startOf(date1, { unit, timeZone, calendar })
  const startOf2 = startOf(date2, { unit, timeZone, calendar })

  const zdt1 = startOf1.asZonedDateTime()
  const zdt2 = startOf2.asZonedDateTime()

  if (unit === 'week') {
    const normalized1 = normalizeWeek(zdt1)
    const normalized2 = normalizeWeek(zdt2)
    return (
      normalized1.toInstant().epochNanoseconds ===
      normalized2.toInstant().epochNanoseconds
    )
  }

  return zdt1.toInstant().epochNanoseconds === zdt2.toInstant().epochNanoseconds
}
