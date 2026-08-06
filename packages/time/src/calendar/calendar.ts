import { Temporal } from "@js-temporal/polyfill";
import { getTimeClient } from "../client";
import { bucketByDay, toUnavailableRanges } from "~/projection";
import type { EventLayout, LayoutOptions, LayoutStyle } from "~/projection";
import {
  expandRecurringEvent,
  masterIdOf,
  getRecurringOccurrence,
  normalizeRecurrenceRule,
} from "~/recurrence";
import { createKernel } from "~/kernel";
import { guardApi } from "~/kernel/apiGuard";
import { allCalendarFeatures } from "./features";
import type {
  AllCalendarFeatures,
  AnyCalendarFeature,
  CalendarFeatureList,
  CalendarHost,
  ComposedApi,
  FeatureModuleCtx,
} from "./features";
import type {
  Module,
  InvertibleOp,
  IntentOp,
  Kernel,
  KernelEvent,
  WriteOp,
} from "~/kernel";
import { groupDaysBy } from "./groupDaysBy";
import { getTimeSlots } from "./getTimeSlots";
import { calculateResizedEvent } from "./getResizeProps";
import { DateCore } from "./date-core";
import { generateDateRange } from "./generateDateRange";
import { ResizeController } from "./resizeController";
import type { DateCoreOptions, ParsedDateCoreOptions } from "./date-core";
import type { ResizeControllerOptions } from "./resizeController";
import type { SegmentInfo, UnavailableTimeRange } from "./getResizeProps";
import type {
  AvailabilityConflict,
  Day,
  DependencyType,
  Event,
  EventDateTimeInput,
  EventDependency,
  RecurrenceEditScope,
  ResizeError,
  Resource,
  SaveEventResult,
  TimeSlot,
  TimelineLayout,
  UnavailableRange,
  ValidateResizeOptions,
  ValidateResizeResult,
} from "./types";
import type { CalendarStore } from "./types";
import { toPlainDateString, toPlainDateTimeString } from "~/date/parse";
import {
  checkAvailability,
  checkDaySpan,
  describeUnavailability,
  formatMinutesToTime,
  getUnavailabilityDetails as computeUnavailabilityDetails,
  mergeUnavailableMinuteRanges,
  MINUTES_IN_DAY,
  toUnavailabilityConflict,
} from "~/validation/availability";
import type {
  AvailabilityOtherEvent,
  MinuteRange,
} from "~/validation/availability";
import {
  computeCascade,
  propagateToDependents,
  propagateToPredecessors,
  requiredForwardShiftMs,
} from "~/validation/dependency";
import type { DependencyGraphEvent } from "~/validation/dependency";

export type * from "./types";
export * from "./date-core";

type WritableEvent<TEvent> = TEvent & KernelEvent;

export interface CalendarCoreOptions<
  TFeatures extends CalendarFeatureList = AllCalendarFeatures,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> extends DateCoreOptions {
  features: TFeatures;

  events?: Array<NoInfer<TEvent>> | null;

  resources?: Array<TResource> | null;

  fetchEvents?: (range: {
    start: string;
    end: string;
  }) => Promise<Array<NoInfer<TEvent>>>;

  layout?: LayoutOptions;
}

interface CalendarActions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  goToPreviousPeriod: () => void;

  goToNextPeriod: () => void;

  goToCurrentPeriod: () => void;

  goToSpecificPeriod: (date: string) => void;

  canGoPreviousPeriod: () => boolean;

  canGoNextPeriod: () => boolean;

  goToNextOccurrence: (eventId: string, fromDate?: EventDateTimeInput) => void;

  goToPreviousOccurrence: (
    eventId: string,
    fromDate?: EventDateTimeInput,
  ) => void;

  getMasterEvent: (event: TEvent) => TEvent;

  changeViewMode: (newViewMode: CalendarStore["viewMode"]) => void;

  getEventProps: (
    event: TEvent,
    layoutOptions?: LayoutOptions,
  ) => {
    isSplitEvent: boolean;
    overlappingEvents: Array<TEvent>;
    start: string;
    end: string;

    layout?: EventLayout;
    style?: LayoutStyle;
  };

  getDaysNames: (weekday?: "long" | "short") => Array<string>;

  groupDaysBy: (props: {
    days: Array<Day<TResource, TEvent> | null>;
    unit: "week" | "workWeek";
    fillMissingDays?: boolean;
  }) => Array<Array<Day<TResource, TEvent> | null>>;

  getTimeSlots: (
    options?: Parameters<typeof getTimeSlots>[1],
  ) => Array<TimeSlot>;

  getEventsByDate: (date: string) => Array<TEvent>;

  getAllDayEventsByDate: (date: string) => Array<TEvent>;

  addEvent: (
    event: TEvent,
    options?: { dependsOn?: Array<EventDependency> },
  ) => Promise<SaveEventResult>;

  editEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options?: { dependsOn?: Array<EventDependency> },
  ) => Promise<SaveEventResult>;

  editRecurringEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
      dependsOn?: Array<EventDependency>;
    },
  ) => Promise<SaveEventResult>;

  removeRecurringEvent: (
    eventId: string,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
    },
  ) => void;

  removeEvent: (id: Event["id"]) => void;

  getUnavailableRanges: (
    date: string,
    options?: {
      resourceIds?: Array<TResource["id"]>;
    },
  ) => Array<UnavailableRange>;

  getEventsByResource: () => Map<TResource["id"], Array<TEvent>>;

  getTimelineLayout: () => TimelineLayout<TResource, TEvent>;

  formatPeriodLabel: (options?: { locale?: string }) => string;

  formatCurrentPeriod: (options?: { locale?: string }) => string;

  getEventSegmentInfo: (event: TEvent) => SegmentInfo;

  getDaysInRange: (start: string, end: string) => Array<Day<TResource, TEvent>>;

  getEvents: () => Array<TEvent>;

  undo: () => void;

  redo: () => void;

  canUndo: () => boolean;

  canRedo: () => boolean;

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

  createDependency: (
    sourceId: string,
    targetId: string,
    type?: DependencyType,
  ) => { blocked: boolean; error?: ResizeError };

  fetchEventsForRange: (start: string, end: string) => Promise<void>;

  validateEventPlacement: (event: {
    title: string;
    start: string;
    end: string;
    resources?: Array<TResource | string>;
  }) => { blocked: boolean; message?: string };
  setResources: (resources: Array<TResource> | null) => void;
  setEvents: (events: Array<TEvent> | null) => void;
}

function buildFeatureApiOwners(): Map<string, string> {
  const owners = new Map<string, string>();
  for (const factory of allCalendarFeatures) {
    const feature = factory();
    const label = factory.name || feature.name;

    if (feature.module) {
      const module = feature.module({ timeZone: "UTC" });
      const api = module.api?.({} as never);
      if (api) {
        for (const key of Object.keys(api)) {
          owners.set(key, label);
        }
      }
    }

    const hostApi = feature.api?.({} as never, {} as never);
    if (hostApi) {
      for (const key of Object.keys(hostApi)) {
        owners.set(key, label);
      }
    }
  }
  return owners;
}

const FEATURE_API_OWNERS = buildFeatureApiOwners();

interface CalendarState<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  currentPeriod: CalendarStore["currentPeriod"];

  viewMode: CalendarStore["viewMode"];

  days: Array<Day<TResource, TEvent>>;

  activeDate: CalendarStore["activeDate"];
}

export interface CalendarApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> extends CalendarActions<TResource, TEvent>,
    CalendarState<TResource, TEvent> {}

