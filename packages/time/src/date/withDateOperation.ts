import { Temporal } from '@js-temporal/polyfill'
import { parse } from './parse/parse'
import { getDateDefaults } from './dateDefaults'

export type DateInput = string | number | Date | Temporal.ZonedDateTime

export interface DateOptions {
  calendar?: string
  timeZone?: string
}

export interface DateOperationOptions extends DateOptions {}

export interface DateOperationResult {
  value: string
  options: Required<DateOptions>
  asDate: () => Date
  asEpoch: () => number
  asString: () => string
  asLong: () => string
  asZonedDateTime: () => Temporal.ZonedDateTime
  timeZone: string
  calendar: string
}

function createDateOperationResult(
  zdt: Temporal.ZonedDateTime,
  options: Required<DateOptions>,
): DateOperationResult {
  return {
    value: zdt.toInstant().toString(),
    options,
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
    dateString = input
  } else if (typeof input === 'number') {
    const date = parse(input)
    if (!date) {
      throw new Error(`"${input}" is an invalid date value`)
    }
    dateString = date.toISOString()
  } else if (input instanceof Date) {
    dateString = input.toISOString()
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
  ): DateOperationResult => {
    const defaults = getDateDefaults()
    const timeZone = options?.timeZone ?? defaults.timeZone
    const calendar = options?.calendar ?? defaults.calendar

    const inputZdt = toZonedDateTime(input, timeZone, calendar)
    const resultZdt = fn(inputZdt, args)

    return createDateOperationResult(resultZdt, {
      timeZone,
      calendar,
    })
  }
}
