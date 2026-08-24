import { Temporal } from '@js-temporal/polyfill'
import { toPlainDateTimeString } from '~/date'

const DAY_START = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0,
} as const

const DAY_END = {
  hour: 23,
  minute: 59,
  second: 59,
  millisecond: 999,
  microsecond: 0,
  nanosecond: 0,
} as const

export interface SplittableEvent {
  id: string
  start: string | Date | number
  end: string | Date | number
  allDay?: boolean
  _originalStart?: string | Date | number
  _originalEnd?: string | Date | number
}

export function splitMultiDay<E extends SplittableEvent>(
  event: E,
  timeZone: Temporal.TimeZoneLike,
): Array<E> {
  const startDate = Temporal.PlainDateTime.from(toPlainDateTimeString(event.start)).toZonedDateTime(
    timeZone,
  )
  const endDate = Temporal.PlainDateTime.from(toPlainDateTimeString(event.end)).toZonedDateTime(
    timeZone,
  )

  const events: Array<E> = []
  let currentDay = startDate

  while (Temporal.ZonedDateTime.compare(currentDay, endDate) < 0) {
    const startOfDay = currentDay.with(DAY_START)
    const endOfDay = currentDay.with(DAY_END)

    const eventStart =
      Temporal.ZonedDateTime.compare(currentDay, startDate) === 0 ? startDate : startOfDay
    const eventEnd = Temporal.ZonedDateTime.compare(endDate, endOfDay) < 0 ? endDate : endOfDay

    events.push({
      ...event,
      start: eventStart.toPlainDateTime().toString(),
      end: eventEnd.toPlainDateTime().toString(),
      _originalStart: event.start,
      _originalEnd: event.end,
    } as E)

    currentDay = startOfDay.add({ days: 1 })
  }

  return events
}

export function spansMultipleDays(event: SplittableEvent): boolean {
  const startDt = Temporal.PlainDateTime.from(toPlainDateTimeString(event.start))
  const endDt = Temporal.PlainDateTime.from(toPlainDateTimeString(event.end))
  return Temporal.PlainDate.compare(startDt.toPlainDate(), endDt.toPlainDate()) !== 0
}

export function splitEventsByDay<E extends SplittableEvent>(
  events: Array<E>,
  timeZone: Temporal.TimeZoneLike,
): Array<E> {
  const out: Array<E> = []
  for (const event of events) {
    if (spansMultipleDays(event)) {
      out.push(...splitMultiDay(event, timeZone))
    } else {
      out.push(event)
    }
  }
  return out
}
