import { describe, expect, it } from 'vitest'
import { between, compileSchedule, dates, merge, weekday } from '~/workingTime'
import { generateSlots } from '../generateSlots'
import type { WorkingCalendar } from '~/workingTime'
import type { GenerateSlotsInput, SlotRule } from '../types'

const TIME_ZONE = 'Europe/Warsaw'

const calendars: Array<WorkingCalendar> = [
  compileSchedule({
    id: 'clinic-mornings',
    timeZone: TIME_ZONE,
    on: [merge(weekday('monday', 'wednesday'), between('08:00', '10:00'))],
    except: dates(['2026-06-08']),
  }),
  compileSchedule({
    id: 'clinic-afternoons',
    timeZone: TIME_ZONE,
    on: [merge(weekday('monday', 'wednesday'), between('12:00', '16:00'))],
    except: dates(['2026-06-08']),
  }),
]

const consult: SlotRule = {
  id: 'consult',
  calendarId: 'clinic-mornings',
  duration: 60,
  resourceIds: ['dr-a'],
}

const checkup: SlotRule = {
  id: 'checkup',
  calendarId: 'clinic-afternoons',
  duration: 30,
  resourceIds: ['dr-a', 'dr-b'],
}

function run(overrides: Partial<GenerateSlotsInput> = {}) {
  return generateSlots({
    rules: [consult, checkup],
    range: { start: '2026-06-01T00:00:00', end: '2026-06-11T00:00:00' },
    now: '2026-05-01T09:00:00',
    timeZone: TIME_ZONE,
    calendars,
    resources: [{ id: 'dr-a' }, { id: 'dr-b' }],
    events: [],
    ...overrides,
  })
}

const startsOf = (ruleId: string, result = run()) =>
  result.slots.filter((slot) => slot.ruleId === ruleId).map((slot) => slot.start)

describe('generateSlots', () => {
  it('lays each rule on its own calendar at its own granularity', () => {
    expect(startsOf('consult')).toEqual([
      '2026-06-01T08:00:00',
      '2026-06-01T09:00:00',
      '2026-06-03T08:00:00',
      '2026-06-03T09:00:00',
      '2026-06-10T08:00:00',
      '2026-06-10T09:00:00',
    ])

    expect(startsOf('checkup').filter((start) => start.startsWith('2026-06-01'))).toEqual([
      '2026-06-01T12:00:00',
      '2026-06-01T12:30:00',
      '2026-06-01T13:00:00',
      '2026-06-01T13:30:00',
      '2026-06-01T14:00:00',
      '2026-06-01T14:30:00',
      '2026-06-01T15:00:00',
      '2026-06-01T15:30:00',
    ])
  })

  it('generates nothing on an excepted date', () => {
    expect(run().slots.filter((slot) => slot.start.startsWith('2026-06-08'))).toEqual([])
  })

  it('anchors to the window start and drops the overflowing tail', () => {
    const result = generateSlots({
      rules: [{ id: 'odd', calendarId: 'odd-window', duration: 30 }],
      range: { start: '2026-06-01T00:00:00', end: '2026-06-02T00:00:00' },
      now: '2026-05-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars: [
        compileSchedule({
          id: 'odd-window',
          on: [merge(weekday('monday'), between('08:15', '10:00'))],
        }),
      ],
    })

    expect(result.slots.map((slot) => slot.start)).toEqual([
      '2026-06-01T08:15:00',
      '2026-06-01T08:45:00',
      '2026-06-01T09:15:00',
    ])
  })

  it('offers rolling candidates when step is smaller than duration', () => {
    const result = generateSlots({
      rules: [{ id: 'rolling', calendarId: 'clinic-mornings', duration: 60, step: 15 }],
      range: { start: '2026-06-01T00:00:00', end: '2026-06-02T00:00:00' },
      now: '2026-05-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars,
    })

    expect(result.slots.map((slot) => slot.start)).toEqual([
      '2026-06-01T08:00:00',
      '2026-06-01T08:15:00',
      '2026-06-01T08:30:00',
      '2026-06-01T08:45:00',
      '2026-06-01T09:00:00',
    ])
  })
})

