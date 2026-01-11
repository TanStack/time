import { Store } from '@tanstack/store'
import { Temporal } from '@js-temporal/polyfill'
import {
  getFirstDayOfMonth,
  getFirstDayOfWeek,
  parseDateRange,
  constrainDateToRange,
  isDateInRange,
} from '../utils'
import { generateDateRange } from '../calendar/generateDateRange'
import { splitMultiDayEvents } from '../calendar/splitMultiDayEvents'
import { getEventProps } from '../calendar/getEventProps'
import { groupDaysBy } from '../calendar/groupDaysBy'
import { getDateDefaults } from '../utils/dateDefaults'
import type { GroupDaysByProps } from '../calendar/groupDaysBy'
import type {
  CalendarStore,
  DateRange,
  Day,
  Event,
  Resource,
} from '../calendar/types'
import type { ParsedDateRange } from '../utils/dateRange'

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
  /** Optional range of dates to be used in the calendar. */
  range?: DateRange
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
interface ParsedCalendarCoreOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> extends Omit<Required<CalendarCoreOptions<TResource, TEvent>>, 'range'> {
  range: ParsedDateRange
}

export class CalendarCore<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> implements CalendarActions<TResource, TEvent>
{
  store: Store<CalendarStore>
  options: ParsedCalendarCoreOptions<TResource, TEvent>

  constructor(options: CalendarCoreOptions<TResource, TEvent>) {
    const defaults = getDateDefaults()
    const parsedRange = parseDateRange({
      range: options.range,
      calendar: defaults.calendar,
    })

    this.options = {
      ...defaults,
      ...options,
      events: options.events || null,
      resources: options.resources || null,
      range: parsedRange,
    }

    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar)
    const initialDate = constrainDateToRange({
      date: now,
      range: this.options.range,
    })

    this.store = new Store<CalendarStore>({
      currentPeriod: initialDate,
      activeDate: initialDate,
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

    const filteredDays = allDays.filter(
      (day) =>
        Temporal.PlainDate.compare(day, startMonthDate) >= 0 &&
        Temporal.PlainDate.compare(day, endMonthDate) <= 0,
    )

    if (this.options.range.start || this.options.range.end) {
      return filteredDays.filter((day) =>
        isDateInRange({ date: day, range: this.options.range }),
      )
    }

    return filteredDays
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
    let newActiveDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        newActiveDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        })
        break
      }

      case 'week': {
        newActiveDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        })
        break
      }

      case 'day': {
        newActiveDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        newActiveDate = this.store.state.activeDate.subtract({
          days: 5,
        })
        break
      }
    }

    const constrainedDate = constrainDateToRange({
      date: newActiveDate,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  goToNextPeriod() {
    let newActiveDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        newActiveDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        })
        break
      }

      case 'week': {
        newActiveDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        })
        break
      }

      case 'day': {
        newActiveDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        newActiveDate = this.store.state.activeDate.add({
          days: 5,
        })
        break
      }
    }

    const constrainedDate = constrainDateToRange({
      date: newActiveDate,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  goToCurrentPeriod() {
    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar)
    const constrainedDate = constrainDateToRange({
      date: now,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  goToSpecificPeriod(date: string) {
    const targetDate = Temporal.PlainDate.from(date).withCalendar(
      this.options.calendar,
    )
    const constrainedDate = constrainDateToRange({
      date: targetDate,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  canGoPreviousPeriod(): boolean {
    let previousDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        previousDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        })
        break
      }
      case 'week': {
        previousDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        })
        break
      }
      case 'day': {
        previousDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        previousDate = this.store.state.activeDate.subtract({ days: 5 })
        break
      }
    }

    return isDateInRange({ date: previousDate, range: this.options.range })
  }

  canGoNextPeriod(): boolean {
    let nextDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        nextDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        })
        break
      }
      case 'week': {
        nextDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        })
        break
      }
      case 'day': {
        nextDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        nextDate = this.store.state.activeDate.add({ days: 5 })
        break
      }
    }

    return isDateInRange({ date: nextDate, range: this.options.range })
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
