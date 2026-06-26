import { Temporal } from "@js-temporal/polyfill";
import { validateDate } from "../validateDate";
import type { DateInput } from "../types";

export function toZonedDateTime(
  input: DateInput,
  timeZone: string,
  calendar: string,
): Temporal.ZonedDateTime {
  if (input instanceof Temporal.ZonedDateTime) {
    return input;
  }

  let dateString: string;

  if (typeof input === "string") {
    if (input.includes("[") && input.includes("]")) {
      return Temporal.ZonedDateTime.from(input);
    }
    const date = validateDate({ date: input });
    dateString = date.toISOString();
  } else if (typeof input === "number") {
    const date = validateDate({ date: input });
    dateString = date.toISOString();
  } else if (input instanceof Date) {
    const date = validateDate({ date: input });
    dateString = date.toISOString();
  } else {
    throw new Error(`Invalid date input type: ${typeof input}`);
  }

  const zonedDateTimeString = `${dateString}[${timeZone}][u-ca=${calendar}]`;
  return Temporal.ZonedDateTime.from(zonedDateTimeString);
}
