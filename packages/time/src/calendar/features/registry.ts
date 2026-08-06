import type { KernelEvent } from "~/kernel";
import type {
  DependencyApi,
  RecurrenceApi,
  UndoHistory,
} from "~/kernel/modules";
import type { Event, Resource } from "../types";
import type { DayLayoutApi } from "./dayLayout";
import type { DependencyCreationApi } from "./dependency";
import type { HistoryApi } from "./history";
import type { RecurrenceEditApi, RecurrenceNavigationApi } from "./recurrence";
import type { ResizeFeatureApi } from "./resize";
import type { TimelineApi } from "./timeline";
import type { CalendarFeatureFactory, FeatureName } from "./types";

export interface FeatureApiRegistry<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  history: HistoryApi & UndoHistory<TEvent & KernelEvent>;
  recurrence: RecurrenceNavigationApi &
    RecurrenceEditApi<TResource, TEvent> &
    RecurrenceApi<TEvent & KernelEvent>;
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
  TFeatures extends Record<string, CalendarFeatureFactory>,
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = UnionToIntersection<
  FeatureApiRegistry<TResource, TEvent>[FeatureName<
    TFeatures[keyof TFeatures]
  > &
    keyof FeatureApiRegistry<TResource, TEvent>]
>;
