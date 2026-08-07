import {
  invertMinuteRanges,
  mergeMinuteRanges,
  MINUTES_IN_DAY,
  resourceDayWorkingTime,
  type MinuteRange,
} from "./time";
import type { AvailabilityResourceInput } from "./checkAvailability";

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

  const available: Array<MinuteRange> = [];
  for (const resource of selected) {
    if (!resource.availability) continue;
    available.push(
      ...resourceDayWorkingTime(resource.availability, date).working,
    );
  }

  if (available.length === 0) {
    return [{ startMinutes: 0, endMinutes: MINUTES_IN_DAY }];
  }

  return invertMinuteRanges(mergeMinuteRanges(available));
}
