import { toZonedDateTime } from "../helpers";
import type { DateInput, DateOptions } from "../types";
import { getDateTimeDefaults } from "~/utils";

export interface GetUnixTimeOptions extends DateOptions {}

export function getUnixTime(
  date: DateInput,
  options?: GetUnixTimeOptions,
): number {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults();
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } =
    options ?? {};

  const zdt = toZonedDateTime(date, timeZone, calendar);
  return Number(zdt.epochNanoseconds / 1_000_000_000n);
}
