import { resourceAvailabilityFeature } from "./availability";
import { dayEventLayoutFeature } from "./dayLayout";
import { eventDependencyFeature } from "./dependency";
import { historyFeature } from "./history";
import { eventRecurrenceFeature } from "./recurrence";
import { timelineFeature } from "./timeline";
import { workingTimeFeature } from "./workingTime";

export const stockFeatures = [
  historyFeature,
  eventRecurrenceFeature,
  eventDependencyFeature,
  workingTimeFeature,
  resourceAvailabilityFeature,
  dayEventLayoutFeature,
  timelineFeature,
] as const;

export type StockFeatures = typeof stockFeatures;
