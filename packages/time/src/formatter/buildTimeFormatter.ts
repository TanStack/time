import { getDefaultLocale } from "../utils/dateDefaults";
import { extractLocaleOptions } from "./extractLocaleOptions";
import type { TimeFormatterBuildParams } from "./shared";

/**
 * @typedef {Object} TimeFormatterOptions
 * @property {string} [localeMatcher]
 * @property {string} [calendar]
 * @property {string} [numberingSystem]
 * @property {boolean} [hour12]
 * @property {string} [hourCycle]
 * @property {string} [timeZone]
 * @property {string} [formatMatcher]
 * @property {string} [dayPeriod]
 * @property {string} [hour]
 * @property {string} [minute]
 * @property {string} [second]
 * @property {number} [fractionalSecondDigits]
 * @property {string} [timeZoneName]
 * @property {string} [timeStyle]
 * 
 * @typedef {string | Intl.Locale | string[] | Intl.Locale[]} Locale
 * 
 * @typedef {Object} TimeFormatterBuildParams
 * @property {Locale} [locale]
 * @property {string | DateFormatterOptions} [options]
 */

/**
 * Function: buildTimeFormatter
 * This function is used to build a time only formatter, using the Intl.DateTimeFormat constructor.
 * The 'locale' named parameter can be a string, an Intl.Locale object, or an array of strings 
 * or Intl.Locale objects. This is defaulted to the user's browser locale.
 * 
 * The 'options' named parameter can be a string or an object.
 * 
 * If 'options' is a string, it will be used as the 'timeStyle' option.
 *  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#timestyle as reference.
 * 
 * If 'options' is an object, it will use the Intl.DateTimeFormat 'options'. 
 *  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options as reference.
 * 
 * You use the 'options' object for finer level of control over the time formatting.
 * When using UTC date strings, it is suggested that you use the 'options' object
 * to set the 'timeZone' when building the formatter. The 'timeZone' is defaulted
 * to the user's browser timezone.
 * @param {DateFormatterBuildParams} [param0]
 * @returns Intl.DateTimeFormat
 */
export function buildTimeFormatter({
  locale = getDefaultLocale(), 
  options
}: TimeFormatterBuildParams): Intl.DateTimeFormat {
  const opts = (typeof options === 'string') ? { dateStyle: options } : options ?? {};
  const {formatOptions = {}, ...localeOptions} = extractLocaleOptions(opts);
  const { timeStyle, ...rest } = formatOptions;
  const newOptions = {
    ...localeOptions,
    ...(timeStyle ? { timeStyle } : rest),
  };
  return new Intl.DateTimeFormat(locale, newOptions);
}

