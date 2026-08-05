import type { Temporal } from "@js-temporal/polyfill";
import type { LayoutOptions } from "~/projection";
import type {
  IntentOp,
  InvertibleOp,
  KernelEvent,
  Module,
  ModuleApi,
} from "~/kernel";
import type {
  CalendarStore,
  Day,
  Event,
  EventDateTimeInput,
  EventDependency,
  RecurrenceEditScope,
  Resource,
  ResizeError,
  SaveEventResult,
  ValidateResizeOptions,
  ValidateResizeResult,
} from "../types";

export interface CalendarHost<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getEvent: (id: string) => TEvent | undefined;
  getEvents: () => Array<TEvent>;
  getState: () => CalendarStore;
  getOptions: () => {
    timeZone: Temporal.TimeZoneLike;
    resources: Array<TResource> | null;
    layout?: LayoutOptions;
  };
  getEventMap: (window?: {
    start: string;
    end: string;
  }) => Map<string, Array<TEvent>>;
  getDaysWithEvents: () => Array<Day<TResource, TEvent>>;
  goToSpecificPeriod: (isoDate: string) => void;
  write: (
    ops: Array<InvertibleOp<TEvent> | IntentOp>,
    reason: string,
  ) => Array<InvertibleOp<TEvent>>;
  fetchEventsForRange: (start: string, end: string) => Promise<void>;
  editEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options?: { dependsOn?: Array<EventDependency> },
  ) => Promise<SaveEventResult>;
  removeEvent: (id: string) => void;
  editRecurringEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
      dependsOn?: Array<EventDependency>;
    },
  ) => Promise<SaveEventResult>;
  commitUpdate: (id: string, updates: Partial<Omit<TEvent, "id">>) => void;
  validateMove: (
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ) => { blocked: boolean; blockedEventTitle?: string; message?: string };
  validateEventDependencies: (
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<EventDependency>,
  ) => { valid: boolean; error?: ResizeError };
  validateResize: (options: ValidateResizeOptions) => ValidateResizeResult;
  validateEventPlacement: (event: {
    id?: string;
    title: string;
    start: string;
    end: string;
    resources?: Array<TResource | string>;
    consumption?: Array<number>;
  }) => { blocked: boolean; message?: string };
}

export interface CalendarFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
  TModuleApi = object,
  TApi = object,
> {
  name: string;
  requires?: ReadonlyArray<string>;
  module?: Module<TEvent & KernelEvent, TModuleApi>;
  api?: (host: CalendarHost<TResource, TEvent>) => TApi;
}

export type FeatureApi<TFeature> = TFeature extends {
  api?: (...args: Array<never>) => infer TApi;
}
  ? TApi
  : object;

export type FeatureModuleApi<TFeature> = TFeature extends {
  module?: infer TModule;
}
  ? ModuleApi<TModule>
  : object;

type UnionToIntersection<TUnion> = (
  TUnion extends unknown
    ? (value: TUnion) => void
    : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

export type ComposedFeatureApi<TFeatures> = UnionToIntersection<
  {
    [K in keyof TFeatures]: FeatureApi<TFeatures[K]> &
      FeatureModuleApi<TFeatures[K]>;
  }[keyof TFeatures]
>;
