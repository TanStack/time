import { toPlainDateTimeString } from "~/date/parse";
import {
  getLayeredWorkingTime,
  invertMinuteRanges,
  mergeMinuteRanges,
  resolveLayeredDayMinutes,
} from "~/workingTime";
import type {
  MinuteRange,
  WorkingCalendar,
  WorkingTimeRange,
} from "~/workingTime";
import type { Event, Resource } from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

export interface WorkingTimeTarget<TResource extends Resource> {
  resourceId?: TResource["id"];
  resourceIds?: Array<TResource["id"]>;
  calendarId?: string;
}

export interface WorkingTimeApi<TResource extends Resource> {
  getEffectiveCalendar: (
    target?: WorkingTimeTarget<TResource>,
  ) => string | undefined;
  getWorkingIntervals: (
    range: WorkingTimeRange,
    target?: WorkingTimeTarget<TResource>,
  ) => Array<WorkingTimeRange>;
  getWorkingMinutes: (
    date: string,
    target?: WorkingTimeTarget<TResource>,
  ) => Array<MinuteRange>;
  getNonWorkingMinutes: (
    date: string,
    target?: WorkingTimeTarget<TResource>,
  ) => Array<MinuteRange>;
  isWorkingTime: (
    range: WorkingTimeRange,
    target?: WorkingTimeTarget<TResource>,
  ) => boolean;
}

export function workingTimeFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  WorkingTimeApi<TResource>,
  "workingTime"
> {
  const minuteCache = new Map<string, Array<MinuteRange>>();
  let cachedForResources: Array<TResource> | null = null;
  let cachedForCalendars: Array<WorkingCalendar> | null | undefined = undefined;

  const resourcesOf = (
    host: CalendarHost<TResource, TEvent>,
  ): Array<TResource> => {
    const { resources, workingTime } = host.getOptions();
    if (
      resources !== cachedForResources ||
      workingTime.calendars !== cachedForCalendars
    ) {
      minuteCache.clear();
      cachedForResources = resources;
      cachedForCalendars = workingTime.calendars;
    }
    return resources ?? [];
  };

  const targetResourceIds = (
    target?: WorkingTimeTarget<TResource>,
  ): Array<string> | undefined => {
    if (target?.resourceIds) return target.resourceIds;
    return target?.resourceId != null ? [target.resourceId] : undefined;
  };

  const layersOf = (
    host: CalendarHost<TResource, TEvent>,
    target?: WorkingTimeTarget<TResource>,
  ): Array<Array<string | undefined>> => {
    const resources = resourcesOf(host);
    const { workingTime } = host.getOptions();
    const ids = targetResourceIds(target);

    const bases = ids
      ? resources
          .filter((resource) => ids.includes(resource.id))
          .map(
            (resource) => resource.calendarId ?? workingTime.defaultCalendarId,
          )
      : [workingTime.defaultCalendarId];

    return bases.map((base) => [base, target?.calendarId]);
  };

  const workingMinutes = (
    host: CalendarHost<TResource, TEvent>,
    date: string,
    target?: WorkingTimeTarget<TResource>,
  ): Array<MinuteRange> => {
    const layers = layersOf(host, target);
    const key = `${layers
      .map((stack) => stack.join(">"))
      .sort()
      .join("|")}@${date}`;
    const cached = minuteCache.get(key);
    if (cached) return cached;

    const { workingTime } = host.getOptions();
    const merged = mergeMinuteRanges(
      layers.flatMap((stack) =>
        resolveLayeredDayMinutes(stack, date, workingTime.calendars),
      ),
    );

    minuteCache.set(key, merged);
    return merged;
  };

  return {
    name: "workingTime",
    api: (host) => ({
      getEffectiveCalendar: (target) => {
        const { workingTime } = host.getOptions();
        if (target?.calendarId) return target.calendarId;

        const id = target?.resourceId ?? target?.resourceIds?.[0];
        const resource =
          id != null
            ? resourcesOf(host).find((candidate) => candidate.id === id)
            : undefined;

        return resource?.calendarId ?? workingTime.defaultCalendarId;
      },
      getWorkingMinutes: (date, target) => workingMinutes(host, date, target),
      getNonWorkingMinutes: (date, target) =>
        invertMinuteRanges(workingMinutes(host, date, target)),
      getWorkingIntervals: (range, target) =>
        getLayeredWorkingTime(
          layersOf(host, target),
          {
            start: toPlainDateTimeString(range.start),
            end: toPlainDateTimeString(range.end),
          },
          host.getOptions().workingTime.calendars,
        ),
      isWorkingTime: (range, target) => {
        const start = toPlainDateTimeString(range.start);
        const end = toPlainDateTimeString(range.end);
        if (end <= start) return false;

        const [covering, ...rest] = getLayeredWorkingTime(
          layersOf(host, target),
          { start, end },
          host.getOptions().workingTime.calendars,
        );

        return (
          rest.length === 0 &&
          covering !== undefined &&
          covering.start === start &&
          covering.end === end
        );
      },
    }),
  };
}
