import type { Temporal } from '@js-temporal/polyfill'

type ViewUnit = 'month' | 'week' | 'day' | 'workWeek' | 'decade' | 'year'

interface StartOfParams {
  date: Temporal.ZonedDateTime
  unit: ViewUnit
  firstDayOfWeek?: number
}

/**
 * Helper function to get the start of a given temporal unit.
 * @param {StartOfParams} params - The parameters for the startOf function.
 * @returns {Temporal.ZonedDateTime} The start of the given unit.
 */
export function startOf({
  date,
  unit,
  firstDayOfWeek = 1,
}: StartOfParams): Temporal.ZonedDateTime {
  let startDate: Temporal.ZonedDateTime

  switch (unit) {
    case 'day':
      startDate = date.with({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      })
      break
    case 'week': {
      const daysToSubtract = (date.dayOfWeek - firstDayOfWeek + 7) % 7
      startDate = date.subtract({ days: daysToSubtract }).with({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      })
      break
    }
    case 'month':
      startDate = date.with({
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      })
      break
    case 'year':
      startDate = date.with({
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      })
      break
    case 'workWeek': {
      const daysToSubtract = (date.dayOfWeek - 1 + 7) % 7
      startDate = date.subtract({ days: daysToSubtract }).with({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      })
      break
    }
    case 'decade':
      startDate = date.with({
        year: date.year - (date.year % 10),
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      })
      break
    default:
      throw new Error(`Unsupported unit: ${unit}`)
  }

  return startDate
}
