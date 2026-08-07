import { Temporal } from "@js-temporal/polyfill";
import { getTimeClient } from "../client";
import { bucketByDay } from "~/projection";
import type { LayoutOptions } from "~/projection";
import type { WorkingTimeConfig } from "~/validation/availability";
import type { WorkingCalendar } from "~/workingTime";
import { normalizeRecurrenceRule } from "~/recurrence";
import { createKernel } from "~/kernel";
import { FEATURE_API_OWNERS } from "./features";
import type {
  AnyCalendarFeature,
  AvailabilityApi,
  DependencyGraphApi,
  CalendarFeatureList,
  CalendarHost,
  ComposedApi,
  FeatureModuleCtx,
  FullFeatureApi,
} from "./features";
import type {
  Conflict,
  Module,
  InvertibleOp,
  IntentOp,
  Kernel,
  KernelEvent,
  WriteOp,
} from "~/kernel";
import { groupDaysBy } from "./groupDaysBy";
import { getTimeSlots } from "./getTimeSlots";
import { DateCore } from "./date-core";
import { generateDateRange } from "./generateDateRange";
import type { DateCoreOptions, ParsedDateCoreOptions } from "./date-core";
import type {
  AvailabilityConflict,
  Day,
  Event,
  EventDependency,
  ResizeError,
  Resource,
  SaveEventResult,
  TimeSlot,
} from "./types";
import type { CalendarStore } from "./types";
import { toPlainDateTimeString } from "~/date/parse";

export type * from "./types";
export * from "./date-core";

type WritableEvent<TEvent> = TEvent & KernelEvent;

export interface CalendarCoreOptions<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> extends DateCoreOptions {
  features: TFeatures;

  events?: Array<NoInfer<TEvent>> | null;

  resources?: Array<TResource> | null;

  calendars?: Array<WorkingCalendar> | null;

  defaultCalendarId?: string;

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

  changeViewMode: (newViewMode: CalendarStore["viewMode"]) => void;

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

  removeEvent: (id: Event["id"]) => void;

  formatPeriodLabel: (options?: { locale?: string }) => string;

  formatCurrentPeriod: (options?: { locale?: string }) => string;

  getDaysInRange: (start: string, end: string) => Array<Day<TResource, TEvent>>;

  getEvents: () => Array<TEvent>;

  validateMove: (
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ) => { blocked: boolean; blockedEventTitle?: string; message?: string };

  fetchEventsForRange: (start: string, end: string) => Promise<void>;

  setResources: (resources: Array<TResource> | null) => void;
  setEvents: (events: Array<TEvent> | null) => void;
}

interface CalendarState<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  currentPeriod: CalendarStore["currentPeriod"];

  viewMode: CalendarStore["viewMode"];

  days: Array<Day<TResource, TEvent>>;

  activeDate: CalendarStore["activeDate"];
}

export type CalendarApi<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = CalendarActions<TResource, TEvent> &
  CalendarState<TResource, TEvent> &
  ComposedApi<TFeatures, TResource, TEvent>;

export type Calendar<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = CalendarCore<TFeatures, TResource, TEvent> &
  ComposedApi<TFeatures, TResource, TEvent>;

type ParsedCalendarCoreOptions<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = ParsedDateCoreOptions & {
  features: TFeatures;
  events: Array<TEvent> | null;
  resources: Array<TResource> | null;
  calendars: Array<WorkingCalendar> | null;
  defaultCalendarId?: string;
  fetchEvents?: (range: {
    start: string;
    end: string;
  }) => Promise<Array<TEvent>>;
  layout?: LayoutOptions;
};

