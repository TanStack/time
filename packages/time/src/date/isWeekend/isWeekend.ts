import '../../polyfills/getWeekInfo'
import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'

export interface IsWeekendOptions extends DateOptions {
  locale?: string
}

/**
 * isWeekend
 * Returns true if the date falls on a weekend based on locale-specific week info
 */
export function isWeekend(date: DateInput, options?: IsWeekendOptions): boolean {
  const defaults = getDateDefaults()
  const {
    timeZone = defaults.timeZone,
    calendar = defaults.calendar,
    locale = defaults.locale,
  } = options ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const dayOfWeek = zdt.dayOfWeek

  const localeObj = new Intl.Locale(locale)
  const weekInfo = localeObj.getWeekInfo()

  return weekInfo.weekend.includes(dayOfWeek)
}
