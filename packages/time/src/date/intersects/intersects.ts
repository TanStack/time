import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import type { DateInput, DateOptions, Range } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface IntersectsOptions extends DateOptions {
  range: Range
}

export function intersects(date: DateInput, options: IntersectsOptions): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults()
  const {
    range: { start, end },
    timeZone = defaultTimeZone,
    calendar = defaultCalendar,
  } = options

  const zdt = toZonedDateTime(date, timeZone, calendar)
  const zdtStart = toZonedDateTime(start, timeZone, calendar)
  const zdtEnd = toZonedDateTime(end, timeZone, calendar)

  const compareStart = Temporal.ZonedDateTime.compare(zdt, zdtStart)
  const compareEnd = Temporal.ZonedDateTime.compare(zdt, zdtEnd)

  return compareStart >= 0 && compareEnd <= 0
}
