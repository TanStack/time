import type { Temporal } from '@js-temporal/polyfill'

export type DateInput = string | number | Date | Temporal.ZonedDateTime

export interface DateOptions {
  calendar?: string
  timeZone?: string
}

export interface DurationLike {
  years?: number
  months?: number
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
  microseconds?: number
  nanoseconds?: number
}
