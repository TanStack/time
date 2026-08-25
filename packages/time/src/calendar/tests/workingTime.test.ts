import { describe, expect, it } from 'vitest'
import { createCalendar } from '../calendar'
import { calendarFeatures, resourceAvailabilityFeature, workingTimeFeature } from '../features'
import type { CalendarFeatureList } from '../features'
import type { Event, Resource } from '../types'
import type { WorkingCalendar } from '~/workingTime'

type TestEvent = Event<Resource>

const MONDAY = '2026-01-05'
const TUESDAY = '2026-01-06'

const calendars: Array<WorkingCalendar> = [
  {
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
  },
  {
    id: 'early',
    parentId: 'office',
    intervals: [
      {
        isWorking: true,
        recurrent: {
          weekdays: [1, 2, 3, 4, 5],
          startTime: '07:00',
          endTime: '09:00',
        },
      },
    ],
  },
  {
    id: 'late-exception',
    intervals: [
      {
        isWorking: true,
        startDate: MONDAY,
        endDate: MONDAY,
        startTime: '17:00',
        endTime: '20:00',
      },
    ],
  },
]

const resources: Array<Resource> = [
  { id: 'r1', label: 'Early Room', calendarId: 'early' },
  { id: 'r2', label: 'Office Room', calendarId: 'office' },
]

function createTestCalendar<TFeatures extends CalendarFeatureList>(features: TFeatures) {
  return createCalendar<TFeatures, Resource, TestEvent>({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    resources,
    calendars,
    defaultCalendarId: 'office',
    features,
  })
}

const cal = createTestCalendar(calendarFeatures([workingTimeFeature]))

describe('workingTimeFeature', () => {
  it('names the calendar that governs a target', () => {
    expect(cal.getEffectiveCalendar({ resourceId: 'r1' })).toBe('early')
    expect(cal.getEffectiveCalendar()).toBe('office')
    expect(cal.getEffectiveCalendar({ resourceId: 'gone' })).toBe('office')
    expect(cal.getEffectiveCalendar({ calendarId: 'late-exception' })).toBe('late-exception')
  })

  it('resolves a resource through its parent chain', () => {
    expect(
      cal.getWorkingIntervals(
        { start: `${MONDAY}T00:00:00`, end: `${TUESDAY}T00:00:00` },
        { resourceId: 'r1' },
      ),
    ).toEqual([{ start: `${MONDAY}T07:00:00`, end: `${MONDAY}T17:00:00` }])
  })

  it('splits a multi-day range into one interval per day', () => {
    expect(
      cal.getWorkingIntervals({
        start: `${MONDAY}T00:00:00`,
        end: '2026-01-07T00:00:00',
      }),
    ).toEqual([
      { start: `${MONDAY}T09:00:00`, end: `${MONDAY}T17:00:00` },
      { start: `${TUESDAY}T09:00:00`, end: `${TUESDAY}T17:00:00` },
    ])
  })

  it('unions the calendars of several resources', () => {
    expect(
      cal.getWorkingIntervals(
        { start: `${MONDAY}T00:00:00`, end: `${TUESDAY}T00:00:00` },
        { resourceIds: ['r1', 'r2'] },
      ),
    ).toEqual([{ start: `${MONDAY}T07:00:00`, end: `${MONDAY}T17:00:00` }])
  })

  it('layers an event calendar over the resource calendar', () => {
    expect(
      cal.getWorkingIntervals(
        { start: `${MONDAY}T00:00:00`, end: `${TUESDAY}T00:00:00` },
        { resourceId: 'r2', calendarId: 'late-exception' },
      ),
    ).toEqual([{ start: `${MONDAY}T09:00:00`, end: `${MONDAY}T20:00:00` }])
  })

  it('reports the minutes a target works and the minutes it does not', () => {
    expect(cal.getWorkingMinutes(MONDAY, { resourceId: 'r2' })).toEqual([
      { startMinutes: 540, endMinutes: 1020 },
    ])
    expect(cal.getNonWorkingMinutes(MONDAY, { resourceId: 'r2' })).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1440 },
    ])
  })

  it('answers whether a whole range is working time', () => {
    const range = { start: `${MONDAY}T08:00:00`, end: `${MONDAY}T10:00:00` }

    expect(cal.isWorkingTime(range, { resourceId: 'r1' })).toBe(true)
    expect(cal.isWorkingTime(range, { resourceId: 'r2' })).toBe(false)
    expect(
      cal.isWorkingTime(
        { start: `${MONDAY}T17:00:00`, end: `${MONDAY}T18:00:00` },
        { resourceId: 'r2', calendarId: 'late-exception' },
      ),
    ).toBe(true)
  })

  it('is not working time across a gap between two working spans', () => {
    expect(
      cal.isWorkingTime(
        { start: `${MONDAY}T16:00:00`, end: `${TUESDAY}T10:00:00` },
        { resourceId: 'r2' },
      ),
    ).toBe(false)
  })

  it('has no working time for a resource that is not assigned', () => {
    expect(
      cal.getWorkingIntervals(
        { start: `${MONDAY}T00:00:00`, end: `${TUESDAY}T00:00:00` },
        { resourceIds: [] },
      ),
    ).toEqual([])
  })

  it("backs the availability feature's shading read", () => {
    const composed = createTestCalendar(
      calendarFeatures([workingTimeFeature, resourceAvailabilityFeature]),
    )

    expect(composed.getUnavailableMinuteRanges(MONDAY, { resourceIds: ['r2'] })).toEqual(
      composed.getNonWorkingMinutes(MONDAY, { resourceIds: ['r2'] }),
    )
  })

  it('refuses to compose availability without it', () => {
    expect(() => createTestCalendar(calendarFeatures([resourceAvailabilityFeature]))).toThrow(
      /"availability" requires "workingTime"/,
    )
  })
})
