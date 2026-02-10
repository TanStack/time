import { Temporal } from '@js-temporal/polyfill'
import { getTimeClient } from '../client'
import { splitMultiDayEvents } from './splitMultiDayEvents'
import { getEventProps } from './getEventProps'
import { groupDaysBy } from './groupDaysBy'
import { getTimeSlots } from './getTimeSlots'
import { DateCore } from './date-core'
import type { DateCoreOptions, ParsedDateCoreOptions } from './date-core'
import type {
  Day,
  Event,
  Resource,
  TimeSlot,
  UnavailableRange,
  ViewMode,
} from './types'

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
  groupDaysBy: (props: {
    days: Array<Day<TResource, TEvent> | null>
    unit: 'week' | 'workWeek'
    fillMissingDays?: boolean
  }) => Array<Array<Day<TResource, TEvent> | null>>
  /** Retrieves time slots for day view with configurable intervals. */
  getTimeSlots: (
    options?: Parameters<typeof getTimeSlots>[1],
  ) => Array<TimeSlot>
  /** Retrieves events for a specific date. */
  getEventsByDate: (date: string) => Array<TEvent>
  /** Adds a new event to the calendar. */
  addEvent: (event: TEvent) => void
  /** Updates an existing event by ID. */
  updateEvent: (id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>) => void
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
    console.log('getDaysWithEvents')
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
    return eventMap.get(targetDate) ?? []
  }

  addEvent(event: TEvent): void {
    if (!this.options.events) {
      this.options.events = []
    }
    this.options.events.push(event)
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    getTimeClient().emit('event:added', {
      eventId: event.id,
      eventTitle: event.title,
      start: event.start,
      end: event.end,
    })
  }

  updateEvent(id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>): void {
    if (!this.options.events) return

    const index = this.options.events.findIndex((e) => e.id === id)
    if (index === -1) return

    const existingEvent = this.options.events[index]
    this.options.events[index] = { ...existingEvent, ...updates } as TEvent
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    // Emit event to TimeClient
    if (existingEvent) {
      getTimeClient().emit('event:updated', {
        eventId: id,
        eventTitle: existingEvent.title,
        start: this.options.events[index].start,
        end: this.options.events[index].end,
        updates: updates as Record<string, unknown>,
      })
    }
  }

  removeEvent(id: Event['id']): void {
    if (!this.options.events) return

    const index = this.options.events.findIndex((e) => e.id === id)
    if (index === -1) return

    const removedEvent = this.options.events[index]
    this.options.events.splice(index, 1)
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    if (removedEvent) {
      getTimeClient().emit('event:removed', {
        eventId: id,
        eventTitle: removedEvent.title,
        start: removedEvent.start,
        end: removedEvent.end,
      })
    }
  }

  getUnavailableRanges(
    date: string,
    options?: {
      containerHeight?: number
      resourceIds?: Array<TResource['id']>
    },
  ): Array<UnavailableRange> {
    const containerHeight = options?.containerHeight ?? 1440
    const resources = options?.resourceIds
      ? this.options.resources?.filter((resource) =>
          options.resourceIds?.includes(resource.id),
        )
      : this.options.resources
    if (!resources || resources.length === 0) {
      return []
    }

    const plainDate = Temporal.PlainDate.from(date)
    const weekday = plainDate.dayOfWeek

    const availableRanges: Array<{ startMinutes: number; endMinutes: number }> =
      []

    for (const resource of resources) {
      if (!resource.availability) continue

      for (const slot of resource.availability) {
        if (!slot.weekdays.includes(weekday)) continue

        const startParts = slot.startTime.split(':').map(Number)
        const endParts = slot.endTime.split(':').map(Number)
        const startHour = startParts[0] ?? 0
        const startMin = startParts[1] ?? 0
        const endHour = endParts[0] ?? 0
        const endMin = endParts[1] ?? 0

        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        availableRanges.push({ startMinutes, endMinutes })
      }
    }

    if (availableRanges.length === 0) {
      return [
        {
          top: 0,
          height: containerHeight,
          startTime: '00:00',
          endTime: '24:00',
        },
      ]
    }

    availableRanges.sort((a, b) => a.startMinutes - b.startMinutes)

    const mergedAvailable: Array<{ startMinutes: number; endMinutes: number }> =
      []
    for (const range of availableRanges) {
      const last = mergedAvailable[mergedAvailable.length - 1]
      if (last && range.startMinutes <= last.endMinutes) {
        last.endMinutes = Math.max(last.endMinutes, range.endMinutes)
      } else {
        mergedAvailable.push({ ...range })
      }
    }

    const unavailableRanges: Array<{
      startMinutes: number
      endMinutes: number
    }> = []
    let currentMinute = 0
    const dayEndMinutes = 24 * 60

    for (const available of mergedAvailable) {
      if (currentMinute < available.startMinutes) {
        unavailableRanges.push({
          startMinutes: currentMinute,
          endMinutes: available.startMinutes,
        })
      }
      currentMinute = available.endMinutes
    }

    if (currentMinute < dayEndMinutes) {
      unavailableRanges.push({
        startMinutes: currentMinute,
        endMinutes: dayEndMinutes,
      })
    }

    const minutesToPixels = (minutes: number) =>
      (minutes / dayEndMinutes) * containerHeight

    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    }

    return unavailableRanges.map((range) => ({
      top: minutesToPixels(range.startMinutes),
      height: minutesToPixels(range.endMinutes - range.startMinutes),
      startTime: formatTime(range.startMinutes),
      endTime: formatTime(range.endMinutes),
    }))
  }
}
