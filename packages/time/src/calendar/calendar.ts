import { Temporal } from '@js-temporal/polyfill'
import { getTimeClient } from '../client'
import { splitMultiDayEvents } from './splitMultiDayEvents'
import { getEventProps } from './getEventProps'
import { groupDaysBy } from './groupDaysBy'
import { getTimeSlots } from './getTimeSlots'
import { calculateResizedEvent } from './getResizeProps'
import { DateCore } from './date-core'
import type { DateCoreOptions, ParsedDateCoreOptions } from './date-core'
import type {
  ResizeConstraints,
  ResizeEdge,
  UnavailableTimeRange,
} from './getResizeProps'
import type {
  AvailabilityConflict,
  Day,
  Event,
  ResizeError,
  Resource,
  TimeSlot,
  TimelineLayout,
  TimelineResourceRow,
  UnavailableRange,
  ViewMode,
} from './types'
import { toPlainDateString, toPlainDateTimeString } from '~/date/parse'

export type * from './types'
export * from './date-core'

interface CalendarStore {
  currentPeriod: Temporal.PlainDate
  activeDate: Temporal.PlainDate
  viewMode: ViewMode
}

/**
 * Configuration options for initializing a CalendarCore instance, allowing customization
 * of events, locale, time zone, and the calendar system.
 * @template TEvent - Specifies the event type, extending a base Event type.
 */
export interface CalendarCoreOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> extends DateCoreOptions {
  /** An optional array of events to be handled by the calendar. */
  events?: Array<TEvent> | null
  /** Optional resources to be used in the calendar. */
  resources?: Array<TResource> | null
  /**
   * Optional async callback for lazy/on-demand event loading.
   * Called whenever the current viewport window is not yet fully loaded.
   * The returned events are merged into the internal indices automatically.
   * When omitted the calendar operates in fully-eager mode (no change in behaviour).
   */
  fetchEvents?: (range: { start: string; end: string }) => Promise<Array<TEvent>>
}

/**
 * The API surface provided by CalendarCore, allowing interaction with the calendar's state
 * and manipulation of its settings and data.
 * @template TEvent - The type of events handled by the calendar.
 */
interface CalendarActions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  /** Navigates to the previous period according to the current view mode. */
  goToPreviousPeriod: () => void
  /** Navigates to the next period according to the current view mode. */
  goToNextPeriod: () => void
  /** Resets the view to the current period based on today's date. */
  goToCurrentPeriod: () => void
  /** Navigates to a specific date. */
  goToSpecificPeriod: (date: string) => void
  /** Checks if navigation to the previous period is allowed within the range. */
  canGoPreviousPeriod: () => boolean
  /** Checks if navigation to the next period is allowed within the range. */
  canGoNextPeriod: () => boolean
  /** Changes the current view mode of the calendar. */
  changeViewMode: (newViewMode: CalendarStore['viewMode']) => void
  /** Retrieves styling properties for a specific event. */
  getEventProps: (event: TEvent) => {
    isSplitEvent: boolean
    overlappingEvents: Array<TEvent>
    start: string
    end: string
    style?: {
      top: string
      height: string
      left: string
      width: string
    }
  }
  /** Retrieves the names of the days of the week, based on the current locale. */
  getDaysNames: (weekday?: 'long' | 'short') => Array<string>
  /** Groups days by a specified unit. */
  groupDaysBy: (props: {
    days: Array<Day<TResource, TEvent> | null>
    unit: 'week' | 'workWeek'
    fillMissingDays?: boolean
  }) => Array<Array<Day<TResource, TEvent> | null>>
  /** Retrieves time slots for day view with configurable intervals. */
  getTimeSlots: (
    options?: Parameters<typeof getTimeSlots>[1],
  ) => Array<TimeSlot>
  /** Retrieves events for a specific date. */
  getEventsByDate: (date: string) => Array<TEvent>
  /** Adds a new event to the calendar. */
  addEvent: (event: TEvent) => void
  /** Updates an existing event by ID. */
  updateEvent: (id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>) => void
  /** Removes an event by ID. */
  removeEvent: (id: Event['id']) => void
  /** Retrieves unavailable time ranges for a specific date based on resource availability. */
  getUnavailableRanges: (
    date: string,
    options?: {
      containerHeight?: number
      resourceIds?: Array<TResource['id']>
    },
  ) => Array<UnavailableRange>
  /** Groups visible events by resource, merging multi-day segments back to full-span events. */
  getEventsByResource: () => Map<TResource['id'], Array<TEvent>>
  /** Computes horizontal timeline layout with event positions, lane assignments, and current time marker. */
  getTimelineLayout: () => TimelineLayout<TResource, TEvent>
  /** Returns a human-readable label for the currently visible date range. */
  formatPeriodLabel: (options?: { locale?: string }) => string
  /** Returns a snapshot of all events currently managed by the calendar (including those outside the visible range). */
  getEvents: () => Array<TEvent>
  /**
   * Checks whether moving `eventId` to `[newStart, newEnd]` — and cascading
   * all finish-to-start dependents — would violate any resource availability.
   */
  validateMove: (
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource>,
  ) => { blocked: boolean; blockedEventTitle?: string; message?: string }
  /**
   * Validates if placing an event with a specific start time satisfies all dependency constraints.
   */
  validateEventDependencies: (
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<string>,
  ) => { valid: boolean; error?: ResizeError }
  /**
   * Creates a dependency link from source to target event.
   * If the target event starts before the source event ends, it will optionally reschedule the target.
   */
  createDependency: (
    sourceId: string,
    targetId: string,
  ) => { blocked: boolean; error?: ResizeError }
}

interface CalendarState<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  /** The currently focused date period in the calendar. */
  currentPeriod: CalendarStore['currentPeriod']
  /** The current view mode of the calendar. */
  viewMode: CalendarStore['viewMode']
  /** An array of days, each potentially containing events. */
  days: Array<Day<TResource, TEvent>>
  /** The currently active date in the calendar. */
  activeDate: CalendarStore['activeDate']
}

type ConvertTemporalToString<T> = {
  [K in keyof T]: T[K] extends Temporal.PlainDate ? string : T[K]
}

export interface CalendarApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>
  extends
    CalendarActions<TResource, TEvent>,
    ConvertTemporalToString<CalendarState<TResource, TEvent>> {}

export interface ValidateResizeOptions {
  eventId: string
  originalStart: string
  originalEnd: string
  edge: ResizeEdge
  totalDeltaMinutes: number
  targetDayDate: string
  originalDayDate: string
  constraints?: ResizeConstraints
}

export interface ValidateResizeResult {
  blocked: boolean
  error?: {
    reason: ResizeError['reason']
    message: string
    conflicts: Array<AvailabilityConflict>
  }
  result: {
    start: string
    end: string
    durationMinutes: number
  }
  targetDayDate: string
}

const MINUTES_IN_DAY = 24 * 60

const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

type ParsedCalendarCoreOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = ParsedDateCoreOptions & {
  events: Array<TEvent> | null
  resources: Array<TResource> | null
  fetchEvents?: (range: { start: string; end: string }) => Promise<Array<TEvent>>
}

