import { resourceAvailabilityFeature } from "./availability";
import { dayEventLayoutFeature } from "./dayLayout";
import { eventDependencyFeature } from "./dependency";
import { historyFeature } from "./history";
import { eventRecurrenceFeature } from "./recurrence";
import { eventResizeFeature } from "./resize";
import { timelineFeature } from "./timeline";
import type { CalendarFeatureFactory } from "./types";

export type CalendarFeatureList = ReadonlyArray<CalendarFeatureFactory>;

export function calendarFeatures<const TFeatures extends CalendarFeatureList>(
  features: TFeatures,
): TFeatures {
  return features;
}

export const stockFeatures = [
  historyFeature,
  eventRecurrenceFeature,
  eventDependencyFeature,
  resourceAvailabilityFeature,
  eventResizeFeature,
  dayEventLayoutFeature,
  timelineFeature,
] as const;

export type StockFeatures = typeof stockFeatures;
