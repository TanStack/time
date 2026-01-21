import { getDateDefaults } from '../dateDefaults'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions } from '../types'

export interface IsWeekdayOptions extends DateOptions {
  locale?: string | Intl.Locale
}

/**
 * isWeekday
 * Returns true if the date falls on a weekday based on locale-specific week info
 */
export function isWeekday(date: DateInput, options?: IsWeekdayOptions): boolean {
  const defaults = getDateDefaults()
  const {
    timeZone = defaults.timeZone,
    calendar = defaults.calendar,
    locale = defaults.locale,
  } = options ?? {}

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const dayOfWeek = zdt.dayOfWeek

  const localeObj = typeof locale === 'string' ? new Intl.Locale(locale) : locale

  const weekInfo = localeObj.getWeekInfo()
  return !weekInfo.weekend.includes(dayOfWeek)
}
