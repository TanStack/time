import type { Temporal } from "@js-temporal/polyfill";
import type { DateInput, DateOptions } from "../types";
import { getDateTimeDefaults } from "~/utils";
import { toZonedDateTime } from "~/date/helpers";

export type DateOperationOptions = DateOptions;

export interface ResolvedDateOperationOptions {
  timeZone: string;
  calendar: string;
}

export function resolveOptions(
  options: DateOperationOptions,
): ResolvedDateOperationOptions {
  const { timeZone: defaultTimeZone, calendar: defaultCalendar } =
    getDateTimeDefaults();
  const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
  return { timeZone, calendar };
}

export function toInstantDate(zdt: Temporal.ZonedDateTime): Date {
  return new Date(zdt.epochMilliseconds);
}

export function withDateOperation<TArgs>(
  fn: (zdt: Temporal.ZonedDateTime, args: TArgs) => Temporal.ZonedDateTime,
) {
  return (input: DateInput, options: DateOperationOptions & TArgs): Date => {
    const resolved = resolveOptions(options);
    const inputZdt = toZonedDateTime(
      input,
      resolved.timeZone,
      resolved.calendar,
    );

    return toInstantDate(fn(inputZdt, options));
  };
}
