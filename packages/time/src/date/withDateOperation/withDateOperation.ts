import { Temporal } from '@js-temporal/polyfill'
import { validateDate } from '../validateDate'
import { getDateDefaults } from '../dateDefaults'
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
 * Converts various date inputs to a Temporal.ZonedDateTime
 */
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
 * Higher-order function that provides common parsing, defaults, and formatting logic
 * for date utility functions like startOf, endOf, etc.
 */
export function withDateOperation<TArgs extends Record<string, unknown>>(
  fn: (zdt: Temporal.ZonedDateTime, args: TArgs) => Temporal.ZonedDateTime,
) {
  return (
    input: DateInput,
    args: TArgs,
    options?: DateOperationOptions,
  ) => {
    const defaults = getDateDefaults()
    const timeZone = options?.timeZone ?? defaults.timeZone
    const calendar = options?.calendar ?? defaults.calendar
    const returnFormat = options?.returnFormat ?? 'standard'

    const inputZdt = toZonedDateTime(input, timeZone, calendar)
    const resultZdt = fn(inputZdt, args)

    return createDateOperationResult(resultZdt, {
      timeZone,
      calendar,
    }, returnFormat)
  }
}
