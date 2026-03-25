import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput } from '~/date'

export type EventDateTimeInput = string | Date | number

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
  capacity?: number
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
  /** IDs of events this event immediately follows (finish-to-start dependency).
   * When a predecessor's end time shifts, this event shifts by the same delta. */
  dependsOn?: Array<string>
  /** Original start time before splitting (only set on split segments of multi-day events) */
  _originalStart?: string
  /** Original end time before splitting (only set on split segments of multi-day events) */
  _originalEnd?: string
}

export type Day<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  date: Temporal.PlainDate
  /** Pre-computed ISO date string (YYYY-MM-DD) — use instead of manually formatting `date` */
  isoDate: string
  events: Array<TEvent>
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
