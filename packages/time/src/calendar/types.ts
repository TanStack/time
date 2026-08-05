import type { DateInput } from "~/date";

export type EventDateTimeInput = string | Date | number;

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type DependencyType = "FS" | "SS" | "FF" | "SF";

export interface EventDependency {
  id: string;
  type: DependencyType;
}

export type RecurrenceEditScope = "this" | "thisAndFollowing" | "all";

export interface RecurrenceOverride<TResource extends Resource = Resource> {
  originalStart: EventDateTimeInput;

  id?: string;
  start?: EventDateTimeInput;
  end?: EventDateTimeInput;
  title?: string;
  resources?: Array<TResource | string>;
  consumption?: Array<number>;
  dependsOn?: Array<EventDependency>;
  allDay?: boolean;
  [key: string]: unknown;
}

export interface RecurrenceRule<TResource extends Resource = Resource> {
  frequency: RecurrenceFrequency;

  interval?: number;

  until?: string;

  count?: number;

  byWeekday?: Array<number>;

  exDates?: Array<EventDateTimeInput>;

  overrides?: Array<RecurrenceOverride<TResource>>;
}

export interface Availability {
  weekdays: Array<number>;

  startTime: string;

  endTime: string;
}

export interface Resource {
  id: string;
  label: string;
  availability?: Array<Availability>;
  capacity?: Array<number>;
  buffer?: {
    before?: number;
    after?: number;
  };
}

export interface ViewMode {
  value: number;

  unit: "month" | "week" | "day" | "workWeek";
}

export interface Event<TResource extends Resource = Resource> {
  id: string;
  start: EventDateTimeInput;
  end: EventDateTimeInput;
  title: string;
  resources?: Array<TResource | string>;
  consumption?: Array<number>;

  dependsOn?: Array<EventDependency>;

  recurrence?: RecurrenceRule<TResource>;

  allDay?: boolean;

  _originalStart?: string;

  _originalEnd?: string;

  _recurringMasterId?: string;

  _occurrenceIndex?: number;

  _occurrenceOriginalStart?: string;
}

export type Day<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  isoDate: string;

  events: Array<TEvent>;

  allDayEvents: Array<TEvent>;
  isToday: boolean;
  isInCurrentPeriod: boolean;
};

export interface DateRange {
  start: DateInput | null;
  end: DateInput | null;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}

export type { UnavailableRange } from "~/projection";

export interface CalendarStore {
  currentPeriod: string;

  activeDate: string;
  viewMode: ViewMode;
  eventsVersion: number;

  isPending: boolean;
}

export interface UnavailabilityReason {
  resourceId: string;

  resourceLabel: string;

  reason: "outside-hours" | "capacity" | "no-availability";

  description: string;

  capacityInfo?: {
    max: number;
    used: number;
    remaining: number;
  };
}

export interface AvailabilityConflict {
  date: string;

  conflictRange: {
    start: string;
    end: string;
  };

  resourceIds: Array<string>;

  resourceDetails: Array<UnavailabilityReason>;

  description: string;
}

export interface ResizeError {
  eventId: string;
  eventTitle: string;
  reason: "unavailable-time" | "invalid-time" | "min-duration" | "blocked";
  message: string;
  originalStart: string;
  originalEnd: string;
  attemptedStart?: string;
  attemptedEnd?: string;

  conflicts?: Array<AvailabilityConflict>;
}

export interface ResizeValidationResult {
  valid: boolean;
  error?: ResizeError;
}

export type SaveEventResult =
  | { success: true }
  | { success: false; error: ResizeError };

export interface TimelineEventLayout<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  event: TEvent;

  left: number;

  width: number;
  lane: number;

  startFraction: number;

  endFraction: number;

  isStartClipped: boolean;

  isEndClipped: boolean;
}

export interface TimelineResourceRow<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  resource: TResource;
  events: Array<TimelineEventLayout<TResource, TEvent>>;
  laneCount: number;
}

export interface TimelineLayout<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  rows: Array<TimelineResourceRow<TResource, TEvent>>;
  currentTimePosition: number | null;
}