describe('generateSlots occupancy', () => {
  it('drops a slot an existing booking overlaps', () => {
    const result = run({
      events: [
        {
          id: 'taken',
          start: '2026-06-01T08:00:00',
          end: '2026-06-01T09:00:00',
          resourceIds: ['dr-a'],
        },
      ],
    })

    expect(startsOf('consult', result)).not.toContain('2026-06-01T08:00:00')
    expect(startsOf('consult', result)).toContain('2026-06-01T09:00:00')
  })

  it('keeps a slot free for the resources that are still free', () => {
    const result = run({
      events: [
        {
          id: 'taken',
          start: '2026-06-01T12:00:00',
          end: '2026-06-01T12:30:00',
          resourceIds: ['dr-a'],
        },
      ],
    })

    const slot = result.slots.find(
      (candidate) => candidate.ruleId === 'checkup' && candidate.start === '2026-06-01T12:00:00',
    )

    expect(slot?.availableResourceIds).toEqual(['dr-b'])
  })

  it('survives bookings until capacity is exhausted', () => {
    const room = { id: 'room', capacity: [3] }
    const rule: SlotRule = {
      id: 'class',
      calendarId: 'clinic-mornings',
      duration: 60,
      resourceIds: ['room'],
    }
    const booking = (id: string) => ({
      id,
      start: '2026-06-01T08:00:00',
      end: '2026-06-01T09:00:00',
      resourceIds: ['room'],
    })

    const remaining = (count: number) =>
      generateSlots({
        rules: [rule],
        range: { start: '2026-06-01T00:00:00', end: '2026-06-02T00:00:00' },
        now: '2026-05-01T00:00:00',
        timeZone: TIME_ZONE,
        calendars,
        resources: [room],
        events: Array.from({ length: count }, (_, index) => booking(`b${index}`)),
      }).slots.find((slot) => slot.start === '2026-06-01T08:00:00')?.remainingCapacity

    expect(remaining(0)).toBe(3)
    expect(remaining(1)).toBe(2)
    expect(remaining(2)).toBe(1)
    expect(remaining(3)).toBeUndefined()
  })

  it('pushes the next slot out by the rule buffer', () => {
    const buffered = { ...checkup, bufferAfter: 15, resourceIds: ['dr-a'] }
    const result = generateSlots({
      rules: [buffered],
      range: { start: '2026-06-01T00:00:00', end: '2026-06-02T00:00:00' },
      now: '2026-05-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars,
      resources: [{ id: 'dr-a' }],
      events: [
        {
          id: 'taken',
          start: '2026-06-01T12:00:00',
          end: '2026-06-01T13:00:00',
          resourceIds: ['dr-a'],
        },
      ],
    })

    const starts = result.slots.map((slot) => slot.start)
    expect(starts).not.toContain('2026-06-01T13:00:00')
    expect(starts).toContain('2026-06-01T13:30:00')
  })

  it('takes the larger of the rule buffer and the resource buffer', () => {
    const generous = { id: 'dr-a', buffer: { after: 60 } }
    const result = generateSlots({
      rules: [{ ...checkup, bufferAfter: 15, resourceIds: ['dr-a'] }],
      range: { start: '2026-06-01T00:00:00', end: '2026-06-02T00:00:00' },
      now: '2026-05-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars,
      resources: [generous],
      events: [
        {
          id: 'taken',
          start: '2026-06-01T12:00:00',
          end: '2026-06-01T13:00:00',
          resourceIds: ['dr-a'],
        },
      ],
    })

    const starts = result.slots.map((slot) => slot.start)
    expect(starts).not.toContain('2026-06-01T13:30:00')
    expect(starts).toContain('2026-06-01T14:00:00')
  })

  it('subtracts a live hold and ignores a lapsed one', () => {
    const hold = (expiresAt: string) => ({
      id: 'hold',
      start: '2026-06-01T08:00:00',
      end: '2026-06-01T09:00:00',
      resourceIds: ['dr-a'],
      expiresAt,
    })

    const held = run({ now: '2026-06-01T07:00:00', events: [hold('2026-06-01T07:10:00')] })
    const lapsed = run({ now: '2026-06-01T07:20:00', events: [hold('2026-06-01T07:10:00')] })

    expect(startsOf('consult', held)).not.toContain('2026-06-01T08:00:00')
    expect(startsOf('consult', lapsed)).toContain('2026-06-01T08:00:00')
  })

  it('counts every event when the rule names no resources', () => {
    const soloRule: SlotRule = { id: 'solo', calendarId: 'clinic-mornings', duration: 60 }
    const result = generateSlots({
      rules: [soloRule],
      range: { start: '2026-06-01T00:00:00', end: '2026-06-02T00:00:00' },
      now: '2026-05-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars,
      events: [{ id: 'anything', start: '2026-06-01T08:00:00', end: '2026-06-01T09:00:00' }],
    })

    expect(result.slots.map((slot) => slot.start)).toEqual(['2026-06-01T09:00:00'])
  })
})

