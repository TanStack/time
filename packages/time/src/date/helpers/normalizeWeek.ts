import type { Temporal } from "@js-temporal/polyfill";

export function normalizeWeek(
  zdt: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime {
  return zdt.with({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}
