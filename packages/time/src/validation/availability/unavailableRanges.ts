import {
  getWeekday,
  invertMinuteRanges,
  mergeMinuteRanges,
  MINUTES_IN_DAY,
  resourceDayAvail,
  type MinuteRange,
} from "./time";
import type { AvailabilityResourceInput } from "./checkAvailability";

/**
 * Minutes of `date` that none of the selected resources can serve, as a merged, sorted list.
 * A minute counts as unavailable only when every resource is unavailable for it.
 *
 * Returns `null` when availability is unknowable — no resources at all, or none matching
 * `resourceIds` — which callers render as "no constraint" rather than "blocked all day".
 */
export function mergeUnavailableMinuteRanges(
  resources: Array<AvailabilityResourceInput> | null | undefined,
  date: string,
  resourceIds?: Array<string>,
): Array<MinuteRange> | null {
  if (!resources || resources.length === 0) return null;

  const selected = resourceIds
    ? resources.filter((resource) => resourceIds.includes(resource.id))
    : resources;
  if (selected.length === 0) return null;

  const weekday = getWeekday(date);
  const available: Array<MinuteRange> = [];
  for (const resource of selected) {
    if (!resource.availability) continue;
    available.push(
      ...resourceDayAvail(resource.availability, weekday).available,
    );
  }

  if (available.length === 0) {
    return [{ startMinutes: 0, endMinutes: MINUTES_IN_DAY }];
  }

  return invertMinuteRanges(mergeMinuteRanges(available));
}
