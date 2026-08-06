import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";
import { getEventProps } from "../getEventProps";
import type { LayoutOptions } from "~/projection";
import type { Event, EventProps, GetEventProps, Resource } from "../types";
import type { CalendarFeature, CalendarHost } from "./types";

export interface DayLayoutApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getEventProps: GetEventProps<TResource, TEvent>;
}

export function dayEventLayoutFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  DayLayoutApi<TResource, TEvent>,
  "dayLayout"
> {
  const daySegments = (
    host: CalendarHost<TResource, TEvent>,
    event: TEvent,
  ): Array<TEvent> => {
    const isoDate = toPlainDateTimeString(event.start).slice(0, 10);
    const nextDay = Temporal.PlainDate.from(isoDate)
      .add({ days: 1 })
      .toString({ calendarName: "never" });

    return (
      host.getEventMap({ start: isoDate, end: nextDay }).get(isoDate) ?? []
    );
  };

  return {
    name: "dayLayout",
    api: (host) => ({
      getEventProps: (event, layoutOptions?: LayoutOptions) => {
        const options = host.getOptions();
        return getEventProps(host.getEventMap(), event, host.getState(), {
          timeZone: options.timeZone,
          ...options.layout,
          ...layoutOptions,
          daySegments: daySegments(host, event),
        }) as EventProps<TResource, TEvent>;
      },
    }),
  };
}
