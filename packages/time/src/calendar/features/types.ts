import type { Temporal } from '@js-temporal/polyfill'
import type { LayoutOptions } from '~/projection'
import type { WorkingTimeConfig } from '~/validation/availability'
import type { IntentOp, InvertibleOp, KernelEvent, Module, ModuleApi } from '~/kernel'
import type {
  CalendarStore,
  Day,
  Event,
  EventDependency,
  Resource,
  ResizeError,
  SaveEventResult,
} from '../types'

export interface CalendarHost<TResource extends Resource, TEvent extends Event<TResource>> {
  getEvent: (id: string) => TEvent | undefined
  getEvents: () => Array<TEvent>
  getState: () => CalendarStore
  getOptions: () => {
    timeZone: Temporal.TimeZoneLike
    resources: Array<TResource> | null
    workingTime: WorkingTimeConfig
    layout?: LayoutOptions
  }
  getEventMap: (window?: { start: string; end: string }) => Map<string, Array<TEvent>>
  getDaysWithEvents: () => Array<Day<TResource, TEvent>>
  getEventsByDate: (date: string) => Array<TEvent>
  invalidateEvents: () => void
  goToSpecificPeriod: (isoDate: string) => void
  write: (
    ops: Array<InvertibleOp<TEvent> | IntentOp>,
    reason: string,
  ) => Array<InvertibleOp<TEvent>>
  fetchEventsForRange: (start: string, end: string) => Promise<void>
  editEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, 'id'>>,
    options?: { dependsOn?: Array<EventDependency> },
  ) => Promise<SaveEventResult>
  removeEvent: (id: string) => void
  commitUpdate: (id: string, updates: Partial<Omit<TEvent, 'id'>>) => void
  validateMove: (
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ) => { blocked: boolean; blockedEventTitle?: string; message?: string }
  validateEventDependencies: (
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<EventDependency>,
  ) => { valid: boolean; error?: ResizeError }
  validateEventPlacement: (event: {
    id?: string
    title: string
    start: string
    end: string
    resources?: Array<TResource | string>
    consumption?: Array<number>
    calendarId?: string
  }) => { blocked: boolean; message?: string }
}

export interface FeatureModuleCtx<TResource extends Resource = Resource> {
  timeZone: Temporal.TimeZoneLike
  getResources: () => Array<TResource>
  getWorkingTime: () => WorkingTimeConfig
}

export interface CalendarFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
  TModuleApi = object,
  TApi = object,
  TName extends string = string,
  TPeers = object,
> {
  name: TName
  requires?: ReadonlyArray<string>
  module?: (ctx: FeatureModuleCtx<TResource>) => Module<TEvent & KernelEvent, TModuleApi>
  api?: (host: CalendarHost<TResource, TEvent>, module: TModuleApi, peers: TPeers) => TApi
}

export interface AnyCalendarFeature<TResource extends Resource, TEvent extends Event<TResource>> {
  name: string
  requires?: ReadonlyArray<string>
  module?: (ctx: FeatureModuleCtx<TResource>) => Module<TEvent & KernelEvent, unknown>
  api?: (host: CalendarHost<TResource, TEvent>, module: never, peers: never) => object | undefined
}

export type CalendarFeatureFactory = () => AnyCalendarFeature<Resource, Event<Resource>>

export type FeatureName<TFactory> = TFactory extends (...args: Array<never>) => {
  name: infer TName
}
  ? TName
  : never

export type FeatureApi<TFeature> = TFeature extends {
  api?: (...args: Array<never>) => infer TApi
}
  ? TApi
  : object

export type FeatureModuleApi<TFeature> = TFeature extends {
  module?: (...args: Array<never>) => infer TModule
}
  ? ModuleApi<TModule>
  : object

type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never

export type ComposedModuleApi<TFeatures> = UnionToIntersection<
  { [K in keyof TFeatures]: FeatureModuleApi<TFeatures[K]> }[keyof TFeatures]
>

export type ComposedFeatureApi<TFeatures> = UnionToIntersection<
  {
    [K in keyof TFeatures]: FeatureApi<TFeatures[K]> & FeatureModuleApi<TFeatures[K]>
  }[keyof TFeatures]
>
