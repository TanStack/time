import { getDefaultLocale } from '../utils/dateDefaults'
import { extractLocaleOptions } from './extractLocaleOptions'
import type {
  IDateTimeFormatterBuildParams,
  IDateTimeFormatterOptions,
} from './shared'

/**
 * @typedef {string | Intl.Locale | string[] | Intl.Locale[]} Locale
 *
 * @typedef {Object} IDateTimeFormatterOptions
 * @property {Locale} [locale]
 * @property {string | IDateFormatterOptions} [options]
 */

/**
 * Function: buildDateTimeFormatter
 * This function is used to build a date and time formatter, using the Intl.DateTimeFormat constructor.
 * The 'locale' named parameter can be a string, an Intl.Locale object, or an array of strings
 * or Intl.Locale objects. This is defaulted to the user's browser locale.
 *
 * The 'options' named parameter can be a string or an object.
 *
 * If 'options' is a string, it will be used as the 'dateStyle' and 'timeStyle' options.
 *  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#datestyle and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#timestyle as reference.
 *
 * If 'options' is an object, it will use the Intl.DateTimeFormat 'options'.
 *  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options as reference.
 *
 * You use the 'options' object for finer level of control over the time formatting.
 * When using UTC date strings, it is suggested that you use the 'options' object
 * to set the 'timeZone' when building the formatter. The 'timeZone' is defaulted
 * to the user's browser timezone.
 * @param {IDateTimeFormatterBuildParams} [param0]
 * @returns Intl.DateTimeFormat
 */
export function buildDateTimeFormatter({
  locale = getDefaultLocale(),
  options,
}: IDateTimeFormatterBuildParams): Intl.DateTimeFormat {
  const opts =
    typeof options === 'string'
      ? { dateStyle: options, timeStyle: options }
      : (options ?? {})
  const { formatOptions = {}, ...localeOptions } = extractLocaleOptions(opts)
  const { dateStyle, timeStyle, ...rest } =
    formatOptions as IDateTimeFormatterOptions
  const newOptions = {
    ...localeOptions,
    ...(dateStyle && timeStyle ? { dateStyle, timeStyle } : rest),
  }
  return new Intl.DateTimeFormat(locale, newOptions)
}
