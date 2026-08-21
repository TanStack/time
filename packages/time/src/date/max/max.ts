import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import { createDateOperationResult } from '../withDateOperation'
import type { DateInput, DateOptions } from '../types'
import { getDateTimeDefaults } from '~/utils'

export interface MaxOptions extends DateOptions {}

export function max(dates: Array<DateInput>, options?: MaxOptions) {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults()
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {}

  if (dates.length === 0) {
    throw new Error('max requires at least one date')
  }

  let maxZdt = toZonedDateTime(dates[0]!, timeZone, calendar)

  for (let i = 1; i < dates.length; i++) {
    const zdt = toZonedDateTime(dates[i]!, timeZone, calendar)
    if (Temporal.ZonedDateTime.compare(zdt, maxZdt) > 0) {
      maxZdt = zdt
    }
  }

  return createDateOperationResult(maxZdt, {
    timeZone,
    calendar,
    returnFormat: 'standard',
  })
}
