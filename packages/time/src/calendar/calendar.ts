import { Temporal } from '@js-temporal/polyfill'
import { getTimeClient } from '../client'
import { splitMultiDayEvents } from './splitMultiDayEvents'
import { getEventProps } from './getEventProps'
import { groupDaysBy } from './groupDaysBy'
import { getTimeSlots } from './getTimeSlots'
import { calculateResizedEvent } from './getResizeProps'
import { toPlainDateString, toPlainDateTimeString } from '~/date/parse'
import { DateCore } from './date-core'
import type { DateCoreOptions, ParsedDateCoreOptions } from './date-core'
import type {
  ResizeConstraints,
  ResizeEdge,
  UnavailableTimeRange,
} from './getResizeProps'
import type {
  AvailabilityConflict,
  Day,
  Event,
  ResizeError,
  Resource,
  TimeSlot,
  TimelineLayout,
  TimelineResourceRow,
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
  /** Groups visible events by resource, merging multi-day segments back to full-span events. */
  getEventsByResource: () => Map<TResource['id'], Array<TEvent>>
  /** Computes horizontal timeline layout with event positions, lane assignments, and current time marker. */
  getTimelineLayout: () => TimelineLayout<TResource, TEvent>
  /** Returns a human-readable label for the currently visible date range. */
  formatPeriodLabel: (options?: { locale?: string }) => string
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

export interface ValidateResizeOptions {
  eventId: string
  originalStart: string
  originalEnd: string
  edge: ResizeEdge
  totalDeltaMinutes: number
  targetDayDate: string
  originalDayDate: string
  constraints?: ResizeConstraints
}

export interface ValidateResizeResult {
  blocked: boolean
  error?: {
    reason: ResizeError['reason']
    message: string
    conflicts: Array<AvailabilityConflict>
  }
  result: {
    start: string
    end: string
    durationMinutes: number
  }
  targetDayDate: string
}

const MINUTES_IN_DAY = 24 * 60

const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

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
      events: options.events?.map((e) => this.normalizeEvent(e)) || null,
      resources: options.resources || null,
    })
  }

  private normalizeEvent<
    T extends { start: string | Date | number; end: string | Date | number },
  >(event: T): T {
    return {
      ...event,
      start: toPlainDateTimeString(event.start),
      end: toPlainDateTimeString(event.end),
    }
  }

  protected getCalendarDays() {
    return super.getCalendarDays()
  }

  private getEventMap() {
    const map = new Map<string, Array<TEvent>>()
    this.options.events?.forEach((event) => {
      const eventStartDate = Temporal.PlainDateTime.from(
        toPlainDateTimeString(event.start),
      ).toZonedDateTime(this.options.timeZone)
      const eventEndDate = Temporal.PlainDateTime.from(
        toPlainDateTimeString(event.end),
      ).toZonedDateTime(this.options.timeZone)
      const startPlainDate = eventStartDate.toPlainDate()
      const endPlainDate = eventEndDate.toPlainDate()

      if (Temporal.PlainDate.compare(startPlainDate, endPlainDate) !== 0) {
        const splitEvents = splitMultiDayEvents<TResource, TEvent>(
          event,
          this.options.timeZone,
        )
        splitEvents.forEach((splitEvent) => {
          const dateKey = Temporal.PlainDateTime.from(
            toPlainDateTimeString(splitEvent.start),
          )
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
      const isoDate = day.toString({ calendarName: 'never' })
      const dailyEvents = eventMap.get(isoDate) ?? []
      const currentMonthRange = Array.from(
        { length: this.store.state.viewMode.value },
        (_, i) => this.store.state.currentPeriod.add({ months: i }).month,
      )
      const isInCurrentPeriod = currentMonthRange.includes(day.month)
      return {
        date: day,
        isoDate,
        events: dailyEvents,
        isToday:
          Temporal.PlainDate.compare(day, Temporal.Now.plainDateISO()) === 0,
        isInCurrentPeriod,
      }
    })
  }

  formatPeriodLabel(options?: { locale?: string }): string {
    const days = this.getDaysWithEvents()
    if (days.length === 0) return ''

    const locale = options?.locale ?? this.options.locale
    const first = days[0]!
    const last = days[days.length - 1]!

    const fmt = (d: Temporal.PlainDate) =>
      new Date(d.year, d.month - 1, d.day).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

    if (days.length === 1) return fmt(first.date)
    return `${fmt(first.date)} \u2014 ${fmt(last.date)}`
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
    const normalized = this.normalizeEvent(event)
    this.options.events.push(normalized)
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    getTimeClient().emit('event:added', {
      eventId: normalized.id,
      eventTitle: normalized.title,
      start: normalized.start,
      end: normalized.end,
    })
  }

  updateEvent(id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>): void {
    if (!this.options.events) return

    const index = this.options.events.findIndex((e) => e.id === id)
    if (index === -1) return

    const normalizedUpdates = {
      ...updates,
      ...(updates.start != null
        ? { start: toPlainDateTimeString(updates.start) }
        : {}),
      ...(updates.end != null
        ? { end: toPlainDateTimeString(updates.end) }
        : {}),
    }

    const existingEvent = this.options.events[index]
    this.options.events[index] = {
      ...existingEvent,
      ...normalizedUpdates,
    } as TEvent
    this.store.setState((prev) => ({
      ...prev,
      eventsVersion: prev.eventsVersion + 1,
    }))

    if (existingEvent) {
      getTimeClient().emit('event:updated', {
        eventId: id,
        eventTitle: existingEvent.title,
        start: this.options.events[index].start,
        end: this.options.events[index].end,
        updates: normalizedUpdates as Record<string, unknown>,
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

  /**
   * Get detailed unavailability information for a specific time range on a date
   * Returns which resources are unavailable and why
   */
  getUnavailabilityDetails(
    date: string,
    startMinutes: number,
    endMinutes: number,
    options?: {
      resourceIds?: Array<TResource['id']>
    },
  ): Array<{
    resourceId: string
    resourceLabel: string
    reason: 'outside-hours' | 'capacity' | 'no-availability'
    description: string
  }> {
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

    const details: Array<{
      resourceId: string
      resourceLabel: string
      reason: 'outside-hours' | 'capacity' | 'no-availability'
      description: string
    }> = []

    for (const resource of resources) {
      if (!resource.availability || resource.availability.length === 0) {
        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'no-availability',
          description: `${resource.label}: No availability configured`,
        })
        continue
      }

      const availableSlots = resource.availability.filter((slot) =>
        slot.weekdays.includes(weekday),
      )

      if (availableSlots.length === 0) {
        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'outside-hours',
          description: `${resource.label}: Not available on this day`,
        })
        continue
      }

      const isWithinAvailability = availableSlots.some((slot) => {
        const slotStartParts = slot.startTime.split(':').map(Number)
        const slotEndParts = slot.endTime.split(':').map(Number)
        const slotStartMinutes =
          (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0)
        const slotEndMinutes =
          (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0)

        return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes
      })

      if (!isWithinAvailability) {
        const timeRanges = availableSlots
          .map((slot) => {
            const slotStartParts = slot.startTime.split(':').map(Number)
            const slotEndParts = slot.endTime.split(':').map(Number)
            return {
              start: (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0),
              end: (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0),
            }
          })
          .sort((a, b) => a.start - b.start)

        const formatTime = (mins: number) =>
          `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

        const availabilityWindow = timeRanges
          .map((r) => `${formatTime(r.start)}-${formatTime(r.end)}`)
          .join(', ')

        details.push({
          resourceId: resource.id,
          resourceLabel: resource.label,
          reason: 'outside-hours',
          description: `${resource.label}: Available ${availabilityWindow}, but event is ${formatTime(startMinutes)}-${formatTime(endMinutes)}`,
        })
      }
    }

    return details
  }

  private getMergedEventsByResource(
    days: Array<Day<TResource, TEvent>>,
  ): Map<TResource['id'], Array<TEvent>> {
    const map = new Map<TResource['id'], Array<TEvent>>()
    this.options.resources?.forEach((r) => map.set(r.id, []))

    const allSegments = days.flatMap((d) => d.events)
    const merged = new Map<string, TEvent>()
    for (const segment of allSegments) {
      if (!merged.has(segment.id)) {
        merged.set(segment.id, {
          ...segment,
          start: segment._originalStart ?? segment.start,
          end: segment._originalEnd ?? segment.end,
        } as TEvent)
      }
    }

    for (const event of merged.values()) {
      const resourceIds = event.resources?.map((r) => r.id) ?? []
      for (const rid of resourceIds) {
        map.get(rid)?.push(event)
      }
    }

    return map
  }

  getEventsByResource(): Map<TResource['id'], Array<TEvent>> {
    return this.getMergedEventsByResource(this.getDaysWithEvents())
  }

  getTimelineLayout(): TimelineLayout<TResource, TEvent> {
    const days = this.getDaysWithEvents()

    if (days.length === 0) {
      return { rows: [], currentTimePosition: null }
    }

    const firstDay = days[0]!.date
    const totalDays = days.length
    const eventsByResource = this.getMergedEventsByResource(days)

    const rows: Array<TimelineResourceRow<TResource, TEvent>> = (
      this.options.resources ?? []
    ).map((resource) => {
      const resourceEvents = eventsByResource.get(resource.id) ?? []

      const positioned = resourceEvents
        .map((event) => {
          const pos = this.computeTimelineEventPosition(
            event,
            firstDay,
            totalDays,
          )
          if (pos.width <= 0) return null
          return { event, ...pos, right: pos.left + pos.width }
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)

      const lanes: Array<Array<{ left: number; right: number }>> = []
      const withLanes = positioned.map((item) => {
        let assignedLane = 0
        for (assignedLane = 0; assignedLane < lanes.length; assignedLane++) {
          const hasOverlap = lanes[assignedLane]!.some(
            (existing) =>
              item.left < existing.right && item.right > existing.left,
          )
          if (!hasOverlap) break
        }
        if (!lanes[assignedLane]) lanes[assignedLane] = []
        lanes[assignedLane]!.push({ left: item.left, right: item.right })
        return {
          event: item.event,
          left: item.left,
          width: item.width,
          lane: assignedLane,
          isStartClipped: item.isStartClipped,
          isEndClipped: item.isEndClipped,
        }
      })

      return {
        resource,
        events: withLanes,
        laneCount: Math.max(1, lanes.length),
      }
    })

    let currentTimePosition: number | null = null
    const now = Temporal.Now.zonedDateTimeISO(this.options.timeZone)
    const todayStr = now.toPlainDate().toString({ calendarName: 'never' })
    const todayIndex = days.findIndex(
      (d) => d.date.toString({ calendarName: 'never' }) === todayStr,
    )
    if (todayIndex >= 0) {
      const hourFraction = now.hour + now.minute / 60
      const totalHours = totalDays * 24
      currentTimePosition =
        ((todayIndex * 24 + hourFraction) / totalHours) * 100
    }

    return { rows, currentTimePosition }
  }

  private computeTimelineEventPosition(
    event: TEvent,
    firstDay: Temporal.PlainDate,
    totalDays: number,
  ): { left: number; width: number } {
    const startStr = toPlainDateTimeString(event.start)
    const endStr = toPlainDateTimeString(event.end)

    const startDateStr = startStr.split('T')[0]!
    const endDateStr = endStr.split('T')[0]!
    const startTimeStr = startStr.split('T')[1] ?? '00:00:00'
    const endTimeStr = endStr.split('T')[1] ?? '00:00:00'

    const startTimeParts = startTimeStr.split(':').map(Number)
    const endTimeParts = endTimeStr.split(':').map(Number)

    const firstDayIso = firstDay.toString({ calendarName: 'never' })
    const startDayOffset = Temporal.PlainDate.from(firstDayIso).until(
      Temporal.PlainDate.from(startDateStr),
    ).days
    const endDayOffset = Temporal.PlainDate.from(firstDayIso).until(
      Temporal.PlainDate.from(endDateStr),
    ).days

    const startHours =
      startDayOffset * 24 +
      (startTimeParts[0] ?? 0) +
      (startTimeParts[1] ?? 0) / 60
    const endHours =
      endDayOffset * 24 + (endTimeParts[0] ?? 0) + (endTimeParts[1] ?? 0) / 60

    const totalHours = totalDays * 24

    const rawLeft = (startHours / totalHours) * 100
    const rawRight = (endHours / totalHours) * 100

    const left = Math.max(0, rawLeft)
    const right = Math.min(100, rawRight)

    return {
      left,
      width: right - left,
      isStartClipped: rawLeft < 0,
      isEndClipped: rawRight > 100,
    }
  }

  private getUnavailableMinuteRanges(
    date: string,
    options?: { resourceIds?: Array<string> },
  ): Array<UnavailableTimeRange> {
    const rawRanges = this.getUnavailableRanges(date, {
      containerHeight: MINUTES_IN_DAY,
      resourceIds: options?.resourceIds,
    })
    return rawRanges.map((range) => {
      const startParts = range.startTime.split(':').map(Number)
      const endParts = range.endTime.split(':').map(Number)
      return {
        startMinutes: (startParts[0] ?? 0) * 60 + (startParts[1] ?? 0),
        endMinutes: (endParts[0] ?? 0) * 60 + (endParts[1] ?? 0),
      }
    })
  }

  private getResizeConflicts(
    dayDate: string,
    startMins: number,
    endMins: number,
    eventId: string,
    originalStart: string,
    originalEnd: string,
    resourceIds: Array<string>,
  ): Array<AvailabilityConflict> {
    const conflicts: Array<AvailabilityConflict> = []

    const details = this.getUnavailabilityDetails(dayDate, startMins, endMins, {
      resourceIds,
    })

    const unavailableRangesForDay = this.getUnavailableMinuteRanges(dayDate, {
      resourceIds,
    })

    const plainDate = Temporal.PlainDate.from(dayDate)
    const weekday = plainDate.dayOfWeek

    for (const range of unavailableRangesForDay) {
      if (startMins < range.endMinutes && endMins > range.startMinutes) {
        const overlappingDetails = details.filter((d) => {
          const resource = this.options.resources?.find(
            (r) => r.id === d.resourceId,
          )
          if (!resource) return false

          const resourceAvailableSlots =
            resource.availability?.filter((slot) =>
              slot.weekdays.includes(weekday),
            ) || []

          if (resourceAvailableSlots.length === 0) return true

          return !resourceAvailableSlots.some((slot) => {
            const slotStartParts = slot.startTime.split(':').map(Number)
            const slotEndParts = slot.endTime.split(':').map(Number)
            const slotStart =
              (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0)
            const slotEnd = (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0)

            return !(
              range.endMinutes <= slotStart || range.startMinutes >= slotEnd
            )
          })
        })

        if (overlappingDetails.length > 0) {
          conflicts.push({
            date: dayDate,
            conflictRange: {
              start: formatMinutesToTime(
                Math.max(startMins, range.startMinutes),
              ),
              end: formatMinutesToTime(Math.min(endMins, range.endMinutes)),
            },
            resourceIds: overlappingDetails.map((d) => d.resourceId),
            resourceDetails: overlappingDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: overlappingDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }
    }

    const eventsOnDay = this.getEventsByDate(dayDate)

    const origStartDate = new Date(originalStart)
    const origEndDate = new Date(originalEnd)
    const origStartMins =
      origStartDate.getHours() * 60 + origStartDate.getMinutes()
    const origEndMins = origEndDate.getHours() * 60 + origEndDate.getMinutes()

    for (const resourceId of resourceIds) {
      const resource = this.options.resources?.find((r) => r.id === resourceId)
      if (!resource || !resource.capacity) continue

      const getOverlappingEvents = (
        checkStartMins: number,
        checkEndMins: number,
      ) =>
        eventsOnDay.filter((e) => {
          if (e.id === eventId) return false

          const eventResourceIds = e.resources?.map((r) => r.id) || []
          if (!eventResourceIds.includes(resourceId)) return false

          const eventStart = new Date(e.start)
          const eventEnd = new Date(e.end)
          const eventStartMins =
            eventStart.getHours() * 60 + eventStart.getMinutes()
          const eventEndMins = eventEnd.getHours() * 60 + eventEnd.getMinutes()

          return checkStartMins < eventEndMins && checkEndMins > eventStartMins
        })

      const overlappingEvents = getOverlappingEvents(startMins, endMins)
      const previouslyOverlapping = getOverlappingEvents(
        origStartMins,
        origEndMins,
      )

      const currentUsage = overlappingEvents.length
      const previousUsage = previouslyOverlapping.length
      const maxCapacity = resource.capacity

      if (currentUsage > previousUsage && currentUsage >= maxCapacity) {
        conflicts.push({
          date: dayDate,
          conflictRange: {
            start: formatMinutesToTime(startMins),
            end: formatMinutesToTime(endMins),
          },
          resourceIds: [resourceId],
          resourceDetails: [
            {
              resourceId: resource.id,
              resourceLabel: resource.label,
              reason: 'capacity',
              description: `${resource.label}: Capacity exceeded (${currentUsage}/${maxCapacity} slots used)`,
              capacityInfo: {
                max: maxCapacity,
                used: currentUsage,
                remaining: 0,
              },
            },
          ],
          description: `${resource.label}: Capacity exceeded (${currentUsage}/${maxCapacity} slots used)`,
        })
      }
    }

    return conflicts
  }

  validateResize(options: ValidateResizeOptions): ValidateResizeResult {
    const {
      eventId,
      originalStart,
      originalEnd,
      edge,
      totalDeltaMinutes,
      targetDayDate,
      originalDayDate,
      constraints,
    } = options

    const event = this.options.events?.find((ev) => ev.id === eventId)
    const resourceIds = event?.resources?.map((r) => r.id)

    const unavailableRanges = this.getUnavailableMinuteRanges(targetDayDate, {
      resourceIds,
    })

    const originalStartDate = originalStart.split('T')[0] ?? ''
    const originalEndDate = originalEnd.split('T')[0] ?? ''

    const effectiveEdge =
      edge === 'left' ? 'top' : edge === 'right' ? 'bottom' : edge

    let shouldBlockResize = false
    let blockReason: ResizeError['reason'] = 'blocked'
    let blockMessage = 'Resize blocked'
    const conflicts: Array<AvailabilityConflict> = []

    const snapToMinutes = constraints?.snapToMinutes ?? 1
    const snapMins = (minutes: number): number => {
      if (snapToMinutes <= 1) return minutes
      return Math.round(minutes / snapToMinutes) * snapToMinutes
    }

    if (effectiveEdge === 'top' && targetDayDate < originalStartDate) {
      const rawStartMinutes =
        new Date(originalStart).getHours() * 60 +
        new Date(originalStart).getMinutes() +
        totalDeltaMinutes
      const targetStartMinutes =
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
      const snappedTargetStartMinutes = snapMins(targetStartMinutes)
      const currentStartMinutes =
        new Date(originalStart).getHours() * 60 +
        new Date(originalStart).getMinutes()

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          snappedTargetStartMinutes,
          MINUTES_IN_DAY,
          { resourceIds },
        )

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = unavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedTargetStartMinutes)} conflicts with ${detailsText}`
          conflicts.push({
            date: targetDayDate,
            conflictRange: {
              start: formatMinutesToTime(snappedTargetStartMinutes),
              end: formatMinutesToTime(MINUTES_IN_DAY),
            },
            resourceIds: unavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: unavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: unavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const sourceUnavailabilityDetails = this.getUnavailabilityDetails(
          originalStartDate,
          0,
          currentStartMinutes,
          { resourceIds },
        )

        if (sourceUnavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = sourceUnavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalStartDate} - ${detailsText}`
          conflicts.push({
            date: originalStartDate,
            conflictRange: {
              start: formatMinutesToTime(0),
              end: formatMinutesToTime(currentStartMinutes),
            },
            resourceIds: sourceUnavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: sourceUnavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: sourceUnavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }
    } else if (effectiveEdge === 'bottom' && targetDayDate > originalEndDate) {
      const rawEndMinutes =
        new Date(originalEnd).getHours() * 60 +
        new Date(originalEnd).getMinutes() +
        totalDeltaMinutes
      const targetEndMinutes =
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
      const snappedTargetEndMinutes = snapMins(targetEndMinutes)
      const currentEndMinutes =
        new Date(originalEnd).getHours() * 60 +
        new Date(originalEnd).getMinutes()

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          0,
          snappedTargetEndMinutes,
          { resourceIds },
        )

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = unavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event ending at ${formatMinutesToTime(snappedTargetEndMinutes)} conflicts with ${detailsText}`
          conflicts.push({
            date: targetDayDate,
            conflictRange: {
              start: formatMinutesToTime(0),
              end: formatMinutesToTime(snappedTargetEndMinutes),
            },
            resourceIds: unavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: unavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: unavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const sourceUnavailabilityDetails = this.getUnavailabilityDetails(
          originalEndDate,
          currentEndMinutes,
          MINUTES_IN_DAY,
          { resourceIds },
        )

        if (sourceUnavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = sourceUnavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalEndDate} - ${detailsText}`
          conflicts.push({
            date: originalEndDate,
            conflictRange: {
              start: formatMinutesToTime(currentEndMinutes),
              end: formatMinutesToTime(MINUTES_IN_DAY),
            },
            resourceIds: sourceUnavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: sourceUnavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: sourceUnavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }
    }

    if (
      !shouldBlockResize &&
      targetDayDate === originalStartDate &&
      targetDayDate === originalEndDate
    ) {
      const rawStartMinutes =
        new Date(originalStart).getHours() * 60 +
        new Date(originalStart).getMinutes() +
        (effectiveEdge === 'top' ? totalDeltaMinutes : 0)
      const rawEndMinutes =
        new Date(originalEnd).getHours() * 60 +
        new Date(originalEnd).getMinutes() +
        (effectiveEdge === 'bottom' ? totalDeltaMinutes : 0)

      const snappedStartMinutes = snapMins(
        ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
      )
      const snappedEndMinutes = snapMins(
        ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
      )

      if (resourceIds?.length) {
        const unavailabilityDetails = this.getUnavailabilityDetails(
          targetDayDate,
          snappedStartMinutes,
          snappedEndMinutes,
          { resourceIds },
        )

        if (unavailabilityDetails.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const detailsText = unavailabilityDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
          conflicts.push({
            date: targetDayDate,
            conflictRange: {
              start: formatMinutesToTime(snappedStartMinutes),
              end: formatMinutesToTime(snappedEndMinutes),
            },
            resourceIds: unavailabilityDetails.map((d) => d.resourceId),
            resourceDetails: unavailabilityDetails.map((d) => ({
              resourceId: d.resourceId,
              resourceLabel: d.resourceLabel,
              reason: d.reason,
              description: d.description,
            })),
            description: unavailabilityDetails
              .map((d) => d.description)
              .join('; '),
          })
        }
      }

      if (!shouldBlockResize && resourceIds?.length) {
        const detailedConflicts = this.getResizeConflicts(
          targetDayDate,
          snappedStartMinutes,
          snappedEndMinutes,
          eventId,
          originalStart,
          originalEnd,
          resourceIds,
        )

        const capacityConflicts = detailedConflicts.filter((c) =>
          c.resourceDetails.some((d) => d.reason === 'capacity'),
        )

        if (capacityConflicts.length > 0) {
          shouldBlockResize = true
          blockReason = 'unavailable-time'
          const conflict = capacityConflicts[0]!
          const detailsText = conflict.resourceDetails
            .map((d) => `${d.resourceLabel} (${d.reason})`)
            .join(', ')
          blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
          conflicts.push(...capacityConflicts)
        }
      }
    }

    // Comprehensive datetime-based check: catches multi-day event resizes and
    // cases where the existing per-day-minute logic doesn't apply (e.g.
    // horizontal timeline where targetDayDate is always the original day).
    if (!shouldBlockResize && resourceIds?.length) {
      const originalStartMs = new Date(originalStart).getTime()
      const originalEndMs = new Date(originalEnd).getTime()
      const snapMs = snapToMinutes * 60_000
      const snappedDeltaMs =
        Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs

      // Only check the *new territory* being added — shrinking is always fine.
      let checkFromMs: number | null = null
      let checkToMs: number | null = null

      if (effectiveEdge === 'bottom') {
        const newEndMs = originalEndMs + snappedDeltaMs
        if (newEndMs > originalEndMs) {
          checkFromMs = originalEndMs
          checkToMs = newEndMs
        }
      } else if (effectiveEdge === 'top') {
        const newStartMs = originalStartMs + snappedDeltaMs
        if (newStartMs < originalStartMs) {
          checkFromMs = newStartMs
          checkToMs = originalStartMs
        }
      }

      if (checkFromMs !== null && checkToMs !== null) {
        const dayMs = 24 * 60 * 60 * 1_000
        const cursor = new Date(checkFromMs)
        cursor.setHours(0, 0, 0, 0)

        while (cursor.getTime() < checkToMs && !shouldBlockResize) {
          const dayStr = toPlainDateString(cursor)
          const dayStartMs = cursor.getTime()
          const dayEndMs = dayStartMs + dayMs

          const overlapStartMs = Math.max(checkFromMs, dayStartMs)
          const overlapEndMs = Math.min(checkToMs, dayEndMs)

          if (overlapStartMs < overlapEndMs) {
            const overlapStartMins = Math.floor(
              (overlapStartMs - dayStartMs) / 60_000,
            )
            const overlapEndMins = Math.ceil(
              (overlapEndMs - dayStartMs) / 60_000,
            )

            const details = this.getUnavailabilityDetails(
              dayStr,
              overlapStartMins,
              overlapEndMins,
              { resourceIds },
            )

            if (details.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              const detailsText = details
                .map((d) => `${d.resourceLabel} (${d.reason})`)
                .join(', ')
              blockMessage = `Unavailable: ${dayStr} ${formatMinutesToTime(overlapStartMins)}–${formatMinutesToTime(overlapEndMins)} conflicts with ${detailsText}`
              conflicts.push({
                date: dayStr,
                conflictRange: {
                  start: formatMinutesToTime(overlapStartMins),
                  end: formatMinutesToTime(overlapEndMins),
                },
                resourceIds: details.map((d) => d.resourceId),
                resourceDetails: details.map((d) => ({
                  resourceId: d.resourceId,
                  resourceLabel: d.resourceLabel,
                  reason: d.reason,
                  description: d.description,
                })),
                description: details.map((d) => d.description).join('; '),
              })
            }
          }

          cursor.setTime(cursor.getTime() + dayMs)
        }
      }
    }

    const effectiveDeltaMinutes = shouldBlockResize ? 0 : totalDeltaMinutes

    const result = calculateResizedEvent({
      originalStart,
      originalEnd,
      edge,
      deltaMinutes: effectiveDeltaMinutes,
      timeZone: this.options.timeZone,
      constraints: {
        ...constraints,
        unavailableRanges: shouldBlockResize ? [] : unavailableRanges,
      },
    })

    return {
      blocked: shouldBlockResize,
      error: shouldBlockResize
        ? {
            reason: blockReason,
            message: blockMessage,
            conflicts,
          }
        : undefined,
      result,
      targetDayDate: shouldBlockResize ? originalDayDate : targetDayDate,
    }
  }
}
