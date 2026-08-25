import type { DateTimeFormatterBuildParams, DateTimeFormatterOptions } from '../shared'
import { getDateTimeDefaults } from '~/utils'
import { normalizeLocale } from '~/date/helpers'
import { extractLocaleOptions } from '~/formatter/extractLocaleOptions'

export function buildDateTimeFormatter({
  locale = getDateTimeDefaults().locale,
  options,
}: DateTimeFormatterBuildParams): Intl.DateTimeFormat {
  const normalizedLocale = normalizeLocale(locale)
  const opts =
    typeof options === 'string' ? { dateStyle: options, timeStyle: options } : (options ?? {})
  const { formatOptions = {}, ...localeOptions } = extractLocaleOptions(opts)
  const { dateStyle, timeStyle, ...rest } = formatOptions as DateTimeFormatterOptions
  const newOptions = {
    ...localeOptions,
    ...(dateStyle && timeStyle ? { dateStyle, timeStyle } : rest),
  }
  return new Intl.DateTimeFormat(normalizedLocale, newOptions)
}
