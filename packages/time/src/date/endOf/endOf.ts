import { withDateOperation } from "../withDateOperation";
import type { DateOperationOptions } from "../withDateOperation";
import type { DateInput } from "../types";

export type EndOfUnit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

export interface EndOfOptions extends DateOperationOptions {
  unit: EndOfUnit;
}

/**
 * endOf
 * Returns the end of a given unit for a date/time instance
 */
export function endOf(input: DateInput, options: EndOfOptions) {
  return withDateOperation<EndOfOptions>((zdt, { unit }) => {
    switch (unit) {
      case "year":
        return zdt.with({
          month: 12,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
          microsecond: 0,
          nanosecond: 0,
        });
      case "month": {
        const daysInMonth = zdt.daysInMonth;
        return zdt.with({
          day: daysInMonth,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
          microsecond: 0,
          nanosecond: 0,
        });
      }
      case "week": {
        const dayOfWeek = zdt.dayOfWeek;
        const daysToAdd = dayOfWeek === 7 ? 0 : 7 - dayOfWeek;
        const endOfWeekDay =
          daysToAdd === 0 ? zdt : zdt.add({ days: daysToAdd });
        return endOfWeekDay.with({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
          microsecond: 0,
          nanosecond: 0,
        });
      }
      case "day":
        return zdt.with({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
          microsecond: 0,
          nanosecond: 0,
        });
      case "hour":
        return zdt.with({
          minute: 59,
          second: 59,
          millisecond: 999,
          microsecond: 0,
          nanosecond: 0,
        });
      case "minute":
        return zdt.with({
          second: 59,
          millisecond: 999,
          microsecond: 0,
          nanosecond: 0,
        });
      case "second":
        return zdt.with({ millisecond: 999, microsecond: 0, nanosecond: 0 });
      case "millisecond":
        return zdt.with({ microsecond: 999, nanosecond: 0 });
      default:
        return zdt;
    }
  })(input, options);
}
