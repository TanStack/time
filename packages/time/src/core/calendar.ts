import { Temporal } from '@js-temporal/polyfill'
import { splitMultiDayEvents } from '../calendar/splitMultiDayEvents'
import { getEventProps } from '../calendar/getEventProps'
import { groupDaysBy } from '../calendar/groupDaysBy'
import { BaseDateCore, type BaseDateCoreOptions } from './base-date-core'
import type { GroupDaysByProps } from '../calendar/groupDaysBy'
import type { CalendarStore, Day, Event, Resource } from '../calendar/types'

import '@bart-krakowski/get-week-info-polyfill'

export type * from '../calendar/types'
export * from './base-date-core'

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

/**
 * Configuration options for initializing a CalendarCore instance, allowing customization
 * of events, locale, time zone, and the calendar system.
 * @template TEvent - Specifies the event type, extending a base Event type.
 */
export interface CalendarCoreOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> extends BaseDateCoreOptions {
  /** An optional array of events to be handled by the calendar. */
  events?: TEvent[] | null
  /** Optional resources to be used in the calendar. */
  resources?: TResource[] | null
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
  /** Retrieves styling properties for a specific event, identified by ID. */
  getEventProps: (id: Event['id']) => {
    isSplitEvent: boolean
    overlappingEvents: TEvent[]
  } | null
  /** Retrieves the names of the days of the week, based on the current locale. */
  getDaysNames: (weekday?: 'long' | 'short') => string[]
  /** Groups days by a specified unit. */
  groupDaysBy: (
    props: Omit<GroupDaysByProps<TResource, TEvent>, 'weekStartsOn' | 'locale'>,
  ) => (Day<TResource, TEvent> | null)[][]
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
> extends CalendarActions<TResource, TEvent>,
    ConvertTemporalToString<CalendarState<TResource, TEvent>> {}

/**
 * Core functionality for a calendar system, managing the state and operations of the calendar,
 * such as navigating through time periods, handling events, and adjusting settings.
 * @template TEvent - The type of events managed by the calendar.
 */
type ParsedCalendarCoreOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = import('./base-date-core').ParsedBaseDateCoreOptions & {
  events: TEvent[] | null
  resources: TResource[] | null
}

export class CalendarCore<
    TResource extends Resource,
    TEvent extends Event<TResource>,
  >
  extends BaseDateCore
  implements CalendarActions<TResource, TEvent>
{
  declare options: ParsedCalendarCoreOptions<TResource, TEvent>

  constructor(options: CalendarCoreOptions<TResource, TEvent>) {
    super(options)
    Object.assign(this.options, {
      events: options.events || null,
      resources: options.resources || null,
    })
  }

  protected getCalendarDays() {
    return super.getCalendarDays()
  }

  private getEventMap() {
    const map = new Map<string, TEvent[]>()
    this.options.events?.forEach((event) => {
      const eventStartDate = Temporal.PlainDateTime.from(
        event.start,
      ).toZonedDateTime(this.options.timeZone)
      const eventEndDate = Temporal.PlainDateTime.from(
        event.end,
      ).toZonedDateTime(this.options.timeZone)
      if (Temporal.ZonedDateTime.compare(eventStartDate, eventEndDate) !== 0) {
        const splitEvents = splitMultiDayEvents<TResource, TEvent>(
          event,
          this.options.timeZone,
        )
        splitEvents.forEach((splitEvent) => {
          const [datePart] = splitEvent.start.toString().split('T')
          if (datePart) {
            if (!map.has(datePart)) map.set(datePart, [])
            map.get(datePart)?.push(splitEvent)
          }
        })
      } else {
        const [eventKey] = event.start.toString().split('T')
        if (eventKey) {
          if (!map.has(eventKey)) map.set(eventKey, [])
          map.get(eventKey)?.push(event)
        }
      }
    })
    return map
  }

  getDaysWithEvents() {
    const calendarDays = this.getCalendarDays()
    const eventMap = this.getEventMap()
    return calendarDays.map((day) => {
      const dayKey = day.toString()
      const dailyEvents = eventMap.get(dayKey) ?? []
      const currentMonthRange = Array.from(
        { length: this.store.state.viewMode.value },
        (_, i) => this.store.state.currentPeriod.add({ months: i }).month,
      )
      const isInCurrentPeriod = currentMonthRange.includes(day.month)
      return {
        date: day,
        events: dailyEvents,
        isToday:
          Temporal.PlainDate.compare(day, Temporal.Now.plainDateISO()) === 0,
        isInCurrentPeriod,
      }
    })
  }

  getEventProps(id: Event['id']) {
    return getEventProps(
      this.getEventMap(),
      id,
      this.store.state,
    ) as ReturnType<CalendarActions<TResource, TEvent>['getEventProps']>
  }

  groupDaysBy({
    days,
    unit,
    fillMissingDays = true,
  }: Omit<GroupDaysByProps<TResource, TEvent>, 'weekStartsOn' | 'locale'>) {
    return groupDaysBy<TResource, TEvent>({
      days,
      unit,
      fillMissingDays,
      weekStartsOn: this.getWeekStartsOn(),
      locale: this.options.locale,
    } as GroupDaysByProps<TResource, TEvent>)
  }
}
