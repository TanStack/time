import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput, DateOptions } from '../types'

export type ReturnFormat = 'standard' | 'long'

export interface DateOperationOptions extends DateOptions {
  returnFormat?: ReturnFormat
}

function createDateOperationResult(
  zdt: Temporal.ZonedDateTime,
  options: Required<DateOptions>,
  returnFormat: ReturnFormat = 'standard',
) {
  const getValue = (): string => {
    switch (returnFormat) {
      case 'standard':
        return zdt.toInstant().toString()
      case 'long':
        return `${zdt.toInstant().toString()}[${zdt.timeZoneId}][u-ca=${zdt.calendarId}]`
      default:
        return zdt.toInstant().toString()
    }
  }

  return {
    value: getValue(),
    options,
    returnFormat,
    asDate: () => {
      return new Date(Number(zdt.epochNanoseconds / 1_000_000n))
    },
    asEpoch: () => {
      return Number(zdt.epochNanoseconds / 1_000_000n)
    },
    asString: () => {
      return zdt.toInstant().toString()
    },
    asLong: () => {
      return `${zdt.toInstant().toString()}[${zdt.timeZoneId}][u-ca=${zdt.calendarId}]`
    },
    asZonedDateTime: () => {
      return zdt
    },
    timeZone: options.timeZone,
    calendar: options.calendar,
  }
}

/**
 * Higher-order function that provides common parsing, defaults, and formatting logic
 * for date utility functions like startOf, endOf, etc.
 */
export function withDateOperation<TArgs>(
  fn: (zdt: Temporal.ZonedDateTime, args: TArgs) => Temporal.ZonedDateTime,
) {
  return (input: DateInput, options: DateOperationOptions & TArgs) => {
    const defaults = getDateDefaults()
    const timeZone = options.timeZone ?? defaults.timeZone
    const calendar = options.calendar ?? defaults.calendar
    const returnFormat = options.returnFormat ?? 'standard'

    const inputZdt = toZonedDateTime(input, timeZone, calendar)
    const resultZdt = fn(inputZdt, options)

    return createDateOperationResult(
      resultZdt,
      {
        timeZone,
        calendar,
      },
      returnFormat,
    )
  }
}
