import { toZonedDateTime } from '../helpers'
import { toInstantDate } from '../withDateOperation'
import type { DateInput, DateOptions } from '../types'
import type {
  DateFormatterBuildParams,
  DateTimeFormatterBuildParams,
  TimeFormatterBuildParams,
} from '~/formatter/shared'
import { getDateTimeDefaults } from '~/utils'
import { buildFinalFormatter } from '~/formatter/buildFinalFormatter'
import { buildDateFormatter } from '~/formatter/buildDateFormatter'
import { buildTimeFormatter } from '~/formatter/buildTimeFormatter'
import { buildDateTimeFormatter } from '~/formatter/buildDateTimeFormatter'

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

export function format(date: DateInput, formatOptions?: FormatDateOptions): string {
  const {
    locale: defaultLocale,
    timeZone: defaultTimeZone,
    calendar: defaultCalendar,
  } = getDateTimeDefaults()
  const {
    type = 'datetime',
    locale = defaultLocale,
    timeZone = defaultTimeZone,
    calendar = defaultCalendar,
    options,
  } = formatOptions ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const dateObj = toInstantDate(zdt)

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
