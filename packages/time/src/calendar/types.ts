import type { Temporal } from '@js-temporal/polyfill'
import type { DateInput } from '~/date'

export interface Resource {
  id: string
  label: string
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
  start: string
  end: string
  title: string
  resources?: Array<TResource>
}

export type Day<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  date: Temporal.PlainDate
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
