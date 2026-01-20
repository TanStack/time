import type { Temporal } from '@js-temporal/polyfill'

export type DateInput = string | number | Date | Temporal.ZonedDateTime

export interface DateOptions {
  calendar?: string
  timeZone?: string
}
