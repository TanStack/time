import type { WorkingCalendar, WorkingInterval } from './types'

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

const WEEKDAY_NUMBERS: Record<Weekday, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
}

const DAY_START = '00:00'
const DAY_END = '24:00'

const HM = /^(?:[01]\d|2[0-4]):[0-5]\d$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function assertTime(value: string): string {
  if (!HM.test(value)) {
    throw new Error(`Invalid time "${value}": expected HH:MM between 00:00 and 24:00`)
  }
  return value
}

function assertDate(value: string): string {
  if (!ISO_DATE.test(value)) {
    throw new Error(`Invalid date "${value}": expected YYYY-MM-DD`)
  }
  return value
}

function toWeekdayNumber(day: Weekday | number): number {
  if (typeof day === 'number') {
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      throw new Error(`Invalid weekday ${day}: expected 1 (Monday) through 7 (Sunday)`)
    }
    return day
  }

  const number = WEEKDAY_NUMBERS[day]
  if (number === undefined) throw new Error(`Invalid weekday "${day}"`)
  return number
}

export function weekday(...days: Array<Weekday | number>): WorkingInterval {
  if (days.length === 0) throw new Error('weekday() needs at least one day')

  const numbers = [...new Set(days.map(toWeekdayNumber))].sort((a, b) => a - b)
  return {
    isWorking: true,
    recurrent: { weekdays: numbers, startTime: DAY_START, endTime: DAY_END },
  }
}

export function date(isoDate: string): WorkingInterval {
  const day = assertDate(isoDate)
  return { isWorking: true, startDate: day, endDate: day }
}

export function dates(isoDates: Array<string>): Array<WorkingInterval> {
  return isoDates.map(date)
}

export function dateRange(start: string, end: string): WorkingInterval {
  const from = assertDate(start)
  const to = assertDate(end)
  if (to < from) throw new Error(`dateRange(${start}, ${end}): end is before start`)
  return { isWorking: true, startDate: from, endDate: to }
}

export function between(startTime: string, endTime: string): WorkingInterval {
  const from = assertTime(startTime)
  const to = assertTime(endTime)
  if (to <= from) throw new Error(`between(${startTime}, ${endTime}): end is not after start`)
  return { isWorking: true, startTime: from, endTime: to }
}

export function after(startTime: string): WorkingInterval {
  return between(startTime, DAY_END)
}

export function before(endTime: string): WorkingInterval {
  return between(DAY_START, endTime)
}

interface Axes {
  weekdays?: Array<number>
  startTime?: string
  endTime?: string
  startDate?: string
  endDate?: string
}

function axesOf(fragment: WorkingInterval): Axes {
  const axes: Axes = {}

  if (fragment.recurrent) {
    axes.weekdays = fragment.recurrent.weekdays
    const { startTime, endTime } = fragment.recurrent
    if (startTime !== DAY_START || endTime !== DAY_END) {
      axes.startTime = startTime
      axes.endTime = endTime
    }
  } else if (fragment.startTime !== undefined || fragment.endTime !== undefined) {
    axes.startTime = fragment.startTime
    axes.endTime = fragment.endTime
  }

  if (fragment.startDate !== undefined) axes.startDate = fragment.startDate
  if (fragment.endDate !== undefined) axes.endDate = fragment.endDate

  return axes
}

export function merge(...fragments: Array<WorkingInterval>): WorkingInterval {
  if (fragments.length === 0) throw new Error('merge() needs at least one fragment')

  const combined: Axes = {}

  for (const fragment of fragments) {
    const axes = axesOf(fragment)

    if (axes.weekdays) {
      if (combined.weekdays) throw new Error('merge(): two fragments constrain weekdays')
      combined.weekdays = axes.weekdays
    }
    if (axes.startTime !== undefined || axes.endTime !== undefined) {
      if (combined.startTime !== undefined || combined.endTime !== undefined) {
        throw new Error('merge(): two fragments constrain time of day')
      }
      combined.startTime = axes.startTime
      combined.endTime = axes.endTime
    }
    if (axes.startDate !== undefined || axes.endDate !== undefined) {
      if (combined.startDate !== undefined || combined.endDate !== undefined) {
        throw new Error('merge(): two fragments constrain dates')
      }
      combined.startDate = axes.startDate
      combined.endDate = axes.endDate
    }
  }

  const interval: WorkingInterval = { isWorking: true }
  if (combined.startDate !== undefined) interval.startDate = combined.startDate
  if (combined.endDate !== undefined) interval.endDate = combined.endDate

  if (combined.weekdays) {
    interval.recurrent = {
      weekdays: combined.weekdays,
      startTime: combined.startTime ?? DAY_START,
      endTime: combined.endTime ?? DAY_END,
    }
    return interval
  }

  if (combined.startTime !== undefined) interval.startTime = combined.startTime
  if (combined.endTime !== undefined) interval.endTime = combined.endTime
  return interval
}

export interface ScheduleSpec {
  id: string
  label?: string
  parentId?: string
  timeZone?: string
  on: Array<WorkingInterval | Array<WorkingInterval>>
  except?: Array<WorkingInterval | Array<WorkingInterval>>
}

function flatten(
  entries: Array<WorkingInterval | Array<WorkingInterval>>,
  isWorking: boolean,
): Array<WorkingInterval> {
  return entries.flat().map((interval) => ({ ...interval, isWorking }))
}

export function compileSchedule(spec: ScheduleSpec): WorkingCalendar {
  const calendar: WorkingCalendar = {
    id: spec.id,
    intervals: [...flatten(spec.on, true), ...flatten(spec.except ?? [], false)],
  }

  if (spec.label !== undefined) calendar.label = spec.label
  if (spec.parentId !== undefined) calendar.parentId = spec.parentId
  if (spec.timeZone !== undefined) calendar.timeZone = spec.timeZone

  return calendar
}