type ParsedCalendarCoreOptions<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = ParsedDateCoreOptions & {
  features: TFeatures;
  events: Array<TEvent> | null;
  resources: Array<TResource> | null;
  fetchEvents?: (range: {
    start: string;
    end: string;
  }) => Promise<Array<TEvent>>;
  layout?: LayoutOptions;
};

export class CalendarCore<
    TFeatures extends CalendarFeatureList = AllCalendarFeatures,
    TResource extends Resource = Resource,
    TEvent extends Event<TResource> = Event<TResource>,
  >
  extends DateCore
  implements CalendarActions<TResource, TEvent>
{
  declare options: ParsedCalendarCoreOptions<TFeatures, TResource, TEvent>;

  private _eventMap = new Map<string, TEvent>();
  private _dependentsMap = new Map<string, Set<string>>();
  private _dateIndex = new Map<string, Set<string>>();
  private _loadedRanges: Array<{ start: string; end: string }> = [];
  private _inFlightFetches = 0;
  private _kernel!: Kernel<WritableEvent<TEvent>, unknown>;
  private _features!: ComposedApi<TFeatures, TResource, TEvent>;

  private get _api(): ComposedApi<AllCalendarFeatures, TResource, TEvent> {
    return guardApi(
      this._features as unknown as Record<string, unknown>,
      (key) => this._describeMissingFeatureApi(key),
    ) as never;
  }

  private get _moduleApi(): ComposedApi<
    AllCalendarFeatures,
    TResource,
    TEvent
  > {
    return guardApi(
      this._kernel.api as unknown as Record<string, unknown>,
      (key) => this._describeMissingFeatureApi(key),
    ) as never;
  }

  private _describeMissingFeatureApi(key: string): string {
    const featureName = FEATURE_API_OWNERS.get(key) ?? "a feature";
    return `CalendarCore: "${key}" requires ${featureName}. Compose it via calendarFeatures([${featureName}, ...]).`;
  }

  private _eventsCache: Array<TEvent> | null = null;

  private _mergedUnavailMinuteCache = new Map<string, Array<MinuteRange>>();

  private _mapVersion = 0;
  private _eventMapCache = new Map<string, Map<string, Array<TEvent>>>();
  private _eventMapCacheVersion = -1;

  private _bumpMapVersion() {
    this._mapVersion++;
  }

  private _resolveEventResources(event: {
    resources?: Array<TResource | string>;
  }): Array<TResource> {
    return (event.resources ?? []).map((r) => {
      if (typeof r === "string") {
        return (
          this.options.resources?.find((res) => res.id === r) ??
          ({ id: r, label: r } as TResource)
        );
      }
      return r;
    });
  }

  private _getEventResourceIds(event: {
    resources?: Array<TResource | string>;
  }): Array<string> {
    return (event.resources ?? []).map((r) =>
      typeof r === "string" ? r : r.id,
    );
  }

  constructor(options: CalendarCoreOptions<TFeatures, TResource, TEvent>) {
    super(options);
    Object.assign(this.options, {
      resources: options.resources || null,
      fetchEvents: options.fetchEvents,
      features:
        options.features ?? (allCalendarFeatures as unknown as TFeatures),
    });

    const seed = options.events?.map((e) => this.normalizeEvent(e)) ?? [];
    this._seedKernel(seed);
    Object.defineProperty(this.options, "events", {
      get: () => this._eventsView(),
      set: (next: Array<TEvent> | null) => this.setEvents(next),
      enumerable: true,
      configurable: true,
    });
    seed.forEach((e) => this._indexAddEvent(e));
  }

  private _load(events: Array<TEvent>) {
    this._kernel.load(events as Array<WritableEvent<TEvent>>);
    this._eventsCache = null;
  }

  private _eventsView(): Array<TEvent> {
    this._eventsCache ??= this._kernel.getEvents() as Array<TEvent>;
    return this._eventsCache;
  }

  private _seedKernel(events: Array<TEvent>) {
    this._eventsCache = null;
    const features = this.options.features.map((factory) => factory());
    const ctx: FeatureModuleCtx = { timeZone: this.options.timeZone };

    const modules: Record<string, Module<WritableEvent<TEvent>, unknown>> = {};
    for (const feature of features) {
      const module = feature.module?.(ctx);
      if (module) {
        modules[feature.name] = (module) as unknown as Module<
          WritableEvent<TEvent>,
          unknown
        >;
      }
    }

    this._assertFeatureRequires(features);
    this._kernel = createKernel({
      events: events as Array<WritableEvent<TEvent>>,
      modules,
    }) as unknown as Kernel<WritableEvent<TEvent>, unknown>;

    const host = this._host();
    const api: Record<string, unknown> = {};
    for (const feature of features) {
      const contributed = feature.api?.(
        host as unknown as CalendarHost<Resource, Event<Resource>>,
        this._kernel.api as never,
      );
      if (!contributed) continue;
      for (const [key, value] of Object.entries(contributed)) {
        if (key in api) {
          throw new Error(
            `CalendarCore: feature "${feature.name}" contributes api "${key}", which another composed feature already contributes. Compose only one of them.`,
          );
        }
        api[key] = value;
      }
    }
    this._features = api as ComposedApi<TFeatures, TResource, TEvent>;
  }

  private _assertFeatureRequires(
    features: Array<AnyCalendarFeature<Resource, Event<Resource>>>,
  ) {
    const mounted = new Set(features.map((feature) => feature.name));
    for (const feature of features) {
      for (const required of feature.requires ?? []) {
        if (mounted.has(required)) continue;
        throw new Error(
          `CalendarCore: feature "${feature.name}" requires "${required}", which is not composed. Add it to the features option.`,
        );
      }
    }
  }

  private _host(): CalendarHost<TResource, TEvent> {
    return {
      getEvent: (id) => this._eventMap.get(id),
      getEvents: () => this.getEvents(),
      getState: () => this.store.state,
      getOptions: () => ({
        timeZone: this.options.timeZone,
        resources: this.options.resources,
        layout: this.options.layout,
      }),
      getEventMap: (window) => this.getEventMap(window),
      getDaysWithEvents: () => this.getDaysWithEvents(),
      goToSpecificPeriod: (isoDate) => this.goToSpecificPeriod(isoDate),
      write: (ops, reason) => this._write(ops, reason),
      fetchEventsForRange: (start, end) => this.fetchEventsForRange(start, end),
      editEvent: (eventId, updates, options) =>
        this.editEvent(eventId, updates, options),
      removeEvent: (id) => this.removeEvent(id),
      editRecurringEvent: (eventId, updates, options) =>
        this.editRecurringEvent(eventId, updates, options),
      commitUpdate: (id, updates) => this.commitUpdate(id, updates),
      validateMove: (eventId, newStart, newEnd, resources, consumption) =>
        this.validateMove(eventId, newStart, newEnd, resources, consumption),
      validateEventDependencies: (event, dependsOn) =>
        this.validateEventDependencies(event, dependsOn),
      validateResize: (options) => this.validateResize(options),
      validateEventPlacement: (event) => this.validateEventPlacement(event),
    };
  }

  private _write(
    ops: Array<InvertibleOp<TEvent> | IntentOp>,
    reason: string,
  ): Array<InvertibleOp<TEvent>> {
    const result = this._kernel.write(
      ops as Array<WriteOp<WritableEvent<TEvent>>>,
      reason,
    );
    if (result.status !== "committed") return [];

    const committed = result.batch.ops as unknown as Array<
      InvertibleOp<TEvent>
    >;
    this._applyOps(committed);
    return committed;
  }

  private _eventDateKey(event: TEvent): string {
    const startStr = event.start as string;
    return startStr.split("T")[0] ?? startStr;
  }

  private _indexAddEvent(event: TEvent) {
    this._bumpMapVersion();
    this._eventMap.set(event.id, event);
    const dk = this._eventDateKey(event);
    if (!this._dateIndex.has(dk)) this._dateIndex.set(dk, new Set());
    this._dateIndex.get(dk)!.add(event.id);

    for (const dep of event.dependsOn ?? []) {
      if (!this._dependentsMap.has(dep.id))
        this._dependentsMap.set(dep.id, new Set());
      this._dependentsMap.get(dep.id)!.add(event.id);
    }
  }

  private _indexRemoveEvent(event: TEvent) {
    this._bumpMapVersion();
    this._eventMap.delete(event.id);
    const dk = this._eventDateKey(event);
    const bucket = this._dateIndex.get(dk);
    if (bucket) {
      bucket.delete(event.id);
      if (bucket.size === 0) this._dateIndex.delete(dk);
    }
    for (const dep of event.dependsOn ?? []) {
      this._dependentsMap.get(dep.id)?.delete(event.id);
    }
    this._dependentsMap.delete(event.id);
  }

  private _indexUpdateEvent(prev: TEvent, next: TEvent) {
    this._bumpMapVersion();
    this._eventMap.set(next.id, next);

    const prevDk = this._eventDateKey(prev);
    const nextDk = this._eventDateKey(next);
    if (prevDk !== nextDk) {
      const old = this._dateIndex.get(prevDk);
      if (old) {
        old.delete(prev.id);
        if (old.size === 0) this._dateIndex.delete(prevDk);
      }
      if (!this._dateIndex.has(nextDk)) this._dateIndex.set(nextDk, new Set());
      this._dateIndex.get(nextDk)!.add(next.id);
    }

    const prevDeps = new Map((prev.dependsOn ?? []).map((d) => [d.id, d.type]));
    const nextDeps = new Map((next.dependsOn ?? []).map((d) => [d.id, d.type]));
    for (const [predId] of prevDeps) {
      if (!nextDeps.has(predId)) {
        this._dependentsMap.get(predId)?.delete(next.id);
      }
    }
    for (const [predId] of nextDeps) {
      if (!prevDeps.has(predId)) {
        if (!this._dependentsMap.has(predId))
          this._dependentsMap.set(predId, new Set());
        this._dependentsMap.get(predId)!.add(next.id);
      }
    }
  }

  private _isRangeLoaded(start: string, end: string) {
    for (const r of this._loadedRanges) {
      if (r.start <= start && r.end >= end) return true;
    }
    return false;
  }

  private _markRangeLoaded(start: string, end: string) {
    this._loadedRanges.push({ start, end });
    this._loadedRanges.sort((a, b) => (a.start < b.start ? -1 : 1));
    const merged: Array<{ start: string; end: string }> = [];

    for (const r of this._loadedRanges) {
      const last = merged[merged.length - 1];
      if (last && r.start <= last.end) {
        last.end = last.end > r.end ? last.end : r.end;
      } else {
        merged.push({ ...r });
      }
    }
    this._loadedRanges = merged;
  }

  private normalizeEvent<
    T extends { start: string | Date | number; end: string | Date | number },
  >(event: T): T {
    const recurrence = (event as { recurrence?: TEvent["recurrence"] })
      .recurrence;
    return {
      ...event,
      start: toPlainDateTimeString(event.start),
      end: toPlainDateTimeString(event.end),
      ...(recurrence
        ? { recurrence: this._normalizeRecurrenceDateTimeInputs(recurrence) }
        : {}),
    } as T;
  }

  protected getCalendarDays() {
    return super.getCalendarDays();
  }

  private getEventMap(window?: { start: string; end: string }) {
    let windowStart: string | null;
    let windowEnd: string | null;
    if (window) {
      windowStart = window.start;
      windowEnd = window.end;
    } else {
      const calendarDays = this.getCalendarDays();
      windowStart =
        calendarDays.length > 0
          ? calendarDays[0]!.toString({ calendarName: "never" })
          : null;
      windowEnd =
        calendarDays.length > 0
          ? calendarDays[calendarDays.length - 1]!.add({ days: 1 }).toString({
              calendarName: "never",
            })
          : null;
    }

    if (this._eventMapCacheVersion !== this._mapVersion) {
      this._eventMapCache.clear();
      this._eventMapCacheVersion = this._mapVersion;
    }
    const cacheKey = `${windowStart ?? ""}|${windowEnd ?? ""}`;
    const cached = this._eventMapCache.get(cacheKey);
    if (cached) return cached;

    const projected: Array<TEvent> = [];
    for (const event of this._eventMap.values()) {
      if (event.recurrence && windowStart && windowEnd) {
        projected.push(
          ...expandRecurringEvent<TResource, TEvent>(
            event,
            windowStart,
            windowEnd,
          ),
        );
        continue;
      }
      projected.push(event);
    }

    const map = bucketByDay<TEvent>(projected, this.options.timeZone);

    this._eventMapCache.set(cacheKey, map);
    return map;
  }

  private _beginFetch() {
    this._inFlightFetches++;
    if (this._inFlightFetches === 1) {
      this.store.setState((prev) => ({ ...prev, isPending: true }));
    }
  }

  private _endFetch(eventsChanged: boolean) {
    this._inFlightFetches = Math.max(0, this._inFlightFetches - 1);
    const isPending = this._inFlightFetches > 0;
    this.store.setState((prev) => ({
      ...prev,
      isPending,
      eventsVersion: eventsChanged
        ? prev.eventsVersion + 1
        : prev.eventsVersion,
    }));
  }

  private _indexFetchedEvents(fetchedEvents: Array<TEvent>) {
    const newlyFetchedEvents: Array<{
      eventId: string;
      eventTitle: string;
      start: string;
      end: string;
    }> = [];
    const loaded: Array<TEvent> = [];
    for (const raw of fetchedEvents) {
      if (this._eventMap.has(raw.id)) continue;
      const normalized = this.normalizeEvent(raw);
      loaded.push(normalized);
      this._indexAddEvent(normalized);
      newlyFetchedEvents.push({
        eventId: normalized.id,
        eventTitle: normalized.title,
        start: normalized.start as string,
        end: normalized.end as string,
      });
    }
    if (newlyFetchedEvents.length > 0) {
      this._load(loaded);
      getTimeClient().emit("events:set", { events: newlyFetchedEvents });
    }
  }

  private async _loadRange(start: string, end: string): Promise<void> {
    const fetchEvents = this.options.fetchEvents;
    if (!fetchEvents) return;
    if (this._isRangeLoaded(start, end)) return;

    this._markRangeLoaded(start, end);
    this._beginFetch();

    try {
      const fetchedEvents = await fetchEvents({ start, end });
      if (fetchedEvents.length > 0) {
        this._indexFetchedEvents(fetchedEvents);
      }
      this._endFetch(fetchedEvents.length > 0);
    } catch {
      this._loadedRanges = this._loadedRanges.filter(
        (r) => !(r.start === start && r.end === end),
      );
      this._endFetch(false);
    }
  }

  ensureRangeLoaded() {
    const calendarDays = this.getCalendarDays();
    if (!this.options.fetchEvents || calendarDays.length === 0) return;

    const first = calendarDays[0]!;
    const last = calendarDays[calendarDays.length - 1]!;
    const rangeStart = first.toString({ calendarName: "never" });
    const rangeEnd = last.add({ days: 1 }).toString({ calendarName: "never" });

    void this._loadRange(rangeStart, rangeEnd);
  }

  getDaysWithEvents() {
    return this._buildDays(this.getCalendarDays());
  }

  getDaysInRange(start: string, end: string) {
    const days = generateDateRange(start, end);
    const windowEnd = Temporal.PlainDate.from(end)
      .add({ days: 1 })
      .toString({ calendarName: "never" });
    return this._buildDays(days, { start, end: windowEnd });
  }

  private _buildDays(
    days: Array<Temporal.PlainDate>,
    window?: { start: string; end: string },
  ) {
    const eventMap = this.getEventMap(window);
    const currentMonthRange = Array.from(
      { length: this.store.state.viewMode.value },
      (_, i) => this.currentPeriodPlain.add({ months: i }).month,
    );
    const today = Temporal.Now.plainDateISO();
    return days.map((day) => {
      const isoDate = day.toString({ calendarName: "never" });
      const dailyEvents = eventMap.get(isoDate) ?? [];
      const timedEvents: Array<TEvent> = [];
      const allDayEvents: Array<TEvent> = [];
      for (const ev of dailyEvents) {
        if (ev.allDay) allDayEvents.push(ev);
        else timedEvents.push(ev);
      }
      const isInCurrentPeriod = currentMonthRange.includes(day.month);
      return {
        isoDate,
        events: timedEvents,
        allDayEvents,
        isToday: Temporal.PlainDate.compare(day, today) === 0,
        isInCurrentPeriod,
      };
    });
  }

  getLoadedRanges(): ReadonlyArray<{ start: string; end: string }> {
    return this._loadedRanges;
  }

  async fetchEventsForRange(start: string, end: string): Promise<void> {
    await this._loadRange(start, end);
  }

  formatPeriodLabel(options?: { locale?: string }): string {
    const days = this.getDaysWithEvents();
    if (days.length === 0) return "";

    const locale = options?.locale ?? this.options.locale;
    const first = days[0]!;
    const last = days[days.length - 1]!;

    const fmt = (isoDate: string) =>
      new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    if (days.length === 1) return fmt(first.isoDate);
    return `${fmt(first.isoDate)} \u2014 ${fmt(last.isoDate)}`;
  }

  formatCurrentPeriod(options?: { locale?: string }): string {
    const period = this.currentPeriodPlain;
    const locale = options?.locale ?? this.options.locale;
    return new Date(
      period.year,
      period.month - 1,
      period.day,
    ).toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }

  getEventSegmentInfo(event: TEvent): SegmentInfo {
    return this._api.getEventSegmentInfo(event);
  }

  getEventProps(event: TEvent, layoutOptions?: LayoutOptions) {
    return this._api.getEventProps(event, layoutOptions);
  }

  groupDaysBy({
    days,
    unit,
    fillMissingDays = true,
  }: {
    days: Array<Day<TResource, TEvent> | null>;
    unit: "week" | "workWeek";
    fillMissingDays?: boolean;
  }) {
    return groupDaysBy<TResource, TEvent>({
      days,
      unit,
      fillMissingDays,
      weekStartsOn: this.getWeekStartsOn(),
      locale: this.options.locale,
    });
  }

  getTimeSlots(options?: Parameters<typeof getTimeSlots>[1]): Array<TimeSlot> {
    return getTimeSlots(this.options.locale, options);
  }

  getEventsByDate(date: string): Array<TEvent> {
    const targetDate = Temporal.PlainDate.from(date).toString({
      calendarName: "never",
    });
    const windowEnd = Temporal.PlainDate.from(targetDate)
      .add({ days: 1 })
      .toString({ calendarName: "never" });
    const eventMap = this.getEventMap({ start: targetDate, end: windowEnd });
    const all = eventMap.get(targetDate);
    return all ? [...all] : [];
  }

  getAllDayEventsByDate(date: string): Array<TEvent> {
    const targetDate = Temporal.PlainDate.from(date).toString({
      calendarName: "never",
    });
    const windowEnd = Temporal.PlainDate.from(targetDate)
      .add({ days: 1 })
      .toString({ calendarName: "never" });
    const eventMap = this.getEventMap({ start: targetDate, end: windowEnd });
    const all = eventMap.get(targetDate) ?? [];
    return all.filter((e) => !!e.allDay);
  }

  private _applyOps(ops: Array<InvertibleOp<TEvent>>) {
    this._eventsCache = null;

    for (const op of ops) {
      if (op.kind === "add") {
        this._indexAddEvent(op.event);
        continue;
      }

      if (op.kind === "remove") {
        const current = this._eventMap.get(op.id);
        if (!current) continue;
        this._indexRemoveEvent(current);
        continue;
      }

      const current = this._eventMap.get(op.id);
      if (!current) continue;
      this._indexUpdateEvent(current, op.after);
    }

    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }));
  }

  canUndo() {
    return this._moduleApi.canUndo();
  }

  canRedo() {
    return this._moduleApi.canRedo();
  }

  undo() {
    this._api.undo();
  }

  redo() {
    this._api.redo();
  }

  commitAdd(event: TEvent) {
    const normalized = this.normalizeEvent(event);
    this._write([{ kind: "add", event: normalized }], "add");

    getTimeClient().emit("event:added", {
      eventId: normalized.id,
      eventTitle: normalized.title,
      start: normalized.start as string,
      end: normalized.end as string,
    });
  }

  commitUpdate(id: Event["id"], updates: Partial<Omit<TEvent, "id">>) {
    const existingEvent = this._eventMap.get(id);
    if (!existingEvent) return;

    const recurrenceUpdate = (updates as { recurrence?: TEvent["recurrence"] })
      .recurrence;
    const normalizedUpdates = {
      ...updates,
      ...(updates.start != null
        ? { start: toPlainDateTimeString(updates.start) }
        : {}),
      ...(updates.end != null
        ? { end: toPlainDateTimeString(updates.end) }
        : {}),
      ...(recurrenceUpdate != null
        ? {
            recurrence:
              this._normalizeRecurrenceDateTimeInputs(recurrenceUpdate),
          }
        : {}),
    };

    const nextEvent = {
      ...existingEvent,
      ...normalizedUpdates,
    } as TEvent;

    const committed = this._write(
      [{ kind: "update", id, before: existingEvent, after: nextEvent }],
      "update",
    );

    for (const op of committed) {
      if (op.kind !== "update" || op.id === id) continue;
      getTimeClient().emit("event:updated", {
        eventId: op.id,
        eventTitle: op.before.title,
        start: op.after.start as string,
        end: op.after.end as string,
        updates: {
          start: op.after.start,
          end: op.after.end,
        } as Record<string, unknown>,
      });
    }

    getTimeClient().emit("event:updated", {
      eventId: id,
      eventTitle: existingEvent.title,
      start: toPlainDateTimeString(nextEvent.start),
      end: toPlainDateTimeString(nextEvent.end),
      updates: normalizedUpdates as Record<string, unknown>,
    });
  }

  private _dependencyGraphEvents(override?: {
    id: string;
    start: string;
    end: string;
  }): Array<DependencyGraphEvent> {
    const events: Array<DependencyGraphEvent> = [];
    for (const e of this._eventMap.values()) {
      const moved = override?.id === e.id;
      events.push({
        id: e.id,
        title: e.title,
        start: moved ? override.start : toPlainDateTimeString(e.start),
        end: moved ? override.end : toPlainDateTimeString(e.end),
        dependsOn: e.dependsOn,
      });
    }
    return events;
  }

  private getAffectedByDelta(
    sourceId: string,
    deltaMs: number,
    visited: Set<string>,
  ): Array<{ event: TEvent; newStart: string; newEnd: string }> {
    const shifts = computeCascade({
      sourceId,
      deltaMs,
      events: this._dependencyGraphEvents(),
      timeZone: this.options.timeZone,
      visited,
    });

    const affected: Array<{ event: TEvent; newStart: string; newEnd: string }> =
      [];
    for (const shift of shifts) {
      const event = this._eventMap.get(shift.id);
      if (!event) continue;
      affected.push({
        event,
        newStart: shift.newStart,
        newEnd: shift.newEnd,
      });
    }
    return affected;
  }

  private checkEventAvailability(
    event: TEvent,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ): AvailabilityConflict | null {
    const resources =
      newResources?.map((r) =>
        typeof r === "string"
          ? (this.options.resources?.find((res) => res.id === r) ??
            ({ id: r, label: r } as TResource))
          : r,
      ) || this._resolveEventResources(event);
    if (!resources?.length) return null;

    const otherEvents: Array<AvailabilityOtherEvent> = [];
    for (const candidate of this._eventMap.values()) {
      if (candidate._originalStart) continue;
      otherEvents.push({
        id: candidate.id,
        start: toPlainDateTimeString(candidate.start),
        end: toPlainDateTimeString(candidate.end),
        resourceIds: this._getEventResourceIds(candidate),
        consumption: candidate.consumption,
        masterId: candidate._recurringMasterId ?? candidate.id,
      });
    }

    const [conflict] = checkAvailability({
      event: {
        id: event.id,
        title: event.title,
        start: newStart,
        end: newEnd,
      },
      resources,
      consumption: newConsumption ?? event.consumption,
      otherEvents,
    });

    return conflict ?? null;
  }

  getMasterEvent(event: TEvent): TEvent {
    return this._moduleApi.getMasterEvent(
      event as WritableEvent<TEvent>,
    ) as TEvent;
  }

  getEvents(): Array<TEvent> {
    return [...this._eventsView()];
  }

  private _resolveMasterEvent(eventId: string): TEvent | undefined {
    return (
      this._eventMap.get(eventId) ?? this._eventMap.get(masterIdOf(eventId))
    );
  }

  private _normalizeRecurrenceDateTimeInputs(
    rule: NonNullable<TEvent["recurrence"]>,
  ): NonNullable<TEvent["recurrence"]> {
    return normalizeRecurrenceRule(rule) as NonNullable<TEvent["recurrence"]>;
  }

  private _getRecurringOccurrence(
    master: TEvent,
    occurrenceStart: string,
  ): TEvent | null {
    return getRecurringOccurrence<TResource, TEvent>(master, occurrenceStart);
  }

  private _resolveResizeEvent(
    eventId: string,
    occurrenceStart?: string,
    originalStart?: string,
  ): TEvent | undefined {
    const direct = this._eventMap.get(eventId);
    const master = this._resolveMasterEvent(eventId);

    if (master?.recurrence) {
      const resolvedOccurrenceStart =
        occurrenceStart ??
        (direct ? toPlainDateTimeString(direct.start) : originalStart);
      if (resolvedOccurrenceStart) {
        return (
          this._getRecurringOccurrence(master, resolvedOccurrenceStart) ??
          direct ??
          master
        );
      }
    }

    return direct;
  }

  goToNextOccurrence(eventId: string, fromDate?: EventDateTimeInput) {
    this._api.goToNextOccurrence(eventId, fromDate);
  }

  goToPreviousOccurrence(eventId: string, fromDate?: EventDateTimeInput) {
    this._api.goToPreviousOccurrence(eventId, fromDate);
  }

  createResizeController(
    options: ResizeControllerOptions = {},
  ): ResizeController<TResource, TEvent> {
    return this._api.createResizeController(options);
  }

  validateMove(
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ): { blocked: boolean; blockedEventTitle?: string; message?: string } {
    const event = this._eventMap.get(eventId);
    if (!event || event._originalStart) return { blocked: false };

    const tz = this.options.timeZone;
    const newStartMs =
      Temporal.PlainDateTime.from(newStart).toZonedDateTime(
        tz,
      ).epochMilliseconds;
    const newEndMs =
      Temporal.PlainDateTime.from(newEnd).toZonedDateTime(tz).epochMilliseconds;

    if (event.dependsOn?.length) {
      const pulled = propagateToPredecessors({
        sourceId: eventId,
        events: this._dependencyGraphEvents({
          id: eventId,
          start: newStart,
          end: newEnd,
        }),
        timeZone: tz,
        visited: new Set([eventId]),
      });

      for (const shift of pulled) {
        const pred = this._eventMap.get(shift.id);
        if (!pred) continue;

        if (this.checkEventAvailability(pred, shift.newStart, shift.newEnd)) {
          return {
            blocked: true,
            blockedEventTitle: pred.title,
            message: `"${pred.title}" would be pulled into unavailable time.`,
          };
        }
      }
    }

    const conflict = this.checkEventAvailability(
      event,
      newStart,
      newEnd,
      newResources,
      newConsumption,
    );
    if (conflict) {
      const isCapacity = conflict.resourceDetails.some(
        (d) => d.reason === "capacity",
      );
      const message = isCapacity
        ? `"${event.title}" cannot be placed here — ${conflict.description}.`
        : `"${event.title}" cannot be placed here — it falls inside an unavailable zone.`;
      return {
        blocked: true,
        blockedEventTitle: event.title,
        message,
      };
    }

    const oldStartMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(event.start),
    ).toZonedDateTime(tz).epochMilliseconds;
    const startDeltaMs = newStartMs - oldStartMs;

    if (startDeltaMs !== 0) {
      const affected = this.getAffectedByDelta(
        eventId,
        startDeltaMs,
        new Set([eventId]),
      );
      for (const {
        event: dep,
        newStart: depStart,
        newEnd: depEnd,
      } of affected) {
        const depConflict = this.checkEventAvailability(dep, depStart, depEnd);
        if (depConflict) {
          return {
            blocked: true,
            blockedEventTitle: dep.title,
            message: `"${dep.title}" would be pushed to unavailable time.`,
          };
        }
      }
    }

    const oldEndMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(event.end),
    ).toZonedDateTime(tz).epochMilliseconds;
    const endDeltaMs = newEndMs - oldEndMs;

    if (endDeltaMs > 0) {
      const pushed = propagateToDependents({
        sourceId: eventId,
        events: this._dependencyGraphEvents({
          id: eventId,
          start: newStart,
          end: newEnd,
        }),
        timeZone: tz,
        visited: new Set([eventId]),
      });

      for (const shift of pushed) {
        const successor = this._eventMap.get(shift.id);
        if (!successor) continue;

        if (
          this.checkEventAvailability(successor, shift.newStart, shift.newEnd)
        ) {
          return {
            blocked: true,
            blockedEventTitle: successor.title,
            message: `"${successor.title}" would be pushed into unavailable time.`,
          };
        }
      }
    }

    return { blocked: false };
  }

  validateEventDependencies(
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<EventDependency>,
  ): { valid: boolean; error?: ResizeError } {
    return this._moduleApi.validateEventDependencies(event, dependsOn);
  }

  validateEventPlacement(event: {
    id?: string;
    title: string;
    start: string;
    end: string;
    resources?: Array<TResource | string>;
    consumption?: Array<number>;
  }): { blocked: boolean; message?: string } {
    const placeholderEvent = {
      id: event.id ?? "__validate_placement__",
      title: event.title,
      start: event.start,
      end: event.end,
      resources: event.resources,
      consumption: event.consumption,
    } as TEvent;

    const conflict = this.checkEventAvailability(
      placeholderEvent,
      event.start,
      event.end,
      event.resources,
      event.consumption,
    );

    if (conflict) {
      const isCapacity = conflict.resourceDetails.some(
        (d) => d.reason === "capacity",
      );
      const message = isCapacity
        ? `Cannot place "${event.title}" here — ${conflict.description}.`
        : `Cannot place "${event.title}" here — it falls inside an unavailable zone.`;
      return {
        blocked: true,
        message,
      };
    }

    return { blocked: false };
  }

  async addEvent(
    event: TEvent,
    options?: { dependsOn?: Array<EventDependency> },
  ): Promise<SaveEventResult> {
    const dependsOn = options?.dependsOn;
    const startStr = event.start as string;
    const endStr = event.end as string;

    const startDateStr = startStr.slice(0, 10);
    const endDate = Temporal.PlainDate.from(endStr.slice(0, 10)).add({
      days: 1,
    });
    const endDateStr = endDate.toString({ calendarName: "never" });

    await this.fetchEventsForRange(startDateStr, endDateStr);

    if (dependsOn && dependsOn.length > 0) {
      const depValidation = this.validateEventDependencies(
        { id: event.id, title: event.title, start: startStr, end: endStr },
        dependsOn,
      );
      if (!depValidation.valid && depValidation.error) {
        return { success: false, error: depValidation.error };
      }
    }

    const placementValidation = this.validateEventPlacement({
      id: event.id,
      title: event.title,
      start: startStr,
      end: endStr,
      resources: event.resources,
      consumption: event.consumption,
    });
    if (placementValidation.blocked) {
      return {
        success: false,
        error: {
          eventId: event.id,
          eventTitle: event.title,
          reason: "blocked",
          message:
            placementValidation.message ??
            `Cannot place "${event.title}" here.`,
          originalStart: startStr,
          originalEnd: endStr,
        },
      };
    }

    this.commitAdd(event);
    return { success: true };
  }

  async editEvent(
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options?: { dependsOn?: Array<EventDependency> },
  ): Promise<SaveEventResult> {
    const dependsOn = options?.dependsOn;
    const existingEvent = this._eventMap.get(eventId);
    if (!existingEvent) {
      return {
        success: false,
        error: {
          eventId,
          eventTitle: "",
          reason: "blocked",
          message: `Event "${eventId}" not found.`,
          originalStart: "",
          originalEnd: "",
        },
      };
    }

    const effectiveStart =
      (updates.start as string | undefined) ?? (existingEvent.start as string);
    const effectiveEnd =
      (updates.end as string | undefined) ?? (existingEvent.end as string);

    const oldStartDateStr = (existingEvent.start as string).slice(0, 10);
    const newStartDateStr = effectiveStart.slice(0, 10);
    const rangeStart =
      oldStartDateStr < newStartDateStr ? oldStartDateStr : newStartDateStr;

    const oldEndDate = Temporal.PlainDate.from(
      (existingEvent.end as string).slice(0, 10),
    ).add({ days: 1 });
    const newEndDate = Temporal.PlainDate.from(effectiveEnd.slice(0, 10)).add({
      days: 1,
    });
    const rangeEndPlain =
      Temporal.PlainDate.compare(oldEndDate, newEndDate) > 0
        ? oldEndDate
        : newEndDate;
    const rangeEnd = rangeEndPlain.toString({ calendarName: "never" });

    await this.fetchEventsForRange(rangeStart, rangeEnd);

    if (dependsOn && dependsOn.length > 0) {
      const depValidation = this.validateEventDependencies(
        {
          id: eventId,
          title: (updates.title as string | undefined) ?? existingEvent.title,
          start: effectiveStart,
          end: effectiveEnd,
        },
        dependsOn,
      );
      if (!depValidation.valid && depValidation.error) {
        return { success: false, error: depValidation.error };
      }
    }

    const startChanged = updates.start !== undefined;
    const endChanged = updates.end !== undefined;
    const resourcesChanged = updates.resources !== undefined;
    const consumptionChanged = updates.consumption !== undefined;

    if (startChanged || endChanged || resourcesChanged || consumptionChanged) {
      const resources = updates.resources ?? existingEvent.resources;
      const consumption = updates.consumption ?? existingEvent.consumption;
      const moveValidation = this.validateMove(
        eventId,
        effectiveStart,
        effectiveEnd,
        resources,
        consumption,
      );
      if (moveValidation.blocked) {
        return {
          success: false,
          error: {
            eventId,
            eventTitle: moveValidation.blockedEventTitle ?? existingEvent.title,
            reason: "blocked",
            message:
              moveValidation.message ??
              `Cannot move "${existingEvent.title}" to this position.`,
            originalStart: existingEvent.start as string,
            originalEnd: existingEvent.end as string,
            attemptedStart: effectiveStart,
            attemptedEnd: effectiveEnd,
          },
        };
      }
    }

    this.commitUpdate(eventId, updates);
    return { success: true };
  }

  async editRecurringEvent(
    eventId: string,
    updates: Partial<Omit<TEvent, "id">>,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
      dependsOn?: Array<EventDependency>;
    },
  ): Promise<SaveEventResult> {
    return this._api.editRecurringEvent(eventId, updates, options);
  }

  removeRecurringEvent(
    eventId: string,
    options: {
      scope: RecurrenceEditScope;
      occurrenceStart?: EventDateTimeInput;
    },
  ) {
    this._api.removeRecurringEvent(eventId, options);
  }

  createDependency(
    sourceId: string,
    targetId: string,
    type: DependencyType = "FS",
  ): { blocked: boolean; error?: ResizeError } {
    return this._api.createDependency(sourceId, targetId, type);
  }

  removeEvent(id: Event["id"]) {
    const removedEvent = this._eventMap.get(id);
    if (!removedEvent) return;

    this._write([{ kind: "remove", id, event: removedEvent }], "remove");

    getTimeClient().emit("event:removed", {
      eventId: id,
      eventTitle: removedEvent.title,
      start: removedEvent.start as string,
      end: removedEvent.end as string,
    });
  }

  getUnavailableRanges(
    date: string,
    options?: {
      resourceIds?: Array<TResource["id"]>;
    },
  ): Array<UnavailableRange> {
    const merged = this._getMergedUnavailableMinuteRanges(
      date,
      options?.resourceIds,
    );
    if (merged === null) return [];

    return toUnavailableRanges(merged);
  }

  private _getMergedUnavailableMinuteRanges(
    date: string,
    resourceIds?: Array<TResource["id"]>,
  ): Array<MinuteRange> | null {
    const allResources = this.options.resources;
    if (!allResources || allResources.length === 0) return null;

    const ids = (
      resourceIds
        ? allResources
            .filter((r) => resourceIds.includes(r.id))
            .map((r) => r.id)
        : allResources.map((r) => r.id)
    ).slice();
    if (ids.length === 0) return null;

    const cacheKey = `${ids.slice().sort().join(",")}|${date}`;
    const cached = this._mergedUnavailMinuteCache.get(cacheKey);
    if (cached) return cached;

    const merged = mergeUnavailableMinuteRanges(allResources, date, ids);
    if (merged === null) return null;

    this._mergedUnavailMinuteCache.set(cacheKey, merged);
    return merged;
  }

  getUnavailabilityDetails(
    date: string,
    startMinutes: number,
    endMinutes: number,
    options?: {
      resourceIds?: Array<TResource["id"]>;
    },
  ): Array<{
    resourceId: string;
    resourceLabel: string;
    reason: "outside-hours" | "capacity" | "no-availability";
    description: string;
  }> {
    const resources = options?.resourceIds
      ? this.options.resources?.filter((resource) =>
          options.resourceIds?.includes(resource.id),
        )
      : this.options.resources;

    if (!resources || resources.length === 0) {
      return [];
    }

    return computeUnavailabilityDetails(
      resources,
      date,
      startMinutes,
      endMinutes,
    );
  }

  getEventsByResource(): Map<TResource["id"], Array<TEvent>> {
    return this._api.getEventsByResource();
  }

  getTimelineLayout(): TimelineLayout<TResource, TEvent> {
    return this._api.getTimelineLayout();
  }

  private getUnavailableMinuteRanges(
    date: string,
    options?: { resourceIds?: Array<string> },
  ): Array<UnavailableTimeRange> {
    const merged = this._getMergedUnavailableMinuteRanges(
      date,
      options?.resourceIds,
    );
    if (!merged) return [];
    return merged.map((r) => ({
      startMinutes: r.startMinutes,
      endMinutes: r.endMinutes,
    }));
  }

  private getResizeConflicts(
    dayDate: string,
    startMins: number,
    endMins: number,
    eventId: string,
    resourceIds: Array<string>,
    resizeEvent?: TEvent,
  ): Array<AvailabilityConflict> {
    const resources = (this.options.resources ?? []).filter((resource) =>
      resourceIds.includes(resource.id),
    );
    const selfEvent = resizeEvent ?? this._eventMap.get(eventId);

    return checkDaySpan({
      date: dayDate,
      startMinutes: startMins,
      endMinutes: endMins,
      resources,
      consumption: selfEvent?.consumption,
      otherEvents: this.getEventsByDate(dayDate)
        .filter((event) => event.id !== eventId)
        .map((event) => {
          const start = new Date(event.start);
          const end = new Date(event.end);
          return {
            id: event.id,
            startMinutes: start.getHours() * 60 + start.getMinutes(),
            endMinutes: end.getHours() * 60 + end.getMinutes(),
            resourceIds: this._getEventResourceIds(event),
            consumption: event.consumption,
          };
        }),
    });
  }

  validateResize(options: ValidateResizeOptions): ValidateResizeResult {
    const {
      eventId,
      originalStart,
      originalEnd,
      edge,
      totalDeltaMinutes,
      targetDayDate,
      originalDayDate,
      constraints,
    } = options;

    const occurrenceStart =
      options.occurrenceStart != null
        ? toPlainDateTimeString(options.occurrenceStart)
        : undefined;
    const event = this._resolveResizeEvent(
      eventId,
      occurrenceStart,
      originalStart,
    );
    const resourceIds = event ? this._getEventResourceIds(event) : undefined;

    const unavailableRanges = this.getUnavailableMinuteRanges(targetDayDate, {
      resourceIds,
    });

    const originalStartDate = originalStart.split("T")[0] ?? "";
    const originalEndDate = originalEnd.split("T")[0] ?? "";

    const origStartHourMins =
      ((originalStart.charCodeAt(11) - 48) * 10 +
        (originalStart.charCodeAt(12) - 48)) *
        60 +
      (originalStart.charCodeAt(14) - 48) * 10 +
      (originalStart.charCodeAt(15) - 48);
    const origEndHourMins =
      ((originalEnd.charCodeAt(11) - 48) * 10 +
        (originalEnd.charCodeAt(12) - 48)) *
        60 +
      (originalEnd.charCodeAt(14) - 48) * 10 +
      (originalEnd.charCodeAt(15) - 48);

    const effectiveEdge =
      edge === "left" ? "top" : edge === "right" ? "bottom" : edge;

    let shouldBlockResize = false;
    let blockReason: ResizeError["reason"] = "blocked";
    let blockMessage = "Resize blocked";
    const conflicts: Array<AvailabilityConflict> = [];

    const snapToMinutes = constraints?.snapToMinutes ?? 1;
    const snapMins = (minutes: number): number => {
      if (snapToMinutes <= 1) return minutes;
      return Math.round(minutes / snapToMinutes) * snapToMinutes;
    };

    if (effectiveEdge === "top" && targetDayDate < originalStartDate) {
      const rawStartMinutes = origStartHourMins + totalDeltaMinutes;
      const targetStartMinutes =
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      const snappedTargetStartMinutes = snapMins(targetStartMinutes);
      const currentStartMinutes = origStartHourMins;

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          snappedTargetStartMinutes,
          MINUTES_IN_DAY,
          { resourceIds },
        );

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedTargetStartMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`;
          conflicts.push(
            toUnavailabilityConflict({
              date: targetDayDate,
              startMinutes: snappedTargetStartMinutes,
              endMinutes: MINUTES_IN_DAY,
              details: unavailabilityDetails,
            }),
          );
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const sourceUnavailabilityDetails = this.getUnavailabilityDetails(
          originalStartDate,
          0,
          currentStartMinutes,
          { resourceIds },
        );

        if (sourceUnavailabilityDetails.length > 0) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalStartDate} - ${describeUnavailability(sourceUnavailabilityDetails)}`;
          conflicts.push(
            toUnavailabilityConflict({
              date: originalStartDate,
              startMinutes: 0,
              endMinutes: currentStartMinutes,
              details: sourceUnavailabilityDetails,
            }),
          );
        }
      }
    } else if (effectiveEdge === "bottom" && targetDayDate > originalEndDate) {
      const rawEndMinutes = origEndHourMins + totalDeltaMinutes;
      const targetEndMinutes =
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      const snappedTargetEndMinutes = snapMins(targetEndMinutes);
      const currentEndMinutes = origEndHourMins;

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          0,
          snappedTargetEndMinutes,
          { resourceIds },
        );

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = `Unavailable: Event ending at ${formatMinutesToTime(snappedTargetEndMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`;
          conflicts.push(
            toUnavailabilityConflict({
              date: targetDayDate,
              startMinutes: 0,
              endMinutes: snappedTargetEndMinutes,
              details: unavailabilityDetails,
            }),
          );
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const sourceUnavailabilityDetails = this.getUnavailabilityDetails(
          originalEndDate,
          currentEndMinutes,
          MINUTES_IN_DAY,
          { resourceIds },
        );

        if (sourceUnavailabilityDetails.length > 0) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalEndDate} - ${describeUnavailability(sourceUnavailabilityDetails)}`;
          conflicts.push(
            toUnavailabilityConflict({
              date: originalEndDate,
              startMinutes: currentEndMinutes,
              endMinutes: MINUTES_IN_DAY,
              details: sourceUnavailabilityDetails,
            }),
          );
        }
      }
    }

    if (
      !shouldBlockResize &&
      targetDayDate === originalStartDate &&
      targetDayDate === originalEndDate
    ) {
      const rawStartMinutes =
        origStartHourMins + (effectiveEdge === "top" ? totalDeltaMinutes : 0);
      const rawEndMinutes =
        origEndHourMins + (effectiveEdge === "bottom" ? totalDeltaMinutes : 0);

      const snappedStartMinutes = snapMins(
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
      );
      const snappedEndMinutes = snapMins(
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
      );

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          snappedStartMinutes,
          snappedEndMinutes,
          { resourceIds },
        );

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`;
          conflicts.push(
            toUnavailabilityConflict({
              date: targetDayDate,
              startMinutes: snappedStartMinutes,
              endMinutes: snappedEndMinutes,
              details: unavailabilityDetails,
            }),
          );
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const detailedConflicts = this.getResizeConflicts(
          targetDayDate,
          snappedStartMinutes,
          snappedEndMinutes,
          eventId,
          resourceIds,
          event,
        );

        const capacityConflicts = detailedConflicts.filter((c) =>
          c.resourceDetails.some((d) => d.reason === "capacity"),
        );

        if (capacityConflicts.length > 0) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          const detailsText = describeUnavailability(
            capacityConflicts[0]!.resourceDetails,
          );
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`;
          conflicts.push(...capacityConflicts);
        }
      }
    }

    if (!shouldBlockResize && resourceIds?.length) {
      const originalStartMs = new Date(originalStart).getTime();
      const originalEndMs = new Date(originalEnd).getTime();
      const snapMs = snapToMinutes * 60_000;
      const snappedDeltaMs =
        Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs;

      let checkFromMs: number | null = null;
      let checkToMs: number | null = null;

      if (effectiveEdge === "bottom") {
        const newEndMs = originalEndMs + snappedDeltaMs;
        if (newEndMs > originalEndMs) {
          checkFromMs = originalEndMs;
          checkToMs = newEndMs;
        }
      } else {
        const newStartMs = originalStartMs + snappedDeltaMs;
        if (newStartMs < originalStartMs) {
          checkFromMs = newStartMs;
          checkToMs = originalStartMs;
        }
      }

      if (checkFromMs !== null && checkToMs !== null) {
        const dayMs = 24 * 60 * 60 * 1_000;
        const cursor = new Date(checkFromMs);
        cursor.setHours(0, 0, 0, 0);

        while (cursor.getTime() < checkToMs && !shouldBlockResize) {
          const dayStr = toPlainDateString(cursor);
          const dayStartMs = cursor.getTime();
          const dayEndMs = dayStartMs + dayMs;

          const overlapStartMs = Math.max(checkFromMs, dayStartMs);
          const overlapEndMs = Math.min(checkToMs, dayEndMs);

          if (overlapStartMs < overlapEndMs) {
            const overlapStartMins = Math.floor(
              (overlapStartMs - dayStartMs) / 60_000,
            );
            const overlapEndMins = Math.ceil(
              (overlapEndMs - dayStartMs) / 60_000,
            );

            const dayConflicts = this.getResizeConflicts(
              dayStr,
              overlapStartMins,
              overlapEndMins,
              eventId,
              resourceIds,
              event,
            );

            if (dayConflicts.length > 0) {
              shouldBlockResize = true;
              blockReason = "unavailable-time";
              const detailsText = describeUnavailability(
                dayConflicts[0]!.resourceDetails,
              );
              blockMessage = `Unavailable: ${dayStr} ${formatMinutesToTime(overlapStartMins)}–${formatMinutesToTime(overlapEndMins)} conflicts with ${detailsText}`;
              conflicts.push(...dayConflicts);
            }
          }

          cursor.setTime(cursor.getTime() + dayMs);
        }
      }
    }

    const snapMs = (constraints?.snapToMinutes ?? 1) * 60_000;
    const snappedDeltaMs =
      Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs;

    if (!shouldBlockResize && effectiveEdge === "top") {
      const event = this._eventMap.get(eventId);
      if (event?.dependsOn?.length) {
        const proposedStartMs =
          Temporal.PlainDateTime.from(originalStart).toZonedDateTime(
            this.options.timeZone,
          ).epochMilliseconds + snappedDeltaMs;
        const proposedEndMs = Temporal.PlainDateTime.from(
          originalEnd,
        ).toZonedDateTime(this.options.timeZone).epochMilliseconds;

        for (const dep of event.dependsOn) {
          const pred = this._eventMap.get(dep.id);
          if (!pred) continue;

          const predStartStr = toPlainDateTimeString(pred.start);
          const predEndStr = toPlainDateTimeString(pred.end);
          const predStartMs = Temporal.PlainDateTime.from(
            predStartStr,
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds;
          const predEndMs = Temporal.PlainDateTime.from(
            predEndStr,
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds;

          const shortfall = requiredForwardShiftMs(
            dep.type,
            predStartMs,
            predEndMs,
            proposedStartMs,
            proposedEndMs,
          );
          if (shortfall > 0) {
            shouldBlockResize = true;
            blockReason = "blocked";
            blockMessage = `"${event.title}" violates ${dep.type} dependency on "${pred.title}"`;
            break;
          }
        }
      }
    }

    if (
      !shouldBlockResize &&
      effectiveEdge === "bottom" &&
      snappedDeltaMs > 0
    ) {
      const affected = this.getAffectedByDelta(
        eventId,
        snappedDeltaMs,
        new Set([eventId]),
      );

      for (const { event: affectedEvent, newStart, newEnd } of affected) {
        const alreadyConflicting = this.checkEventAvailability(
          affectedEvent,
          toPlainDateTimeString(affectedEvent.start),
          toPlainDateTimeString(affectedEvent.end),
        );
        if (alreadyConflicting) continue;

        const conflict = this.checkEventAvailability(
          affectedEvent,
          newStart,
          newEnd,
        );
        if (conflict) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = `Blocked: "${affectedEvent.title}" would be pushed to unavailable time`;
          conflicts.push(conflict);
          break;
        }
      }
    }

    if (
      !shouldBlockResize &&
      resourceIds?.length &&
      originalStartDate === originalEndDate
    ) {
      const selfEvent = event;
      if (selfEvent) {
        const proposedNewStart =
          effectiveEdge === "top"
            ? Temporal.PlainDateTime.from(originalStart)
                .add({ milliseconds: snappedDeltaMs })
                .toString({ smallestUnit: "second" })
            : originalStart;
        const proposedNewEnd =
          effectiveEdge === "bottom"
            ? Temporal.PlainDateTime.from(originalEnd)
                .add({ milliseconds: snappedDeltaMs })
                .toString({ smallestUnit: "second" })
            : originalEnd;

        const spanConflict = this.checkEventAvailability(
          selfEvent,
          proposedNewStart,
          proposedNewEnd,
        );
        if (spanConflict) {
          shouldBlockResize = true;
          blockReason = "unavailable-time";
          blockMessage = spanConflict.description;
          const alreadyReported = conflicts.some(
            (c) =>
              c.date === spanConflict.date &&
              c.conflictRange.start === spanConflict.conflictRange.start &&
              c.conflictRange.end === spanConflict.conflictRange.end,
          );
          if (!alreadyReported) conflicts.push(spanConflict);
        }
      }
    }

    const effectiveDeltaMinutes = shouldBlockResize ? 0 : totalDeltaMinutes;

    const result = calculateResizedEvent({
      originalStart,
      originalEnd,
      edge,
      deltaMinutes: effectiveDeltaMinutes,
      timeZone: this.options.timeZone,
      constraints: {
        ...constraints,
        unavailableRanges: shouldBlockResize ? [] : unavailableRanges,
      },
    });

    return {
      blocked: shouldBlockResize,
      error: shouldBlockResize
        ? {
            reason: blockReason,
            message: blockMessage,
            conflicts,
          }
        : undefined,
      result,
      targetDayDate: shouldBlockResize ? originalDayDate : targetDayDate,
    };
  }

  setResources(resources: Array<TResource> | null) {
    this.options.resources = resources;
    this._mergedUnavailMinuteCache.clear();

    this._bumpMapVersion();
  }

  setEvents(events: Array<TEvent> | null) {
    const next = events?.map((e) => this.normalizeEvent(e)) ?? [];
    this._eventMap.clear();
    this._dependentsMap.clear();
    this._dateIndex.clear();
    this._mergedUnavailMinuteCache.clear();
    this._bumpMapVersion();
    this._seedKernel(next);
    next.forEach((e) => this._indexAddEvent(e));
  }
}
