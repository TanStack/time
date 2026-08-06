import { Temporal } from "@js-temporal/polyfill";
import { currentTimeFraction, layoutTimelineRange } from "~/projection";
import type {
  Day,
  Event,
  Resource,
  TimelineLayout,
  TimelineResourceRow,
} from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

export interface TimelineApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getEventsByResource: () => Map<TResource["id"], Array<TEvent>>;
  getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
}

export function timelineFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  TimelineApi<TResource, TEvent>,
  "timeline"
> {
  const mergedByResource = (
    host: CalendarHost<TResource, TEvent>,
    days: Array<Day<TResource, TEvent>>,
  ): Map<TResource["id"], Array<TEvent>> => {
    const resources = host.getOptions().resources ?? [];
    const map = new Map<TResource["id"], Array<TEvent>>();
    resources.forEach((resource) => map.set(resource.id, []));

    const merged = new Map<string, TEvent>();
    for (const segment of days.flatMap((day) => day.events)) {
      if (merged.has(segment.id)) continue;
      merged.set(segment.id, {
        ...segment,
        start: segment._originalStart ?? segment.start,
        end: segment._originalEnd ?? segment.end,
      } as TEvent);
    }

    for (const event of merged.values()) {
      for (const resource of event.resources ?? []) {
        const id = typeof resource === "string" ? resource : resource.id;
        map.get(id)?.push(event);
      }
    }

    return map;
  };

  return {
    name: "timeline",
    api: (host) => ({
      getEventsByResource: () =>
        mergedByResource(host, host.getDaysWithEvents()),
      getTimelineLayout: () => {
        const days = host.getDaysWithEvents();
        if (days.length === 0) return { rows: [], currentTimePosition: null };

        const isoDates = days.map((day) => day.isoDate);
        const eventsByResource = mergedByResource(host, days);
        const options = host.getOptions();

        const rows: Array<TimelineResourceRow<TResource, TEvent>> = (
          options.resources ?? []
        ).map((resource) => {
          const resourceEvents = eventsByResource.get(resource.id) ?? [];
          const { items, laneCount } = layoutTimelineRange({
            events: resourceEvents,
            firstDay: isoDates[0]!,
            totalDays: isoDates.length,
          });

          return {
            resource,
            events: items.map((item) => ({
              event: resourceEvents[item.index]!,
              left: item.startFraction * 100,
              width: item.durationFraction * 100,
              lane: item.lane,
              startFraction: item.startFraction,
              endFraction: item.endFraction,
              isStartClipped: item.isStartClipped,
              isEndClipped: item.isEndClipped,
            })),
            laneCount,
          };
        });

        const now = Temporal.Now.zonedDateTimeISO(options.timeZone);
        const fraction = currentTimeFraction({
          isoDates,
          now: {
            isoDate: now.toPlainDate().toString({ calendarName: "never" }),
            hour: now.hour,
            minute: now.minute,
          },
        });

        return {
          rows,
          currentTimePosition: fraction === null ? null : fraction * 100,
        };
      },
    }),
  };
}
