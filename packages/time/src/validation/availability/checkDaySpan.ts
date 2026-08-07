import { getUnavailabilityDetails } from "./checkAvailability";
import { toUnavailabilityConflict } from "./conflicts";
import { formatMinutesToTime, resourceDayWorkingTime } from "./time";
import { mergeUnavailableMinuteRanges } from "./unavailableRanges";
import type {
  AvailabilityConflict,
  AvailabilityResourceInput,
} from "./checkAvailability";
import type { MinuteRange, WorkingTimeConfig } from "./time";

export interface DaySpanEvent {
  id: string;
  startMinutes: number;
  endMinutes: number;
  resourceIds: Array<string>;
  consumption?: Array<number>;
}

export interface CheckDaySpanInput {
  date: string;
  startMinutes: number;
  endMinutes: number;
  resources: Array<AvailabilityResourceInput>;
  workingTime: WorkingTimeConfig;
  otherEvents?: Array<DaySpanEvent>;
  consumption?: Array<number>;
}

const overlaps = (a: MinuteRange, b: MinuteRange): boolean =>
  a.startMinutes < b.endMinutes && a.endMinutes > b.startMinutes;

const sum = (values: Array<number>): number =>
  values.reduce((total, value) => total + value, 0);

export function checkDaySpan(
  input: CheckDaySpanInput,
): Array<AvailabilityConflict> {
  const { date, startMinutes, endMinutes, resources, workingTime } = input;
  if (resources.length === 0) return [];

  const span = { startMinutes, endMinutes };
  const conflicts: Array<AvailabilityConflict> = [];

  const details = getUnavailabilityDetails(
    resources,
    date,
    startMinutes,
    endMinutes,
    workingTime,
  );
  const unavailable =
    mergeUnavailableMinuteRanges(resources, date, workingTime) ?? [];

  for (const range of unavailable) {
    if (!overlaps(range, span)) continue;

    const blocking = details.filter((detail) => {
      const resource = resources.find((r) => r.id === detail.resourceId);
      if (!resource) return false;

      const slots = resourceDayWorkingTime(resource, date, workingTime).working;
      if (slots.length === 0) return true;

      return !slots.some((slot) => overlaps(slot, range));
    });
    if (blocking.length === 0) continue;

    conflicts.push(
      toUnavailabilityConflict({
        date,
        startMinutes: Math.max(startMinutes, range.startMinutes),
        endMinutes: Math.min(endMinutes, range.endMinutes),
        details: blocking,
      }),
    );
  }

  const ownConsumption = sum(input.consumption ?? [1]);
  const otherEvents = input.otherEvents ?? [];

  for (const resource of resources) {
    if (!resource.capacity?.length) continue;

    const usedByOthers = otherEvents
      .filter(
        (event) =>
          event.resourceIds.includes(resource.id) && overlaps(event, span),
      )
      .reduce((total, event) => total + sum(event.consumption ?? [1]), 0);

    const capacity = sum(resource.capacity);
    const totalUsage = usedByOthers + ownConsumption;
    if (totalUsage <= capacity) continue;

    const description = `${resource.label}: Capacity exceeded (${totalUsage}/${capacity} units used)`;
    conflicts.push({
      date,
      conflictRange: {
        start: formatMinutesToTime(startMinutes),
        end: formatMinutesToTime(endMinutes),
      },
      resourceIds: [resource.id],
      resourceDetails: [
        {
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: "capacity",
          description,
          capacityInfo: { max: capacity, used: totalUsage, remaining: 0 },
        },
      ],
      description,
    });
  }

  return conflicts;
}
