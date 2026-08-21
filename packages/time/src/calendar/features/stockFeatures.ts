import { resourceAvailabilityFeature } from "./availability";
import { schedulingConstraintFeature } from "./constraint";
import { dayEventLayoutFeature } from "./dayLayout";
import { eventDependencyFeature } from "./dependency";
import { eventDurationFeature } from "./duration";
import { eventFilterFeature } from "./filter";
import { historyFeature } from "./history";
import { eventRecurrenceFeature } from "./recurrence";
import { eventMoveFeature } from "./move";
import { eventResizeFeature } from "./resize";
import { timelineFeature } from "./timeline";
import { workingTimeFeature } from "./workingTime";

export const stockFeatures = [
  historyFeature,
  eventRecurrenceFeature,
  eventDependencyFeature,
  schedulingConstraintFeature,
  eventDurationFeature,
  eventFilterFeature,
  workingTimeFeature,
  resourceAvailabilityFeature,
  eventResizeFeature,
  eventMoveFeature,
  dayEventLayoutFeature,
  timelineFeature,
] as const;

export type StockFeatures = typeof stockFeatures;
