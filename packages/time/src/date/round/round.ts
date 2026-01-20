import { Temporal } from '@js-temporal/polyfill'
import { withDateOperation } from '../withDateOperation'
import type { DateOperationOptions } from '../withDateOperation'
import type { DateInput } from '../types'
import { startOf } from '../startOf/startOf'

export type RoundUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export interface RoundOptions extends DateOperationOptions {
  unit: RoundUnit
}

/**
 * round
 * Returns the date/time instance rounded to the nearest unit
 */
export function round(input: DateInput, options: RoundOptions) {
  return withDateOperation<RoundOptions>((zdt, { unit }) => {
    switch (unit) {
      case 'year': {
        const yearStart = startOf(zdt, {
          unit: 'year',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const nextYearStart = startOf(zdt.add({ years: 1 }), {
          unit: 'year',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const midpoint = yearStart.add({ months: 6 })
        return Temporal.ZonedDateTime.compare(zdt, midpoint) >= 0
          ? nextYearStart
          : yearStart
      }
      case 'month': {
        const monthStart = startOf(zdt, {
          unit: 'month',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const nextMonthStart = startOf(zdt.add({ months: 1 }), {
          unit: 'month',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const daysInMonth = zdt.daysInMonth
        const midpoint = monthStart.add({ days: Math.floor(daysInMonth / 2) })
        return Temporal.ZonedDateTime.compare(zdt, midpoint) >= 0
          ? nextMonthStart
          : monthStart
      }
      case 'week': {
        const weekStart = startOf(zdt, {
          unit: 'week',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const nextWeekStart = startOf(zdt.add({ weeks: 1 }), {
          unit: 'week',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const midpoint = weekStart.add({ days: 3, hours: 12 })
        return Temporal.ZonedDateTime.compare(zdt, midpoint) >= 0
          ? nextWeekStart
          : weekStart
      }
      case 'day': {
        const dayStart = startOf(zdt, {
          unit: 'day',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const nextDayStart = startOf(zdt.add({ days: 1 }), {
          unit: 'day',
          timeZone: zdt.timeZoneId,
          calendar: zdt.calendarId,
        }).asZonedDateTime()
        const midpoint = dayStart.add({ hours: 12 })
        return Temporal.ZonedDateTime.compare(zdt, midpoint) >= 0
          ? nextDayStart
          : dayStart
      }
      case 'hour':
        return zdt.round({ smallestUnit: 'hour', roundingMode: 'halfExpand' })
      case 'minute':
        return zdt.round({ smallestUnit: 'minute', roundingMode: 'halfExpand' })
      case 'second':
        return zdt.round({ smallestUnit: 'second', roundingMode: 'halfExpand' })
      case 'millisecond':
        return zdt.round({
          smallestUnit: 'millisecond',
          roundingMode: 'halfExpand',
        })
      default:
        return zdt
    }
  })(input, options)
}
