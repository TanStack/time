import { Store } from '@tanstack/store'
import { Temporal } from '@js-temporal/polyfill'
import { getFirstDayOfMonth, getFirstDayOfWeek } from '../utils'
import { generateDateRange } from '../calendar/generateDateRange'
import { splitMultiDayEvents } from '../calendar/splitMultiDayEvents'
import { getEventProps } from '../calendar/getEventProps'
import { groupDaysBy } from '../calendar/groupDaysBy'
import { getDateDefaults } from '../utils/dateDefaults'
import type { GroupDaysByProps } from '../calendar/groupDaysBy'
import type { CalendarStore, Day, Event, Resource } from '../calendar/types'

import '@bart-krakowski/get-week-info-polyfill'

export type * from '../calendar/types'

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
> {
  /** An optional array of events to be handled by the calendar. */
  events?: TEvent[] | null
  /** The initial view mode configuration of the calendar. */
  viewMode: CalendarStore['viewMode']
  /** Optional locale for date formatting. Uses a BCP 47 language tag. */
  locale?: Intl.UnicodeBCP47LocaleIdentifier
  /** Optional time zone specification for the calendar. */
  timeZone?: Temporal.TimeZoneLike
  /** Optional calendar system to be used. */
  calendar?: Temporal.CalendarLike
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
export class CalendarCore<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> implements CalendarActions<TResource, TEvent>
{
  store: Store<CalendarStore>
  options: Required<CalendarCoreOptions<TResource, TEvent>>

  constructor(options: CalendarCoreOptions<TResource, TEvent>) {
    const defaults = getDateDefaults()
    this.options = {
      ...defaults,
      ...options,
      events: options.events || null,
      resources: options.resources || null,
    }

    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar)

    this.store = new Store<CalendarStore>({
      currentPeriod: now,
      activeDate: now,
      viewMode: options.viewMode,
    })
  }

  private getFirstDayOfMonth() {
    return getFirstDayOfMonth(
      this.store.state.currentPeriod
        .toString({ calendarName: 'auto' })
        .substring(0, 7),
    )
  }

  private getFirstDayOfWeek() {
    return getFirstDayOfWeek(
      this.store.state.currentPeriod.toString(),
      this.options.locale,
    )
  }

  private getCalendarDays() {
    const start =
      this.store.state.viewMode.unit === 'month'
        ? this.getFirstDayOfMonth().subtract({
            days:
              (this.getFirstDayOfMonth().dayOfWeek -
                (this.getFirstDayOfWeek().dayOfWeek + 1) +
                7) %
              7,
          })
        : this.store.state.currentPeriod

    let end: Temporal.PlainDate
    switch (this.store.state.viewMode.unit) {
      case 'month': {
        const lastDayOfMonth = this.getFirstDayOfMonth()
          .add({ months: this.store.state.viewMode.value })
          .subtract({ days: 1 })
        const lastDayOfMonthWeekDay =
          (lastDayOfMonth.dayOfWeek -
            (this.getFirstDayOfWeek().dayOfWeek + 1) +
            7) %
          7
        end = lastDayOfMonth.add({ days: 6 - lastDayOfMonthWeekDay })
        break
      }
      case 'week': {
        end = this.getFirstDayOfWeek().add({
          days: 7 * this.store.state.viewMode.value - 1,
        })
        break
      }
      case 'day': {
        end = this.store.state.currentPeriod.add({
          days: this.store.state.viewMode.value - 1,
        })
        break
      }
      case 'workWeek': {
        end = start.add({ days: 4 })
        break
      }
    }

    const allDays = generateDateRange(start.toString(), end.toString())
    const startMonthDate = this.store.state.currentPeriod.with({ day: 1 })
    const endMonthDate = this.store.state.currentPeriod
      .add({
        months: this.store.state.viewMode.value - 1,
      })
      .with({
        day: Temporal.PlainDate.from(
          this.store.state.currentPeriod.toString({ calendarName: 'auto' }),
        ).daysInMonth,
      })

    return allDays.filter(
      (day) =>
        Temporal.PlainDate.compare(day, startMonthDate) >= 0 &&
        Temporal.PlainDate.compare(day, endMonthDate) <= 0,
    )
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

  getDaysNames(weekday: 'long' | 'short' = 'short') {
    const baseDate = Temporal.PlainDate.from('2024-01-01')
    const firstDayOfWeek = this.getFirstDayOfWeek().dayOfWeek

    return Array.from({ length: 7 }).map((_, i) =>
      baseDate
        .add({ days: (i + (firstDayOfWeek - 1)) % 7 })
        .toLocaleString(this.options.locale, { weekday: weekday }),
    )
  }

  changeViewMode(newViewMode: CalendarStore['viewMode']) {
    this.store.setState((prev) => ({
      ...prev,
      viewMode: newViewMode,
    }))
  }

  goToPreviousPeriod() {
    switch (this.store.state.viewMode.unit) {
      case 'month': {
        const newActiveDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }

      case 'week': {
        const newActiveDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }

      case 'day': {
        const newActiveDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }
      case 'workWeek': {
        const newActiveDate = this.store.state.activeDate.subtract({
          days: 5,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }
    }
  }

  goToNextPeriod() {
    switch (this.store.state.viewMode.unit) {
      case 'month': {
        const newActiveDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }

      case 'week': {
        const newActiveDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }

      case 'day': {
        const newActiveDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }
      case 'workWeek': {
        const newActiveDate = this.store.state.activeDate.add({
          days: 5,
        })
        this.store.setState((prev) => ({
          ...prev,
          activeDate: newActiveDate,
          currentPeriod: newActiveDate,
        }))
        break
      }
    }
  }

  goToCurrentPeriod() {
    const now = Temporal.Now.plainDateISO()
    this.store.setState((prev) => ({
      ...prev,
      activeDate: now,
      currentPeriod: now,
    }))
  }

  goToSpecificPeriod(date: string) {
    this.store.setState((prev) => ({
      ...prev,
      activeDate: Temporal.PlainDate.from(date),
      currentPeriod: Temporal.PlainDate.from(date),
    }))
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
      weekStartsOn: this.getFirstDayOfWeek().dayOfWeek,
      locale: this.options.locale,
    } as GroupDaysByProps<TResource, TEvent>)
  }
}