describe('generateSlots now-relative limits', () => {
  it('never offers the past', () => {
    const result = run({ now: '2026-06-01T08:30:00' })
    expect(startsOf('consult', result)[0]).toBe('2026-06-01T09:00:00')
  })

  it('counts working-time notice differently from wall notice', () => {
    const notice = (isWorkingTime: boolean) =>
      generateSlots({
        rules: [{ ...checkup, minNotice: 240, minNoticeIsWorkingTime: isWorkingTime }],
        range: { start: '2026-06-01T00:00:00', end: '2026-06-11T00:00:00' },
        now: '2026-06-01T09:30:00',
        timeZone: TIME_ZONE,
        calendars,
        resources: [{ id: 'dr-a' }, { id: 'dr-b' }],
      }).slots[0]?.start

    expect(notice(false)).toBe('2026-06-01T13:30:00')
    expect(notice(true)).toBe('2026-06-03T12:00:00')
  })

  it('clamps the far end to maxHorizon', () => {
    const result = generateSlots({
      rules: [{ ...consult, maxHorizon: 2 }],
      range: { start: '2026-06-01T00:00:00', end: '2026-06-11T00:00:00' },
      now: '2026-06-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars,
      resources: [{ id: 'dr-a' }],
    })

    expect([...new Set(result.slots.map((slot) => slot.start.slice(0, 10)))]).toEqual([
      '2026-06-01',
      '2026-06-03',
    ])
  })

  it('reports truncation instead of returning a silent prefix', () => {
    const result = run({ maxSlots: 3 })
    expect(result.slots).toHaveLength(3)
    expect(result.truncated).toBe(true)
    expect(run().truncated).toBe(false)
  })

  it('declares the event range it needed', () => {
    const result = run()
    expect(result.requiredRange.start).toBe('2026-06-01T00:00:00')
    expect(result.requiredRange.end).toBe('2026-06-11T00:00:00')
  })
})

describe('generateSlots across DST', () => {
  const nightly = [
    compileSchedule({
      id: 'nightly',
      timeZone: TIME_ZONE,
      on: [between('01:00', '05:00')],
    }),
  ]

  const onDay = (day: string) =>
    generateSlots({
      rules: [{ id: 'night', calendarId: 'nightly', duration: 30 }],
      range: { start: `${day}T00:00:00`, end: `${day}T23:59:00` },
      now: '2026-01-01T00:00:00',
      timeZone: TIME_ZONE,
      calendars: nightly,
    }).slots

  it('drops slots that start inside the spring-forward gap', () => {
    const starts = onDay('2026-03-29').map((slot) => slot.start.slice(11, 16))
    expect(starts).not.toContain('02:00')
    expect(starts).not.toContain('02:30')
    expect(starts).toEqual(['01:00', '01:30', '03:00', '03:30', '04:00', '04:30'])
  })

  it('keeps both fall-back repeats as distinct instants', () => {
    const repeats = onDay('2026-10-25').filter((slot) => slot.start.endsWith('T02:00:00'))
    expect(repeats).toHaveLength(2)
    expect(repeats[0]!.startEpochMs).toBeLessThan(repeats[1]!.startEpochMs)
    expect(repeats[1]!.startEpochMs - repeats[0]!.startEpochMs).toBe(3_600_000)
  })

  it('keeps every slot exactly one duration of real time', () => {
    for (const slot of [...onDay('2026-03-29'), ...onDay('2026-10-25')]) {
      expect(slot.endEpochMs - slot.startEpochMs).toBe(30 * 60_000)
    }
  })
})
