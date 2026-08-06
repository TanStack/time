import { dayEventLayoutFeature } from "./dayLayout";
import { eventDependencyFeature } from "./dependency";
import { historyFeature } from "./history";
import { eventRecurrenceFeature } from "./recurrence";
import { eventResizeFeature } from "./resize";
import { timelineFeature } from "./timeline";
import type { CalendarFeatureFactory } from "./types";

export type CalendarFeatureRecord = Record<string, CalendarFeatureFactory>;

export function calendarFeatures<const TFeatures extends CalendarFeatureRecord>(
  features: TFeatures,
): TFeatures {
  return features;
}

export const allCalendarFeatures = {
  historyFeature,
  eventRecurrenceFeature,
  eventDependencyFeature,
  eventResizeFeature,
  dayEventLayoutFeature,
  timelineFeature,
};

export type AllCalendarFeatures = typeof allCalendarFeatures;
