import { splitMultiDay } from "~/projection";
import type { Temporal } from "@js-temporal/polyfill";
import type { Event, Resource } from "./types";

export const splitMultiDayEvents = <
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  event: TEvent,
  timeZone: Temporal.TimeZoneLike,
): Array<TEvent> => splitMultiDay(event, timeZone);
