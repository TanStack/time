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
 * Get the first day of the week for a given date string and locale
 */
export function getFirstDayOfWeek(
  dateString: string,
  locale: string,
): Temporal.PlainDate {
  const date = Temporal.PlainDate.from(dateString)
  const weekInfo = getWeekInfo(locale)
  const firstDayOfWeek = weekInfo.firstDay
  const dayOfWeek = date.dayOfWeek
  const daysToSubtract = (dayOfWeek - firstDayOfWeek + 7) % 7

  return date.subtract({ days: daysToSubtract })
}
