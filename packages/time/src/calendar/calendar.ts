import { Temporal } from '@js-temporal/polyfill'
import { splitMultiDayEvents } from './splitMultiDayEvents'
import { getEventProps } from './getEventProps'
import { groupDaysBy } from './groupDaysBy'
import { getTimeSlots } from './getTimeSlots'
import { DateCore } from './date-core'
import type { DateCoreOptions, ParsedDateCoreOptions } from './date-core'
import type { GroupDaysByProps } from './groupDaysBy'
import type { Day, Event, Resource, TimeSlot, ViewMode } from './types'

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
  groupDaysBy: (
    props: Omit<GroupDaysByProps<TResource, TEvent>, 'weekStartsOn' | 'locale'>,
  ) => Array<Array<Day<TResource, TEvent> | null>>
  /** Retrieves time slots for day view with configurable intervals. */
  getTimeSlots: (
    options?: Parameters<typeof getTimeSlots>[1],
  ) => Array<TimeSlot>
  /** Retrieves events for a specific date. */
  getEventsByDate: (date: string) => Array<TEvent>
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

/**
 * Core functionality for a calendar system, managing the state and operations of the calendar,
 * such as navigating through time periods, handling events, and adjusting settings.
 * @template TEvent - The type of events managed by the calendar.
 */
type ParsedCalendarCoreOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = ParsedDateCoreOptions & {
  events: Array<TEvent> | null
  resources: Array<TResource> | null
}

export class CalendarCore<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>
  extends DateCore
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
    const map = new Map<string, Array<TEvent>>()
    this.options.events?.forEach((event) => {
      const eventStartDate = Temporal.PlainDateTime.from(
        event.start,
      ).toZonedDateTime(this.options.timeZone)
      const eventEndDate = Temporal.PlainDateTime.from(
        event.end,
      ).toZonedDateTime(this.options.timeZone)
      const startPlainDate = eventStartDate.toPlainDate()
      const endPlainDate = eventEndDate.toPlainDate()

      if (Temporal.PlainDate.compare(startPlainDate, endPlainDate) !== 0) {
        const splitEvents = splitMultiDayEvents<TResource, TEvent>(
          event,
          this.options.timeZone,
        )
        splitEvents.forEach((splitEvent) => {
          const dateKey = Temporal.PlainDateTime.from(splitEvent.start)
            .toPlainDate()
            .toString({ calendarName: 'never' })
          if (!map.has(dateKey)) map.set(dateKey, [])
          map.get(dateKey)?.push(splitEvent)
        })
      } else {
        const dateKey = startPlainDate.toString({ calendarName: 'never' })
        if (!map.has(dateKey)) map.set(dateKey, [])
        map.get(dateKey)?.push(event)
      }
    })
    return map
  }

  getDaysWithEvents() {
    const calendarDays = this.getCalendarDays()
    const eventMap = this.getEventMap()
    return calendarDays.map((day) => {
      const dayKey = day.toString({ calendarName: 'never' })
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

  getEventProps(event: TEvent) {
    return getEventProps(this.getEventMap(), event, this.store.state, {
      timeZone: this.options.timeZone,
    }) as ReturnType<CalendarActions<TResource, TEvent>['getEventProps']>
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
    return eventMap.get(targetDate) ?? []
  }
}
