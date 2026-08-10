import { Temporal } from "@js-temporal/polyfill";
import { toZonedDateTime } from "../helpers";
import { resolveOptions, toInstantDate } from "../withDateOperation";
import type { DateInput, DateOptions, Range } from "../types";

export interface ClampOptions extends DateOptions {
  range: Range;
}

export function clamp(input: DateInput, options: ClampOptions): Date {
  const resolved = resolveOptions(options);
  const {
    range: { start, end },
  } = options;

  const zdt = toZonedDateTime(input, resolved.timeZone, resolved.calendar);
  const startZdt = toZonedDateTime(start, resolved.timeZone, resolved.calendar);
  const endZdt = toZonedDateTime(end, resolved.timeZone, resolved.calendar);

  if (Temporal.ZonedDateTime.compare(zdt, startZdt) < 0) {
    return toInstantDate(startZdt);
  }

  if (Temporal.ZonedDateTime.compare(zdt, endZdt) > 0) {
    return toInstantDate(endZdt);
  }

  return toInstantDate(zdt);
}