export class CalendarCore<
    TFeatures extends CalendarFeatureList,
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

  private get _api(): FullFeatureApi<TResource, TEvent> {
    return this._features as unknown as FullFeatureApi<TResource, TEvent>;
  }

  get featureApi(): ComposedApi<TFeatures, TResource, TEvent> {
    return this._features;
  }

  hasFeature(name: string): boolean {
    return this._featureNames.has(name);
  }

  private _featureNames = new Set<string>();

  private _describeMissingFeatureApi(key: string): string {
    const featureName =
      FEATURE_API_OWNERS[key as keyof typeof FEATURE_API_OWNERS] ?? "a feature";
    return `CalendarCore: "${key}" requires ${featureName}. Compose it via calendarFeatures([${featureName}, ...]).`;
  }

  private _eventsCache: Array<TEvent> | null = null;

  private _mapVersion = 0;
  private _eventMapCache = new Map<string, Map<string, Array<TEvent>>>();
  private _eventMapCacheVersion = -1;

  private _bumpMapVersion() {
    this._mapVersion++;
  }

  constructor(options: CalendarCoreOptions<TFeatures, TResource, TEvent>) {
    super(options);
    Object.assign(this.options, {
      resources: options.resources || null,
      calendars: options.calendars || null,
      defaultCalendarId: options.defaultCalendarId,
      fetchEvents: options.fetchEvents,
      features: options.features,
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
    this._featureNames = new Set(features.map((feature) => feature.name));
    const ctx: FeatureModuleCtx<TResource> = {
      timeZone: this.options.timeZone,
      getResources: () => this.options.resources ?? [],
      getWorkingTime: () => this._workingTime(),
    };

    const modules: Record<string, Module<WritableEvent<TEvent>, unknown>> = {};
    for (const feature of features) {
      const module = feature.module?.(
        ctx as unknown as FeatureModuleCtx<Resource>,
      );
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
    const byFeature: Record<string, object> = {};
    const peers = new Proxy(byFeature, {
      get: (target, key) => target[key as string],
    });

    for (const feature of features) {
      const contributed = feature.api?.(
        host as unknown as CalendarHost<Resource, Event<Resource>>,
        this._kernel.api as never,
        peers as never,
      );
      if (!contributed) continue;
      byFeature[feature.name] = contributed;
      for (const [key, value] of Object.entries(contributed)) {
        if (key in api) {
          throw new Error(
            `CalendarCore: feature "${feature.name}" contributes api "${key}", which another composed feature already contributes. Compose only one of them.`,
          );
        }
        if (key in CalendarCore.prototype) {
          throw new Error(
            `CalendarCore: feature "${feature.name}" contributes api "${key}", which shadows a core method. Rename it.`,
          );
        }
        api[key] = value;
      }
    }
    this._features = api as ComposedApi<TFeatures, TResource, TEvent>;
    this._mountFeatureApi(api);
  }

  private _mountFeatureApi(api: Record<string, unknown>) {
    Object.assign(this, api);

    for (const key of Object.keys(FEATURE_API_OWNERS)) {
      if (key in api) continue;

      Object.defineProperty(this, key, {
        get: () => {
          throw new Error(this._describeMissingFeatureApi(key));
        },
        configurable: true,
      });
    }
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

  private get _availability(): AvailabilityApi<TResource, TEvent> | null {
    return this.hasFeature("availability") ? this._api : null;
  }

  private get _dependency(): DependencyGraphApi<TResource, TEvent> | null {
    return this.hasFeature("dependency") ? this._api : null;
  }

  private _checkAvailability(
    event: TEvent,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource | string>,
    newConsumption?: Array<number>,
  ): AvailabilityConflict | null {
    return (
      this._availability?.checkEventAvailability(
        event,
        newStart,
        newEnd,
        newResources,
        newConsumption,
      ) ?? null
    );
  }

  private _workingTime(): WorkingTimeConfig {
    return {
      calendars: this.options.calendars,
      defaultCalendarId: this.options.defaultCalendarId,
    };
  }

  private _host(): CalendarHost<TResource, TEvent> {
    return {
      getEvent: (id) => this._eventMap.get(id),
      getEvents: () => this.getEvents(),
      getState: () => this.store.state,
      getOptions: () => ({
        timeZone: this.options.timeZone,
        resources: this.options.resources,
        workingTime: this._workingTime(),
        layout: this.options.layout,
      }),
      getEventMap: (window) => this.getEventMap(window),
      getDaysWithEvents: () => this.getDaysWithEvents(),
      getEventsByDate: (date) => this.getEventsByDate(date),
      goToSpecificPeriod: (isoDate) => this.goToSpecificPeriod(isoDate),
      write: (ops, reason) => this._write(ops, reason),
      fetchEventsForRange: (start, end) => this.fetchEventsForRange(start, end),
      editEvent: (eventId, updates, options) =>
        this.editEvent(eventId, updates, options),
      removeEvent: (id) => this.removeEvent(id),
      commitUpdate: (id, updates) => this.commitUpdate(id, updates),
      validateMove: (eventId, newStart, newEnd, resources, consumption) =>
        this.validateMove(eventId, newStart, newEnd, resources, consumption),
      validateEventDependencies: (event, dependsOn) =>
        this._api.validateEventDependencies(event, dependsOn),
      validateEventPlacement: (event) =>
        this._availability?.validateEventPlacement(event) ?? {
          blocked: false,
        },
    };
  }

  private _write(
    ops: Array<InvertibleOp<TEvent> | IntentOp>,
    reason: string,
  ): Array<InvertibleOp<TEvent>> {
    return this._writeChecked(ops, reason).committed;
  }

  private _writeChecked(
    ops: Array<InvertibleOp<TEvent> | IntentOp>,
    reason: string,
  ): { committed: Array<InvertibleOp<TEvent>>; conflicts: Array<Conflict> } {
    const result = this._kernel.write(
      ops as Array<WriteOp<WritableEvent<TEvent>>>,
      reason,
    );
    if (result.status !== "committed") {
      return { committed: [], conflicts: result.conflicts };
    }

    const committed = result.batch.ops as unknown as Array<
      InvertibleOp<TEvent>
    >;
    this._applyOps(committed);
    return { committed, conflicts: [] };
  }

  private _conflictError(
    event: { id: string; title: string; start: string; end: string },
    conflicts: Array<Conflict>,
  ): ResizeError {
    const [first] = conflicts;
    return {
      eventId: event.id,
      eventTitle: event.title,
      reason: "blocked",
      message: first?.message ?? `"${event.title}" was rejected on write.`,
      originalStart: event.start,
      originalEnd: event.end,
    };
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

    const projected =
      windowStart && windowEnd
        ? (this._kernel.project({
            start: `${windowStart.slice(0, 10)}T00:00:00`,
            end: `${Temporal.PlainDate.from(windowEnd.slice(0, 10))
              .subtract({ days: 1 })
              .toString({ calendarName: "never" })}T23:59:59`,
          }) as Array<TEvent>)
        : (this._kernel.getEvents() as Array<TEvent>);

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

  commitAdd(event: TEvent) {
    this._commitAdd(event);
  }

  private _commitAdd(event: TEvent): Array<Conflict> {
    const normalized = this.normalizeEvent(event);
    const { committed, conflicts } = this._writeChecked(
      [{ kind: "add", event: normalized }],
      "add",
    );
    if (committed.length === 0) return conflicts;

    getTimeClient().emit("event:added", {
      eventId: normalized.id,
      eventTitle: normalized.title,
      start: normalized.start as string,
      end: normalized.end as string,
    });
    return [];
  }

  commitUpdate(id: Event["id"], updates: Partial<Omit<TEvent, "id">>) {
    this._commitUpdate(id, updates);
  }

  private _commitUpdate(
    id: Event["id"],
    updates: Partial<Omit<TEvent, "id">>,
  ): Array<Conflict> {
    const existingEvent = this._eventMap.get(id);
    if (!existingEvent) return [];

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

    const { committed, conflicts } = this._writeChecked(
      [{ kind: "update", id, before: existingEvent, after: nextEvent }],
      "update",
    );
    if (committed.length === 0) return conflicts;

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
    return [];
  }

  getEvents(): Array<TEvent> {
    return [...this._eventsView()];
  }

  private _normalizeRecurrenceDateTimeInputs(
    rule: NonNullable<TEvent["recurrence"]>,
  ): NonNullable<TEvent["recurrence"]> {
    return normalizeRecurrenceRule(rule) as NonNullable<TEvent["recurrence"]>;
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
      const pulled =
        this._dependency?.getPredecessorShifts(eventId, newStart, newEnd) ?? [];

      for (const shift of pulled) {
        if (
          this._checkAvailability(shift.event, shift.newStart, shift.newEnd)
        ) {
          return {
            blocked: true,
            blockedEventTitle: shift.event.title,
            message: `"${shift.event.title}" would be pulled into unavailable time.`,
          };
        }
      }
    }

    const conflict = this._checkAvailability(
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
      const affected =
        this._dependency?.getAffectedByDelta(eventId, startDeltaMs) ?? [];
      for (const {
        event: dep,
        newStart: depStart,
        newEnd: depEnd,
      } of affected) {
        const depConflict = this._checkAvailability(dep, depStart, depEnd);
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
      const pushed =
        this._dependency?.getDependentShifts(eventId, newStart, newEnd) ?? [];

      for (const shift of pushed) {
        if (
          this._checkAvailability(shift.event, shift.newStart, shift.newEnd)
        ) {
          return {
            blocked: true,
            blockedEventTitle: shift.event.title,
            message: `"${shift.event.title}" would be pushed into unavailable time.`,
          };
        }
      }
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
      const depValidation = this._api.validateEventDependencies(
        { id: event.id, title: event.title, start: startStr, end: endStr },
        dependsOn,
      );
      if (!depValidation.valid && depValidation.error) {
        return { success: false, error: depValidation.error };
      }
    }

    const placementValidation = this._availability?.validateEventPlacement({
      id: event.id,
      title: event.title,
      start: startStr,
      end: endStr,
      resources: event.resources,
      consumption: event.consumption,
    });
    if (placementValidation?.blocked) {
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

    const addConflicts = this._commitAdd(event);
    if (addConflicts.length > 0) {
      return {
        success: false,
        error: this._conflictError(
          { id: event.id, title: event.title, start: startStr, end: endStr },
          addConflicts,
        ),
      };
    }

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
      const depValidation = this._api.validateEventDependencies(
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

    const updateConflicts = this._commitUpdate(eventId, updates);
    if (updateConflicts.length > 0) {
      return {
        success: false,
        error: this._conflictError(
          {
            id: eventId,
            title: existingEvent.title,
            start: effectiveStart,
            end: effectiveEnd,
          },
          updateConflicts,
        ),
      };
    }

    return { success: true };
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

  setResources(resources: Array<TResource> | null) {
    this.options.resources = resources;

    this._bumpMapVersion();
  }

  setEvents(events: Array<TEvent> | null) {
    const next = events?.map((e) => this.normalizeEvent(e)) ?? [];
    this._eventMap.clear();
    this._dependentsMap.clear();
    this._dateIndex.clear();
    this._bumpMapVersion();
    this._seedKernel(next);
    next.forEach((e) => this._indexAddEvent(e));
  }
}

export function createCalendar<
  const TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  options: CalendarCoreOptions<TFeatures, TResource, TEvent>,
): Calendar<TFeatures, TResource, TEvent> {
  return new CalendarCore<TFeatures, TResource, TEvent>(options) as Calendar<
    TFeatures,
    TResource,
    TEvent
  >;
}
