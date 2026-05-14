import { Temporal } from '@js-temporal/polyfill'
import { getTimeClient } from '../client'
import { splitMultiDayEvents } from './splitMultiDayEvents'
import { expandRecurringEvent } from './expandRecurringEvent'
import { getEventProps } from './getEventProps'
import { groupDaysBy } from './groupDaysBy'
import { getTimeSlots } from './getTimeSlots'
import { calculateResizedEvent, getSegmentInfo } from './getResizeProps'
import { DateCore } from './date-core'
import { generateDateRange } from './generateDateRange'
import { ResizeController } from './resizeController'
import type { DateCoreOptions, ParsedDateCoreOptions } from './date-core'
import type { ResizeControllerOptions } from './resizeController'
import type {
  ResizeConstraints,
  ResizeEdge,
  SegmentInfo,
  UnavailableTimeRange,
} from './getResizeProps'
import type {
  AvailabilityConflict,
  Day,
  DependencyType,
  Event,
  EventDateTimeInput,
  EventDependency,
  ResizeError,
  Resource,
  SaveEventResult,
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
  fetchEvents?: (range: {
    start: string
    end: string
  }) => Promise<Array<TEvent>>
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
  /**
   * Navigates to the next occurrence of a recurring event after fromDate (defaults to activeDate).
   * No-op when the event is not recurring or has no future occurrences.
   */
  goToNextOccurrence: (eventId: string, fromDate?: EventDateTimeInput) => void
  /**
   * Navigates to the previous occurrence of a recurring event before fromDate (defaults to activeDate).
   * No-op when the event is not recurring or is already at the first occurrence.
   */
  goToPreviousOccurrence: (
    eventId: string,
    fromDate?: EventDateTimeInput,
  ) => void
  /**
   * Returns the master event for a given occurrence (or the event itself if it is already the master).
   */
  getMasterEvent: (event: TEvent) => TEvent
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
  /** Retrieves all events for a specific date. */
  getEventsByDate: (date: string) => Array<TEvent>
  /** Retrieves all-day events occurring on a specific date (multi-day all-day segments included). */
  getAllDayEventsByDate: (date: string) => Array<TEvent>
  /**
   * Fetches events for the event's date range, validates placement
   * constraints, and adds the event if valid. Returns a result
   * indicating success or a validation error.
   */
  addEvent: (
    event: TEvent,
    options?: { dependsOn?: Array<EventDependency> },
  ) => Promise<SaveEventResult>
  /**
   * Fetches events for the event's date range, validates move constraints
   * (and cascading dependents), and updates the event if valid.
   * Returns a result indicating success or a validation error.
   */
  editEvent: (
    eventId: string,
    updates: Partial<Omit<TEvent, 'id'>>,
    options?: { dependsOn?: Array<EventDependency> },
  ) => Promise<SaveEventResult>
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
  /** Formats the current period as a human-readable "Month Year" string (e.g. "January 2024"). */
  formatCurrentPeriod: (options?: { locale?: string }) => string
  /** Returns segment info (split/occurrence metadata) for an event, normalising flexible datetime inputs. */
  getEventSegmentInfo: (event: TEvent) => SegmentInfo
  /**
   * Returns Day objects for every date between `start` and `end` (inclusive),
   * derived freshly from current event state. Useful for buffered/infinite-scroll
   * UIs that need to render a range wider than the current period without
   * caching stale Day snapshots.
   */
  getDaysInRange: (start: string, end: string) => Array<Day<TResource, TEvent>>
  /** Returns a snapshot of all events currently managed by the calendar (including those outside the visible range). */
  getEvents: () => Array<TEvent>
  /** Reverts the last mutating action (commitAdd, commitUpdate, removeEvent). */
  undo: () => void
  /** Re-applies the last undone action. */
  redo: () => void
  /** Returns true when there is at least one action to undo. */
  canUndo: () => boolean
  /** Returns true when there is at least one action to redo. */
  canRedo: () => boolean
  /**
   * Checks whether moving `eventId` to `[newStart, newEnd]` — and cascading
   * all finish-to-start dependents — would violate any resource availability.
   */
  validateMove: (
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource>,
    newConsumption?: Array<number>,
  ) => { blocked: boolean; blockedEventTitle?: string; message?: string }
  /**
   * Validates if placing an event with a specific start time satisfies all dependency constraints.
   */
  validateEventDependencies: (
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<EventDependency>,
  ) => { valid: boolean; error?: ResizeError }
  /**
   * Creates a dependency link from source to target event.
   * If the target event starts before the source event ends, it will optionally reschedule the target.
   */
  createDependency: (
    sourceId: string,
    targetId: string,
    type?: DependencyType,
  ) => { blocked: boolean; error?: ResizeError }
  /**
   * Fetches events for an arbitrary date range from the configured
   * `fetchEvents` callback and merges them into the calendar.
   * Resolves immediately if `fetchEvents` is not configured or the range
   * is already loaded.
   */
  fetchEventsForRange: (start: string, end: string) => Promise<void>
  /**
   * Validates whether a new event (not yet added to the calendar) can be
   * placed at the given time slot without violating resource availability.
   * Use this for standalone validation before manually committing events.
   */
  validateEventPlacement: (event: {
    title: string
    start: string
    end: string
    resources?: Array<TResource>
  }) => { blocked: boolean; message?: string }
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
  fetchEvents?: (range: {
    start: string
    end: string
  }) => Promise<Array<TEvent>>
}

