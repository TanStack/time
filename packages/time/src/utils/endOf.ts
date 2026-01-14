import type { Temporal } from '@js-temporal/polyfill'

type ViewUnit = 'month' | 'week' | 'day' | 'workWeek' | 'decade' | 'year'

interface EndOfParams {
  date: Temporal.ZonedDateTime
  unit: ViewUnit
  viewModeValue?: number
  firstDayOfWeek?: number
}

/**
 * Helper function to get the end of a given temporal unit.
 * @param {EndOfParams} params - The parameters for the endOf function.
 * @returns {Temporal.ZonedDateTime} The end of the given unit.
 */
export function endOf({
  date,
  unit,
  viewModeValue = 1,
  firstDayOfWeek = 1,
}: EndOfParams): Temporal.ZonedDateTime {
  let endDate: Temporal.ZonedDateTime

  switch (unit) {
    case 'day':
      endDate = date
      break
    case 'week':
      endDate = date.add({ days: 7 - date.dayOfWeek })
      break
    case 'workWeek':
      endDate = date.add({ days: 5 - date.dayOfWeek })
      break
    case 'month':
      endDate = date
        .with({ day: 1 })
        .add({ months: viewModeValue })
        .subtract({ days: 1 })
      if (viewModeValue > 1) {
        const lastDayOfMonthWeekDay =
          (endDate.dayOfWeek - firstDayOfWeek + 7) % 7
        endDate = endDate.add({ days: 6 - lastDayOfMonthWeekDay })
      }
      break
    case 'year':
      endDate = date.with({ month: 12, day: 31 })
      break
    case 'decade': {
      const lastYearOfDecade = date.with({
        year: date.year - (date.year % 10) + 9,
      })
      endDate = lastYearOfDecade.with({ month: 12, day: 31 })
      break
    }
    default:
      throw new Error(`Unsupported unit: ${unit}`)
  }

  return endDate.with({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  })
}
