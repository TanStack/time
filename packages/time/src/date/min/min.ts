import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import { createDateOperationResult } from '../withDateOperation'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface MinOptions extends DateOptions {}

export function min(dates: Array<DateInput>, options?: MinOptions) {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {}

  if (dates.length === 0) {
    throw new Error('min requires at least one date')
  }

  let minZdt = toZonedDateTime(dates[0]!, timeZone, calendar)

  for (let i = 1; i < dates.length; i++) {
    const zdt = toZonedDateTime(dates[i]!, timeZone, calendar)
    if (Temporal.ZonedDateTime.compare(zdt, minZdt) < 0) {
      minZdt = zdt
    }
  }

  return createDateOperationResult(minZdt, {
    timeZone,
    calendar,
    returnFormat: 'standard',
  })
}
