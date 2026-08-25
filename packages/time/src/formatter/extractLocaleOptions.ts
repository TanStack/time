import type { DateFormatterOptions, DateTimeFormatterOptions, TimeFormatterOptions } from './shared'
import { getDateTimeDefaults } from '~/utils'

export function extractLocaleOptions({
  localeMatcher,
  calendar = getDateTimeDefaults().calendar,
  timeZone = getDateTimeDefaults().timeZone,
  numberingSystem,
  hour12,
  hourCycle,
  ...formatOptions
}: DateFormatterOptions | DateTimeFormatterOptions | TimeFormatterOptions) {
  return {
    localeMatcher,
    calendar,
    numberingSystem,
    hour12,
    hourCycle,
    timeZone,
    formatOptions,
  }
}
