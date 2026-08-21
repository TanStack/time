import { Temporal } from '@js-temporal/polyfill'
import { getWeekInfo } from '../polyfills/getWeekInfo'

/**
 * Get the first day of the month for a given year-month string
 */
export function getFirstDayOfMonth(yearMonth: string): Temporal.PlainDate {
  const [year, month] = yearMonth.split('-').map(Number)
  if (!year || !month) {
    throw new Error(`Invalid yearMonth format: ${yearMonth}. Expected YYYY-MM`)
  }
  return Temporal.PlainDate.from({ year, month, day: 1 })
}

/**
 * Get the first day of the week for a given date string and locale.
 *
 * `weekStartsOn` (ISO: 1=Mon … 7=Sun) overrides the locale-derived first day
 * when provided; otherwise the locale's own convention is used.
 */
export function getFirstDayOfWeek(
  dateString: string,
  locale: string,
  weekStartsOn?: number,
): Temporal.PlainDate {
  const date = Temporal.PlainDate.from(dateString)
  const firstDayOfWeek = weekStartsOn ?? getWeekInfo(locale).firstDay
  const dayOfWeek = date.dayOfWeek
  const daysToSubtract = (dayOfWeek - firstDayOfWeek + 7) % 7

  return date.subtract({ days: daysToSubtract })
}
