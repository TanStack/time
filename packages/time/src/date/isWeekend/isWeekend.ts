import type { DateInput, DateOptions } from "../types";
import { toZonedDateTime } from "~/date/helpers";
import { getDateTimeDefaults } from "~/utils";
import { getWeekInfo } from "../../polyfills/getWeekInfo";

export interface IsWeekendOptions extends DateOptions {
  locale?: string;
}

export function isWeekend(
  date: DateInput,
  options?: IsWeekendOptions,
): boolean {
  const {
    timeZone: defaultTimeZone,
    calendar: defaultCalendar,
    locale: defaultLocale,
  } = getDateTimeDefaults();
  const {
    timeZone = defaultTimeZone,
    calendar = defaultCalendar,
    locale = defaultLocale,
  } = options ?? {};

  const zdt = toZonedDateTime(date, timeZone, calendar);
  const dayOfWeek = zdt.dayOfWeek;
  const weekInfo = getWeekInfo(locale);

  return weekInfo.weekend.includes(dayOfWeek);
}
