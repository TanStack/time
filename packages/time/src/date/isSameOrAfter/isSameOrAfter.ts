import { Temporal } from "@js-temporal/polyfill";
import type { DateInput, DateOptions } from "../types";
import { getDateTimeDefaults } from "~/utils";
import { normalizeWeek } from "~/date/helpers";
import { startOf } from "~/date/startOf/startOf";

export type IsSameOrAfterUnit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

export interface IsSameOrAfterOptions extends DateOptions {
  unit: IsSameOrAfterUnit;
}

export function isSameOrAfter(
  date1: DateInput,
  date2: DateInput,
  options: IsSameOrAfterOptions,
): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults();
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;

  const startOf1 = startOf(date1, { unit: options.unit, timeZone, calendar });
  const startOf2 = startOf(date2, { unit: options.unit, timeZone, calendar });
  const zdt1 = startOf1.asZonedDateTime();
  const zdt2 = startOf2.asZonedDateTime();

  if (options.unit === "week") {
    const normalized1 = normalizeWeek(zdt1);
    const normalized2 = normalizeWeek(zdt2);
    return Temporal.ZonedDateTime.compare(normalized1, normalized2) >= 0;
  }

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) >= 0;
}
