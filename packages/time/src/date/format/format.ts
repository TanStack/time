import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import { buildFinalFormatter } from '../../formatter/buildFinalFormatter'
import { buildDateFormatter } from '../../formatter/buildDateFormatter'
import { buildTimeFormatter } from '../../formatter/buildTimeFormatter'
import { buildDateTimeFormatter } from '../../formatter/buildDateTimeFormatter'
import type { DateInput, DateOptions } from '../types'
import type {
  DateFormatterBuildParams,
  DateTimeFormatterBuildParams,
  TimeFormatterBuildParams,
} from '../../formatter/shared'

export type FormatType = 'date' | 'time' | 'datetime'

export interface FormatDateOptions extends DateOptions {
  type?: FormatType
  locale?: string | Intl.Locale | Array<string> | Array<Intl.Locale>
  options?:
    | string
    | DateFormatterBuildParams['options']
    | TimeFormatterBuildParams['options']
    | DateTimeFormatterBuildParams['options']
}

/**
 * format
 * Formats a date/time instance using Intl.DateTimeFormat
 * @param date - The date to format
 * @param formatOptions - Formatting options including type, locale, and Intl.DateTimeFormat options
 */
export function format(
  date: DateInput,
  formatOptions?: FormatDateOptions,
): string {
  const defaults = getDateDefaults()
  const {
    type = 'datetime',
    locale = defaults.locale,
    timeZone = defaults.timeZone,
    calendar = defaults.calendar,
    options,
  } = formatOptions ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const dateObj = new Date(Number(zdt.epochNanoseconds / 1_000_000n))

  const mergedOptions =
    typeof options === 'string'
      ? options
      : {
          ...options,
          timeZone,
          calendar,
        }

  let formatter: Intl.DateTimeFormat

  switch (type) {
    case 'date':
      formatter = buildDateFormatter({
        locale,
        options: mergedOptions as DateFormatterBuildParams['options'],
      })
      break
    case 'time':
      formatter = buildTimeFormatter({
        locale,
        options: mergedOptions as TimeFormatterBuildParams['options'],
      })
      break
    case 'datetime':
    default:
      formatter = buildDateTimeFormatter({
        locale,
        options: mergedOptions as DateTimeFormatterBuildParams['options'],
      })
      break
  }

  const formatFn = buildFinalFormatter({
    formatter,
    formatterName: 'format',
  })

  return formatFn(dateObj)
}
