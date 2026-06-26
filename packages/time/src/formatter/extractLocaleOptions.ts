import type {
  DateFormatterOptions,
  DateTimeFormatterOptions,
  TimeFormatterOptions,
} from "./shared";
import { getDateTimeDefaults } from "~/utils";

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
 */

/**
 * Function: extractLocaleOptions
 * This function is used to extract the locale options from the 'options' parameter of the various
 * formatter 'build' functions.
 *
 * If 'calender' or 'timeZone' are not provided, the default values provided by the
 * Intl.DateTimeFormat().resolvedOptions() are used.
 * @param {DateFormatterOptions | DateTimeFormatterOptions | TimeFormatterOptions} param0
 * @returns
 */
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
  };
}
