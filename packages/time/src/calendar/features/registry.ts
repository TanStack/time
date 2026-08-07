import type { DependencyApi } from "~/kernel/modules";
import type { Event, Resource } from "../types";
import type { DayLayoutApi } from "./dayLayout";
import type { DependencyCreationApi } from "./dependency";
import type { HistoryApi } from "./history";
import type {
  RecurrenceEditApi,
  RecurrenceNavigationApi,
  RecurrenceReadApi,
} from "./recurrence";
import type { ResizeFeatureApi } from "./resize";
import type { TimelineApi } from "./timeline";
import type { CalendarFeatureFactory, FeatureName } from "./types";

export interface FeatureApiRegistry<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  history: HistoryApi;
  recurrence: RecurrenceNavigationApi &
    RecurrenceEditApi<TResource, TEvent> &
    RecurrenceReadApi<TResource, TEvent>;
  dependency: DependencyCreationApi & DependencyApi;
  resize: ResizeFeatureApi<TResource, TEvent>;
  dayLayout: DayLayoutApi<TResource, TEvent>;
  timeline: TimelineApi<TResource, TEvent>;
}

type UnionToIntersection<TUnion> = (
  TUnion extends unknown
    ? (value: TUnion) => void
    : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

export type ComposedApi<
  TFeatures extends ReadonlyArray<CalendarFeatureFactory>,
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = UnionToIntersection<
  FeatureApiRegistry<TResource, TEvent>[FeatureName<TFeatures[number]> &
    keyof FeatureApiRegistry<TResource, TEvent>]
>;

export type FullFeatureApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = UnionToIntersection<
  FeatureApiRegistry<TResource, TEvent>[keyof FeatureApiRegistry<
    TResource,
    TEvent
  >]
>;

export const FEATURE_API_OWNERS = {
  undo: "historyFeature",
  redo: "historyFeature",
  canUndo: "historyFeature",
  canRedo: "historyFeature",
  getMasterEvent: "eventRecurrenceFeature",
  goToNextOccurrence: "eventRecurrenceFeature",
  goToPreviousOccurrence: "eventRecurrenceFeature",
  editRecurringEvent: "eventRecurrenceFeature",
  removeRecurringEvent: "eventRecurrenceFeature",
  createDependency: "eventDependencyFeature",
  validateEventDependencies: "eventDependencyFeature",
  createResizeController: "eventResizeFeature",
  getEventSegmentInfo: "eventResizeFeature",
  getEventProps: "dayEventLayoutFeature",
  getEventsByResource: "timelineFeature",
  getTimelineLayout: "timelineFeature",
} as const satisfies Record<
  keyof FullFeatureApi<Resource, Event<Resource>>,
  string
>;
