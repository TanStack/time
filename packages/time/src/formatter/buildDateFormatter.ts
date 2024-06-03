import { getDefaultLocale } from "../utils/dateDefaults";
import { extractLocaleOptions } from "./extractLocaleOptions";
import type { DateFormatterBuildParams } from "./shared";

/**
 * @typedef {Object} DateFormatterOptions
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
 * 
 * @typedef {string | Intl.Locale | string[] | Intl.Locale[]} Locale
 * 
 * @typedef {Object} DateFormatterBuildParams
 * @property {Locale} [locale]
 * @property {string | DateFormatterOptions} [options]
 */

/**
 * Function: buildDateFormatter
 * This function is used to build a date only formatter, using the Intl.DateTimeFormat constructor.
 * The 'locale' named parameter can be a string, an Intl.Locale object, or an array of strings 
 * or Intl.Locale objects. This is defaulted to the user's browser locale.
 * 
 * The 'options' named parameter can be a string or an object.
 * 
 * If 'options' is a string, it will be used as the 'dateStyle' option.
 *  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#datestyle as reference.
 * 
 * If 'options' is an object, it will use the Intl.DateTimeFormat 'options'. 
 *  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options as reference.
 * 
 * You use the 'options' object for finer level of control over the date formatting.
 * When using UTC date strings, it is suggested that you use the 'options' object
 * to set the 'timeZone' when building the formatter. The 'timeZone' is defaulted
 * to the user's browser timezone.
 * @param {DateFormatterBuildParams} [param0]
 * @returns Intl.DateTimeFormat
 */
export function buildDateFormatter({
  locale = getDefaultLocale(), 
  options
}: DateFormatterBuildParams = {}): Intl.DateTimeFormat {
  const opts = (typeof options === 'string') ? { dateStyle: options } : options ?? {};
  const {formatOptions = {}, ...localeOptions} = extractLocaleOptions(opts);
  const { dateStyle, ...rest } = formatOptions;
  const newOptions = {
    ...localeOptions,
    ...(dateStyle ? { dateStyle } : rest),
  };
  return new Intl.DateTimeFormat(locale, newOptions);
}