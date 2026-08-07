import { availabilityModule } from "~/kernel/modules";
import { toUnavailableRanges } from "~/projection";
import {
  checkDaySpan,
  getUnavailabilityDetails as computeUnavailabilityDetails,
  mergeUnavailableMinuteRanges,
} from "~/validation/availability";
import type { KernelEvent } from "~/kernel";
import type { AvailabilityModuleApi } from "~/kernel/modules";
import type {
  AvailabilityConflict,
  MinuteRange,
} from "~/validation/availability";
import type { UnavailableRange } from "~/projection";
import type { UnavailableTimeRange } from "../getResizeProps";
import type { Event, Resource } from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

export interface UnavailabilityDetail {
  resourceId: string;
  resourceLabel: string;
  reason: "outside-hours" | "capacity" | "no-availability";
  description: string;
}

export interface AvailabilityApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getUnavailableRanges: (
    date: string,
    options?: { resourceIds?: Array<TResource["id"]> },
  ) => Array<UnavailableRange>;
  getUnavailableMinuteRanges: (
    date: string,
    options?: { resourceIds?: Array<TResource["id"]> },
  ) => Array<UnavailableTimeRange>;
  getUnavailabilityDetails: (
    date: string,
    startMinutes: number,
    endMinutes: number,
    options?: { resourceIds?: Array<TResource["id"]> },
  ) => Array<UnavailabilityDetail>;
  getDaySpanConflicts: (options: {
    date: string;
    startMinutes: number;
    endMinutes: number;
    eventId: string;
    resourceIds: Array<TResource["id"]>;
    event?: TEvent;
  }) => Array<AvailabilityConflict>;
  checkEventAvailability: (
    event: TEvent,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ) => AvailabilityConflict | null;
  validateEventPlacement: (event: {
    id?: string;
    title: string;
    start: string;
    end: string;
    resources?: Array<TResource | string>;
    consumption?: Array<number>;
  }) => { blocked: boolean; message?: string };
}

export function resourceAvailabilityFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  AvailabilityModuleApi,
  AvailabilityApi<TResource, TEvent>,
  "availability"
> {
  const minuteCache = new Map<string, Array<MinuteRange>>();
  let cachedFor: Array<TResource> | null = null;

  const resourcesOf = (
    host: CalendarHost<TResource, TEvent>,
  ): Array<TResource> | null => {
    const resources = host.getOptions().resources;
    if (resources !== cachedFor) {
      minuteCache.clear();
      cachedFor = resources;
    }
    return resources;
  };

  const resourceIdsOf = (event: {
    resources?: Array<TResource | string>;
  }): Array<string> =>
    (event.resources ?? []).map((r) => (typeof r === "string" ? r : r.id));

  const mergedMinutes = (
    host: CalendarHost<TResource, TEvent>,
    date: string,
    resourceIds?: Array<TResource["id"]>,
  ): Array<MinuteRange> | null => {
    const allResources = resourcesOf(host);
    if (!allResources || allResources.length === 0) return null;

    const ids = (
      resourceIds
        ? allResources
            .filter((r) => resourceIds.includes(r.id))
            .map((r) => r.id)
        : allResources.map((r) => r.id)
    ).slice();
    if (ids.length === 0) return null;

    const cacheKey = `${ids.slice().sort().join(",")}|${date}`;
    const cached = minuteCache.get(cacheKey);
    if (cached) return cached;

    const merged = mergeUnavailableMinuteRanges(allResources, date, ids);
    if (merged === null) return null;

    minuteCache.set(cacheKey, merged);
    return merged;
  };

  const details = (
    host: CalendarHost<TResource, TEvent>,
    date: string,
    startMinutes: number,
    endMinutes: number,
    resourceIds?: Array<TResource["id"]>,
  ): Array<UnavailabilityDetail> => {
    const all = host.getOptions().resources;
    const resources = resourceIds
      ? all?.filter((resource) => resourceIds.includes(resource.id))
      : all;
    if (!resources || resources.length === 0) return [];

    return computeUnavailabilityDetails(
      resources,
      date,
      startMinutes,
      endMinutes,
    );
  };

  const conflictOf = (
    module: AvailabilityModuleApi,
    event: TEvent,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ): AvailabilityConflict | null => {
    const [conflict] = module.evaluateAvailability({
      id: event.id,
      title: event.title,
      start: newStart,
      end: newEnd,
      resources: newResources ?? event.resources,
      consumption: newConsumption ?? event.consumption,
    });

    return conflict ?? null;
  };

  return {
    name: "availability",
    module: (ctx) =>
      availabilityModule<TEvent & KernelEvent>({
        resources: () => ctx.getResources(),
      }),
    api: (host, module) => ({
      getUnavailableRanges: (date, options) => {
        const merged = mergedMinutes(host, date, options?.resourceIds);
        if (merged === null) return [];

        return toUnavailableRanges(merged);
      },
      getUnavailableMinuteRanges: (date, options) => {
        const merged = mergedMinutes(host, date, options?.resourceIds);
        if (!merged) return [];

        return merged.map((r) => ({
          startMinutes: r.startMinutes,
          endMinutes: r.endMinutes,
        }));
      },
      getUnavailabilityDetails: (date, startMinutes, endMinutes, options) =>
        details(host, date, startMinutes, endMinutes, options?.resourceIds),
      getDaySpanConflicts: (options) => {
        const resources = (host.getOptions().resources ?? []).filter(
          (resource) => options.resourceIds.includes(resource.id),
        );
        const selfEvent = options.event ?? host.getEvent(options.eventId);

        return checkDaySpan({
          date: options.date,
          startMinutes: options.startMinutes,
          endMinutes: options.endMinutes,
          resources,
          consumption: selfEvent?.consumption,
          otherEvents: host
            .getEventsByDate(options.date)
            .filter((event) => event.id !== options.eventId)
            .map((event) => {
              const start = new Date(event.start);
              const end = new Date(event.end);
              return {
                id: event.id,
                startMinutes: start.getHours() * 60 + start.getMinutes(),
                endMinutes: end.getHours() * 60 + end.getMinutes(),
                resourceIds: resourceIdsOf(event),
                consumption: event.consumption,
              };
            }),
        });
      },
      checkEventAvailability: (
        event,
        newStart,
        newEnd,
        newResources,
        newConsumption,
      ) =>
        conflictOf(
          module,
          event,
          newStart,
          newEnd,
          newResources,
          newConsumption,
        ),
      validateEventPlacement: (event) => {
        const placeholder = {
          id: event.id ?? "__validate_placement__",
          title: event.title,
          start: event.start,
          end: event.end,
          resources: event.resources,
          consumption: event.consumption,
        } as TEvent;

        const conflict = conflictOf(
          module,
          placeholder,
          event.start,
          event.end,
          event.resources,
          event.consumption,
        );
        if (!conflict) return { blocked: false };

        const isCapacity = conflict.resourceDetails.some(
          (d) => d.reason === "capacity",
        );

        return {
          blocked: true,
          message: isCapacity
            ? `Cannot place "${event.title}" here — ${conflict.description}.`
            : `Cannot place "${event.title}" here — it falls inside an unavailable zone.`,
        };
      },
    }),
  };
}
