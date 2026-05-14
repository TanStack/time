import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput } from '~/date'

export type EventDateTimeInput = string | Date | number

/** How often a recurring event repeats. */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/** Supported dependency types for ordering events. */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

/** A single dependency from one event to another. */
export interface EventDependency {
  id: string
  type: DependencyType
}

/**
 * Defines the repetition rule for a recurring event.
 * Occurrences are expanded automatically by the calendar within the current viewport.
 */
export interface RecurrenceRule {
  /** How often the event repeats. */
  frequency: RecurrenceFrequency
  /**
   * Repeat every N frequencies (default 1).
   * E.g. `{ frequency: 'weekly', interval: 2 }` = every other week.
   */
  interval?: number
  /**
   * ISO date string (YYYY-MM-DD) — no occurrences start on or after this date.
   * Takes precedence over `count`.
   */
  until?: string
  /**
   * Maximum total occurrences to generate (including the original).
   * Only used when `until` is not set.
   */
  count?: number
  /**
   * For `weekly` frequency: ISO weekdays (1 = Mon … 7 = Sun) to repeat on.
   * Defaults to the weekday of the original event start.
   */
  byWeekday?: Array<number>
}

export interface Availability {
  /** Days of the week when available (ISO weekday: 1 = Monday, ..., 7 = Sunday) */
  weekdays: Array<number>
  /** Start time in HH:mm format */
  startTime: string
  /** End time in HH:mm format */
  endTime: string
}

export interface Resource {
  id: string
  label: string
  availability?: Array<Availability>
  capacity?: Array<number>
  buffer?: {
    before?: number
    after?: number
  }
}

/**
 * Represents the configuration for the current viewing mode of a calendar,
 * specifying the scale and unit of time.
 */
export interface ViewMode {
  /** The number of units for the view mode. */
  value: number
  /** The unit of time that the calendar view should display (month, week, workWeek or day). */
  unit: 'month' | 'week' | 'day' | 'workWeek'
}

export interface Event<TResource extends Resource = Resource> {
  id: string
  start: EventDateTimeInput
  end: EventDateTimeInput
  title: string
  resources?: Array<TResource>
  consumption?: Array<number>
  /** Dependency links to other events this event is constrained by.
   * Each link has an `id` (predecessor event) and a `type` (FS/SS/FF/SF).
   * When a predecessor's relevant anchor shifts, this event shifts by the same delta. */
  dependsOn?: Array<EventDependency>
  /** Defines how and when this event repeats. */
  recurrence?: RecurrenceRule
  /**
   * When true, event spans full day(s) and is rendered in the all-day strip
   * separately from timed events. `start` and `end` are still ISO datetime strings;
   * for an all-day event use the day's start (00:00:00) and the inclusive day's
   * end (23:59:59) — or any time within those days. Multi-day all-day events
   * are split per-day like regular events.
   */
  allDay?: boolean
  /** Original start time before splitting (only set on split segments of multi-day events) */
  _originalStart?: string
  /** Original end time before splitting (only set on split segments of multi-day events) */
  _originalEnd?: string
  /**
   * ID of the master recurring event this occurrence was generated from.
   * Only present on ephemeral occurrence instances (index > 0).
   */
  _recurringMasterId?: string
  /** 0-based index of this occurrence within the recurring series. */
  _occurrenceIndex?: number
}

export type Day<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  date: Temporal.PlainDate
  /** Pre-computed ISO date string (YYYY-MM-DD) — use instead of manually formatting `date` */
  isoDate: string
  /** Timed events occurring on this day (sub-day events + segments of timed multi-day events). */
  events: Array<TEvent>
  /** All-day events occurring on this day (segments of multi-day all-day events included). */
  allDayEvents: Array<TEvent>
  isToday: boolean
  isInCurrentPeriod: boolean
}

export interface DateRange {
  start: DateInput | null
  end: DateInput | null
}

export interface TimeSlot {
  hour: number
  minute: number
  label: string
}

export interface UnavailableRange {
  /** Top position in pixels */
  top: number
  /** Height in pixels */
  height: number
  /** Start time as HH:mm string */
  startTime: string
  /** End time as HH:mm string */
  endTime: string
}

export interface CalendarStore {
  currentPeriod: Temporal.PlainDate
  activeDate: Temporal.PlainDate
  viewMode: ViewMode
  eventsVersion: number
  /** True while an async fetchEvents call is in-flight for the current viewport. */
  isPending: boolean
}

/**
 * Information about why a resource is unavailable
 */
export interface UnavailabilityReason {
  /** Resource ID */
  resourceId: string
  /** Resource label/name */
  resourceLabel: string
  /** Why the resource is unavailable */
  reason: 'outside-hours' | 'capacity' | 'no-availability'
  /** Human-readable explanation */
  description: string
  /** Current capacity usage if applicable */
  capacityInfo?: {
    max: number
    used: number
    remaining: number
  }
}

/**
 * Information about a specific availability conflict
 */
export interface AvailabilityConflict {
  /** The date where the conflict occurred (YYYY-MM-DD) */
  date: string
  /** Time range that conflicts with availability */
  conflictRange: {
    start: string
    end: string
  }
  /** The resource(s) whose availability is being violated */
  resourceIds: Array<string>
  /** Detailed reasons for each resource */
  resourceDetails: Array<UnavailabilityReason>
  /** Human-readable description of the conflict */
  description: string
}

/**
 * Error information when a resize operation is blocked
 */
export interface ResizeError {
  eventId: string
  eventTitle: string
  reason: 'unavailable-time' | 'invalid-time' | 'min-duration' | 'blocked'
  message: string
  originalStart: string
  originalEnd: string
  attemptedStart?: string
  attemptedEnd?: string
  /** Specific availability conflicts that prevented the resize */
  conflicts?: Array<AvailabilityConflict>
}

/**
 * Result of checking if a resize is valid
 */
export interface ResizeValidationResult {
  valid: boolean
  error?: ResizeError
}

/** Result of a {@link CalendarActions.saveEvent} call. */
export type SaveEventResult =
  | { success: true }
  | { success: false; error: ResizeError }

export interface TimelineEventLayout<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  event: TEvent
  left: number
  width: number
  lane: number
  /** True when the event starts before the first visible day (left edge is clipped) */
  isStartClipped: boolean
  /** True when the event ends after the last visible day (right edge is clipped) */
  isEndClipped: boolean
}

export interface TimelineResourceRow<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  resource: TResource
  events: Array<TimelineEventLayout<TResource, TEvent>>
  laneCount: number
}

export interface TimelineLayout<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  rows: Array<TimelineResourceRow<TResource, TEvent>>
  currentTimePosition: number | null
}
