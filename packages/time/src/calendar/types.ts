import type { Temporal } from '@js-temporal/polyfill'
import { PossibleDate } from '../utils/parseDate'

export interface Resource {
  id: string
  label: string
}

export interface Event<TResource extends Resource = Resource> {
  id: string
  start: string
  end: string
  title: string
  resources?: TResource[]
}

export interface CalendarStore {
  currentPeriod: Temporal.PlainDate
  activeDate: Temporal.PlainDate
  viewMode: {
    value: number
    unit: 'month' | 'week' | 'workWeek' | 'day'
  }
}

export type Day<
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  date: Temporal.PlainDate
  events: TEvent[]
  isToday: boolean
  isInCurrentPeriod: boolean
}

export interface DateRange {
  start: PossibleDate | null
  end: PossibleDate | null
}
