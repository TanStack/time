import { Temporal } from '@js-temporal/polyfill'

export type MoveGranularity = 'time' | 'day'

export interface MoveConstraints {
  snapToMinutes?: number
}

const DEFAULT_SNAP_TO_MINUTES = 15
const MS_PER_MINUTE = 60_000

const extractDate = (value: string): string => value.split('T')[0] ?? value

export function snapToInterval(minutes: number, interval: number): number {
  if (!Number.isFinite(minutes)) return 0
  if (interval <= 1) return Math.round(minutes)
  return Math.round(minutes / interval) * interval
}

export function calculateDayShift(fromDate: string, toDate: string): number {
  return Temporal.PlainDate.from(extractDate(fromDate)).until(
    Temporal.PlainDate.from(extractDate(toDate)),
    { largestUnit: 'day' },
  ).days
}

export interface CalculateMovedEventOptions {
  originalStart: string
  originalEnd: string
  dayShift?: number
  minuteShift?: number
  granularity?: MoveGranularity
  timeZone: Temporal.TimeZoneLike
  constraints?: MoveConstraints
}

export interface MovedEventResult {
  start: string
  end: string
  durationMinutes: number
  dayShift: number
  minuteShift: number
  moved: boolean
}

export function calculateMovedEvent(options: CalculateMovedEventOptions): MovedEventResult {
  const { originalStart, originalEnd, granularity = 'time', timeZone, constraints = {} } = options

  const { snapToMinutes = DEFAULT_SNAP_TO_MINUTES } = constraints

  const dayShift = Math.round(options.dayShift ?? 0)
  const minuteShift =
    granularity === 'day' ? 0 : snapToInterval(options.minuteShift ?? 0, snapToMinutes)

  const shift = (value: string): Temporal.PlainDateTime =>
    Temporal.PlainDateTime.from(value).add({ days: dayShift }).add({ minutes: minuteShift })

  const start = shift(originalStart)
  const end = shift(originalEnd)

  const durationMs =
    end.toZonedDateTime(timeZone).epochMilliseconds -
    start.toZonedDateTime(timeZone).epochMilliseconds

  return {
    start: start.toString(),
    end: end.toString(),
    durationMinutes: Math.floor(durationMs / MS_PER_MINUTE),
    dayShift,
    minuteShift,
    moved: dayShift !== 0 || minuteShift !== 0,
  }
}
