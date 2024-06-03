import { getDefaultLocale } from "../utils/dateDefaults";
import { extractLocaleOptions } from "./extractLocaleOptions";
import type { DateTimeFormatterBuildParams } from "./shared";

/**
 * @typedef {Object} DateTimeFormatterOptions
 * @property {string} [localeMatcher]
 * @property {string} [calendar]
 * @property {string} [numberingSystem]
 * @property {boolean} [hour12]
 * @property {string} [hourCycle]
 * @property {string} [timeZone]
 * @property {string} [formatMatcher]
 * @property {string} [weekday]
 * @property {string} [era]
 * @property {string} [year]
 * @property {string} [month]
 * @property {string} [day]
 * @property {string} [dateStyle]
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
 * @typedef {Object} DateTimeFormatterOptions
 * @property {Locale} [locale]
 * @property {string | DateFormatterOptions} [options]
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
 * @param {IDateFormatterBuildParams} [param0]
 * @returns Intl.DateTimeFormat
 */
export function buildDateTimeFormatter({
  locale = getDefaultLocale(), 
  options
}: DateTimeFormatterBuildParams): Intl.DateTimeFormat {
  const opts = (typeof options === 'string') ? { dateStyle: options, timeStyle: options } : options ?? {};
  const {formatOptions = {}, ...localeOptions} = extractLocaleOptions(opts);
  const { dateStyle, timeStyle, ...rest } = formatOptions;
  const newOptions = {
    ...localeOptions,
    ...(dateStyle && timeStyle ? { dateStyle, timeStyle } : rest),
  };
  return new Intl.DateTimeFormat(locale, newOptions);
}