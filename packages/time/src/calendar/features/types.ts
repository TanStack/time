import type { KernelEvent, Module, ModuleApi } from "~/kernel";
import type { Event, Resource } from "../types";

export interface CalendarHost<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  getEvent: (id: string) => TEvent | undefined;
  getEvents: () => Array<TEvent>;
  getActiveDate: () => string;
  goToSpecificPeriod: (isoDate: string) => void;
  commitUpdate: (id: string, updates: Partial<Omit<TEvent, "id">>) => void;
  validateMove: (
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ) => { blocked: boolean; blockedEventTitle?: string; message?: string };
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
