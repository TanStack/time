import './setupTemporal'
import { Temporal } from '@js-temporal/polyfill'
import { getDefaultCalendar, getDefaultLocale, getDefaultTimeZone, normalizeLocale } from './dateDefaults'
import { toZonedDateTime, type ToZonedDateTimeOptions } from './toZonedDateTime'
import {
  fromZonedDateTime,
  type ReturnFormat,
  type FromZonedDateTimeResult,
} from './fromZonedDateTime'

export type StartOfUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export interface StartOfOptions extends ToZonedDateTimeOptions {
  returnFormat?: ReturnFormat
}

export interface StartOfParams {
  date: string | number | Date | Temporal.ZonedDateTime
  unit: StartOfUnit
  returnFormat?: ReturnFormat
  options?: ToZonedDateTimeOptions
}

/**
 * Returns the start of a given unit of time for a date
 * @param params - Parameters object containing date, unit, returnFormat, and options
 * @returns Object containing the value in the requested format and options (timeZone, calendar)
 */
export function startOf<T extends ReturnFormat = 'standard'>({
  date,
  unit,
  returnFormat = 'standard' as T,
  options = {},
}: StartOfParams): FromZonedDateTimeResult<T> {
  const mergedOptions: ToZonedDateTimeOptions = {
    timeZone: options.timeZone ?? getDefaultTimeZone(),
    calendar: options.calendar ?? getDefaultCalendar(),
  }

  // Convert input to ZonedDateTime
  let zdt = toZonedDateTime(date, mergedOptions)

  // Apply startOf logic based on unit
  switch (unit) {
    case 'year':
      zdt = zdt.with({ month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
      break
    case 'month':
      zdt = zdt.with({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
      break
    case 'week': {
      // Use native getWeekInfo API to get the first day of the week based on locale
      const defaultLocale = getDefaultLocale()
      const normalizedLocale = normalizeLocale(defaultLocale)
      const localeString = Array.isArray(normalizedLocale) 
        ? normalizedLocale[0] ?? 'en-US'
        : normalizedLocale
      const locale = new Intl.Locale(localeString)
      const weekInfo = locale.getWeekInfo()
      const firstDay = weekInfo.firstDay
      const dayOfWeek = zdt.dayOfWeek
      const daysInWeek = zdt.daysInWeek
      
      const daysToSubtract = (dayOfWeek - firstDay + daysInWeek) % daysInWeek
      
      zdt = zdt
        .subtract({ days: daysToSubtract })
        .with({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      break
    }
    case 'day':
      zdt = zdt.with({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      break
    case 'hour':
      zdt = zdt.with({ minute: 0, second: 0, millisecond: 0 })
      break
    case 'minute':
      zdt = zdt.with({ second: 0, millisecond: 0 })
      break
    case 'second':
      zdt = zdt.with({ millisecond: 0 })
      break
    case 'millisecond':
      break
    default:
      throw new Error(`Invalid unit: "${unit}". Must be one of: year, month, week, day, hour, minute, second, millisecond`)
  }

  return fromZonedDateTime(zdt, returnFormat)
}