export class CalendarCore<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>
  extends DateCore
  implements CalendarActions<TResource, TEvent>
{
  declare options: ParsedCalendarCoreOptions<TResource, TEvent>

  private _eventMap = new Map<string, TEvent>()
  private _dependentsMap = new Map<string, Set<string>>()
  private _dateIndex = new Map<string, Set<string>>()
  private _loadedRanges: Array<{ start: string; end: string }> = []
  private _undoStack: Array<Array<TEvent>> = []
  private _redoStack: Array<Array<TEvent>> = []

  private _resourceDayAvailCache = new Map<
    string,
    {
      available: Array<{ startMinutes: number; endMinutes: number }>
      unavailable: Array<{ startMinutes: number; endMinutes: number }>
      hasAvailability: boolean
      slotsForWeekday: Array<{ startMinutes: number; endMinutes: number }>
    }
  >()
  private _mergedUnavailMinuteCache = new Map<
    string,
    Array<{ startMinutes: number; endMinutes: number }>
  >()
  private _weekdayCache = new Map<string, number>()

  constructor(options: CalendarCoreOptions<TResource, TEvent>) {
    super(options)
    Object.assign(this.options, {
      events: options.events?.map((e) => this.normalizeEvent(e)) || null,
      resources: options.resources || null,
      fetchEvents: options.fetchEvents,
    })
    this.options.events?.forEach((e) => this._indexAddEvent(e))
  }

  private _eventDateKey(event: TEvent): string {
    const startStr = event.start as string
    return startStr.split('T')[0] ?? startStr
  }

  private _indexAddEvent(event: TEvent) {
    this._eventMap.set(event.id, event)
    const dk = this._eventDateKey(event)
    if (!this._dateIndex.has(dk)) this._dateIndex.set(dk, new Set())
    this._dateIndex.get(dk)!.add(event.id)

    for (const dep of event.dependsOn ?? []) {
      if (!this._dependentsMap.has(dep.id))
        this._dependentsMap.set(dep.id, new Set())
      this._dependentsMap.get(dep.id)!.add(event.id)
    }
  }

  private _indexRemoveEvent(event: TEvent) {
    this._eventMap.delete(event.id)
    const dk = this._eventDateKey(event)
    const bucket = this._dateIndex.get(dk)
    if (bucket) {
      bucket.delete(event.id)
      if (bucket.size === 0) this._dateIndex.delete(dk)
    }
    for (const dep of event.dependsOn ?? []) {
      this._dependentsMap.get(dep.id)?.delete(event.id)
    }
    this._dependentsMap.delete(event.id)
  }

  private _indexUpdateEvent(prev: TEvent, next: TEvent) {
    this._eventMap.set(next.id, next)

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

    const prevDeps = new Map((prev.dependsOn ?? []).map((d) => [d.id, d.type]))
    const nextDeps = new Map((next.dependsOn ?? []).map((d) => [d.id, d.type]))
    for (const [predId] of prevDeps) {
      if (!nextDeps.has(predId)) {
        this._dependentsMap.get(predId)?.delete(next.id)
      }
    }
    for (const [predId] of nextDeps) {
      if (!prevDeps.has(predId)) {
        if (!this._dependentsMap.has(predId))
          this._dependentsMap.set(predId, new Set())
        this._dependentsMap.get(predId)!.add(next.id)
      }
    }
  }

  private _isRangeLoaded(start: string, end: string) {
    for (const r of this._loadedRanges) {
      if (r.start <= start && r.end >= end) return true
    }
    return false
  }

  private _markRangeLoaded(start: string, end: string) {
    this._loadedRanges.push({ start, end })
    this._loadedRanges.sort((a, b) => (a.start < b.start ? -1 : 1))
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

  private _getWeekday(date: string): number {
    const cached = this._weekdayCache.get(date)
    if (cached !== undefined) return cached
    const y = +date.slice(0, 4)
    const m = +date.slice(5, 7)
    const d = +date.slice(8, 10)
    const jsDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
    const iso = jsDow === 0 ? 7 : jsDow
    this._weekdayCache.set(date, iso)
    return iso
  }

  private _parseHmToMinutes(hm: string): number {
    const h = (hm.charCodeAt(0) - 48) * 10 + (hm.charCodeAt(1) - 48)
    const mi = (hm.charCodeAt(3) - 48) * 10 + (hm.charCodeAt(4) - 48)
    return h * 60 + mi
  }

  private _getResourceDayAvail(
    resource: TResource,
    weekday: number,
  ): {
    available: Array<{ startMinutes: number; endMinutes: number }>
    unavailable: Array<{ startMinutes: number; endMinutes: number }>
    hasAvailability: boolean
    slotsForWeekday: Array<{ startMinutes: number; endMinutes: number }>
  } {
    const key = `${resource.id}:${weekday}`
    const cached = this._resourceDayAvailCache.get(key)
    if (cached) return cached

    const slotsForWeekday: Array<{ startMinutes: number; endMinutes: number }> =
      []
    if (resource.availability) {
      for (const slot of resource.availability) {
        if (!slot.weekdays.includes(weekday)) continue
        slotsForWeekday.push({
          startMinutes: this._parseHmToMinutes(slot.startTime),
          endMinutes: this._parseHmToMinutes(slot.endTime),
        })
      }
    }

    slotsForWeekday.sort((a, b) => a.startMinutes - b.startMinutes)
    const available: Array<{ startMinutes: number; endMinutes: number }> = []
    for (const r of slotsForWeekday) {
      const last = available[available.length - 1]
      if (last && r.startMinutes <= last.endMinutes) {
        last.endMinutes = Math.max(last.endMinutes, r.endMinutes)
      } else {
        available.push({ ...r })
      }
    }

    const unavailable: Array<{ startMinutes: number; endMinutes: number }> = []
    let cursor = 0
    for (const a of available) {
      if (cursor < a.startMinutes) {
        unavailable.push({ startMinutes: cursor, endMinutes: a.startMinutes })
      }
      cursor = a.endMinutes
    }
    if (cursor < MINUTES_IN_DAY) {
      unavailable.push({ startMinutes: cursor, endMinutes: MINUTES_IN_DAY })
    }

    const result = {
      available,
      unavailable,
      hasAvailability: !!resource.availability,
      slotsForWeekday,
    }
    this._resourceDayAvailCache.set(key, result)
    return result
  }

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

  private getEventMap(window?: { start: string; end: string }) {
    const map = new Map<string, Array<TEvent>>()

    let windowStart: string | null
    let windowEnd: string | null
    if (window) {
      windowStart = window.start
      windowEnd = window.end
    } else {
      const calendarDays = this.getCalendarDays()
      windowStart =
        calendarDays.length > 0
          ? calendarDays[0]!.toString({ calendarName: 'never' })
          : null
      windowEnd =
        calendarDays.length > 0
          ? calendarDays[calendarDays.length - 1]!.add({ days: 1 }).toString({
              calendarName: 'never',
            })
          : null
    }

    const placeEvent = (ev: TEvent) => {
      const startStr = ev.start as string
      const endStr = ev.end as string

      const startDt = Temporal.PlainDateTime.from(startStr)
      const endDt = Temporal.PlainDateTime.from(endStr)
      const startPlainDate = startDt.toPlainDate()
      const endPlainDate = endDt.toPlainDate()

      if (Temporal.PlainDate.compare(startPlainDate, endPlainDate) !== 0) {
        const splitEvents = splitMultiDayEvents<TResource, TEvent>(
          ev,
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
        map.get(dateKey)!.push(ev)
      }
    }

    for (const event of this._eventMap.values()) {
      const masterConflict =
        event.recurrence && event.resources?.length
          ? this.checkEventAvailability(
              event,
              event.start as string,
              event.end as string,
            )
          : null
      if (!masterConflict) {
        placeEvent(event)
      }

      if (event.recurrence && windowStart && windowEnd) {
        const occurrences = expandRecurringEvent<TResource, TEvent>(
          event,
          windowStart,
          windowEnd,
        )
        for (const occ of occurrences) {
          const conflict = occ.resources?.length
            ? this.checkEventAvailability(
                occ,
                occ.start as string,
                occ.end as string,
              )
            : null
          if (!conflict) {
            placeEvent(occ)
          }
        }
      }
    }
    return map
  }

  ensureRangeLoaded() {
    const calendarDays = this.getCalendarDays()

    if (this.options.fetchEvents && calendarDays.length > 0) {
      const first = calendarDays[0]!
      const last = calendarDays[calendarDays.length - 1]!
      const rangeStart = first.toString({ calendarName: 'never' })

      const rangeEnd = last.add({ days: 1 }).toString({ calendarName: 'never' })

      if (!this._isRangeLoaded(rangeStart, rangeEnd)) {
        this._markRangeLoaded(rangeStart, rangeEnd)
        this.store.setState((prev) => ({ ...prev, isPending: true }))
        this.options
          .fetchEvents({ start: rangeStart, end: rangeEnd })
          .then((fetchedEvents) => {
            if (fetchedEvents.length > 0) {
              if (!this.options.events) this.options.events = []
              const newlyFetchedEvents: Array<{
                eventId: string
                eventTitle: string
                start: string
                end: string
              }> = []
              for (const raw of fetchedEvents) {
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
                getTimeClient().emit('events:set', {
                  events: newlyFetchedEvents,
                })
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
            this._loadedRanges = this._loadedRanges.filter(
              (r) => !(r.start === rangeStart && r.end === rangeEnd),
            )
            this.store.setState((prev) => ({ ...prev, isPending: false }))
          })
      }
    }
  }

  getDaysWithEvents() {
    return this._buildDays(this.getCalendarDays())
  }

  /**
   * Returns Day objects for every date between `start` and `end` (inclusive),
   * derived freshly from the current event state. Use this when rendering a
   * buffered range that spans multiple periods (e.g. infinite scroll) so
   * mutations (add/edit/remove) are reflected without manual cache invalidation.
   */
  getDaysInRange(start: string, end: string) {
    const days = generateDateRange(start, end)
    const windowEnd = Temporal.PlainDate.from(end)
      .add({ days: 1 })
      .toString({ calendarName: 'never' })
    return this._buildDays(days, { start, end: windowEnd })
  }

  private _buildDays(
    days: Array<Temporal.PlainDate>,
    window?: { start: string; end: string },
  ) {
    const eventMap = this.getEventMap(window)
    const currentMonthRange = Array.from(
      { length: this.store.state.viewMode.value },
      (_, i) => this.store.state.currentPeriod.add({ months: i }).month,
    )
    const today = Temporal.Now.plainDateISO()
    return days.map((day) => {
      const isoDate = day.toString({ calendarName: 'never' })
      const dailyEvents = eventMap.get(isoDate) ?? []
      const timedEvents: Array<TEvent> = []
      const allDayEvents: Array<TEvent> = []
      for (const ev of dailyEvents) {
        if (ev.allDay) allDayEvents.push(ev)
        else timedEvents.push(ev)
      }
      const isInCurrentPeriod = currentMonthRange.includes(day.month)
      return {
        date: day,
        isoDate,
        events: timedEvents,
        allDayEvents,
        isToday: Temporal.PlainDate.compare(day, today) === 0,
        isInCurrentPeriod,
      }
    })
  }

  getLoadedRanges(): ReadonlyArray<{ start: string; end: string }> {
    return this._loadedRanges
  }

  async fetchEventsForRange(start: string, end: string): Promise<void> {
    if (!this.options.fetchEvents) return
    if (this._isRangeLoaded(start, end)) return

    this._markRangeLoaded(start, end)
    this.store.setState((prev) => ({ ...prev, isPending: true }))

    try {
      const fetchedEvents = await this.options.fetchEvents({ start, end })
      if (fetchedEvents.length > 0) {
        if (!this.options.events) this.options.events = []
        const newlyFetchedEvents: Array<{
          eventId: string
          eventTitle: string
          start: string
          end: string
        }> = []
        for (const raw of fetchedEvents) {
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
          getTimeClient().emit('events:set', {
            events: newlyFetchedEvents,
          })
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
    } catch {
      this._loadedRanges = this._loadedRanges.filter(
        (r) => !(r.start === start && r.end === end),
      )
      this.store.setState((prev) => ({ ...prev, isPending: false }))
    }
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

  formatCurrentPeriod(options?: { locale?: string }): string {
    const period = this.store.state.currentPeriod
    const locale = options?.locale ?? this.options.locale
    return new Date(
      period.year,
      period.month - 1,
      period.day,
    ).toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    })
  }

  getEventSegmentInfo(event: TEvent): SegmentInfo {
    return getSegmentInfo({
      start: toPlainDateTimeString(event.start),
      end: toPlainDateTimeString(event.end),
      ...(event._originalStart != null
        ? { _originalStart: event._originalStart }
        : {}),
      ...(event._originalEnd != null
        ? { _originalEnd: event._originalEnd }
        : {}),
    })
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

  getEventsByDate(date: string): Array<TEvent> {
    const targetDate = Temporal.PlainDate.from(date).toString({
      calendarName: 'never',
    })
    const eventMap = this.getEventMap()
    const all = eventMap.get(targetDate) ?? []
    return all
  }

  getAllDayEventsByDate(date: string): Array<TEvent> {
    const targetDate = Temporal.PlainDate.from(date).toString({
      calendarName: 'never',
    })
    const eventMap = this.getEventMap()
    const all = eventMap.get(targetDate) ?? []
    return all.filter((e) => !!e.allDay)
  }

  private _snapshotEvents(): Array<TEvent> {
    return this.options.events ? [...this.options.events] : []
  }

  private _restoreSnapshot(snapshot: Array<TEvent>) {
    this._eventMap.clear()
    this._dependentsMap.clear()
    this._dateIndex.clear()
    this.options.events = snapshot
    snapshot.forEach((e) => this._indexAddEvent(e))
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))
  }

  canUndo() {
    return this._undoStack.length > 0
  }

  canRedo() {
    return this._redoStack.length > 0
  }

  private _diffEvents(before: Array<TEvent>, after: Array<TEvent>) {
    const beforeMap = new Map(before.map((e) => [e.id, e]))
    const afterMap = new Map(after.map((e) => [e.id, e]))
    const added = after.filter((e) => !beforeMap.has(e.id))
    const removed = before.filter((e) => !afterMap.has(e.id))
    const updated = after.filter((e) => {
      const prev = beforeMap.get(e.id)
      if (!prev) return false
      return (
        prev.start !== e.start || prev.end !== e.end || prev.title !== e.title
      )
    })
    const toInfo = (e: TEvent) => ({
      eventId: e.id,
      eventTitle: e.title,
      start: e.start as string,
      end: e.end as string,
    })
    return {
      added: added.map(toInfo),
      removed: removed.map(toInfo),
      updated: updated.map(toInfo),
    }
  }

  undo() {
    if (this._undoStack.length === 0) return
    const before = this._snapshotEvents()
    this._redoStack.push(before)
    const restored = this._undoStack.pop()!
    this._restoreSnapshot(restored)
    getTimeClient().emit('event:undo', this._diffEvents(before, restored))
  }

  redo() {
    if (this._redoStack.length === 0) return
    const before = this._snapshotEvents()
    this._undoStack.push(before)
    const restored = this._redoStack.pop()!
    this._restoreSnapshot(restored)
    getTimeClient().emit('event:redo', this._diffEvents(before, restored))
  }

  commitAdd(event: TEvent) {
    this._undoStack.push(this._snapshotEvents())
    this._redoStack = []
    if (!this.options.events) {
      this.options.events = []
    }
    const normalized = this.normalizeEvent(event)
    this.options.events.push(normalized)
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

  commitUpdate(id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>) {
    if (!this.options.events) return

    const existingEvent = this._eventMap.get(id)
    if (!existingEvent) return

    this._undoStack.push(this._snapshotEvents())
    this._redoStack = []

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
    this._indexUpdateEvent(existingEvent, nextEvent)

    const visited = new Set([id])

    const newStart = normalizedUpdates.start as string | undefined
    const newEnd = normalizedUpdates.end as string | undefined
    if (newStart && newStart !== oldStartStr) {
      this.propagateStartDeltaBackward(id, visited)
    }

    const startChanged = newStart && newStart !== oldStartStr
    const endChanged = newEnd && newEnd !== oldEndStr

    if (startChanged || endChanged) {
      this.propagateEndDelta(id, 0, visited)
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

  private propagateStartDeltaBackward(sourceId: string, visited: Set<string>) {
    const sourceEvent = this._eventMap.get(sourceId)
    if (!sourceEvent?.dependsOn?.length) return

    const sourceStartStr = toPlainDateTimeString(sourceEvent.start)
    const sourceEndStr = toPlainDateTimeString(sourceEvent.end)
    const tz = this.options.timeZone
    const sourceStartMs =
      Temporal.PlainDateTime.from(sourceStartStr).toZonedDateTime(
        tz,
      ).epochMilliseconds
    const sourceEndMs =
      Temporal.PlainDateTime.from(sourceEndStr).toZonedDateTime(
        tz,
      ).epochMilliseconds

    for (const dep of sourceEvent.dependsOn) {
      if (visited.has(dep.id)) continue

      const pred = this._eventMap.get(dep.id)
      if (!pred) continue
      const predArr = this.options.events
      if (!predArr) continue
      const predIndex = predArr.indexOf(pred)
      if (predIndex === -1) continue

      const predStartStr = toPlainDateTimeString(pred.start)
      const predEndStr = toPlainDateTimeString(pred.end)
      const predStartMs =
        Temporal.PlainDateTime.from(predStartStr).toZonedDateTime(
          tz,
        ).epochMilliseconds
      const predEndMs =
        Temporal.PlainDateTime.from(predEndStr).toZonedDateTime(
          tz,
        ).epochMilliseconds

      const pullBackMs = requiredBackwardShiftMs(
        dep.type,
        predStartMs,
        predEndMs,
        sourceStartMs,
        sourceEndMs,
      )
      if (pullBackMs <= 0) continue

      visited.add(dep.id)

      const shiftedStart = Temporal.PlainDateTime.from(predStartStr)
        .subtract({ milliseconds: pullBackMs })
        .toString({ smallestUnit: 'second' })
      const shiftedEnd = Temporal.PlainDateTime.from(predEndStr)
        .subtract({ milliseconds: pullBackMs })
        .toString({ smallestUnit: 'second' })

      const updated = {
        ...pred,
        start: shiftedStart,
        end: shiftedEnd,
      } as TEvent
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

      this.propagateStartDeltaBackward(dep.id, visited)
    }
  }

  private propagateEndDelta(
    sourceId: string,
    _deltaMs: number,
    visited: Set<string>,
  ) {
    const sourceEvent = this._eventMap.get(sourceId)
    if (!sourceEvent) return

    const tz = this.options.timeZone
    const sourceStartMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(sourceEvent.start),
    ).toZonedDateTime(tz).epochMilliseconds
    const sourceEndMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(sourceEvent.end),
    ).toZonedDateTime(tz).epochMilliseconds

    const dependentIds = this._dependentsMap.get(sourceId)
    if (!dependentIds || dependentIds.size === 0) return

    const eventsArr = this.options.events
    if (!eventsArr) return

    for (const depId of dependentIds) {
      if (visited.has(depId)) continue

      const dependent = this._eventMap.get(depId)
      if (!dependent) continue

      const link = dependent.dependsOn?.find((d) => d.id === sourceId)
      if (!link) continue

      visited.add(dependent.id)

      const eventIndex = eventsArr.indexOf(dependent)
      if (eventIndex === -1) continue

      const depStartStr = toPlainDateTimeString(dependent.start)
      const depEndStr = toPlainDateTimeString(dependent.end)
      const depStartMs =
        Temporal.PlainDateTime.from(depStartStr).toZonedDateTime(
          tz,
        ).epochMilliseconds
      const depEndMs =
        Temporal.PlainDateTime.from(depEndStr).toZonedDateTime(
          tz,
        ).epochMilliseconds

      const shiftMs = requiredForwardShiftMs(
        link.type,
        sourceStartMs,
        sourceEndMs,
        depStartMs,
        depEndMs,
      )
      if (shiftMs <= 0) continue

      const shiftedStart = Temporal.PlainDateTime.from(depStartStr)
        .add({ milliseconds: shiftMs })
        .toString({ smallestUnit: 'second' })
      const shiftedEnd = Temporal.PlainDateTime.from(depEndStr)
        .add({ milliseconds: shiftMs })
        .toString({ smallestUnit: 'second' })

      const updated = {
        ...dependent,
        start: shiftedStart,
        end: shiftedEnd,
      } as TEvent
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

      this.propagateEndDelta(dependent.id, shiftMs, visited)
    }
  }

  private getAffectedByDelta(
    sourceId: string,
    deltaMs: number,
    visited: Set<string>,
  ): Array<{ event: TEvent; newStart: string; newEnd: string }> {
    if (deltaMs === 0) return []

    const tz = this.options.timeZone
    const affected: Array<{ event: TEvent; newStart: string; newEnd: string }> =
      []

    const projected = new Map<string, { startMs: number; endMs: number }>()

    const sourceEvent = this._eventMap.get(sourceId)
    if (!sourceEvent) return []

    const srcStartMs =
      Temporal.PlainDateTime.from(
        toPlainDateTimeString(sourceEvent.start),
      ).toZonedDateTime(tz).epochMilliseconds + deltaMs
    const srcEndMs =
      Temporal.PlainDateTime.from(
        toPlainDateTimeString(sourceEvent.end),
      ).toZonedDateTime(tz).epochMilliseconds + deltaMs
    projected.set(sourceId, { startMs: srcStartMs, endMs: srcEndMs })

    const queue: Array<string> = [sourceId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const cur = projected.get(currentId)!

      const successorIds = this._dependentsMap.get(currentId)
      if (!successorIds || successorIds.size === 0) continue

      for (const sId of successorIds) {
        if (visited.has(sId)) continue
        const s = this._eventMap.get(sId)
        if (!s) continue

        const link = s.dependsOn?.find((d) => d.id === currentId)
        if (!link) continue

        const sStartStr = toPlainDateTimeString(s.start)
        const sEndStr = toPlainDateTimeString(s.end)
        const sStartMs =
          Temporal.PlainDateTime.from(sStartStr).toZonedDateTime(
            tz,
          ).epochMilliseconds
        const sEndMs =
          Temporal.PlainDateTime.from(sEndStr).toZonedDateTime(
            tz,
          ).epochMilliseconds

        const shiftMs = requiredForwardShiftMs(
          link.type,
          cur.startMs,
          cur.endMs,
          sStartMs,
          sEndMs,
        )
        if (shiftMs <= 0) continue

        visited.add(sId)
        const newStart = Temporal.PlainDateTime.from(sStartStr)
          .add({ milliseconds: shiftMs })
          .toString({ smallestUnit: 'second' })
        const newEnd = Temporal.PlainDateTime.from(sEndStr)
          .add({ milliseconds: shiftMs })
          .toString({ smallestUnit: 'second' })
        affected.push({ event: s, newStart, newEnd })

        projected.set(sId, {
          startMs: sStartMs + shiftMs,
          endMs: sEndMs + shiftMs,
        })
        queue.push(sId)
      }
    }

    return affected
  }

  private checkEventAvailability(
    event: TEvent,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource>,
    newConsumption?: Array<number>,
  ): AvailabilityConflict | null {
    const resources = newResources || event.resources
    if (!resources?.length) return null

    const resourceIds = resources.map((r) => r.id)
    const startDt = Temporal.PlainDateTime.from(newStart)
    const endDt = Temporal.PlainDateTime.from(newEnd)

    const startDate = startDt.toPlainDate()
    const endDate = endDt.toPlainDate()
    let cursorDate = startDate

    const eventConsumptionArr = newConsumption ?? event.consumption ?? [1]
    const eventConsumptionSum = eventConsumptionArr.reduce((a, b) => a + b, 0)

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

        const eventsOnDay: Array<TEvent> = []
        for (const candidate of this._eventMap.values()) {
          if (candidate._originalStart) continue
          const cStart = Temporal.PlainDateTime.from(
            toPlainDateTimeString(candidate.start),
          ).toPlainDate()
          const cEnd = Temporal.PlainDateTime.from(
            toPlainDateTimeString(candidate.end),
          ).toPlainDate()
          if (
            Temporal.PlainDate.compare(cursorDate, cStart) >= 0 &&
            Temporal.PlainDate.compare(cursorDate, cEnd) <= 0
          ) {
            eventsOnDay.push(candidate)
          }
        }
        for (const resource of resources) {
          if (!resource.capacity || resource.capacity.length === 0) continue
          const capacitySum = resource.capacity.reduce((a, b) => a + b, 0)
          if (capacitySum <= 0) continue

          const overlappingEvents = eventsOnDay.filter((e) => {
            const masterId = e._recurringMasterId ?? e.id
            const selfId = event.id
            if (e.id === selfId || masterId === selfId) return false

            const eventResourceIds = e.resources?.map((r) => r.id) ?? []
            if (!eventResourceIds.includes(resource.id)) return false

            const eOrigStart = (e._originalStart ?? e.start) as
              | string
              | Date
              | number
            const eOrigEnd = (e._originalEnd ?? e.end) as string | Date | number
            const eStartDt = Temporal.PlainDateTime.from(
              toPlainDateTimeString(eOrigStart),
            )
            const eEndDt = Temporal.PlainDateTime.from(
              toPlainDateTimeString(eOrigEnd),
            )

            const eStartDate = eStartDt.toPlainDate()
            const eEndDate = eEndDt.toPlainDate()
            const cursorIsStart =
              Temporal.PlainDate.compare(cursorDate, eStartDate) === 0
            const cursorIsEnd =
              Temporal.PlainDate.compare(cursorDate, eEndDate) === 0
            const cursorAfterStart =
              Temporal.PlainDate.compare(cursorDate, eStartDate) >= 0
            const cursorBeforeEnd =
              Temporal.PlainDate.compare(cursorDate, eEndDate) <= 0
            if (!cursorAfterStart || !cursorBeforeEnd) return false

            const eStartMins = cursorIsStart
              ? eStartDt.hour * 60 + eStartDt.minute
              : 0
            let eEndMins: number
            if (cursorIsEnd) {
              const m = eEndDt.hour * 60 + eEndDt.minute
              eEndMins = m === 0 && !cursorIsStart ? 0 : m || MINUTES_IN_DAY
            } else {
              eEndMins = MINUTES_IN_DAY
            }

            return overlapStartMins < eEndMins && overlapEndMins > eStartMins
          })

          const seen = new Set<string>()
          let usedByOthers = 0
          for (const oe of overlappingEvents) {
            const key = oe.id
            if (seen.has(key)) continue
            seen.add(key)
            const c = oe.consumption ?? [1]
            usedByOthers += c.reduce((a, b) => a + b, 0)
          }

          const totalUsage = usedByOthers + eventConsumptionSum
          if (totalUsage > capacitySum) {
            return {
              date: dayStr,
              conflictRange: {
                start: formatMinutesToTime(overlapStartMins),
                end: formatMinutesToTime(overlapEndMins),
              },
              resourceIds: [resource.id],
              resourceDetails: [
                {
                  resourceId: resource.id,
                  resourceLabel: resource.label,
                  reason: 'capacity',
                  description: `"${event.title}": ${resource.label} capacity exceeded (${totalUsage}/${capacitySum} units used)`,
                  capacityInfo: {
                    max: capacitySum,
                    used: totalUsage,
                    remaining: Math.max(0, capacitySum - usedByOthers),
                  },
                },
              ],
              description: `"${event.title}" exceeds ${resource.label} capacity (${totalUsage}/${capacitySum})`,
            }
          }
        }
      }

      cursorDate = cursorDate.add({ days: 1 })
    }

    return null
  }

  getMasterEvent(event: TEvent): TEvent {
    if (!event._recurringMasterId) return event
    return this._eventMap.get(event._recurringMasterId) ?? event
  }

  getEvents(): Array<TEvent> {
    return this.options.events ? [...this.options.events] : []
  }

  private _resolveMasterEvent(eventId: string): TEvent | undefined {
    const direct = this._eventMap.get(eventId)
    if (direct) return direct
    const match = eventId.match(/^(.+)_\d+$/)
    if (match) return this._eventMap.get(match[1]!)
    return undefined
  }

  goToNextOccurrence(eventId: string, fromDate?: EventDateTimeInput) {
    const master = this._resolveMasterEvent(eventId)
    if (!master?.recurrence) return

    const baseDate = fromDate
      ? Temporal.PlainDate.from(toPlainDateTimeString(fromDate).split('T')[0]!)
      : this.store.state.activeDate
    const windowStart = baseDate
      .add({ days: 1 })
      .toString({ calendarName: 'never' })
    const windowEnd = baseDate
      .add({ years: 4 })
      .toString({ calendarName: 'never' })

    const occurrences = expandRecurringEvent<TResource, TEvent>(
      master,
      windowStart,
      windowEnd,
    )
    if (occurrences.length === 0) return

    this.goToSpecificPeriod((occurrences[0]!.start as string).split('T')[0]!)
  }

  goToPreviousOccurrence(eventId: string, fromDate?: EventDateTimeInput) {
    const master = this._resolveMasterEvent(eventId)
    if (!master?.recurrence) return

    const activeDateStr = fromDate
      ? toPlainDateTimeString(fromDate).split('T')[0]!
      : this.store.state.activeDate.toString({ calendarName: 'never' })
    const masterStartStr = (master.start as string).split('T')[0]!

    if (masterStartStr >= activeDateStr) return

    const candidates: Array<string> = [masterStartStr]
    const occs = expandRecurringEvent<TResource, TEvent>(
      master,
      masterStartStr,
      activeDateStr,
    )
    for (const occ of occs) {
      const occDateStr = (occ.start as string).split('T')[0]!
      if (occDateStr < activeDateStr) candidates.push(occDateStr)
    }

    this.goToSpecificPeriod(candidates[candidates.length - 1]!)
  }

  createResizeController(
    options: ResizeControllerOptions = {},
  ): ResizeController<TResource, TEvent> {
    return new ResizeController<TResource, TEvent>(this, options)
  }

  validateMove(
    eventId: string,
    newStart: string,
    newEnd: string,
    newResources?: Array<TResource>,
    newConsumption?: Array<number>,
  ): { blocked: boolean; blockedEventTitle?: string; message?: string } {
    const event = this._eventMap.get(eventId)
    if (!event || event._originalStart) return { blocked: false }

    const tz = this.options.timeZone
    const newStartMs =
      Temporal.PlainDateTime.from(newStart).toZonedDateTime(
        tz,
      ).epochMilliseconds
    const newEndMs =
      Temporal.PlainDateTime.from(newEnd).toZonedDateTime(tz).epochMilliseconds

    if (event.dependsOn?.length) {
      const visited = new Set<string>([eventId])
      const queue: Array<{ id: string; startMs: number; endMs: number }> = [
        { id: eventId, startMs: newStartMs, endMs: newEndMs },
      ]

      while (queue.length > 0) {
        const current = queue.shift()!
        const currentEvent = this._eventMap.get(current.id)
        if (!currentEvent?.dependsOn?.length) continue

        for (const dep of currentEvent.dependsOn) {
          if (visited.has(dep.id)) continue
          const pred = this._eventMap.get(dep.id)
          if (!pred) continue

          const predStartStr = toPlainDateTimeString(pred.start)
          const predEndStr = toPlainDateTimeString(pred.end)
          const predStartMs =
            Temporal.PlainDateTime.from(predStartStr).toZonedDateTime(
              tz,
            ).epochMilliseconds
          const predEndMs =
            Temporal.PlainDateTime.from(predEndStr).toZonedDateTime(
              tz,
            ).epochMilliseconds

          const pullBackMs = requiredBackwardShiftMs(
            dep.type,
            predStartMs,
            predEndMs,
            current.startMs,
            current.endMs,
          )
          if (pullBackMs <= 0) continue

          visited.add(dep.id)

          const shiftedStart = Temporal.PlainDateTime.from(predStartStr)
            .subtract({ milliseconds: pullBackMs })
            .toString({ smallestUnit: 'second' })
          const shiftedEnd = Temporal.PlainDateTime.from(predEndStr)
            .subtract({ milliseconds: pullBackMs })
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

          queue.push({
            id: dep.id,
            startMs: predStartMs - pullBackMs,
            endMs: predEndMs - pullBackMs,
          })
        }
      }
    }

    const conflict = this.checkEventAvailability(
      event,
      newStart,
      newEnd,
      newResources,
      newConsumption,
    )
    if (conflict) {
      const isCapacity = conflict.resourceDetails.some(
        (d) => d.reason === 'capacity',
      )
      const message = isCapacity
        ? `"${event.title}" cannot be placed here — ${conflict.description}.`
        : `"${event.title}" cannot be placed here — it falls inside an unavailable zone.`
      return {
        blocked: true,
        blockedEventTitle: event.title,
        message,
      }
    }

    const oldStartMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(event.start),
    ).toZonedDateTime(tz).epochMilliseconds
    const startDeltaMs = newStartMs - oldStartMs

    if (startDeltaMs !== 0) {
      const affected = this.getAffectedByDelta(
        eventId,
        startDeltaMs,
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

    const oldEndMs = Temporal.PlainDateTime.from(
      toPlainDateTimeString(event.end),
    ).toZonedDateTime(tz).epochMilliseconds
    const endDeltaMs = newEndMs - oldEndMs

    if (endDeltaMs > 0) {
      const endVisited = new Set<string>([eventId])
      const endQueue: Array<{
        id: string
        projStartMs: number
        projEndMs: number
      }> = [{ id: eventId, projStartMs: newStartMs, projEndMs: newEndMs }]

      while (endQueue.length > 0) {
        const { id: curId, projStartMs, projEndMs } = endQueue.shift()!
        const succIds = this._dependentsMap.get(curId)
        if (!succIds?.size) continue

        for (const sId of succIds) {
          if (endVisited.has(sId)) continue
          const s = this._eventMap.get(sId)
          if (!s) continue

          const link = s.dependsOn?.find((d) => d.id === curId)
          if (!link) continue

          const sStartStr = toPlainDateTimeString(s.start)
          const sEndStr = toPlainDateTimeString(s.end)
          const sStartMs =
            Temporal.PlainDateTime.from(sStartStr).toZonedDateTime(
              tz,
            ).epochMilliseconds
          const sEndMs =
            Temporal.PlainDateTime.from(sEndStr).toZonedDateTime(
              tz,
            ).epochMilliseconds

          const shiftMs = requiredForwardShiftMs(
            link.type,
            projStartMs,
            projEndMs,
            sStartMs,
            sEndMs,
          )
          if (shiftMs <= 0) continue

          endVisited.add(sId)

          const sNewStart = Temporal.PlainDateTime.from(sStartStr)
            .add({ milliseconds: shiftMs })
            .toString({ smallestUnit: 'second' })
          const sNewEnd = Temporal.PlainDateTime.from(sEndStr)
            .add({ milliseconds: shiftMs })
            .toString({ smallestUnit: 'second' })

          const sConflict = this.checkEventAvailability(s, sNewStart, sNewEnd)
          if (sConflict) {
            return {
              blocked: true,
              blockedEventTitle: s.title,
              message: `"${s.title}" would be pushed into unavailable time.`,
            }
          }

          endQueue.push({
            id: sId,
            projStartMs: sStartMs + shiftMs,
            projEndMs: sEndMs + shiftMs,
          })
        }
      }
    }

    return { blocked: false }
  }

  validateEventDependencies(
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<EventDependency>,
  ): { valid: boolean; error?: ResizeError } {
    if (this._eventMap.size === 0) return { valid: true }

    const tz = this.options.timeZone
    const newStartMs = Temporal.PlainDateTime.from(event.start).toZonedDateTime(
      tz,
    ).epochMilliseconds
    const newEndMs = Temporal.PlainDateTime.from(event.end).toZonedDateTime(
      tz,
    ).epochMilliseconds

    for (const dep of dependsOn) {
      const pred = this._eventMap.get(dep.id)
      if (!pred) continue

      const predStartMs = Temporal.PlainDateTime.from(
        toPlainDateTimeString(pred.start),
      ).toZonedDateTime(tz).epochMilliseconds
      const predEndMs = Temporal.PlainDateTime.from(
        toPlainDateTimeString(pred.end),
      ).toZonedDateTime(tz).epochMilliseconds

      const shortfall = requiredForwardShiftMs(
        dep.type,
        predStartMs,
        predEndMs,
        newStartMs,
        newEndMs,
      )

      if (shortfall > 0) {
        const reason = {
          FS: `cannot start before "${pred.title}" ends`,
          SS: `cannot start before "${pred.title}" starts`,
          FF: `cannot end before "${pred.title}" ends`,
          SF: `cannot end before "${pred.title}" starts`,
        }[dep.type]

        return {
          valid: false,
          error: {
            eventId: event.id ?? '',
            eventTitle: event.title,
            reason: 'blocked',
            message: `"${event.title}" ${reason} (${dep.type})`,
            originalStart: event.start,
            originalEnd: event.end,
          },
        }
      }
    }
    return { valid: true }
  }

  validateEventPlacement(event: {
    id?: string
    title: string
    start: string
    end: string
    resources?: Array<TResource>
    consumption?: Array<number>
  }): { blocked: boolean; message?: string } {
    const placeholderEvent = {
      id: event.id ?? '__validate_placement__',
      title: event.title,
      start: event.start,
      end: event.end,
      resources: event.resources,
      consumption: event.consumption,
    } as TEvent

    const conflict = this.checkEventAvailability(
      placeholderEvent,
      event.start,
      event.end,
      event.resources,
      event.consumption,
    )

    if (conflict) {
      const isCapacity = conflict.resourceDetails.some(
        (d) => d.reason === 'capacity',
      )
      const message = isCapacity
        ? `Cannot place "${event.title}" here — ${conflict.description}.`
        : `Cannot place "${event.title}" here — it falls inside an unavailable zone.`
      return {
        blocked: true,
        message,
      }
    }

    return { blocked: false }
  }

  async addEvent(
    event: TEvent,
    options?: { dependsOn?: Array<EventDependency> },
  ): Promise<SaveEventResult> {
    const dependsOn = options?.dependsOn
    const startStr = event.start as string
    const endStr = event.end as string

    const startDateStr = startStr.slice(0, 10)
    const endDate = Temporal.PlainDate.from(endStr.slice(0, 10)).add({
      days: 1,
    })
    const endDateStr = endDate.toString({ calendarName: 'never' })

    await this.fetchEventsForRange(startDateStr, endDateStr)

    if (dependsOn && dependsOn.length > 0) {
      const depValidation = this.validateEventDependencies(
        { id: event.id, title: event.title, start: startStr, end: endStr },
        dependsOn,
      )
      if (!depValidation.valid && depValidation.error) {
        return { success: false, error: depValidation.error }
      }
    }

    const placementValidation = this.validateEventPlacement({
      id: event.id,
      title: event.title,
      start: startStr,
      end: endStr,
      resources: event.resources,
      consumption: event.consumption,
    })
    if (placementValidation.blocked) {
      return {
        success: false,
        error: {
          eventId: event.id,
          eventTitle: event.title,
          reason: 'blocked',
          message:
            placementValidation.message ??
            `Cannot place "${event.title}" here.`,
          originalStart: startStr,
          originalEnd: endStr,
        },
      }
    }

    this.commitAdd(event)
    return { success: true }
  }

  async editEvent(
    eventId: string,
    updates: Partial<Omit<TEvent, 'id'>>,
    options?: { dependsOn?: Array<EventDependency> },
  ): Promise<SaveEventResult> {
    const dependsOn = options?.dependsOn
    const existingEvent = this._eventMap.get(eventId)
    if (!existingEvent) {
      return {
        success: false,
        error: {
          eventId,
          eventTitle: '',
          reason: 'blocked',
          message: `Event "${eventId}" not found.`,
          originalStart: '',
          originalEnd: '',
        },
      }
    }

    const effectiveStart =
      (updates.start as string | undefined) ?? (existingEvent.start as string)
    const effectiveEnd =
      (updates.end as string | undefined) ?? (existingEvent.end as string)

    const oldStartDateStr = (existingEvent.start as string).slice(0, 10)
    const newStartDateStr = effectiveStart.slice(0, 10)
    const rangeStart =
      oldStartDateStr < newStartDateStr ? oldStartDateStr : newStartDateStr

    const oldEndDate = Temporal.PlainDate.from(
      (existingEvent.end as string).slice(0, 10),
    ).add({ days: 1 })
    const newEndDate = Temporal.PlainDate.from(effectiveEnd.slice(0, 10)).add({
      days: 1,
    })
    const rangeEndPlain =
      Temporal.PlainDate.compare(oldEndDate, newEndDate) > 0
        ? oldEndDate
        : newEndDate
    const rangeEnd = rangeEndPlain.toString({ calendarName: 'never' })

    await this.fetchEventsForRange(rangeStart, rangeEnd)

    if (dependsOn && dependsOn.length > 0) {
      const depValidation = this.validateEventDependencies(
        {
          id: eventId,
          title: (updates.title as string | undefined) ?? existingEvent.title,
          start: effectiveStart,
          end: effectiveEnd,
        },
        dependsOn,
      )
      if (!depValidation.valid && depValidation.error) {
        return { success: false, error: depValidation.error }
      }
    }

    const startChanged = updates.start !== undefined
    const endChanged = updates.end !== undefined
    const resourcesChanged = updates.resources !== undefined
    const consumptionChanged = updates.consumption !== undefined

    if (startChanged || endChanged || resourcesChanged || consumptionChanged) {
      const resources = updates.resources ?? existingEvent.resources
      const consumption = updates.consumption ?? existingEvent.consumption
      const moveValidation = this.validateMove(
        eventId,
        effectiveStart,
        effectiveEnd,
        resources,
        consumption,
      )
      if (moveValidation.blocked) {
        return {
          success: false,
          error: {
            eventId,
            eventTitle: moveValidation.blockedEventTitle ?? existingEvent.title,
            reason: 'blocked',
            message:
              moveValidation.message ??
              `Cannot move "${existingEvent.title}" to this position.`,
            originalStart: existingEvent.start as string,
            originalEnd: existingEvent.end as string,
            attemptedStart: effectiveStart,
            attemptedEnd: effectiveEnd,
          },
        }
      }
    }

    this.commitUpdate(eventId, updates)
    return { success: true }
  }

  createDependency(
    sourceId: string,
    targetId: string,
    type: DependencyType = 'FS',
  ): { blocked: boolean; error?: ResizeError } {
    const sourceEvent = this._eventMap.get(sourceId)
    const targetEvent = this._eventMap.get(targetId)
    if (!sourceEvent || !targetEvent) return { blocked: false }

    const currentDeps = targetEvent.dependsOn ?? []
    if (currentDeps.some((d) => d.id === sourceId && d.type === type)) {
      return { blocked: false }
    }

    const tz = this.options.timeZone
    const sourceStartStr = toPlainDateTimeString(sourceEvent.start)
    const sourceEndStr = toPlainDateTimeString(sourceEvent.end)
    const targetStartStr = toPlainDateTimeString(targetEvent.start)
    const targetEndStr = toPlainDateTimeString(targetEvent.end)

    const sStartMs =
      Temporal.PlainDateTime.from(sourceStartStr).toZonedDateTime(
        tz,
      ).epochMilliseconds
    const sEndMs =
      Temporal.PlainDateTime.from(sourceEndStr).toZonedDateTime(
        tz,
      ).epochMilliseconds
    const tStartMs =
      Temporal.PlainDateTime.from(targetStartStr).toZonedDateTime(
        tz,
      ).epochMilliseconds
    const tEndMs =
      Temporal.PlainDateTime.from(targetEndStr).toZonedDateTime(
        tz,
      ).epochMilliseconds

    const shiftMs = requiredForwardShiftMs(
      type,
      sStartMs,
      sEndMs,
      tStartMs,
      tEndMs,
    )
    const needsReschedule = shiftMs > 0

    let newTargetStart = targetStartStr
    let newTargetEnd = targetEndStr

    if (needsReschedule) {
      newTargetStart = Temporal.PlainDateTime.from(targetStartStr)
        .add({ milliseconds: shiftMs })
        .toString({ smallestUnit: 'second' })
      newTargetEnd = Temporal.PlainDateTime.from(targetEndStr)
        .add({ milliseconds: shiftMs })
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
              `Cannot connect (${type}): the resulting schedule would fall in unavailable time.`,
            originalStart: targetStartStr,
            originalEnd: targetEndStr,
            attemptedStart: newTargetStart,
            attemptedEnd: newTargetEnd,
          },
        }
      }
    }

    this.commitUpdate(targetId, {
      dependsOn: [...currentDeps, { id: sourceId, type }],
      ...(needsReschedule && { start: newTargetStart, end: newTargetEnd }),
    } as Partial<Omit<TEvent, 'id'>>)

    return { blocked: false }
  }

  removeEvent(id: Event['id']) {
    if (!this.options.events) return

    const removedEvent = this._eventMap.get(id)
    if (!removedEvent) return

    const index = this.options.events.indexOf(removedEvent)
    if (index === -1) return

    this._undoStack.push(this._snapshotEvents())
    this._redoStack = []

    this.options.events.splice(index, 1)
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
    const merged = this._getMergedUnavailableMinuteRanges(
      date,
      options?.resourceIds,
    )
    if (merged === null) return []

    const dayEndMinutes = MINUTES_IN_DAY
    const scale = containerHeight / dayEndMinutes

    return merged.map((range) => ({
      top: range.startMinutes * scale,
      height: (range.endMinutes - range.startMinutes) * scale,
      startTime: formatMinutesToTime(range.startMinutes),
      endTime: formatMinutesToTime(range.endMinutes),
    }))
  }

  private _getMergedUnavailableMinuteRanges(
    date: string,
    resourceIds?: Array<TResource['id']>,
  ): Array<{ startMinutes: number; endMinutes: number }> | null {
    const allResources = this.options.resources
    if (!allResources || allResources.length === 0) return null

    const resources = resourceIds
      ? allResources.filter((r) => resourceIds.includes(r.id))
      : allResources
    if (resources.length === 0) return null

    const sortedIds = resources
      .map((r) => r.id)
      .slice()
      .sort()
      .join(',')
    const cacheKey = `${sortedIds}|${date}`
    const cached = this._mergedUnavailMinuteCache.get(cacheKey)
    if (cached) return cached

    const weekday = this._getWeekday(date)

    const availableRanges: Array<{ startMinutes: number; endMinutes: number }> =
      []
    for (const resource of resources) {
      if (!resource.availability) continue
      const info = this._getResourceDayAvail(resource, weekday)
      for (const a of info.available) availableRanges.push(a)
    }

    if (availableRanges.length === 0) {
      const fullDay = [{ startMinutes: 0, endMinutes: MINUTES_IN_DAY }]
      this._mergedUnavailMinuteCache.set(cacheKey, fullDay)
      return fullDay
    }

    availableRanges.sort((a, b) => a.startMinutes - b.startMinutes)
    const mergedAvail: Array<{ startMinutes: number; endMinutes: number }> = []
    for (const range of availableRanges) {
      const last = mergedAvail[mergedAvail.length - 1]
      if (last && range.startMinutes <= last.endMinutes) {
        last.endMinutes = Math.max(last.endMinutes, range.endMinutes)
      } else {
        mergedAvail.push({ ...range })
      }
    }

    const unavailable: Array<{ startMinutes: number; endMinutes: number }> = []
    let cursor = 0
    for (const a of mergedAvail) {
      if (cursor < a.startMinutes) {
        unavailable.push({ startMinutes: cursor, endMinutes: a.startMinutes })
      }
      cursor = a.endMinutes
    }
    if (cursor < MINUTES_IN_DAY) {
      unavailable.push({ startMinutes: cursor, endMinutes: MINUTES_IN_DAY })
    }

    this._mergedUnavailMinuteCache.set(cacheKey, unavailable)
    return unavailable
  }

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

    const weekday = this._getWeekday(date)

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

      const info = this._getResourceDayAvail(resource, weekday)
      const availableSlots = info.slotsForWeekday

      if (availableSlots.length === 0) {
        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'outside-hours',
          description: `${resource.label}: Not available on this day`,
        })
        continue
      }

      let isWithinAvailability = false
      for (const slot of availableSlots) {
        if (
          startMinutes >= slot.startMinutes &&
          endMinutes <= slot.endMinutes
        ) {
          isWithinAvailability = true
          break
        }
      }

      if (!isWithinAvailability) {
        let availabilityWindow = ''
        for (let i = 0; i < availableSlots.length; i++) {
          const r = availableSlots[i]!
          if (i > 0) availabilityWindow += ', '
          availabilityWindow += `${formatMinutesToTime(r.startMinutes)}-${formatMinutesToTime(r.endMinutes)}`
        }

        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'outside-hours',
          description: `${resource.label}: Available ${availabilityWindow}, but event is ${formatMinutesToTime(startMinutes)}-${formatMinutesToTime(endMinutes)}`,
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
    const merged = this._getMergedUnavailableMinuteRanges(
      date,
      options?.resourceIds,
    )
    if (!merged) return []
    return merged.map((r) => ({
      startMinutes: r.startMinutes,
      endMinutes: r.endMinutes,
    }))
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

    const weekday = this._getWeekday(dayDate)

    for (const range of unavailableRangesForDay) {
      if (startMins < range.endMinutes && endMins > range.startMinutes) {
        const overlappingDetails = details.filter((d) => {
          const resource = this.options.resources?.find(
            (r) => r.id === d.resourceId,
          )
          if (!resource) return false

          const resourceAvailableSlots = this._getResourceDayAvail(
            resource,
            weekday,
          ).slotsForWeekday

          if (resourceAvailableSlots.length === 0) return true

          return !resourceAvailableSlots.some(
            (slot) =>
              !(
                range.endMinutes <= slot.startMinutes ||
                range.startMinutes >= slot.endMinutes
              ),
          )
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

    const selfEvent = this._eventMap.get(eventId)
    const ownConsumptionArr = selfEvent?.consumption ?? [1]
    const ownConsumption = ownConsumptionArr.reduce((a, b) => a + b, 0)

    for (const resourceId of resourceIds) {
      const resource = this.options.resources?.find((r) => r.id === resourceId)
      if (!resource || !resource.capacity || resource.capacity.length === 0)
        continue

      const overlappingEvents = eventsOnDay.filter((e) => {
        if (e.id === eventId) return false

        const eventResourceIds = e.resources?.map((r) => r.id) || []
        if (!eventResourceIds.includes(resourceId)) return false

        const eventStart = new Date(e.start)
        const eventEnd = new Date(e.end)
        const eventStartMins =
          eventStart.getHours() * 60 + eventStart.getMinutes()
        const eventEndMins = eventEnd.getHours() * 60 + eventEnd.getMinutes()

        return startMins < eventEndMins && endMins > eventStartMins
      })

      const usedByOthers = overlappingEvents.reduce((acc, e) => {
        const c = e.consumption ?? [1]
        return acc + c.reduce((a, b) => a + b, 0)
      }, 0)

      const resourceCapacitySum = resource.capacity.reduce((a, b) => a + b, 0)
      const totalUsage = usedByOthers + ownConsumption

      if (totalUsage > resourceCapacitySum) {
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
              description: `${resource.label}: Capacity exceeded (${totalUsage}/${resourceCapacitySum} units used)`,
              capacityInfo: {
                max: resourceCapacitySum,
                used: totalUsage,
                remaining: 0,
              },
            },
          ],
          description: `${resource.label}: Capacity exceeded (${totalUsage}/${resourceCapacitySum} units used)`,
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

    const origStartHourMins =
      ((originalStart.charCodeAt(11) - 48) * 10 +
        (originalStart.charCodeAt(12) - 48)) *
        60 +
      (originalStart.charCodeAt(14) - 48) * 10 +
      (originalStart.charCodeAt(15) - 48)
    const origEndHourMins =
      ((originalEnd.charCodeAt(11) - 48) * 10 +
        (originalEnd.charCodeAt(12) - 48)) *
        60 +
      (originalEnd.charCodeAt(14) - 48) * 10 +
      (originalEnd.charCodeAt(15) - 48)

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
      const rawStartMinutes = origStartHourMins + totalDeltaMinutes
      const targetStartMinutes =
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
      const snappedTargetStartMinutes = snapMins(targetStartMinutes)
      const currentStartMinutes = origStartHourMins

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
      const rawEndMinutes = origEndHourMins + totalDeltaMinutes
      const targetEndMinutes =
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
      const snappedTargetEndMinutes = snapMins(targetEndMinutes)
      const currentEndMinutes = origEndHourMins

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
        origStartHourMins + (effectiveEdge === 'top' ? totalDeltaMinutes : 0)
      const rawEndMinutes =
        origEndHourMins + (effectiveEdge === 'bottom' ? totalDeltaMinutes : 0)

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

    if (!shouldBlockResize && resourceIds?.length) {
      const originalStartMs = new Date(originalStart).getTime()
      const originalEndMs = new Date(originalEnd).getTime()
      const snapMs = snapToMinutes * 60_000
      const snappedDeltaMs =
        Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs

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
        const proposedEndMs = Temporal.PlainDateTime.from(
          originalEnd,
        ).toZonedDateTime(this.options.timeZone).epochMilliseconds

        for (const dep of event.dependsOn) {
          const pred = this.options.events.find((ev) => ev.id === dep.id)
          if (!pred) continue

          const predStartStr = toPlainDateTimeString(pred.start)
          const predEndStr = toPlainDateTimeString(pred.end)
          const predStartMs = Temporal.PlainDateTime.from(
            predStartStr,
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds
          const predEndMs = Temporal.PlainDateTime.from(
            predEndStr,
          ).toZonedDateTime(this.options.timeZone).epochMilliseconds

          const shortfall = requiredForwardShiftMs(
            dep.type,
            predStartMs,
            predEndMs,
            proposedStartMs,
            proposedEndMs,
          )
          if (shortfall > 0) {
            shouldBlockResize = true
            blockReason = 'blocked'
            blockMessage = `"${event.title}" violates ${dep.type} dependency on "${pred.title}"`
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

    if (!shouldBlockResize && resourceIds?.length) {
      const selfEvent = this._eventMap.get(eventId)
      if (selfEvent) {
        const proposedNewStart =
          effectiveEdge === 'top'
            ? Temporal.PlainDateTime.from(originalStart)
                .add({ milliseconds: snappedDeltaMs })
                .toString({ smallestUnit: 'second' })
            : originalStart
        const proposedNewEnd =
          effectiveEdge === 'bottom'
            ? Temporal.PlainDateTime.from(originalEnd)
                .add({ milliseconds: snappedDeltaMs })
                .toString({ smallestUnit: 'second' })
            : originalEnd

        const spanConflict = this.checkEventAvailability(
          selfEvent,
          proposedNewStart,
          proposedNewEnd,
        )
        if (spanConflict) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          blockMessage = spanConflict.description
          const alreadyReported = conflicts.some(
            (c) =>
              c.date === spanConflict.date &&
              c.conflictRange.start === spanConflict.conflictRange.start &&
              c.conflictRange.end === spanConflict.conflictRange.end,
          )
          if (!alreadyReported) conflicts.push(spanConflict)
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

function requiredForwardShiftMs(
  type: DependencyType,
  predStartMs: number,
  predEndMs: number,
  succStartMs: number,
  succEndMs: number,
): number {
  switch (type) {
    case 'FS':
      return predEndMs - succStartMs
    case 'SS':
      return predStartMs - succStartMs
    case 'FF':
      return predEndMs - succEndMs
    case 'SF':
      return predStartMs - succEndMs
  }
}

function requiredBackwardShiftMs(
  type: DependencyType,
  predStartMs: number,
  predEndMs: number,
  succStartMs: number,
  succEndMs: number,
): number {
  switch (type) {
    case 'FS':
      return predEndMs - succStartMs
    case 'SS':
      return predStartMs - succStartMs
    case 'FF':
      return predEndMs - succEndMs
    case 'SF':
      return predStartMs - succEndMs
  }
}
