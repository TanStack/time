import type { Temporal } from "@js-temporal/polyfill";

/**
 * Normalizes a ZonedDateTime to midnight for week-level comparisons
 * This is needed because startOf('week') only adjusts the day but preserves time components
 */
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
