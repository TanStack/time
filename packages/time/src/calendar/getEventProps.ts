import { Temporal } from '@js-temporal/polyfill'
import type { CalendarStore, Event } from './types'

interface GetEventPropsOptions {
  timeZone: Temporal.TimeZoneLike
}

const MINUTES_IN_DAY = 24 * 60
const MIN_EVENT_HEIGHT_MINUTES = 30

const toZonedDateTime = (
  dateString: string,
  timeZone: Temporal.TimeZoneLike,
): Temporal.ZonedDateTime =>
  Temporal.PlainDateTime.from(dateString).toZonedDateTime(timeZone)

const toMinutes = (date: Temporal.ZonedDateTime): number =>
  date.hour * 60 + date.minute

const toPercent = (minutes: number): number => (minutes / MINUTES_IN_DAY) * 100

const hasTimeOverlap = (
  aStart: Temporal.ZonedDateTime,
  aEnd: Temporal.ZonedDateTime,
  bStart: Temporal.ZonedDateTime,
  bEnd: Temporal.ZonedDateTime,
): boolean => {
  const compare = Temporal.ZonedDateTime.compare
  return compare(aStart, bEnd) < 0 && compare(aEnd, bStart) > 0
}

const getFullEventTimes = (
  segments: Array<Event>,
  timeZone: Temporal.TimeZoneLike,
  fallback: Event,
): { start: string; end: string } => {
  if (segments.length <= 1) {
    return { start: fallback.start, end: fallback.end }
  }

  const sorted = [...segments].sort((a, b) =>
    Temporal.ZonedDateTime.compare(
      toZonedDateTime(a.start, timeZone),
      toZonedDateTime(b.start, timeZone),
    ),
  )

  return {
    start: sorted[0]?.start ?? fallback.start,
    end: sorted[sorted.length - 1]?.end ?? fallback.end,
  }
}

export const getEventProps = (
  eventMap: Map<string, Array<Event>>,
  event: Event,
  state: CalendarStore,
  options: GetEventPropsOptions,
) => {
  const { timeZone } = options
  const allEvents = [...eventMap.values()].flat()

  const segmentStart = toZonedDateTime(event.start, timeZone)
  const segmentEnd = toZonedDateTime(event.end, timeZone)

  const segments = allEvents.filter((e) => e.id === event.id)
  const isSplitEvent = segments.length > 1
  const { start, end } = getFullEventTimes(segments, timeZone, event)

  const overlappingEvents = allEvents.filter((e) => {
    if (e.id === event.id) return false
    const eStart = toZonedDateTime(e.start, timeZone)
    const eEnd = toZonedDateTime(e.end, timeZone)
    return hasTimeOverlap(segmentStart, segmentEnd, eStart, eEnd)
  })

  const baseProps = { isSplitEvent, overlappingEvents, start, end }

  const isTimeGridView =
    state.viewMode.unit === 'week' || state.viewMode.unit === 'day'

  if (!isTimeGridView) {
    return baseProps
  }

  const startMinutes = toMinutes(segmentStart)
  const endMinutes = toMinutes(segmentEnd)
  const durationMinutes = endMinutes - startMinutes

  const overlappingCount = overlappingEvents.length
  const columnCount = overlappingCount + 1

  const eventIndex =
    overlappingCount > 0
      ? overlappingEvents.filter((e) => {
          const eStart = toZonedDateTime(e.start, timeZone)
          const comparison = Temporal.ZonedDateTime.compare(
            eStart,
            segmentStart,
          )
          if (comparison !== 0) return comparison < 0
          return e.id < event.id
        }).length
      : 0

  return {
    ...baseProps,
    style: {
      top: `${toPercent(startMinutes)}%`,
      height: `${Math.max(toPercent(durationMinutes), toPercent(MIN_EVENT_HEIGHT_MINUTES))}%`,
      left:
        overlappingCount > 0 ? `${(eventIndex * 100) / columnCount}%` : '0%',
      width: overlappingCount > 0 ? `${100 / columnCount}%` : '100%',
    },
  }
}
