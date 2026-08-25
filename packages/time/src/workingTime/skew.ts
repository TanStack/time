import { Temporal } from '@js-temporal/polyfill'
import {
  formatMinutesToTime,
  mergeMinuteRanges,
  MINUTES_IN_DAY,
  parseHmToMinutes,
  type MinuteRange,
} from './minutes'
import { hasAnyWorkingCalendar, resolveLayeredDayMinutes } from './resolve'
import type { WorkingCalendar } from './types'

export const MAX_WORKING_SKEW_DAYS = 366

function dayOf(value: string): string {
  return value.slice(0, 10)
}

function minutesOf(value: string): number {
  if (value.length < 16) return 0
  return parseHmToMinutes(value.slice(11, 16))
}

function stampFrom(base: Temporal.PlainDate, totalMinutes: number): string {
  const days = Math.floor(totalMinutes / MINUTES_IN_DAY)
  const minutesOfDay = totalMinutes - days * MINUTES_IN_DAY
  const date = base.add({ days })
  const time = formatMinutesToTime(minutesOfDay)
  return `${date.toString({ calendarName: 'never' })}T${time}:00`
}

function dayWorkingMinutes(
  layers: Array<Array<string | undefined>>,
  day: string,
  calendars: Array<WorkingCalendar> | null | undefined,
): Array<MinuteRange> {
  return mergeMinuteRanges(
    layers.flatMap((stack) => resolveLayeredDayMinutes(stack, day, calendars)),
  )
}

export function nextWorkingInstant(
  from: string,
  layers: Array<Array<string | undefined>>,
  calendars: Array<WorkingCalendar> | null | undefined,
): string | null {
  if (!hasAnyWorkingCalendar(layers.flat(), calendars)) return from

  const fromMinutes = minutesOf(from)
  let cursor = Temporal.PlainDate.from(dayOf(from))

  for (let day = 0; day <= MAX_WORKING_SKEW_DAYS; day++) {
    const lowerBound = day === 0 ? fromMinutes : 0
    const date = cursor.toString({ calendarName: 'never' })

    for (const span of dayWorkingMinutes(layers, date, calendars)) {
      if (span.endMinutes <= lowerBound) continue
      return stampFrom(cursor, Math.max(span.startMinutes, lowerBound))
    }

    cursor = cursor.add({ days: 1 })
  }

  return null
}

export function previousWorkingInstant(
  from: string,
  layers: Array<Array<string | undefined>>,
  calendars: Array<WorkingCalendar> | null | undefined,
): string | null {
  if (!hasAnyWorkingCalendar(layers.flat(), calendars)) return from

  const fromMinutes = minutesOf(from)
  let cursor = Temporal.PlainDate.from(dayOf(from))

  for (let day = 0; day <= MAX_WORKING_SKEW_DAYS; day++) {
    const upperBound = day === 0 ? fromMinutes : MINUTES_IN_DAY
    const date = cursor.toString({ calendarName: 'never' })
    const spans = dayWorkingMinutes(layers, date, calendars)

    for (let i = spans.length - 1; i >= 0; i--) {
      const span = spans[i]!
      if (span.startMinutes > upperBound) continue
      return stampFrom(cursor, Math.min(span.endMinutes, upperBound))
    }

    cursor = cursor.subtract({ days: 1 })
  }

  return null
}

export function addWorkingMinutes(
  start: string,
  minutes: number,
  layers: Array<Array<string | undefined>>,
  calendars: Array<WorkingCalendar> | null | undefined,
): string | null {
  if (!hasAnyWorkingCalendar(layers.flat(), calendars)) {
    return stampFrom(Temporal.PlainDate.from(dayOf(start)), minutesOf(start) + Math.max(0, minutes))
  }

  if (minutes <= 0) return nextWorkingInstant(start, layers, calendars)

  const startMinutes = minutesOf(start)
  let remaining = minutes
  let cursor = Temporal.PlainDate.from(dayOf(start))

  for (let day = 0; day <= MAX_WORKING_SKEW_DAYS; day++) {
    const lowerBound = day === 0 ? startMinutes : 0
    const date = cursor.toString({ calendarName: 'never' })

    for (const span of dayWorkingMinutes(layers, date, calendars)) {
      const from = Math.max(span.startMinutes, lowerBound)
      if (span.endMinutes <= from) continue

      const available = span.endMinutes - from
      if (remaining <= available) return stampFrom(cursor, from + remaining)
      remaining -= available
    }

    cursor = cursor.add({ days: 1 })
  }

  return null
}

export function subtractWorkingMinutes(
  end: string,
  minutes: number,
  layers: Array<Array<string | undefined>>,
  calendars: Array<WorkingCalendar> | null | undefined,
): string | null {
  if (!hasAnyWorkingCalendar(layers.flat(), calendars)) {
    return stampFrom(Temporal.PlainDate.from(dayOf(end)), minutesOf(end) - Math.max(0, minutes))
  }

  if (minutes <= 0) return previousWorkingInstant(end, layers, calendars)

  const endMinutes = minutesOf(end)
  let remaining = minutes
  let cursor = Temporal.PlainDate.from(dayOf(end))

  for (let day = 0; day <= MAX_WORKING_SKEW_DAYS; day++) {
    const upperBound = day === 0 ? endMinutes : MINUTES_IN_DAY
    const date = cursor.toString({ calendarName: 'never' })
    const spans = dayWorkingMinutes(layers, date, calendars)

    for (let i = spans.length - 1; i >= 0; i--) {
      const span = spans[i]!
      const to = Math.min(span.endMinutes, upperBound)
      if (to <= span.startMinutes) continue

      const available = to - span.startMinutes
      if (remaining <= available) return stampFrom(cursor, to - remaining)
      remaining -= available
    }

    cursor = cursor.subtract({ days: 1 })
  }

  return null
}
