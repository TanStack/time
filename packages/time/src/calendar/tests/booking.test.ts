import { describe, expect, it } from 'vitest'
import { between, compileSchedule, dates, merge, weekday } from '~/workingTime'
import { createCalendar } from '../calendar'
import {
  bookingFeature,
  calendarFeatures,
  resourceAvailabilityFeature,
  workingTimeFeature,
} from '../features'
import type { SlotRule } from '~/slots'
import type { Event, Resource } from '../types'

type TestEvent = Event<Resource>

const TIME_ZONE = 'Europe/Warsaw'

const calendars = [
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
  }),
]

const slotRules: Array<SlotRule> = [
  { id: 'consult', calendarId: 'clinic-mornings', duration: 60, resourceIds: ['dr-a'] },
  {
    id: 'checkup',
    calendarId: 'clinic-afternoons',
    duration: 30,
    resourceIds: ['dr-a', 'dr-b'],
  },
]

const features = calendarFeatures([workingTimeFeature, resourceAvailabilityFeature, bookingFeature])

function makeCalendar(events: Array<TestEvent> = []) {
  return createCalendar<typeof features, Resource, TestEvent>({
    features,
    timeZone: TIME_ZONE,
    viewMode: { value: 1, unit: 'week' },
    resources: [
      { id: 'dr-a', label: 'Dr A' },
      { id: 'dr-b', label: 'Dr B' },
    ],
    calendars,
    slotRules,
    events,
  })
}

const RANGE = { start: '2026-06-01T00:00:00', end: '2026-06-11T00:00:00' }
const NOW = '2026-05-01T09:00:00'

const labelsOf = (slots: Array<{ start: Date }>) =>
  slots.map((slot) =>
    slot.start.toLocaleString('en-GB', { timeZone: TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }),
  )

describe('bookingFeature', () => {
  it('exposes the composed slot rules', () => {
    expect(makeCalendar().getSlotRules().map((rule) => rule.id)).toEqual(['consult', 'checkup'])
  })

  it('returns Date-bearing slots per ADR 0002', () => {
    const { slots } = makeCalendar().getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] })

    expect(slots[0]!.start).toBeInstanceOf(Date)
    expect(slots[0]!.end).toBeInstanceOf(Date)
    expect(labelsOf(slots).slice(0, 2)).toEqual(['01/06/2026, 08:00', '01/06/2026, 09:00'])
  })

  it('scopes rules to the requested resources', () => {
    const { slots } = makeCalendar().getSlots({
      ...RANGE,
      now: NOW,
      resourceIds: ['dr-b'],
    })

    expect([...new Set(slots.map((slot) => slot.ruleId))]).toEqual(['checkup'])
    expect(slots.every((slot) => slot.availableResourceIds.includes('dr-b'))).toBe(true)
  })

  it('books a slot through the write pipeline', () => {
    const calendar = makeCalendar()
    const [slot] = calendar.getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] }).slots

    const result = calendar.book(slot!, { id: 'booking-1', title: 'Consult' })

    expect(result.success).toBe(true)
    expect(calendar.getEvents().map((event) => event.id)).toEqual(['booking-1'])
  })

  it('stops offering a slot once it is booked', () => {
    const calendar = makeCalendar()
    const before = calendar.getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] }).slots
    calendar.book(before[0]!, { id: 'booking-1', title: 'Consult' })
    const after = calendar.getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] }).slots

    expect(after).toHaveLength(before.length - 1)
    expect(after[0]!.start.getTime()).toBe(before[1]!.start.getTime())
  })

  it('rejects a booking the availability stage vetoes', () => {
    const calendar = makeCalendar()
    const [slot] = calendar.getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] }).slots

    const outsideHours = {
      ...slot!,
      start: new Date(slot!.start.getTime() - 4 * 60 * 60_000),
      end: new Date(slot!.end.getTime() - 4 * 60 * 60_000),
    }

    const result = calendar.book(outsideHours, { id: 'booking-x', title: 'Too early' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.conflicts[0]?.code).toMatch(/^availability\//)
    }
    expect(calendar.getEvents()).toHaveLength(0)
  })

  it('every offered slot is one book() accepts', () => {
    const { slots } = makeCalendar().getSlots({ ...RANGE, now: NOW })

    slots.forEach((_, index) => {
      const fresh = makeCalendar()
      const candidate = fresh.getSlots({ ...RANGE, now: NOW }).slots[index]!
      expect(fresh.book(candidate, { id: `b${index}`, title: 'Booking' }).success).toBe(true)
    })
  })

  it('subtracts a live hold and forgets a lapsed one', () => {
    const calendar = makeCalendar()
    const [slot] = calendar.getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] }).slots

    calendar.hold(slot!, {
      id: 'hold-1',
      title: 'Checkout',
      expiresAt: '2026-05-01T09:10:00',
    })

    const whileHeld = calendar.getSlots({ ...RANGE, now: NOW, ruleIds: ['consult'] }).slots
    const afterLapse = calendar.getSlots({
      ...RANGE,
      now: '2026-05-01T09:20:00',
      ruleIds: ['consult'],
    }).slots

    expect(whileHeld[0]!.start.getTime()).not.toBe(slot!.start.getTime())
    expect(afterLapse[0]!.start.getTime()).toBe(slot!.start.getTime())
  })

  it('reports no unbacked ranges when the collection is complete', () => {
    expect(makeCalendar().getSlots({ ...RANGE, now: NOW }).unbackedRanges).toEqual([])
  })

  it('reports the unbacked range when events are fetched lazily', () => {
    const calendar = createCalendar<typeof features, Resource, TestEvent>({
      features,
      timeZone: TIME_ZONE,
      viewMode: { value: 1, unit: 'week' },
      resources: [{ id: 'dr-a', label: 'Dr A' }],
      calendars,
      slotRules,
      events: [],
      fetchEvents: () => Promise.resolve([]),
    })

    const { unbackedRanges } = calendar.getSlots({ ...RANGE, now: NOW })

    expect(unbackedRanges).toHaveLength(1)
    expect(unbackedRanges[0]!.start).toBeInstanceOf(Date)
  })
})
