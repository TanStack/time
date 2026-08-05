import { Temporal } from "@js-temporal/polyfill";
import { toZonedDateTime } from "../helpers";
import type { DateInput, DateOptions, Range } from "../types";
import { getDateTimeDefaults } from "~/utils";

export interface IsBetweenOptions extends DateOptions {
  inclusive?: boolean | "start" | "end";
  range: Range;
}

export function isBetween(date: DateInput, options: IsBetweenOptions): boolean {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults();
  const {
    range: { start, end },
    timeZone = defaultTimeZone,
    calendar = defaultCalendar,
    inclusive = true,
  } = options;
  const zdt = toZonedDateTime(date, timeZone, calendar);
  const zdtStart = toZonedDateTime(start, timeZone, calendar);
  const zdtEnd = toZonedDateTime(end, timeZone, calendar);

  const compareStart = Temporal.ZonedDateTime.compare(zdt, zdtStart);
  const compareEnd = Temporal.ZonedDateTime.compare(zdt, zdtEnd);

  if (inclusive === true) {
    return compareStart >= 0 && compareEnd <= 0;
  } else if (inclusive === "start") {
    return compareStart >= 0 && compareEnd < 0;
  } else if (inclusive === "end") {
    return compareStart > 0 && compareEnd <= 0;
  } else {
    return compareStart > 0 && compareEnd < 0;
  }
}
