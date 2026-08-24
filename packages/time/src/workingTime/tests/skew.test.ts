import { describe, expect, it } from 'vitest'
import { addWorkingMinutes, MAX_WORKING_SKEW_DAYS, nextWorkingInstant } from '../skew'
import { workingMinutesBetween } from '~/validation/duration'
import type { WorkingCalendar } from '../types'

const OFFICE: WorkingCalendar = {
  id: 'office',
  intervals: [
    {
      isWorking: true,
      recurrent: {
        weekdays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00',
      },
    },
  ],
}

const SPLIT_SHIFT: WorkingCalendar = {
  id: 'split',
  intervals: [
    {
      isWorking: true,
      recurrent: {
        weekdays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '12:00',
      },
    },
    {
      isWorking: true,
      recurrent: {
        weekdays: [1, 2, 3, 4, 5],
        startTime: '13:00',
        endTime: '17:00',
      },
    },
  ],
}

const CLOSED: WorkingCalendar = {
  id: 'closed',
  intervals: [
    {
      isWorking: false,
      recurrent: {
        weekdays: [1, 2, 3, 4, 5, 6, 7],
        startTime: '00:00',
        endTime: '23:59',
      },
    },
  ],
}

const OFFICE_LAYERS = [['office']]
const SPLIT_LAYERS = [['split']]

const FRI = '2026-03-06'
const SAT = '2026-03-07'
const MON = '2026-03-09'

describe('nextWorkingInstant', () => {
  it('returns the instant unchanged when it already falls in working time', () => {
    expect(nextWorkingInstant(`${FRI}T10:00:00`, OFFICE_LAYERS, [OFFICE])).toBe(`${FRI}T10:00:00`)
  })

  it("moves forward to the start of the day's work", () => {
    expect(nextWorkingInstant(`${FRI}T06:00:00`, OFFICE_LAYERS, [OFFICE])).toBe(`${FRI}T09:00:00`)
  })

  it('skips the weekend when the instant is after hours on a Friday', () => {
    expect(nextWorkingInstant(`${FRI}T18:00:00`, OFFICE_LAYERS, [OFFICE])).toBe(`${MON}T09:00:00`)
  })

  it('skips a non-working day entirely', () => {
    expect(nextWorkingInstant(`${SAT}T10:00:00`, OFFICE_LAYERS, [OFFICE])).toBe(`${MON}T09:00:00`)
  })

  it('lands in the afternoon span when the morning one is already past', () => {
    expect(nextWorkingInstant(`${FRI}T12:30:00`, SPLIT_LAYERS, [SPLIT_SHIFT])).toBe(
      `${FRI}T13:00:00`,
    )
  })

  it('passes the instant through untouched when no calendar is configured', () => {
    expect(nextWorkingInstant(`${SAT}T03:00:00`, [[undefined]], [])).toBe(`${SAT}T03:00:00`)
  })

  it('gives up rather than searching forever when nothing is ever working', () => {
    expect(nextWorkingInstant(`${FRI}T10:00:00`, [['closed']], [CLOSED])).toBe(null)
  })
})

describe('addWorkingMinutes', () => {
  it('stays inside one working span', () => {
    expect(addWorkingMinutes(`${FRI}T09:00:00`, 120, OFFICE_LAYERS, [OFFICE])).toBe(
      `${FRI}T11:00:00`,
    )
  })

  it('lands exactly on the end of a span without spilling into the next day', () => {
    expect(addWorkingMinutes(`${FRI}T09:00:00`, 480, OFFICE_LAYERS, [OFFICE])).toBe(
      `${FRI}T17:00:00`,
    )
  })

  it('carries the remainder across the weekend', () => {
    expect(addWorkingMinutes(`${FRI}T15:00:00`, 240, OFFICE_LAYERS, [OFFICE])).toBe(
      `${MON}T11:00:00`,
    )
  })

  it('counts from the start of work when the start is before hours', () => {
    expect(addWorkingMinutes(`${FRI}T06:00:00`, 60, OFFICE_LAYERS, [OFFICE])).toBe(
      `${FRI}T10:00:00`,
    )
  })

  it('jumps the midday break instead of counting it', () => {
    expect(addWorkingMinutes(`${FRI}T11:00:00`, 120, SPLIT_LAYERS, [SPLIT_SHIFT])).toBe(
      `${FRI}T14:00:00`,
    )
  })

  it('snaps a zero-minute span to the next working instant', () => {
    expect(addWorkingMinutes(`${SAT}T10:00:00`, 0, OFFICE_LAYERS, [OFFICE])).toBe(`${MON}T09:00:00`)
  })

  it('falls back to wall clock when no calendar is configured', () => {
    expect(addWorkingMinutes(`${SAT}T22:00:00`, 180, [[undefined]], [])).toBe('2026-03-08T01:00:00')
  })

  it('gives up rather than searching forever when nothing is ever working', () => {
    expect(addWorkingMinutes(`${FRI}T10:00:00`, 60, [['closed']], [CLOSED])).toBe(null)
  })

  it('reports exhaustion when the duration outruns the search horizon', () => {
    const minutes = MAX_WORKING_SKEW_DAYS * 8 * 60

    expect(addWorkingMinutes(`${MON}T09:00:00`, minutes, OFFICE_LAYERS, [OFFICE])).toBe(null)
  })
})

describe('skew is the inverse of workingMinutesBetween', () => {
  const cases: Array<{ start: string; minutes: number }> = [
    { start: `${FRI}T09:00:00`, minutes: 120 },
    { start: `${FRI}T15:00:00`, minutes: 240 },
    { start: `${MON}T09:30:00`, minutes: 30 },
    { start: `${MON}T09:00:00`, minutes: 2400 },
  ]

  it.each(cases)(
    'measuring back from $start + $minutes working minutes returns $minutes',
    ({ start, minutes }) => {
      const end = addWorkingMinutes(start, minutes, OFFICE_LAYERS, [OFFICE])
      expect(end).not.toBe(null)

      expect(
        workingMinutesBetween({ start, end: end! }, [], {
          calendars: [OFFICE],
          defaultCalendarId: 'office',
        }),
      ).toBe(minutes)
    },
  )
})
