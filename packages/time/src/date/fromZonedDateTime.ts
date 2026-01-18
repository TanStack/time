import './setupTemporal'
import { Temporal } from '@js-temporal/polyfill'

export type ReturnFormat = 'standard' | 'long' | 'epoch' | 'Date' | 'ZonedDateTime'

export interface FromZonedDateTimeResult<T extends ReturnFormat> {
  value: T extends 'ZonedDateTime'
    ? Temporal.ZonedDateTime
    : T extends 'epoch'
      ? number
      : T extends 'Date'
        ? Date
        : string
  options: {
    timeZone: string
    calendar: string
  }
}

/**
 * Converts a Temporal.ZonedDateTime to the requested return format
 * @param zdt - The ZonedDateTime to convert
 * @param returnFormat - The desired return format
 * @returns The converted value and options
 */
export function fromZonedDateTime<T extends ReturnFormat>(
  zdt: Temporal.ZonedDateTime,
  returnFormat: T = 'standard' as T,
): FromZonedDateTimeResult<T> {
  const timeZone = zdt.timeZoneId
  const calendar = zdt.calendarId

  let value: Temporal.ZonedDateTime | number | Date | string

  switch (returnFormat) {
    case 'ZonedDateTime':
      value = zdt
      break
    case 'epoch':
      value = zdt.epochMilliseconds
      break
    case 'Date':
      value = new Date(zdt.epochMilliseconds)
      break
    case 'long':
      // ISO 8601 extended format with timezone and calendar
      value = `${zdt.toInstant().toString()}[${timeZone}][u-ca=${calendar}]`
      break
    case 'standard':
    default:
      // Standard ISO 8601 / RFC 3339 format
      value = zdt.toInstant().toString()
      break
  }

  return {
    value: value as FromZonedDateTimeResult<T>['value'],
    options: {
      timeZone,
      calendar,
    },
  }
}