export class CalendarCore<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>
  extends DateCore
  implements CalendarActions<TResource, TEvent>
{
  declare options: ParsedCalendarCoreOptions<TResource, TEvent>

  // ─── O(1) index structures ──────────────────────────────────────────────────
  /** id → normalized TEvent (master record) */
  private _eventMap = new Map<string, TEvent>()
  /** id → Set of event IDs whose `dependsOn` includes this id (reverse dep graph) */
  private _dependentsMap = new Map<string, Set<string>>()
  /** 'YYYY-MM-DD' → Set of event IDs that start on that date */
  private _dateIndex = new Map<string, Set<string>>()
  /** Ranges already fetched by fetchEvents (sorted, non-overlapping after merge) */
  private _loadedRanges: Array<{ start: string; end: string }> = []
  // ────────────────────────────────────────────────────────────────────────────

  constructor(options: CalendarCoreOptions<TResource, TEvent>) {
    super(options)
    Object.assign(this.options, {
      events: options.events?.map((e) => this.normalizeEvent(e)) || null,
      resources: options.resources || null,
      fetchEvents: options.fetchEvents,
    })
    // Build indices from initial events
    this.options.events?.forEach((e) => this._indexAddEvent(e))
  }

  // ─── Index helpers ──────────────────────────────────────────────────────────

  /** Return the ISO start-date key for a normalized event. */
  private _eventDateKey(event: TEvent): string {
    const startStr = event.start as string
    return startStr.split('T')[0] ?? startStr
  }

  /** Insert one event into all three indices. */
  private _indexAddEvent(event: TEvent): void {
    this._eventMap.set(event.id, event)
    // date index
    const dk = this._eventDateKey(event)
    if (!this._dateIndex.has(dk)) this._dateIndex.set(dk, new Set())
    this._dateIndex.get(dk)!.add(event.id)
    // reverse dependency graph
    for (const predId of event.dependsOn ?? []) {
      if (!this._dependentsMap.has(predId)) this._dependentsMap.set(predId, new Set())
      this._dependentsMap.get(predId)!.add(event.id)
    }
  }

  /** Remove one event from all three indices. */
  private _indexRemoveEvent(event: TEvent): void {
    this._eventMap.delete(event.id)
    // date index
    const dk = this._eventDateKey(event)
    const bucket = this._dateIndex.get(dk)
    if (bucket) {
      bucket.delete(event.id)
      if (bucket.size === 0) this._dateIndex.delete(dk)
    }
    // reverse dependency graph — remove this event as a dependent of its predecessors
    for (const predId of event.dependsOn ?? []) {
      this._dependentsMap.get(predId)?.delete(event.id)
    }
    // also remove its own forward entry (for events that depended on it)
    this._dependentsMap.delete(event.id)
  }

  /**
   * Patch the indices when an event changes.
   * Only touches the structures that actually changed.
   */
  private _indexUpdateEvent(prev: TEvent, next: TEvent): void {
    this._eventMap.set(next.id, next)

    // date index: only rebuild if start date changed
    const prevDk = this._eventDateKey(prev)
    const nextDk = this._eventDateKey(next)
    if (prevDk !== nextDk) {
      const old = this._dateIndex.get(prevDk)
      if (old) {
        old.delete(prev.id)
        if (old.size === 0) this._dateIndex.delete(prevDk)
      }
      if (!this._dateIndex.has(nextDk)) this._dateIndex.set(nextDk, new Set())
      this._dateIndex.get(nextDk)!.add(next.id)
    }

    // reverse dependency graph: rebuild only diff
    const prevDeps = new Set(prev.dependsOn ?? [])
    const nextDeps = new Set(next.dependsOn ?? [])
    for (const predId of prevDeps) {
      if (!nextDeps.has(predId)) {
        this._dependentsMap.get(predId)?.delete(next.id)
      }
    }
    for (const predId of nextDeps) {
      if (!prevDeps.has(predId)) {
        if (!this._dependentsMap.has(predId)) this._dependentsMap.set(predId, new Set())
        this._dependentsMap.get(predId)!.add(next.id)
      }
    }
  }

  /**
   * Check whether the given [start, end] viewport is already fully covered by
   * previously fetched ranges. Returns true when no fetch is needed.
   */
  private _isRangeLoaded(start: string, end: string): boolean {
    for (const r of this._loadedRanges) {
      if (r.start <= start && r.end >= end) return true
    }
    return false
  }

  /**
   * Merge a newly loaded range into `_loadedRanges` (sorted, non-overlapping).
   */
  private _markRangeLoaded(start: string, end: string): void {
    this._loadedRanges.push({ start, end })
    this._loadedRanges.sort((a, b) => (a.start < b.start ? -1 : 1))
    // merge overlapping/adjacent
    const merged: Array<{ start: string; end: string }> = []
    for (const r of this._loadedRanges) {
      const last = merged[merged.length - 1]
      if (last && r.start <= last.end) {
        last.end = last.end > r.end ? last.end : r.end
      } else {
        merged.push({ ...r })
      }
    }
    this._loadedRanges = merged
  }
  // ────────────────────────────────────────────────────────────────────────────

  private normalizeEvent<
    T extends { start: string | Date | number; end: string | Date | number },
  >(event: T): T {
    return {
      ...event,
      start: toPlainDateTimeString(event.start),
      end: toPlainDateTimeString(event.end),
    }
  }

  protected getCalendarDays() {
    return super.getCalendarDays()
  }

  /**
   * Builds a date → [event segments] map used by getDaysWithEvents and getEventProps.
   * Multi-day events are split here (segments are not stored in the indices).
   * Single-day events are sourced directly from _eventMap via _dateIndex — O(k) where
   * k is the number of distinct dates that have events (≪ total event count).
   */
  private getEventMap() {
    const map = new Map<string, Array<TEvent>>()

    // Visit every event only once, via the master map
    for (const event of this._eventMap.values()) {
      const startStr = event.start as string
      const endStr = event.end as string

      const startDt = Temporal.PlainDateTime.from(startStr)
      const endDt = Temporal.PlainDateTime.from(endStr)
      const startPlainDate = startDt.toPlainDate()
      const endPlainDate = endDt.toPlainDate()

      if (Temporal.PlainDate.compare(startPlainDate, endPlainDate) !== 0) {
        const splitEvents = splitMultiDayEvents<TResource, TEvent>(
          event,
          this.options.timeZone,
        )
        splitEvents.forEach((splitEvent) => {
          const dateKey = Temporal.PlainDateTime.from(
            toPlainDateTimeString(splitEvent.start),
          )
            .toPlainDate()
            .toString({ calendarName: 'never' })
          if (!map.has(dateKey)) map.set(dateKey, [])
          map.get(dateKey)!.push(splitEvent)
        })
      } else {
        const dateKey = startPlainDate.toString({ calendarName: 'never' })
        if (!map.has(dateKey)) map.set(dateKey, [])
        map.get(dateKey)!.push(event)
      }
    }
    return map
  }

  /**
   * Triggers the lazy-loading flow if the current viewport haven't been fetched yet.
   * This is intended to be used by side-effect hooks (like useEffect in React)
   * to avoid triggering fetches during the render cycle.
   */
  ensureRangeLoaded(): void {
    const calendarDays = this.getCalendarDays()

    // Lazy loading: if a fetchEvents callback is configured and the current
    // viewport window hasn't been fetched yet, kick off the fetch asynchronously.
    if (this.options.fetchEvents && calendarDays.length > 0) {
      const first = calendarDays[0]!
      const last = calendarDays[calendarDays.length - 1]!
      const rangeStart = first.toString({ calendarName: 'never' })
      // Use the start of the NEXT day as the range end to provide a standard exclusive range [start, end)
      const rangeEnd = last.add({ days: 1 }).toString({ calendarName: 'never' })

      if (!this._isRangeLoaded(rangeStart, rangeEnd)) {
        // Mark as loaded immediately to prevent concurrent duplicate fetches
        this._markRangeLoaded(rangeStart, rangeEnd)
        // Set isPending while fetching
        this.store.setState((prev) => ({ ...prev, isPending: true }))
        this.options.fetchEvents({ start: rangeStart, end: rangeEnd })
          .then((fetchedEvents) => {
            if (fetchedEvents.length > 0) {
              if (!this.options.events) this.options.events = []
              const newlyFetchedEvents: Array<{ eventId: string; eventTitle: string; start: string; end: string }> = []
              for (const raw of fetchedEvents) {
                // Skip duplicates (event may already be known)
                if (this._eventMap.has(raw.id)) continue
                const normalized = this.normalizeEvent(raw)
                this.options.events.push(normalized)
                this._indexAddEvent(normalized)
                newlyFetchedEvents.push({
                   eventId: normalized.id,
                   eventTitle: normalized.title,
                   start: normalized.start as string,
                   end: normalized.end as string,
                })
              }
              if (newlyFetchedEvents.length > 0) {
                 getTimeClient().emit('events:set', { events: newlyFetchedEvents })
              }
            }
            this.store.setState((prev) => ({
              ...prev,
              isPending: false,
              eventsVersion:
                fetchedEvents.length > 0
                  ? prev.eventsVersion + 1
                  : prev.eventsVersion,
            }))
          })
          .catch(() => {
            // On error, unmark the range so the next render can retry
            this._loadedRanges = this._loadedRanges.filter(
              (r) => !(r.start === rangeStart && r.end === rangeEnd),
            )
            this.store.setState((prev) => ({ ...prev, isPending: false }))
          })
      }
    }
  }

  getDaysWithEvents() {
    const calendarDays = this.getCalendarDays()
    const eventMap = this.getEventMap()
    return calendarDays.map((day) => {
      const isoDate = day.toString({ calendarName: 'never' })
      const dailyEvents = eventMap.get(isoDate) ?? []
      const currentMonthRange = Array.from(
        { length: this.store.state.viewMode.value },
        (_, i) => this.store.state.currentPeriod.add({ months: i }).month,
      )
      const isInCurrentPeriod = currentMonthRange.includes(day.month)
      return {
        date: day,
        isoDate,
        events: dailyEvents,
        isToday:
          Temporal.PlainDate.compare(day, Temporal.Now.plainDateISO()) === 0,
        isInCurrentPeriod,
      }
    })
  }

  /** Returns the list of date ranges that have already been fetched. Useful for testing. */
  getLoadedRanges(): ReadonlyArray<{ start: string; end: string }> {
    return this._loadedRanges
  }

  formatPeriodLabel(options?: { locale?: string }): string {
    const days = this.getDaysWithEvents()
    if (days.length === 0) return ''

    const locale = options?.locale ?? this.options.locale
    const first = days[0]!
    const last = days[days.length - 1]!

    const fmt = (d: Temporal.PlainDate) =>
      new Date(d.year, d.month - 1, d.day).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

    if (days.length === 1) return fmt(first.date)
    return `${fmt(first.date)} \u2014 ${fmt(last.date)}`
  }

  getEventProps(event: TEvent) {
    return getEventProps(this.getEventMap(), event, this.store.state, {
      timeZone: this.options.timeZone,
    }) as ReturnType<CalendarActions<TResource, TEvent>['getEventProps']>
  }

  groupDaysBy({
    days,
    unit,
    fillMissingDays = true,
  }: {
    days: Array<Day<TResource, TEvent> | null>
    unit: 'week' | 'workWeek'
    fillMissingDays?: boolean
  }) {
    return groupDaysBy<TResource, TEvent>({
      days,
      unit,
      fillMissingDays,
      weekStartsOn: this.getWeekStartsOn(),
      locale: this.options.locale,
    })
  }

  getTimeSlots(options?: Parameters<typeof getTimeSlots>[1]): Array<TimeSlot> {
    return getTimeSlots(this.options.locale, options)
  }

  /**
   * Retrieves events for a specific date.
   * Uses _dateIndex for O(1) date lookup, then resolves each id via _eventMap.
   * Multi-day events that span onto this date are still found via getEventMap.
   */
  getEventsByDate(date: string): Array<TEvent> {
    const targetDate = Temporal.PlainDate.from(date).toString({
      calendarName: 'never',
    })
    // Fast path: delegate to the same map used by getDaysWithEvents so that
    // multi-day split segments are included too.
    const eventMap = this.getEventMap()
    return eventMap.get(targetDate) ?? []
  }

  addEvent(event: TEvent): void {
    if (!this.options.events) {
      this.options.events = []
    }
    const normalized = this.normalizeEvent(event)
    this.options.events.push(normalized)
    // Update indices in O(1)
    this._indexAddEvent(normalized)
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    getTimeClient().emit('event:added', {
      eventId: normalized.id,
      eventTitle: normalized.title,
      start: normalized.start as string,
      end: normalized.end as string,
    })
  }

  updateEvent(id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>): void {
    if (!this.options.events) return

    // O(1) lookup via index
    const existingEvent = this._eventMap.get(id)
    if (!existingEvent) return

    const index = this.options.events.indexOf(existingEvent)
    if (index === -1) return

    const oldStartStr = toPlainDateTimeString(existingEvent.start)
    const oldEndStr = toPlainDateTimeString(existingEvent.end)

    const normalizedUpdates = {
      ...updates,
      ...(updates.start != null
        ? { start: toPlainDateTimeString(updates.start) }
        : {}),
      ...(updates.end != null
        ? { end: toPlainDateTimeString(updates.end) }
        : {}),
    }

    const nextEvent = {
      ...existingEvent,
      ...normalizedUpdates,
    } as TEvent
    this.options.events[index] = nextEvent
    // Update all three indices atomically
    this._indexUpdateEvent(existingEvent, nextEvent)

    // Shared visited set prevents double-shifting when both end and start change.
    const visited = new Set([id])

    const newStart = normalizedUpdates.start as string | undefined
    if (newStart && newStart !== oldStartStr) {
      this.propagateStartDeltaBackward(id, visited)
    }

    const newEnd = normalizedUpdates.end as string | undefined
    if (newEnd && newEnd !== oldEndStr) {
      const endDeltaMs = Temporal.PlainDateTime.from(oldEndStr)
        .until(Temporal.PlainDateTime.from(newEnd))
        .total('milliseconds')

      if (endDeltaMs !== 0) {
        this.propagateEndDelta(id, endDeltaMs, visited)
      }
    }

    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    getTimeClient().emit('event:updated', {
      eventId: id,
      eventTitle: existingEvent.title,
      start: toPlainDateTimeString(nextEvent.start),
      end: toPlainDateTimeString(nextEvent.end),
      updates: normalizedUpdates as Record<string, unknown>,
    })
  }

  /**
   * Walk the predecessor chain backward and push each predecessor earlier when
   * the source event's new start would violate a finish-to-start constraint.
   * Uses _eventMap for O(1) lookups — no array scans.
   */
  private propagateStartDeltaBackward(sourceId: string, visited: Set<string>) {
    const sourceEvent = this._eventMap.get(sourceId)
    if (!sourceEvent?.dependsOn?.length) return

    const sourceStartStr = toPlainDateTimeString(sourceEvent.start)
    const sourceStartMs = Temporal.PlainDateTime.from(
      sourceStartStr,
    ).toZonedDateTime(this.options.timeZone).epochMilliseconds

    for (const predId of sourceEvent.dependsOn) {
      if (visited.has(predId)) continue

      const pred = this._eventMap.get(predId)
      if (!pred) continue
      const predArr = this.options.events
      if (!predArr) continue
      const predIndex = predArr.indexOf(pred)
      if (predIndex === -1) continue

      const predEndStr = toPlainDateTimeString(pred.end)
      const predEndMs = Temporal.PlainDateTime.from(predEndStr).toZonedDateTime(
        this.options.timeZone,
      ).epochMilliseconds

      const overlap = predEndMs - sourceStartMs
      if (overlap <= 0) continue

      visited.add(predId)

      const predStartStr = toPlainDateTimeString(pred.start)
      const shiftedStart = Temporal.PlainDateTime.from(predStartStr)
        .subtract({ milliseconds: overlap })
        .toString({ smallestUnit: 'second' })
      const shiftedEnd = Temporal.PlainDateTime.from(predEndStr)
        .subtract({ milliseconds: overlap })
        .toString({ smallestUnit: 'second' })

      const updated = { ...pred, start: shiftedStart, end: shiftedEnd } as TEvent
      predArr[predIndex] = updated
      this._indexUpdateEvent(pred, updated)

      getTimeClient().emit('event:updated', {
        eventId: pred.id,
        eventTitle: pred.title,
        start: shiftedStart,
        end: shiftedEnd,
        updates: { start: shiftedStart, end: shiftedEnd } as Record<
          string,
          unknown
        >,
      })

      this.propagateStartDeltaBackward(predId, visited)
    }
  }

  /**
   * Walk the successor (dependent) chain forward and shift each successor when
   * the source event's new end would overflow into the successor's start time.
   * Uses _dependentsMap for O(degree) traversal — no full array scan.
   */
  private propagateEndDelta(
    sourceId: string,
    _deltaMs: number,
    visited: Set<string>,
  ): void {
    const sourceEvent = this._eventMap.get(sourceId)
    if (!sourceEvent) return

    const sourceEndStr = toPlainDateTimeString(sourceEvent.end)
    const sourceEndMs = Temporal.PlainDateTime.from(
      sourceEndStr,
    ).toZonedDateTime(this.options.timeZone).epochMilliseconds

    // O(degree) — only the direct dependents of sourceId
    const dependentIds = this._dependentsMap.get(sourceId)
    if (!dependentIds || dependentIds.size === 0) return

    const eventsArr = this.options.events
    if (!eventsArr) return

    for (const depId of dependentIds) {
      if (visited.has(depId)) continue

      const dependent = this._eventMap.get(depId)
      if (!dependent) continue

      visited.add(dependent.id)

      const eventIndex = eventsArr.indexOf(dependent)
      if (eventIndex === -1) continue

      const depStartStr = toPlainDateTimeString(dependent.start)
      const depStartMs = Temporal.PlainDateTime.from(
        depStartStr,
      ).toZonedDateTime(this.options.timeZone).epochMilliseconds

      const overflow = sourceEndMs - depStartMs
      if (overflow <= 0) continue

      const depEndStr = toPlainDateTimeString(dependent.end)
      const shiftedStart = Temporal.PlainDateTime.from(depStartStr)
        .add({ milliseconds: overflow })
        .toString({ smallestUnit: 'second' })

      const shiftedEnd = Temporal.PlainDateTime.from(depEndStr)
        .add({ milliseconds: overflow })
        .toString({ smallestUnit: 'second' })

      const updated = { ...dependent, start: shiftedStart, end: shiftedEnd } as TEvent
      eventsArr[eventIndex] = updated
      this._indexUpdateEvent(dependent, updated)

      getTimeClient().emit('event:updated', {
        eventId: dependent.id,
        eventTitle: dependent.title,
        start: shiftedStart,
        end: shiftedEnd,
        updates: { start: shiftedStart, end: shiftedEnd } as Record<
          string,
          unknown
        >,
      })

      this.propagateEndDelta(dependent.id, overflow, visited)
    }
  }

  /**
   * Simulate how deltaMs cascades forward through the dependency graph without mutating state.
   * Uses _dependentsMap for O(degree) BFS — no full array scan per step.
   */
  private getAffectedByDelta(
    sourceId: string,
    deltaMs: number,
    visited: Set<string>,
  ): Array<{ event: TEvent; newStart: string; newEnd: string }> {
    if (deltaMs === 0) return []

    const affected: Array<{ event: TEvent; newStart: string; newEnd: string }> =
      []

    const projectedEndMap = new Map<string, number>()

    const sourceEvent = this._eventMap.get(sourceId)
    if (!sourceEvent) return []

    const sourceEndStr = toPlainDateTimeString(sourceEvent.end)
    const sourceEndMs =
      Temporal.PlainDateTime.from(sourceEndStr).toZonedDateTime(
        this.options.timeZone,
      ).epochMilliseconds + deltaMs
    projectedEndMap.set(sourceId, sourceEndMs)

    const queue: Array<string> = [sourceId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const currentEndMs = projectedEndMap.get(currentId)!

      // O(degree) — only direct dependents via reverse map
      const successorIds = this._dependentsMap.get(currentId)
      if (!successorIds || successorIds.size === 0) continue

      for (const sId of successorIds) {
        if (visited.has(sId)) continue
        const s = this._eventMap.get(sId)
        if (!s) continue

        const sStartStr = toPlainDateTimeString(s.start)
        const sEndStr = toPlainDateTimeString(s.end)
        const depStartMs = Temporal.PlainDateTime.from(
          sStartStr,
        ).toZonedDateTime(this.options.timeZone).epochMilliseconds
        const depEndMs = Temporal.PlainDateTime.from(sEndStr).toZonedDateTime(
          this.options.timeZone,
        ).epochMilliseconds

        const overflow = currentEndMs - depStartMs
        if (overflow <= 0) continue

        visited.add(sId)
        const newStart = Temporal.PlainDateTime.from(sStartStr)
          .add({ milliseconds: overflow })
          .toString({ smallestUnit: 'second' })
        const newEnd = Temporal.PlainDateTime.from(sEndStr)
          .add({ milliseconds: overflow })
          .toString({ smallestUnit: 'second' })
        affected.push({ event: s, newStart, newEnd })

        projectedEndMap.set(sId, depEndMs + overflow)
        queue.push(sId)
      }
    }

    return affected
  }

  /** Check whether the [newStart, newEnd] range for event is within its resources' availability. */
  private checkEventAvailability(
    event: TEvent,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource>,
  ): AvailabilityConflict | null {
    const resources = newResources || event.resources
    if (!resources?.length) return null

    const resourceIds = resources.map((r) => r.id)
    const startDt = Temporal.PlainDateTime.from(newStart)
    const endDt = Temporal.PlainDateTime.from(newEnd)

    const startDate = startDt.toPlainDate()
    const endDate = endDt.toPlainDate()
    let cursorDate = startDate

    while (Temporal.PlainDate.compare(cursorDate, endDate) <= 0) {
      const dayStr = cursorDate.toString({ calendarName: 'never' })
      const isSameAsStart =
        Temporal.PlainDate.compare(cursorDate, startDate) === 0
      const isSameAsEnd = Temporal.PlainDate.compare(cursorDate, endDate) === 0

      const overlapStartMins = isSameAsStart
        ? startDt.hour * 60 + startDt.minute
        : 0
      let overlapEndMins: number
      if (isSameAsEnd) {
        const endMins = endDt.hour * 60 + endDt.minute
        overlapEndMins =
          endMins === 0 && !isSameAsStart ? 0 : endMins || MINUTES_IN_DAY
      } else {
        overlapEndMins = MINUTES_IN_DAY
      }

      if (overlapStartMins < overlapEndMins) {
        const details = this.getUnavailabilityDetails(
          dayStr,
          overlapStartMins,
          overlapEndMins,
          { resourceIds },
        )

        if (details.length > 0) {
          return {
            date: dayStr,
            conflictRange: {
              start: formatMinutesToTime(overlapStartMins),
              end: formatMinutesToTime(overlapEndMins),
            },
            resourceIds,
            resourceDetails: details.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: `"${event.title}": ${d.description}`,
            })),
            description: `"${event.title}" would be pushed to unavailable time: ${details.map((d) => d.description).join('; ')}`,
          }
        }
      }

      cursorDate = cursorDate.add({ days: 1 })
    }

    return null
  }

  getEvents(): Array<TEvent> {
    return this.options.events ? [...this.options.events] : []
  }

  /**
   * Validates whether moving `eventId` to `[newStart, newEnd]` and cascading
   * all finish-to-start dependents would violate any resource availability.
   *
   * Returns `{ blocked: false }` when the move is safe, or
   * `{ blocked: true, message, blockedEventTitle }` when it would land in
   * an unavailable zone (either for the event itself or for a downstream dependent).
   */
  validateMove(
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource>,
  ): { blocked: boolean; blockedEventTitle?: string; message?: string } {
    // O(1) lookup — skip split segments (_originalStart set on them)
    const event = this._eventMap.get(eventId)
    if (!event || event._originalStart) return { blocked: false }

    const conflict = this.checkEventAvailability(
      event,
      newStart,
      newEnd,
      newResources,
    )
    if (conflict) {
      return {
        blocked: true,
        blockedEventTitle: event.title,
        message: `"${event.title}" cannot be placed here — it falls inside an unavailable zone.`,
      }
    }

    const oldEndMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(event.end),
    ).toZonedDateTime(this.options.timeZone).epochMilliseconds
    const newEndMs = Temporal.PlainDateTime.from(newEnd).toZonedDateTime(
      this.options.timeZone,
    ).epochMilliseconds
    const deltaMs = newEndMs - oldEndMs

    // If moving the event earlier would cause it to start before any predecessor ends,
    // we will "pull" predecessors left to maintain finish-to-start dependencies.
    // Validate that those pulled predecessors would not violate availability.
    if (event.dependsOn?.length) {
      const newStartMs = Temporal.PlainDateTime.from(newStart).toZonedDateTime(
        this.options.timeZone,
      ).epochMilliseconds

      const visited = new Set<string>([eventId])
      const queue: Array<{ id: string; startMs: number }> = [
        { id: eventId, startMs: newStartMs },
      ]

      while (queue.length > 0) {
        const current = queue.shift()!
        // O(1) lookup
        const currentEvent = this._eventMap.get(current.id)
        if (!currentEvent?.dependsOn?.length) continue

        for (const predId of currentEvent.dependsOn) {
          if (visited.has(predId)) continue
          // O(1) lookup
          const pred = this._eventMap.get(predId)
          if (!pred) continue

          const predStartStr = toPlainDateTimeString(pred.start)
          const predEndStr = toPlainDateTimeString(pred.end)
          const predStartMs = Temporal.PlainDateTime.from(
            predStartStr,
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds
          const predEndMs = Temporal.PlainDateTime.from(
            predEndStr,
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds

          const overlap = predEndMs - current.startMs
          if (overlap <= 0) continue

          visited.add(predId)

          const shiftedStart = Temporal.PlainDateTime.from(predStartStr)
            .subtract({ milliseconds: overlap })
            .toString({ smallestUnit: 'second' })
          const shiftedEnd = Temporal.PlainDateTime.from(predEndStr)
            .subtract({ milliseconds: overlap })
            .toString({ smallestUnit: 'second' })

          const predConflict = this.checkEventAvailability(
            pred,
            shiftedStart,
            shiftedEnd,
          )
          if (predConflict) {
            return {
              blocked: true,
              blockedEventTitle: pred.title,
              message: `"${pred.title}" would be pulled into unavailable time.`,
            }
          }

          queue.push({ id: predId, startMs: predStartMs - overlap })
        }
      }
    }

    if (deltaMs > 0) {
      const affected = this.getAffectedByDelta(
        eventId,
        deltaMs,
        new Set([eventId]),
      )
      for (const {
        event: dep,
        newStart: depStart,
        newEnd: depEnd,
      } of affected) {
        const depConflict = this.checkEventAvailability(dep, depStart, depEnd)
        if (depConflict) {
          return {
            blocked: true,
            blockedEventTitle: dep.title,
            message: `"${dep.title}" would be pushed to unavailable time.`,
          }
        }
      }
    }

    return { blocked: false }
  }

  validateEventDependencies(
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<string>,
  ): { valid: boolean; error?: ResizeError } {
    if (this._eventMap.size === 0) return { valid: true }

    const newStartMs = Temporal.PlainDateTime.from(event.start).toZonedDateTime(
      this.options.timeZone,
    ).epochMilliseconds

    for (const predId of dependsOn) {
      // O(1) lookup
      const pred = this._eventMap.get(predId)
      if (!pred) continue

      const predEndMs = Temporal.PlainDateTime.from(
        toPlainDateTimeString(pred.end),
      ).toZonedDateTime(this.options.timeZone).epochMilliseconds

      if (newStartMs < predEndMs) {
        return {
          valid: false,
          error: {
            eventId: event.id ?? '',
            eventTitle: event.title,
            reason: 'blocked',
            message: `"${event.title}" cannot start before "${pred.title}" ends`,
            originalStart: event.start,
            originalEnd: event.end,
          },
        }
      }
    }
    return { valid: true }
  }

  createDependency(
    sourceId: string,
    targetId: string,
  ): { blocked: boolean; error?: ResizeError } {
    // O(1) lookups
    const sourceEvent = this._eventMap.get(sourceId)
    const targetEvent = this._eventMap.get(targetId)
    if (!sourceEvent || !targetEvent) return { blocked: false }

    const currentDependsOn = targetEvent.dependsOn ?? []
    if (currentDependsOn.includes(sourceId)) return { blocked: false }

    const sourceEndStr = toPlainDateTimeString(sourceEvent.end)
    const targetStartStr = toPlainDateTimeString(targetEvent.start)
    const targetEndStr = toPlainDateTimeString(targetEvent.end)

    const sourceEndMs = Temporal.PlainDateTime.from(
      sourceEndStr,
    ).toZonedDateTime(this.options.timeZone).epochMilliseconds
    const targetStartMs = Temporal.PlainDateTime.from(
      targetStartStr,
    ).toZonedDateTime(this.options.timeZone).epochMilliseconds
    const targetEndMs = Temporal.PlainDateTime.from(
      targetEndStr,
    ).toZonedDateTime(this.options.timeZone).epochMilliseconds

    const durationMs = targetEndMs - targetStartMs
    const needsReschedule = targetStartMs < sourceEndMs

    let newTargetStart = targetStartStr
    let newTargetEnd = targetEndStr

    if (needsReschedule) {
      newTargetStart = sourceEndStr
      newTargetEnd = Temporal.PlainDateTime.from(sourceEndStr)
        .add({ milliseconds: durationMs })
        .toString({ smallestUnit: 'second' })

      const validation = this.validateMove(
        targetId,
        newTargetStart,
        newTargetEnd,
      )

      if (validation.blocked) {
        return {
          blocked: true,
          error: {
            eventId: targetId,
            eventTitle: validation.blockedEventTitle ?? targetEvent.title,
            reason: 'unavailable-time',
            message:
              validation.message ??
              `Cannot connect: the resulting schedule would fall inside an unavailable zone.`,
            originalStart: targetStartStr,
            originalEnd: targetEndStr,
            attemptedStart: newTargetStart,
            attemptedEnd: newTargetEnd,
          },
        }
      }
    }

    this.updateEvent(targetId, {
      dependsOn: [...currentDependsOn, sourceId],
      ...(needsReschedule && {
        start: newTargetStart,
        end: newTargetEnd,
      }),
    } as Partial<Omit<TEvent, 'id'>>)

    return { blocked: false }
  }

  removeEvent(id: Event['id']): void {
    if (!this.options.events) return

    // O(1) lookup via _eventMap
    const removedEvent = this._eventMap.get(id)
    if (!removedEvent) return

    const index = this.options.events.indexOf(removedEvent)
    if (index === -1) return

    this.options.events.splice(index, 1)
    // Remove from all three indices
    this._indexRemoveEvent(removedEvent)
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    getTimeClient().emit('event:removed', {
      eventId: id,
      eventTitle: removedEvent.title,
      start: removedEvent.start as string,
      end: removedEvent.end as string,
    })
  }

  getUnavailableRanges(
    date: string,
    options?: {
      containerHeight?: number
      resourceIds?: Array<TResource['id']>
    },
  ): Array<UnavailableRange> {
    const containerHeight = options?.containerHeight ?? 1440
    const resources = options?.resourceIds
      ? this.options.resources?.filter((resource) =>
          options.resourceIds?.includes(resource.id),
        )
      : this.options.resources
    if (!resources || resources.length === 0) {
      return []
    }

    const plainDate = Temporal.PlainDate.from(date)
    const weekday = plainDate.dayOfWeek

    const availableRanges: Array<{ startMinutes: number; endMinutes: number }> =
      []

    for (const resource of resources) {
      if (!resource.availability) continue

      for (const slot of resource.availability) {
        if (!slot.weekdays.includes(weekday)) continue

        const startParts = slot.startTime.split(':').map(Number)
        const endParts = slot.endTime.split(':').map(Number)
        const startHour = startParts[0] ?? 0
        const startMin = startParts[1] ?? 0
        const endHour = endParts[0] ?? 0
        const endMin = endParts[1] ?? 0

        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        availableRanges.push({ startMinutes, endMinutes })
      }
    }

    if (availableRanges.length === 0) {
      return [
        {
          top: 0,
          height: containerHeight,
          startTime: '00:00',
          endTime: '24:00',
        },
      ]
    }

    availableRanges.sort((a, b) => a.startMinutes - b.startMinutes)

    const mergedAvailable: Array<{ startMinutes: number; endMinutes: number }> =
      []
    for (const range of availableRanges) {
      const last = mergedAvailable[mergedAvailable.length - 1]
      if (last && range.startMinutes <= last.endMinutes) {
        last.endMinutes = Math.max(last.endMinutes, range.endMinutes)
      } else {
        mergedAvailable.push({ ...range })
      }
    }

    const unavailableRanges: Array<{
      startMinutes: number
      endMinutes: number
    }> = []
    let currentMinute = 0
    const dayEndMinutes = 24 * 60

    for (const available of mergedAvailable) {
      if (currentMinute < available.startMinutes) {
        unavailableRanges.push({
          startMinutes: currentMinute,
          endMinutes: available.startMinutes,
        })
      }
      currentMinute = available.endMinutes
    }

    if (currentMinute < dayEndMinutes) {
      unavailableRanges.push({
        startMinutes: currentMinute,
        endMinutes: dayEndMinutes,
      })
    }

    const minutesToPixels = (minutes: number) =>
      (minutes / dayEndMinutes) * containerHeight

    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    }

    return unavailableRanges.map((range) => ({
      top: minutesToPixels(range.startMinutes),
      height: minutesToPixels(range.endMinutes - range.startMinutes),
      startTime: formatTime(range.startMinutes),
      endTime: formatTime(range.endMinutes),
    }))
  }

  /**
   * Get detailed unavailability information for a specific time range on a date
   * Returns which resources are unavailable and why
   */
  getUnavailabilityDetails(
    date: string,
    startMinutes: number,
    endMinutes: number,
    options?: {
      resourceIds?: Array<TResource['id']>
    },
  ): Array<{
    resourceId: string
    resourceLabel: string
    reason: 'outside-hours' | 'capacity' | 'no-availability'
    description: string
  }> {
    const resources = options?.resourceIds
      ? this.options.resources?.filter((resource) =>
          options.resourceIds?.includes(resource.id),
        )
      : this.options.resources

    if (!resources || resources.length === 0) {
      return []
    }

    const plainDate = Temporal.PlainDate.from(date)
    const weekday = plainDate.dayOfWeek

    const details: Array<{
      resourceId: string
      resourceLabel: string
      reason: 'outside-hours' | 'capacity' | 'no-availability'
      description: string
    }> = []

    for (const resource of resources) {
      if (!resource.availability || resource.availability.length === 0) {
        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'no-availability',
          description: `${resource.label}: No availability configured`,
        })
        continue
      }

      const availableSlots = resource.availability.filter((slot) =>
        slot.weekdays.includes(weekday),
      )

      if (availableSlots.length === 0) {
        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'outside-hours',
          description: `${resource.label}: Not available on this day`,
        })
        continue
      }

      const isWithinAvailability = availableSlots.some((slot) => {
        const slotStartParts = slot.startTime.split(':').map(Number)
        const slotEndParts = slot.endTime.split(':').map(Number)
        const slotStartMinutes =
          (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0)
        const slotEndMinutes =
          (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0)

        return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes
      })

      if (!isWithinAvailability) {
        const timeRanges = availableSlots
          .map((slot) => {
            const slotStartParts = slot.startTime.split(':').map(Number)
            const slotEndParts = slot.endTime.split(':').map(Number)
            return {
              start: (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0),
              end: (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0),
            }
          })
          .sort((a, b) => a.start - b.start)

        const formatTime = (mins: number) =>
          `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

        const availabilityWindow = timeRanges
          .map((r) => `${formatTime(r.start)}-${formatTime(r.end)}`)
          .join(', ')

        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'outside-hours',
          description: `${resource.label}: Available ${availabilityWindow}, but event is ${formatTime(startMinutes)}-${formatTime(endMinutes)}`,
        })
      }
    }

    return details
  }

  private getMergedEventsByResource(
    days: Array<Day<TResource, TEvent>>,
  ): Map<TResource['id'], Array<TEvent>> {
    const map = new Map<TResource['id'], Array<TEvent>>()
    this.options.resources?.forEach((r) => map.set(r.id, []))

    const allSegments = days.flatMap((d) => d.events)
    const merged = new Map<string, TEvent>()
    for (const segment of allSegments) {
      if (!merged.has(segment.id)) {
        merged.set(segment.id, {
          ...segment,
          start: segment._originalStart ?? segment.start,
          end: segment._originalEnd ?? segment.end,
        } as TEvent)
      }
    }

    for (const event of merged.values()) {
      const resourceIds = event.resources?.map((r) => r.id) ?? []
      for (const rid of resourceIds) {
        map.get(rid)?.push(event)
      }
    }

    return map
  }

  getEventsByResource(): Map<TResource['id'], Array<TEvent>> {
    return this.getMergedEventsByResource(this.getDaysWithEvents())
  }

  getTimelineLayout(): TimelineLayout<TResource, TEvent> {
    const days = this.getDaysWithEvents()

    if (days.length === 0) {
      return { rows: [], currentTimePosition: null }
    }

    const firstDay = days[0]!.date
    const totalDays = days.length
    const eventsByResource = this.getMergedEventsByResource(days)

    const rows: Array<TimelineResourceRow<TResource, TEvent>> = (
      this.options.resources ?? []
    ).map((resource) => {
      const resourceEvents = eventsByResource.get(resource.id) ?? []

      const positioned = resourceEvents
        .map((event) => {
          const pos = this.computeTimelineEventPosition(
            event,
            firstDay,
            totalDays,
          )
          if (pos.width <= 0) return null
          return { event, ...pos, right: pos.left + pos.width }
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)

      const lanes: Array<Array<{ left: number; right: number }>> = []
      const withLanes = positioned.map((item) => {
        let assignedLane = 0
        for (assignedLane = 0; assignedLane < lanes.length; assignedLane++) {
          const hasOverlap = lanes[assignedLane]!.some(
            (existing) =>
              item.left < existing.right && item.right > existing.left,
          )
          if (!hasOverlap) break
        }
        if (!lanes[assignedLane]) lanes[assignedLane] = []
        lanes[assignedLane]!.push({ left: item.left, right: item.right })
        return {
          event: item.event,
          left: item.left,
          width: item.width,
          lane: assignedLane,
          isStartClipped: item.isStartClipped,
          isEndClipped: item.isEndClipped,
        }
      })

      return {
        resource,
        events: withLanes,
        laneCount: Math.max(1, lanes.length),
      }
    })

    let currentTimePosition: number | null = null
    const now = Temporal.Now.zonedDateTimeISO(this.options.timeZone)
    const todayStr = now.toPlainDate().toString({ calendarName: 'never' })
    const todayIndex = days.findIndex(
      (d) => d.date.toString({ calendarName: 'never' }) === todayStr,
    )
    if (todayIndex >= 0) {
      const hourFraction = now.hour + now.minute / 60
      const totalHours = totalDays * 24
      currentTimePosition =
        ((todayIndex * 24 + hourFraction) / totalHours) * 100
    }

    return { rows, currentTimePosition }
  }

  private computeTimelineEventPosition(
    event: TEvent,
    firstDay: Temporal.PlainDate,
    totalDays: number,
  ): {
    left: number
    width: number
    isStartClipped: boolean
    isEndClipped: boolean
  } {
    const startStr = toPlainDateTimeString(event.start)
    const endStr = toPlainDateTimeString(event.end)

    const startDateStr = startStr.split('T')[0]!
    const endDateStr = endStr.split('T')[0]!
    const startTimeStr = startStr.split('T')[1] ?? '00:00:00'
    const endTimeStr = endStr.split('T')[1] ?? '00:00:00'

    const startTimeParts = startTimeStr.split(':').map(Number)
    const endTimeParts = endTimeStr.split(':').map(Number)

    const firstDayIso = firstDay.toString({ calendarName: 'never' })
    const startDayOffset = Temporal.PlainDate.from(firstDayIso).until(
      Temporal.PlainDate.from(startDateStr),
    ).days
    const endDayOffset = Temporal.PlainDate.from(firstDayIso).until(
      Temporal.PlainDate.from(endDateStr),
    ).days

    const startHours =
      startDayOffset * 24 +
      (startTimeParts[0] ?? 0) +
      (startTimeParts[1] ?? 0) / 60
    const endHours =
      endDayOffset * 24 + (endTimeParts[0] ?? 0) + (endTimeParts[1] ?? 0) / 60

    const totalHours = totalDays * 24

    const rawLeft = (startHours / totalHours) * 100
    const rawRight = (endHours / totalHours) * 100

    const left = Math.max(0, rawLeft)
    const right = Math.min(100, rawRight)

    return {
      left,
      width: right - left,
      isStartClipped: rawLeft < 0,
      isEndClipped: rawRight > 100,
    }
  }

  private getUnavailableMinuteRanges(
    date: string,
    options?: { resourceIds?: Array<string> },
  ): Array<UnavailableTimeRange> {
    const rawRanges = this.getUnavailableRanges(date, {
      containerHeight: MINUTES_IN_DAY,
      resourceIds: options?.resourceIds,
    })
    return rawRanges.map((range) => {
      const startParts = range.startTime.split(':').map(Number)
      const endParts = range.endTime.split(':').map(Number)
      return {
        startMinutes: (startParts[0] ?? 0) * 60 + (startParts[1] ?? 0),
        endMinutes: (endParts[0] ?? 0) * 60 + (endParts[1] ?? 0),
      }
    })
  }

  private getResizeConflicts(
    dayDate: string,
    startMins: number,
    endMins: number,
    eventId: string,
    originalStart: string,
    originalEnd: string,
    resourceIds: Array<string>,
  ): Array<AvailabilityConflict> {
    const conflicts: Array<AvailabilityConflict> = []

    const details = this.getUnavailabilityDetails(dayDate, startMins, endMins, {
      resourceIds,
    })

    const unavailableRangesForDay = this.getUnavailableMinuteRanges(dayDate, {
      resourceIds,
    })

    const plainDate = Temporal.PlainDate.from(dayDate)
    const weekday = plainDate.dayOfWeek

    for (const range of unavailableRangesForDay) {
      if (startMins < range.endMinutes && endMins > range.startMinutes) {
        const overlappingDetails = details.filter((d) => {
          const resource = this.options.resources?.find(
            (r) => r.id === d.resourceId,
          )
          if (!resource) return false

          const resourceAvailableSlots =
            resource.availability?.filter((slot) =>
              slot.weekdays.includes(weekday),
            ) || []

          if (resourceAvailableSlots.length === 0) return true

          return !resourceAvailableSlots.some((slot) => {
            const slotStartParts = slot.startTime.split(':').map(Number)
            const slotEndParts = slot.endTime.split(':').map(Number)
            const slotStart =
              (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0)
            const slotEnd = (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0)

            return !(
              range.endMinutes <= slotStart || range.startMinutes >= slotEnd
            )
          })
        })

        if (overlappingDetails.length > 0) {
          conflicts.push({
            date: dayDate,
            conflictRange: {
              start: formatMinutesToTime(
                Math.max(startMins, range.startMinutes),
              ),
              end: formatMinutesToTime(Math.min(endMins, range.endMinutes)),
            },
            resourceIds: overlappingDetails.map((d) => d.resourceId),
            resourceDetails: overlappingDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: overlappingDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }
    }

    const eventsOnDay = this.getEventsByDate(dayDate)

    const origStartDate = new Date(originalStart)
    const origEndDate = new Date(originalEnd)
    const origStartMins =
      origStartDate.getHours() * 60 + origStartDate.getMinutes()
    const origEndMins = origEndDate.getHours() * 60 + origEndDate.getMinutes()

    for (const resourceId of resourceIds) {
      const resource = this.options.resources?.find((r) => r.id === resourceId)
      if (!resource || !resource.capacity || resource.capacity.length === 0)
        continue

      const getOverlappingEvents = (
        checkStartMins: number,
        checkEndMins: number,
      ) =>
        eventsOnDay.filter((e) => {
          if (e.id === eventId) return false

          const eventResourceIds = e.resources?.map((r) => r.id) || []
          if (!eventResourceIds.includes(resourceId)) return false

          const eventStart = new Date(e.start)
          const eventEnd = new Date(e.end)
          const eventStartMins =
            eventStart.getHours() * 60 + eventStart.getMinutes()
          const eventEndMins = eventEnd.getHours() * 60 + eventEnd.getMinutes()

          return checkStartMins < eventEndMins && checkEndMins > eventStartMins
        })

      const overlappingEvents = getOverlappingEvents(startMins, endMins)
      const previouslyOverlapping = getOverlappingEvents(
        origStartMins,
        origEndMins,
      )

      const getSum = (events: Array<TEvent>) =>
        events.reduce((acc, e) => {
          const f = e.consumption || [1]
          return acc + f.reduce((a, b) => a + b, 0)
        }, 0)

      const currentUsage = getSum(overlappingEvents)
      const previousUsage = getSum(previouslyOverlapping)
      const resourceCapacitySum = resource.capacity.reduce(
        (a, b) => a + b,
        0,
      )

      if (
        currentUsage > previousUsage &&
        currentUsage >= resourceCapacitySum
      ) {
        conflicts.push({
          date: dayDate,
          conflictRange: {
            start: formatMinutesToTime(startMins),
            end: formatMinutesToTime(endMins),
          },
          resourceIds: [resourceId],
          resourceDetails: [
            {
              resourceId: resource.id,
              resourceLabel: resource.label,
              reason: 'capacity',
              description: `${resource.label}: Capacity exceeded (${currentUsage}/${resourceCapacitySum} units used)`,
              capacityInfo: {
                max: resourceCapacitySum,
                used: currentUsage,
                remaining: 0,
              },
            },
          ],
          description: `${resource.label}: Capacity exceeded (${currentUsage}/${resourceCapacitySum} units used)`,
        })
      }
    }

    return conflicts
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
    } = options

    const event = this.options.events?.find((ev) => ev.id === eventId)
    const resourceIds = event?.resources?.map((r) => r.id)

    const unavailableRanges = this.getUnavailableMinuteRanges(targetDayDate, {
      resourceIds,
    })

    const originalStartDate = originalStart.split('T')[0] ?? ''
    const originalEndDate = originalEnd.split('T')[0] ?? ''

    const effectiveEdge =
      edge === 'left' ? 'top' : edge === 'right' ? 'bottom' : edge

    let shouldBlockResize = false
    let blockReason: ResizeError['reason'] = 'blocked'
    let blockMessage = 'Resize blocked'
    const conflicts: Array<AvailabilityConflict> = []

    const snapToMinutes = constraints?.snapToMinutes ?? 1
    const snapMins = (minutes: number): number => {
      if (snapToMinutes <= 1) return minutes
      return Math.round(minutes / snapToMinutes) * snapToMinutes
    }

    if (effectiveEdge === 'top' && targetDayDate < originalStartDate) {
      const rawStartMinutes =
        new Date(originalStart).getHours() * 60 +
        new Date(originalStart).getMinutes() +
        totalDeltaMinutes
      const targetStartMinutes =
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
      const snappedTargetStartMinutes = snapMins(targetStartMinutes)
      const currentStartMinutes =
        new Date(originalStart).getHours() * 60 +
        new Date(originalStart).getMinutes()

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          snappedTargetStartMinutes,
          MINUTES_IN_DAY,
          { resourceIds },
        )

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = unavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedTargetStartMinutes)} conflicts with ${detailsText}`
          conflicts.push({
            date: targetDayDate,
            conflictRange: {
              start: formatMinutesToTime(snappedTargetStartMinutes),
              end: formatMinutesToTime(MINUTES_IN_DAY),
            },
            resourceIds: unavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: unavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: unavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const sourceUnavailabilityDetails = this.getUnavailabilityDetails(
          originalStartDate,
          0,
          currentStartMinutes,
          { resourceIds },
        )

        if (sourceUnavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = sourceUnavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalStartDate} - ${detailsText}`
          conflicts.push({
            date: originalStartDate,
            conflictRange: {
              start: formatMinutesToTime(0),
              end: formatMinutesToTime(currentStartMinutes),
            },
            resourceIds: sourceUnavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: sourceUnavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: sourceUnavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }
    } else if (effectiveEdge === 'bottom' && targetDayDate > originalEndDate) {
      const rawEndMinutes =
        new Date(originalEnd).getHours() * 60 +
        new Date(originalEnd).getMinutes() +
        totalDeltaMinutes
      const targetEndMinutes =
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
      const snappedTargetEndMinutes = snapMins(targetEndMinutes)
      const currentEndMinutes =
        new Date(originalEnd).getHours() * 60 +
        new Date(originalEnd).getMinutes()

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          0,
          snappedTargetEndMinutes,
          { resourceIds },
        )

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = unavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event ending at ${formatMinutesToTime(snappedTargetEndMinutes)} conflicts with ${detailsText}`
          conflicts.push({
            date: targetDayDate,
            conflictRange: {
              start: formatMinutesToTime(0),
              end: formatMinutesToTime(snappedTargetEndMinutes),
            },
            resourceIds: unavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: unavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: unavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const sourceUnavailabilityDetails = this.getUnavailabilityDetails(
          originalEndDate,
          currentEndMinutes,
          MINUTES_IN_DAY,
          { resourceIds },
        )

        if (sourceUnavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = sourceUnavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalEndDate} - ${detailsText}`
          conflicts.push({
            date: originalEndDate,
            conflictRange: {
              start: formatMinutesToTime(currentEndMinutes),
              end: formatMinutesToTime(MINUTES_IN_DAY),
            },
            resourceIds: sourceUnavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: sourceUnavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: sourceUnavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }
    }

    if (
      !shouldBlockResize &&
      targetDayDate === originalStartDate &&
      targetDayDate === originalEndDate
    ) {
      const rawStartMinutes =
        new Date(originalStart).getHours() * 60 +
        new Date(originalStart).getMinutes() +
        (effectiveEdge === 'top' ? totalDeltaMinutes : 0)
      const rawEndMinutes =
        new Date(originalEnd).getHours() * 60 +
        new Date(originalEnd).getMinutes() +
        (effectiveEdge === 'bottom' ? totalDeltaMinutes : 0)

      const snappedStartMinutes = snapMins(
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
      )
      const snappedEndMinutes = snapMins(
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
      )

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          snappedStartMinutes,
          snappedEndMinutes,
          { resourceIds },
        )

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = unavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
          conflicts.push({
            date: targetDayDate,
            conflictRange: {
              start: formatMinutesToTime(snappedStartMinutes),
              end: formatMinutesToTime(snappedEndMinutes),
            },
            resourceIds: unavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: unavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: unavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const detailedConflicts = this.getResizeConflicts(
          targetDayDate,
          snappedStartMinutes,
          snappedEndMinutes,
          eventId,
          originalStart,
          originalEnd,
          resourceIds,
        )

        const capacityConflicts = detailedConflicts.filter((c) =>
          c.resourceDetails.some((d) => d.reason === 'capacity'),
        )

        if (capacityConflicts.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const conflict = capacityConflicts[0]!
          const detailsText = conflict.resourceDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
          conflicts.push(...capacityConflicts)
        }
      }
    }

    // Comprehensive datetime-based check: catches multi-day event resizes and
    // cases where the existing per-day-minute logic doesn't apply (e.g.
    // horizontal timeline where targetDayDate is always the original day).
    if (!shouldBlockResize && resourceIds?.length) {
      const originalStartMs = new Date(originalStart).getTime()
      const originalEndMs = new Date(originalEnd).getTime()
      const snapMs = snapToMinutes * 60_000
      const snappedDeltaMs =
        Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs

      // Only check the *new territory* being added — shrinking is always fine.
      let checkFromMs: number | null = null
      let checkToMs: number | null = null

      if (effectiveEdge === 'bottom') {
        const newEndMs = originalEndMs + snappedDeltaMs
        if (newEndMs > originalEndMs) {
          checkFromMs = originalEndMs
          checkToMs = newEndMs
        }
      } else {
        const newStartMs = originalStartMs + snappedDeltaMs
        if (newStartMs < originalStartMs) {
          checkFromMs = newStartMs
          checkToMs = originalStartMs
        }
      }

      if (checkFromMs !== null && checkToMs !== null) {
        const dayMs = 24 * 60 * 60 * 1_000
        const cursor = new Date(checkFromMs)
        cursor.setHours(0, 0, 0, 0)

        while (cursor.getTime() < checkToMs && !shouldBlockResize) {
          const dayStr = toPlainDateString(cursor)
          const dayStartMs = cursor.getTime()
          const dayEndMs = dayStartMs + dayMs

          const overlapStartMs = Math.max(checkFromMs, dayStartMs)
          const overlapEndMs = Math.min(checkToMs, dayEndMs)

          if (overlapStartMs < overlapEndMs) {
            const overlapStartMins = Math.floor(
              (overlapStartMs - dayStartMs) / 60_000,
            )
            const overlapEndMins = Math.ceil(
              (overlapEndMs - dayStartMs) / 60_000,
            )

            const details = this.getUnavailabilityDetails(
              dayStr,
              overlapStartMins,
              overlapEndMins,
              { resourceIds },
            )

            if (details.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              const detailsText = details
                .map((d) => `${d.resourceLabel} (${d.reason})`)
                .join(', ')
              blockMessage = `Unavailable: ${dayStr} ${formatMinutesToTime(overlapStartMins)}–${formatMinutesToTime(overlapEndMins)} conflicts with ${detailsText}`
              conflicts.push({
                date: dayStr,
                conflictRange: {
                  start: formatMinutesToTime(overlapStartMins),
                  end: formatMinutesToTime(overlapEndMins),
                },
                resourceIds: details.map((d) => d.resourceId),
                resourceDetails: details.map((d) => ({
                  resourceId: d.resourceId,
                  resourceLabel: d.resourceLabel,
                  reason: d.reason,
                  description: d.description,
                })),
                description: details.map((d) => d.description).join('; '),
              })
            }
          }

          cursor.setTime(cursor.getTime() + dayMs)
        }
      }
    }

    const snapMs = (constraints?.snapToMinutes ?? 1) * 60_000
    const snappedDeltaMs =
      Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs

    if (!shouldBlockResize && effectiveEdge === 'top' && this.options.events) {
      const event = this.options.events.find((ev) => ev.id === eventId)
      if (event?.dependsOn?.length) {
        const proposedStartMs =
          Temporal.PlainDateTime.from(originalStart).toZonedDateTime(
            this.options.timeZone,
          ).epochMilliseconds + snappedDeltaMs

        for (const predId of event.dependsOn) {
          const pred = this.options.events.find((ev) => ev.id === predId)
          if (!pred) continue

          const predEndMs = Temporal.PlainDateTime.from(
            toPlainDateTimeString(pred.end),
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds

          if (proposedStartMs < predEndMs) {
            shouldBlockResize = true
            blockReason = 'blocked'
            blockMessage = `"${event.title}" cannot start before "${pred.title}" ends`
            break
          }
        }
      }
    }

    if (
      !shouldBlockResize &&
      effectiveEdge === 'bottom' &&
      snappedDeltaMs > 0
    ) {
      const affected = this.getAffectedByDelta(
        eventId,
        snappedDeltaMs,
        new Set([eventId]),
      )

      for (const { event: affectedEvent, newStart, newEnd } of affected) {
        const alreadyConflicting = this.checkEventAvailability(
          affectedEvent,
          toPlainDateTimeString(affectedEvent.start),
          toPlainDateTimeString(affectedEvent.end),
        )
        if (alreadyConflicting) continue

        const conflict = this.checkEventAvailability(
          affectedEvent,
          newStart,
          newEnd,
        )
        if (conflict) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          blockMessage = `Blocked: "${affectedEvent.title}" would be pushed to unavailable time`
          conflicts.push(conflict)
          break
        }
      }
    }

    const effectiveDeltaMinutes = shouldBlockResize ? 0 : totalDeltaMinutes

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
    })

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
    }
  }
}
