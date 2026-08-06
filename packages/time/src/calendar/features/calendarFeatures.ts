import { dayEventLayoutFeature } from "./dayLayout";
import { eventDependencyFeature } from "./dependency";
import { historyFeature } from "./history";
import { eventRecurrenceFeature } from "./recurrence";
import { eventResizeFeature } from "./resize";
import { timelineFeature } from "./timeline";
import type { Event, Resource } from "../types";
import type { AnyCalendarFeature } from "./types";

export type CalendarFeatureRecord<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = Record<string, AnyCalendarFeature<TResource, TEvent>>;

export function calendarFeatures<
  const TFeatures extends Record<string, { name: string }>,
>(features: TFeatures): TFeatures {
  return features;
}

export function allCalendarFeatures<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>() {
  return {
    history: historyFeature<TResource, TEvent>(),
    recurrence: eventRecurrenceFeature<TResource, TEvent>(),
    dependency: eventDependencyFeature<TResource, TEvent>(),
    resize: eventResizeFeature<TResource, TEvent>(),
    dayLayout: dayEventLayoutFeature<TResource, TEvent>(),
    timeline: timelineFeature<TResource, TEvent>(),
  };
}

export type AllCalendarFeatures<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = ReturnType<typeof allCalendarFeatures<TResource, TEvent>>;
