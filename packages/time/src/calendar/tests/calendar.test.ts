import { describe, expect, test } from 'vitest'
import { CalendarCore } from '../calendar'
import type { Event, Resource } from '../types'
import { toPlainDateTimeString } from '~/date/parse'

type TestResource = Resource
type TestEvent = Event<TestResource>

function createCalendar(
  overrides: Partial<
    ConstructorParameters<typeof CalendarCore<TestResource, TestEvent>>[0]
  > = {},
) {
  return new CalendarCore<TestResource, TestEvent>({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    ...overrides,
  })
}

const weekdayResource: TestResource = {
  id: 'r1',
  label: 'Weekday Room',
  capacity: [2],
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
  ],
}

const afternoonResource: TestResource = {
  id: 'r2',
  label: 'Afternoon Room',
  capacity: [1],
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: '12:00', endTime: '18:00' },
  ],
}

const allDayResource: TestResource = {
  id: 'r3',
  label: 'All Day Room',
  availability: [
    { weekdays: [1, 2, 3, 4, 5, 6, 7], startTime: '00:00', endTime: '24:00' },
  ],
}

const noAvailabilityResource: TestResource = {
  id: 'r4',
  label: 'No Availability Room',
}

const DATE_MON = '2024-03-18'
const DATE_TUE = '2024-03-19'

describe('CalendarCore', () => {
  describe('constructor', () => {
    test('initializes with events and resources', () => {
      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event 1',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ]

      const cal = createCalendar({
        events,
        resources: [weekdayResource],
      })

      expect(cal.getEvents()).toHaveLength(1)
      expect(cal.getEvents()[0]?.id).toBe('e1')
    })

    test('normalizes date-only event start/end to full datetime', () => {
      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event',
          start: DATE_MON,
          end: DATE_TUE,
        },
      ]

      const cal = createCalendar({ events })
      const e = cal.getEvents()[0]!
      expect(e.start).toBe(`${DATE_MON}T00:00:00`)
      expect(e.end).toBe(`${DATE_TUE}T00:00:00`)
    })

    test('normalizes partial datetime event start/end', () => {
      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event',
          start: `${DATE_MON}T09`,
          end: `${DATE_MON}T10`,
        },
      ]

      const cal = createCalendar({ events })
      const e = cal.getEvents()[0]!
      expect(e.start).toBe(`${DATE_MON}T09:00:00`)
      expect(e.end).toBe(`${DATE_MON}T10:00:00`)
    })

    test('normalizes Date objects in event start/end', () => {
      const startDate = new Date(2024, 2, 18, 9, 0, 0)
      const endDate = new Date(2024, 2, 18, 10, 0, 0)

      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event',
          start: startDate,
          end: endDate,
        },
      ]

      const cal = createCalendar({ events })
      const e = cal.getEvents()[0]!
      expect(e.start).toBe('2024-03-18T09:00:00')
      expect(e.end).toBe('2024-03-18T10:00:00')
    })
  })

  describe('getEventsByDate', () => {
    test('returns events matching the date', () => {
      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event 1',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
        {
          id: 'e2',
          title: 'Event 2',
          start: `${DATE_TUE}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
        },
      ]

      const cal = createCalendar({ events })
      const monEvents = cal.getEventsByDate(DATE_MON)
      expect(monEvents).toHaveLength(1)
      expect(monEvents[0]!.id).toBe('e1')
    })

    test('returns empty array for date without events', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_TUE}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
          },
        ],
      })

      expect(cal.getEventsByDate(DATE_MON)).toHaveLength(0)
    })

    test('splits multi-day events across dates', () => {
      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
        },
      ]

      const cal = createCalendar({ events })
      const monEvents = cal.getEventsByDate(DATE_MON)
      const tueEvents = cal.getEventsByDate(DATE_TUE)

      expect(monEvents).toHaveLength(1)
      expect(tueEvents).toHaveLength(1)
      expect(monEvents[0]!.id).toBe('e1')
      expect(tueEvents[0]!.id).toBe('e1')
    })

    test('returns empty when no events configured', () => {
      const cal = createCalendar({ events: [] })
      expect(cal.getEventsByDate(DATE_MON)).toHaveLength(0)
    })
  })

  describe('commitAdd', () => {
    test('adds an event to an empty calendar', () => {
      const cal = createCalendar()
      const event: TestEvent = {
        id: 'e1',
        title: 'New Event',
        start: `${DATE_MON}T09:00:00`,
        end: `${DATE_MON}T10:00:00`,
      }

      cal.commitAdd(event)
      expect(cal.getEvents()).toHaveLength(1)
      expect(cal.getEvents()[0]!.id).toBe('e1')
    })

    test('adds an event to existing events', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Existing',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.commitAdd({
        id: 'e2',
        title: 'New',
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      })

      expect(cal.getEvents()).toHaveLength(2)
    })

    test('normalizes date-only start/end when adding event', () => {
      const cal = createCalendar()
      cal.commitAdd({
        id: 'e1',
        title: 'Event',
        start: DATE_MON,
        end: DATE_TUE,
      })

      const e = cal.getEvents()[0]!
      expect(e.start).toBe(`${DATE_MON}T00:00:00`)
      expect(e.end).toBe(`${DATE_TUE}T00:00:00`)
    })

    test('normalizes Date objects when adding event', () => {
      const cal = createCalendar()
      cal.commitAdd({
        id: 'e1',
        title: 'Event',
        start: new Date(2024, 2, 18, 9, 0, 0),
        end: new Date(2024, 2, 18, 10, 0, 0),
      })

      const e = cal.getEvents()[0]!
      expect(e.start).toBe('2024-03-18T09:00:00')
      expect(e.end).toBe('2024-03-18T10:00:00')
    })
  })

  describe('commitUpdate', () => {
    test('updates an existing event', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Original',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.commitUpdate('e1', { title: 'Updated' })
      expect(cal.getEvents()[0]!.title).toBe('Updated')
    })

    test('updates start/end times', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.commitUpdate('e1', {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      })

      const e = cal.getEvents()[0]!
      expect(e.start).toBe(`${DATE_MON}T10:00:00`)
      expect(e.end).toBe(`${DATE_MON}T11:00:00`)
    })

    test('normalizes date-only start/end when updating event', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.commitUpdate('e1', {
        start: DATE_TUE,
        end: `${DATE_TUE}T12:00:00`,
      })

      const e = cal.getEvents()[0]!
      expect(e.start).toBe(`${DATE_TUE}T00:00:00`)
      expect(e.end).toBe(`${DATE_TUE}T12:00:00`)
    })

    test('normalizes Date objects when updating event', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.commitUpdate('e1', {
        start: new Date(2024, 2, 19, 10, 0, 0),
        end: new Date(2024, 2, 19, 11, 0, 0),
      })

      const e = cal.getEvents()[0]!
      expect(e.start).toBe('2024-03-19T10:00:00')
      expect(e.end).toBe('2024-03-19T11:00:00')
    })

    test('does nothing when event not found', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Original',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.commitUpdate('nonexistent', { title: 'Updated' })
      expect(cal.getEvents()).toHaveLength(1)
      expect(cal.getEvents()[0]!.title).toBe('Original')
    })

    test('does nothing when events is null', () => {
      const cal = createCalendar()
      cal.commitUpdate('e1', { title: 'Updated' })
      expect(cal.getEvents()).toHaveLength(0)
    })
  })

  describe('removeEvent', () => {
    test('removes an existing event', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event 1',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
          {
            id: 'e2',
            title: 'Event 2',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
          },
        ],
      })

      cal.removeEvent('e1')
      expect(cal.getEvents()).toHaveLength(1)
      expect(cal.getEvents()[0]!.id).toBe('e2')
    })

    test('does nothing when event not found', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.removeEvent('nonexistent')
      expect(cal.getEvents()).toHaveLength(1)
    })

    test('does nothing when events is null', () => {
      const cal = createCalendar()
      expect(() => cal.removeEvent('e1')).not.toThrow()
    })
  })

  describe('getUnavailableRanges', () => {
    test('returns empty when no resources', () => {
      const cal = createCalendar({ resources: [] })
      expect(
        cal.getUnavailableRanges(DATE_MON, { containerHeight: 800 }),
      ).toHaveLength(0)
    })

    test('returns full day unavailable when resource has no availability for that weekday', () => {
      const weekendOnlyResource: TestResource = {
        id: 'r-wknd',
        label: 'Weekend Only',
        availability: [
          { weekdays: [6, 7], startTime: '09:00', endTime: '17:00' },
        ],
      }

      const cal = createCalendar({
        resources: [weekendOnlyResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 800,
        resourceIds: ['r-wknd'],
      })

      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.top).toBe(0)
      expect(ranges[0]!.height).toBe(800)
    })

    test('returns unavailable ranges before and after availability window', () => {
      const cal = createCalendar({
        resources: [weekdayResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 540,
        resourceIds: ['r1'],
      })

      expect(ranges).toHaveLength(2)
      expect(ranges[0]).toMatchObject({
        top: 0,
        startTime: '00:00',
        endTime: '08:00',
      })
      expect(ranges[1]).toMatchObject({
        startTime: '17:00',
        endTime: '24:00',
      })
    })

    test('merges overlapping availability from multiple resources', () => {
      const cal = createCalendar({
        resources: [weekdayResource, afternoonResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 540,
      })

      expect(ranges).toHaveLength(2)
    })

    test('filters by resourceIds when provided', () => {
      const cal = createCalendar({
        resources: [weekdayResource, afternoonResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 540,
        resourceIds: ['r2'],
      })

      expect(ranges).toHaveLength(2)
    })

    test('returns no unavailable ranges for all-day resource', () => {
      const cal = createCalendar({
        resources: [allDayResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 800,
        resourceIds: ['r3'],
      })

      expect(ranges).toHaveLength(0)
    })

    test('returns full day when resource has no availability config', () => {
      const cal = createCalendar({
        resources: [noAvailabilityResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 800,
        resourceIds: ['r4'],
      })

      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.height).toBe(800)
    })

    test('scales pixel positions to containerHeight', () => {
      const cal = createCalendar({
        resources: [weekdayResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 540,
        resourceIds: ['r1'],
      })

      expect(ranges[0]!.height).toBeLessThan(540)
    })
  })

  describe('getUnavailabilityDetails', () => {
    test('returns empty when no resources', () => {
      const cal = createCalendar({ resources: [] })
      expect(cal.getUnavailabilityDetails(DATE_MON, 0, 1440)).toHaveLength(0)
    })

    test('returns no-availability for resource without availability config', () => {
      const cal = createCalendar({
        resources: [noAvailabilityResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 0, 1440, {
        resourceIds: ['r4'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.reason).toBe('no-availability')
      expect(details[0]!.resourceId).toBe('r4')
    })

    test('returns outside-hours when resource not available on that weekday', () => {
      const weekendResource: TestResource = {
        id: 'r-wknd',
        label: 'Weekend Only',
        availability: [
          { weekdays: [6, 7], startTime: '09:00', endTime: '17:00' },
        ],
      }

      const cal = createCalendar({
        resources: [weekendResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
        resourceIds: ['r-wknd'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.reason).toBe('outside-hours')
      expect(details[0]!.resourceId).toBe('r-wknd')
    })

    test('returns outside-hours when time range exceeds availability window', () => {
      const cal = createCalendar({
        resources: [weekdayResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 7 * 60, 10 * 60, {
        resourceIds: ['r1'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.reason).toBe('outside-hours')
      expect(details[0]!.resourceId).toBe('r1')
    })

    test('returns empty when time range is within availability', () => {
      const cal = createCalendar({
        resources: [weekdayResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
        resourceIds: ['r1'],
      })

      expect(details).toHaveLength(0)
    })

    test('checks multiple resources independently', () => {
      const cal = createCalendar({
        resources: [weekdayResource, noAvailabilityResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
        resourceIds: ['r1', 'r4'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.resourceId).toBe('r4')
    })

    test('uses all resources when resourceIds not specified', () => {
      const cal = createCalendar({
        resources: [weekdayResource, noAvailabilityResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60)

      expect(details).toHaveLength(1)
    })
  })

  describe('validateResize', () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    }

    describe('same-day resize within availability', () => {
      test('allows extending bottom edge within available time', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })

      test('allows shrinking top edge within available time', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'top',
          totalDeltaMinutes: -60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })
    })

    describe('same-day resize blocked by availability', () => {
      test('blocks extending bottom edge into unavailable time', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })

      test('blocks extending top edge into unavailable time', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'top',
          totalDeltaMinutes: -90,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })
    })

    describe('capacity constraints', () => {
      test('allows resize when event already coexists with other events at capacity', () => {
        const resource: TestResource = {
          id: 'r-cap',
          label: 'Capacity 1',
          capacity: [1],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
          ],
        }

        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [resource],
            },
            {
              id: 'e2',
              title: 'E2',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        })

        const result = cal.validateResize({
          eventId: 'e2',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })

      test('blocks resize when it would create NEW capacity conflicts', () => {
        const resource: TestResource = {
          id: 'r-cap',
          label: 'Capacity 1',
          capacity: [1],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
          ],
        }

        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: 'e2',
              title: 'E2',
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [resource],
            },
            {
              id: 'e3',
              title: 'E3',
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        })

        const result = cal.validateResize({
          eventId: 'e3',
          originalStart: `${DATE_MON}T14:00:00`,
          originalEnd: `${DATE_MON}T15:00:00`,
          edge: 'top',
          totalDeltaMinutes: -180,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error?.reason).toBe('unavailable-time')
      })

      test('allows resize when capacity is not exceeded', () => {
        const resource: TestResource = {
          id: 'r-cap',
          label: 'Capacity 3',
          capacity: [3],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
          ],
        }

        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: 'e2',
              title: 'E2',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: 'e3',
              title: 'E3',
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        })

        const result = cal.validateResize({
          eventId: 'e3',
          originalStart: `${DATE_MON}T14:00:00`,
          originalEnd: `${DATE_MON}T15:00:00`,
          edge: 'top',
          totalDeltaMinutes: -240,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })
    })

    describe('event without resources', () => {
      test('allows resize freely when event has no resources', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 120,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })
    })

    describe('zero delta', () => {
      test('returns original times when delta is zero', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 0,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
        expect(result.result.start).toBe(`${DATE_MON}T09:00:00`)
        expect(result.result.end).toBe(`${DATE_MON}T10:00:00`)
      })
    })

    describe('blocked resize returns original day date', () => {
      test('targetDayDate falls back to originalDayDate when blocked', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: '2024-03-20',
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.targetDayDate).toBe(DATE_MON)
      })
    })

    describe('cross-day resize (top edge to earlier day)', () => {
      test('blocks when target day has unavailable time at the target range', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_TUE}T09:00:00`,
          originalEnd: `${DATE_TUE}T10:00:00`,
          edge: 'top',
          totalDeltaMinutes: -480,
          targetDayDate: '2024-03-15',
          originalDayDate: DATE_TUE,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })

      test('blocks when source day has unavailable time before event start', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T07:00:00`,
              end: `${DATE_MON}T08:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T07:00:00`,
          originalEnd: `${DATE_MON}T08:00:00`,
          edge: 'top',
          totalDeltaMinutes: -60,
          targetDayDate: '2024-03-15',
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })
    })

    describe('cross-day resize (bottom edge to later day)', () => {
      test('blocks when target day has unavailable time at the target range', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_TUE}T09:00:00`,
          originalEnd: `${DATE_TUE}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 480,
          targetDayDate: '2024-03-22',
          originalDayDate: DATE_TUE,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })

      test('blocks when source day has unavailable time after event end', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_TUE,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })
    })

    describe('result shape', () => {
      test('returns valid result structure when not blocked', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
        expect(result.targetDayDate).toBe(DATE_MON)
        expect(result.result).toBeDefined()
        expect(result.result.start).toBeDefined()
        expect(result.result.end).toBeDefined()
      })

      test('returns valid error structure when blocked', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error).toBeDefined()
      })
    })

    describe('multiple resources on one event', () => {
      test('blocks when any resource is unavailable for the new range', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource, afternoonResource],
            },
          ],
          resources: [weekdayResource, afternoonResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 480,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
      })

      test('allows when all resources are available for the new range', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [weekdayResource, afternoonResource],
            },
          ],
          resources: [weekdayResource, afternoonResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T13:00:00`,
          originalEnd: `${DATE_MON}T14:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })
    })

    describe('no constraints provided', () => {
      test('works with default snap of 1 minute', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'Event',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: 'e1',
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 1,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
        })

        expect(result.blocked).toBe(false)
      })
    })
  })

  describe('navigation', () => {
    test('changeViewMode updates the visible mode', () => {
      const cal = createCalendar()
      cal.changeViewMode({ value: 2, unit: 'week' })
      // No public getter for viewMode; just verify the call doesn't throw
      // and that downstream behaviours (like getDaysWithEvents) reflect it.
      expect(cal.getDaysWithEvents().length).toBeGreaterThan(0)
    })

    test('goToSpecificPeriod accepts an ISO date string', () => {
      const cal = createCalendar()
      expect(() => cal.goToSpecificPeriod('2024-06-01')).not.toThrow()
    })

    test('goToNextPeriod and goToPreviousPeriod do not throw', () => {
      const cal = createCalendar({
        viewMode: { value: 1, unit: 'week' },
      })
      expect(() => cal.goToNextPeriod()).not.toThrow()
      expect(() => cal.goToPreviousPeriod()).not.toThrow()
    })

    test('canGoPreviousPeriod returns true without range', () => {
      const cal = createCalendar()
      expect(cal.canGoPreviousPeriod()).toBe(true)
    })

    test('canGoNextPeriod returns true without range', () => {
      const cal = createCalendar()
      expect(cal.canGoNextPeriod()).toBe(true)
    })
  })

  describe('getDaysNames', () => {
    test('returns 7 day names', () => {
      const cal = createCalendar({ locale: 'en-US' })
      const names = cal.getDaysNames()
      expect(names).toHaveLength(7)
    })

    test('returns long day names', () => {
      const cal = createCalendar({ locale: 'en-US' })
      const names = cal.getDaysNames('long')
      expect(names).toContain('Sunday')
    })
  })

  describe('getTimeSlots', () => {
    test('returns time slots for the day', () => {
      const cal = createCalendar()
      const slots = cal.getTimeSlots()
      expect(slots).toBeDefined()
      expect(Array.isArray(slots)).toBe(true)
    })
  })

  describe('getDaysWithEvents', () => {
    test('returns days array with events mapped to dates', () => {
      const cal = createCalendar({
        viewMode: { value: 1, unit: 'week' },
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.goToSpecificPeriod(DATE_MON)
      const days = cal.getDaysWithEvents()
      const targetDay = days.find((d) => d.isoDate === DATE_MON)

      expect(targetDay).toBeDefined()
      expect(targetDay!.events).toHaveLength(1)
    })

    test('marks today correctly', () => {
      const cal = createCalendar({
        viewMode: { value: 1, unit: 'week' },
      })

      const days = cal.getDaysWithEvents()
      const todayCount = days.filter((d) => d.isToday).length

      expect(todayCount).toBe(1)
    })
  })

  describe('validateResize - horizontal timeline (multi-day events)', () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    }

    test('blocks extending right edge of multi-day event into unavailable hours', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'e1',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_TUE}T10:00:00`,
        edge: 'right',
        totalDeltaMinutes: 480,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })

    test('allows extending right edge of multi-day event within available hours', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'e1',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_TUE}T10:00:00`,
        edge: 'right',
        totalDeltaMinutes: 60,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(false)
    })

    test('blocks extending left edge of multi-day event into unavailable hours', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_TUE}T09:00:00`,
            end: `${DATE_TUE}T17:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'e1',
        originalStart: `${DATE_TUE}T09:00:00`,
        originalEnd: `${DATE_TUE}T17:00:00`,
        edge: 'left',
        totalDeltaMinutes: -480,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })

    test('blocks large delta on single-day event that crosses midnight into next unavailable day', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T22:00:00`,
            end: `${DATE_TUE}T02:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'e1',
        originalStart: `${DATE_MON}T22:00:00`,
        originalEnd: `${DATE_TUE}T02:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 480,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })

    test('shrinking is always allowed regardless of availability', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T17:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'e1',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_TUE}T17:00:00`,
        edge: 'right',
        totalDeltaMinutes: -480,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(false)
    })
  })

  describe('getEvents', () => {
    test('returns a shallow copy of all events', () => {
      const events: Array<TestEvent> = [
        {
          id: 'e1',
          title: 'Event 1',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ]

      const cal = createCalendar({ events })
      const out = cal.getEvents()

      expect(out).toHaveLength(1)
      expect(out).not.toBe(events)
    })

    test('returns empty array when no events configured', () => {
      const cal = createCalendar({ events: [] })
      expect(cal.getEvents()).toHaveLength(0)
    })
  })

  describe('commitUpdate - dependsOn cascade (propagateEndDelta)', () => {
    test('shifts dependent forward when predecessor end extends past dependent start', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      cal.commitUpdate('a', { end: `${DATE_MON}T12:30:00` })

      const b = cal.getEvents().find((e) => e.id === 'b')!
      expect(b.start).toBe(`${DATE_MON}T12:30:00`)
      expect(b.end).toBe(`${DATE_MON}T13:30:00`)
    })

    test('does not shift dependent when predecessor end still ends before dependent start', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T14:00:00`,
            end: `${DATE_MON}T15:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      cal.commitUpdate('a', { end: `${DATE_MON}T11:30:00` })

      const b = cal.getEvents().find((e) => e.id === 'b')!
      expect(b.start).toBe(`${DATE_MON}T14:00:00`)
    })

    test('propagates through a chain A → B → C', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
          {
            id: 'c',
            title: 'C',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'b', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      cal.commitUpdate('a', { end: `${DATE_MON}T12:00:00` })

      const b = cal.getEvents().find((e) => e.id === 'b')!
      const c = cal.getEvents().find((e) => e.id === 'c')!
      expect(b.start).toBe(`${DATE_MON}T12:00:00`)
      expect(c.start).toBe(`${DATE_MON}T13:00:00`)
    })

    test('shifts multiple dependents of the same predecessor', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
          {
            id: 'c',
            title: 'C',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      cal.commitUpdate('a', { end: `${DATE_MON}T12:30:00` })

      const b = cal.getEvents().find((e) => e.id === 'b')!
      const c = cal.getEvents().find((e) => e.id === 'c')!
      expect(b.start).toBe(`${DATE_MON}T12:30:00`)
      expect(c.end).toBe(`${DATE_MON}T14:00:00`)
    })

    test('does not cascade when only start changes (end unchanged)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      cal.commitUpdate('a', { start: `${DATE_MON}T09:00:00` })

      const b = cal.getEvents().find((e) => e.id === 'b')!
      expect(b.start).toBe(`${DATE_MON}T11:00:00`)
    })
  })

  describe('validateMove', () => {
    test('returns blocked:false for unknown event id', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'nonexistent',
        `${DATE_MON}T14:00:00`,
        `${DATE_MON}T15:00:00`,
      )
      expect(r.blocked).toBe(false)
    })

    test('allows move fully inside availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'e1',
        `${DATE_MON}T10:00:00`,
        `${DATE_MON}T11:00:00`,
      )
      expect(r.blocked).toBe(false)
    })

    test('blocks when the moved range overlaps unavailable hours', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'e1',
        `${DATE_MON}T07:00:00`,
        `${DATE_MON}T08:00:00`,
      )
      expect(r.blocked).toBe(true)
    })

    test('allows move when event has no resources (no availability to violate)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      const r = cal.validateMove(
        'e1',
        `${DATE_MON}T06:00:00`,
        `${DATE_MON}T07:00:00`,
      )
      expect(r.blocked).toBe(false)
    })

    test('blocks when extending end pushes a dependent into unavailable time', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'p',
            title: 'Predecessor',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'd',
            title: 'Dependent',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'p',
        `${DATE_MON}T09:00:00`,
        `${DATE_MON}T17:00:00`,
      )
      expect(r.blocked).toBe(true)
    })

    test('blocks transitive dependent when cascade would violate availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
          {
            id: 'c',
            title: 'C',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'b', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'a',
        `${DATE_MON}T09:00:00`,
        `${DATE_MON}T15:00:00`,
      )
      expect(r.blocked).toBe(true)
    })

    test('does not run downstream availability check when new end is not extended', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'a',
        `${DATE_MON}T09:00:00`,
        `${DATE_MON}T10:00:00`,
      )
      expect(r.blocked).toBe(false)
    })

    test('treats split multi-day segment rows as non-targets (no _originalStart match)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'e1',
            title: 'Event',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
            resources: [weekdayResource],
            _originalStart: `${DATE_MON}T09:00:00`,
            _originalEnd: `${DATE_TUE}T10:00:00`,
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        'e1',
        `${DATE_TUE}T10:00:00`,
        `${DATE_TUE}T11:00:00`,
      )
      expect(r.blocked).toBe(false)
    })
  })

  describe('validateResize - dependsOn (finish-to-start)', () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    }

    test('blocks moving dependent start before predecessor end (edge left → top)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'p',
            title: 'Predecessor',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'd',
            title: 'Dependent',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T14:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'd',
        originalStart: `${DATE_MON}T12:00:00`,
        originalEnd: `${DATE_MON}T14:00:00`,
        edge: 'top',
        totalDeltaMinutes: -60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('blocked')
    })

    test('blocks extending predecessor when dependent would enter unavailable time', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'p',
            title: 'Predecessor',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'd',
            title: 'Dependent',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'p',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 420,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })

    test('allows extending predecessor when dependent stays inside availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'p',
            title: 'Predecessor',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'd',
            title: 'Dependent',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'p',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(false)
    })

    test('blocks when transitive dependent would leave availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'a', type: 'FS' }],
          },
          {
            id: 'c',
            title: 'C',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'b', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'a',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 420,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })

    test('skips cascade availability check when dependent is already outside hours', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'p',
            title: 'Predecessor',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'd',
            title: 'Dependent',
            start: `${DATE_MON}T06:00:00`,
            end: `${DATE_MON}T07:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'p',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 120,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(false)
    })

    test('same cascade rule applies with edge bottom (vertical resize)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: 'p',
            title: 'Predecessor',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 'd',
            title: 'Dependent',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: 'p',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 420,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })
  })

  describe('groupDaysBy', () => {
    test('groups days into weeks', () => {
      const cal = createCalendar({
        viewMode: { value: 2, unit: 'week' },
      })

      const days = cal.getDaysWithEvents()
      const grouped = cal.groupDaysBy({ days, unit: 'week' })

      expect(grouped.length).toBeGreaterThanOrEqual(2)
      expect(grouped[0]!).toHaveLength(7)
    })
  })

  describe('capacity / consumption', () => {
    const capResource: TestResource = {
      id: 'r-cap',
      label: 'Capacity Room',
      capacity: [1],
      availability: [
        { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
      ],
    }

    describe('validateEventPlacement', () => {
      test('blocks placement when consumption + existing usage exceeds capacity', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [capResource],
          consumption: [1],
        })

        expect(result.blocked).toBe(true)
      })

      test('allows placement when consumption + existing usage equals capacity', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
          resources: [capResource],
          consumption: [1],
        })

        expect(result.blocked).toBe(false)
      })

      test('allows placement at capacity when ranges do not overlap', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T11:00:00`,
          end: `${DATE_MON}T12:00:00`,
          resources: [capResource],
          consumption: [1],
        })

        expect(result.blocked).toBe(false)
      })

      test('treats missing consumption as 1', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [capResource],
        })

        expect(result.blocked).toBe(true)
      })

      test('blocks when single new event consumption alone exceeds capacity', () => {
        const cal = createCalendar({
          events: [],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E1',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [capResource],
          consumption: [5],
        })

        expect(result.blocked).toBe(true)
      })

      test('allows placement when resource has no capacity configured', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
              consumption: [1],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [weekdayResource],
          consumption: [1],
        })

        expect(result.blocked).toBe(false)
      })

      test('sums multi-segment capacity array', () => {
        const multiCapResource: TestResource = {
          id: 'r-multi',
          label: 'Multi',
          capacity: [1, 2],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
          ],
        }

        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [multiCapResource],
              consumption: [1, 1],
            },
          ],
          resources: [multiCapResource],
        })

        const ok = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
          resources: [multiCapResource],
          consumption: [0, 1],
        })

        const blocked = cal.validateEventPlacement({
          title: 'E3',
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [multiCapResource],
          consumption: [1, 2],
        })

        expect(ok.blocked).toBe(false)
        expect(blocked.blocked).toBe(true)
      })

      test('checks capacity per day for multi-day events', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_TUE}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
          resources: [capResource],
          consumption: [1],
        })

        expect(result.blocked).toBe(true)
      })

      test('does not double-count split multi-day segments', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const result = cal.validateEventPlacement({
          title: 'E2',
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_TUE}T11:00:00`,
          resources: [capResource],
          consumption: [1],
        })

        expect(result.blocked).toBe(true)
      })
    })

    describe('validateMove with capacity', () => {
      test('blocks move when destination overlap exceeds capacity', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
            {
              id: 'e2',
              title: 'E2',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const r = cal.validateMove(
          'e2',
          `${DATE_MON}T09:00:00`,
          `${DATE_MON}T10:00:00`,
        )

        expect(r.blocked).toBe(true)
      })

      test('allows move when self consumption would still fit', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
            {
              id: 'e2',
              title: 'E2',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const r = cal.validateMove(
          'e2',
          `${DATE_MON}T14:00:00`,
          `${DATE_MON}T15:00:00`,
        )

        expect(r.blocked).toBe(false)
      })

      test('uses passed-in newConsumption over event.consumption', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
            {
              id: 'e2',
              title: 'E2',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const r = cal.validateMove(
          'e2',
          `${DATE_MON}T09:00:00`,
          `${DATE_MON}T10:00:00`,
          undefined,
          [0],
        )

        expect(r.blocked).toBe(false)
      })
    })

    describe('validateEventPlacement - additional', () => {
      test('skips own id when validating an existing event', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'e1',
              title: 'E1',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        })

        const r = cal.validateEventPlacement({
          id: 'e1',
          title: 'E1 Updated',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [capResource],
          consumption: [1],
        })

        expect(r.blocked).toBe(false)
      })
    })
  })
})

describe('CalendarCore - dependency types (FS, SS, FF, SF)', () => {
  describe('validateEventDependencies', () => {
    const PRED_START = `${DATE_MON}T10:00:00`
    const PRED_END = `${DATE_MON}T12:00:00`

    function withPredecessor() {
      return createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: PRED_START,
            end: PRED_END,
          },
        ],
      })
    }

    describe('FS - successor.start must be ≥ predecessor.end', () => {
      test('valid when successor starts exactly at predecessor end', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T13:00:00`,
          },
          [{ id: 'p', type: 'FS' }],
        )
        expect(result.valid).toBe(true)
      })

      test('valid when successor starts after predecessor end', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T13:00:00`,
            end: `${DATE_MON}T14:00:00`,
          },
          [{ id: 'p', type: 'FS' }],
        )
        expect(result.valid).toBe(true)
      })

      test('invalid when successor starts before predecessor end', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T13:00:00`,
          },
          [{ id: 'p', type: 'FS' }],
        )
        expect(result.valid).toBe(false)
        expect(result.error?.reason).toBe('blocked')
        expect(result.error?.message).toContain('cannot start before')
        expect(result.error?.message).toContain('ends')
        expect(result.error?.message).toContain('(FS)')
      })
    })

    describe('SS - successor.start must be ≥ predecessor.start', () => {
      test('valid when successor starts exactly at predecessor start', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
          },
          [{ id: 'p', type: 'SS' }],
        )
        expect(result.valid).toBe(true)
      })

      test('valid when successor starts after predecessor start (even if predecessor still running)', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T10:30:00`,
            end: `${DATE_MON}T11:30:00`,
          },
          [{ id: 'p', type: 'SS' }],
        )
        expect(result.valid).toBe(true)
      })

      test('invalid when successor starts before predecessor start', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T09:30:00`,
            end: `${DATE_MON}T11:00:00`,
          },
          [{ id: 'p', type: 'SS' }],
        )
        expect(result.valid).toBe(false)
        expect(result.error?.message).toContain('cannot start before')
        expect(result.error?.message).toContain('starts')
        expect(result.error?.message).toContain('(SS)')
      })
    })

    describe('FF - successor.end must be ≥ predecessor.end', () => {
      test('valid when successor ends exactly at predecessor end', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
          },
          [{ id: 'p', type: 'FF' }],
        )
        expect(result.valid).toBe(true)
      })

      test('valid when successor ends after predecessor end', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T08:00:00`,
            end: `${DATE_MON}T13:00:00`,
          },
          [{ id: 'p', type: 'FF' }],
        )
        expect(result.valid).toBe(true)
      })

      test('invalid when successor ends before predecessor end', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T11:30:00`,
          },
          [{ id: 'p', type: 'FF' }],
        )
        expect(result.valid).toBe(false)
        expect(result.error?.message).toContain('cannot end before')
        expect(result.error?.message).toContain('ends')
        expect(result.error?.message).toContain('(FF)')
      })
    })

    describe('SF - successor.end must be ≥ predecessor.start', () => {
      test('valid when successor ends exactly at predecessor start', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
          [{ id: 'p', type: 'SF' }],
        )
        expect(result.valid).toBe(true)
      })

      test('valid when successor ends after predecessor start', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T08:00:00`,
            end: `${DATE_MON}T11:00:00`,
          },
          [{ id: 'p', type: 'SF' }],
        )
        expect(result.valid).toBe(true)
      })

      test('invalid when successor ends before predecessor start', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T08:00:00`,
            end: `${DATE_MON}T09:30:00`,
          },
          [{ id: 'p', type: 'SF' }],
        )
        expect(result.valid).toBe(false)
        expect(result.error?.message).toContain('cannot end before')
        expect(result.error?.message).toContain('starts')
        expect(result.error?.message).toContain('(SF)')
      })
    })

    describe('shape and edge cases', () => {
      test('returns valid:true when there are no events in the calendar', () => {
        const cal = createCalendar()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
          },
          [{ id: 'missing', type: 'FS' }],
        )
        expect(result.valid).toBe(true)
      })

      test('skips dependencies whose predecessor id is unknown', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T08:00:00`,
            end: `${DATE_MON}T09:00:00`,
          },
          [{ id: 'does-not-exist', type: 'FS' }],
        )
        expect(result.valid).toBe(true)
      })

      test('reports the first failing dependency when multiple are violated', () => {
        const cal = createCalendar({
          events: [
            {
              id: 'p1',
              title: 'P1',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
            },
            {
              id: 'p2',
              title: 'P2',
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
            },
          ],
        })

        const result = cal.validateEventDependencies(
          {
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T09:30:00`,
          },
          [
            { id: 'p1', type: 'FS' },
            { id: 'p2', type: 'FS' },
          ],
        )

        expect(result.valid).toBe(false)
        expect(result.error?.message).toContain('P1')
      })

      test('passes through provided event id and title in the error payload', () => {
        const cal = withPredecessor()
        const result = cal.validateEventDependencies(
          {
            id: 'my-event',
            title: 'My Event',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T11:30:00`,
          },
          [{ id: 'p', type: 'FS' }],
        )

        expect(result.valid).toBe(false)
        expect(result.error?.eventId).toBe('my-event')
        expect(result.error?.eventTitle).toBe('My Event')
        expect(result.error?.originalStart).toBe(`${DATE_MON}T11:00:00`)
        expect(result.error?.originalEnd).toBe(`${DATE_MON}T11:30:00`)
      })
    })
  })

  describe('validateMove - predecessor cascade per type', () => {
    test('FS: moving successor earlier pulls predecessor back into unavailable hours → blocked', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T08:30:00`,
            end: `${DATE_MON}T09:30:00`,
            resources: [weekdayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        's',
        `${DATE_MON}T08:00:00`,
        `${DATE_MON}T09:00:00`,
      )
      expect(r.blocked).toBe(true)
      expect(r.blockedEventTitle).toBe('P')
      expect(r.message).toContain('pulled into unavailable')
    })

    test('SS: moving successor before predecessor.start pulls predecessor back', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T08:30:00`,
            end: `${DATE_MON}T09:30:00`,
            resources: [weekdayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'SS' }],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        's',
        `${DATE_MON}T07:30:00`,
        `${DATE_MON}T08:30:00`,
      )
      expect(r.blocked).toBe(true)
      expect(r.blockedEventTitle).toBe('P')
    })

    test('FF: shrinking successor.end below predecessor.end pulls predecessor back', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T08:30:00`,
            end: `${DATE_MON}T09:30:00`,
            resources: [weekdayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'FF' }],
          },
        ],
        resources: [weekdayResource],
      })

      const allowed = cal.validateMove(
        's',
        `${DATE_MON}T08:00:00`,
        `${DATE_MON}T09:00:00`,
      )
      expect(allowed.blocked).toBe(false)

      const blocked = cal.validateMove(
        's',
        `${DATE_MON}T07:30:00`,
        `${DATE_MON}T08:30:00`,
      )
      expect(blocked.blocked).toBe(true)
      expect(blocked.blockedEventTitle).toBe('P')
    })

    test('SF: shrinking successor.end below predecessor.start pulls predecessor back', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T08:30:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: 'p', type: 'SF' }],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        's',
        `${DATE_MON}T06:30:00`,
        `${DATE_MON}T07:30:00`,
      )
      expect(r.blocked).toBe(true)
      expect(r.blockedEventTitle).toBe('P')
    })

    test('FS: moving successor later (constraint already satisfied) does not touch predecessor', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [allDayResource],
      })

      const r = cal.validateMove(
        's',
        `${DATE_MON}T14:00:00`,
        `${DATE_MON}T15:00:00`,
      )
      expect(r.blocked).toBe(false)
    })
  })

  describe('createDependency', () => {
    test('FS: reschedules target forward when target.start < source.end', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'FS')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T14:00:00`)
      expect(s.dependsOn).toEqual([{ id: 'p', type: 'FS' }])
    })

    test('SS: reschedules target forward when target.start < source.start', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:30:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'SS')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T10:00:00`)
      expect(s.end).toBe(`${DATE_MON}T11:30:00`)
    })

    test('FF: reschedules target forward when target.end < source.end', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'FF')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T11:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('SF: reschedules target forward when target.end < source.start', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T13:00:00`,
            end: `${DATE_MON}T15:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'SF')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('does not reschedule when constraint is already satisfied', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })

      const result = cal.createDependency('p', 's', 'FS')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T11:00:00`)
      expect(s.end).toBe(`${DATE_MON}T12:00:00`)
      expect(s.dependsOn).toEqual([{ id: 'p', type: 'FS' }])
    })

    test('default type is FS when no type is specified', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })

      cal.createDependency('p', 's')

      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.dependsOn).toEqual([{ id: 'p', type: 'FS' }])
    })

    test('does nothing when source or target is missing', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      expect(cal.createDependency('p', 'missing', 'FS')).toEqual({
        blocked: false,
      })
      expect(cal.createDependency('missing', 'p', 'FS')).toEqual({
        blocked: false,
      })
    })

    test('is idempotent - adding the same (sourceId, type) pair twice is a no-op', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })

      cal.createDependency('p', 's', 'FS')
      cal.createDependency('p', 's', 'FS')

      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.dependsOn).toEqual([{ id: 'p', type: 'FS' }])
    })

    test('allows the same source to be linked to the same target with different types', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })

      cal.createDependency('p', 's', 'FS')
      cal.createDependency('p', 's', 'SS')

      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.dependsOn).toEqual([
        { id: 'p', type: 'FS' },
        { id: 'p', type: 'SS' },
      ])
    })

    test('blocks creation when reschedule would land target in unavailable time', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T15:00:00`,
            end: `${DATE_MON}T16:00:00`,
            resources: [weekdayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T16:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.createDependency('p', 's', 'FS')

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('unavailable-time')
      expect(result.error?.eventId).toBe('s')
      expect(result.error?.attemptedStart).toBe(`${DATE_MON}T16:00:00`)
      expect(result.error?.attemptedEnd).toBe(`${DATE_MON}T23:00:00`)

      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T09:00:00`)
      expect(s.end).toBe(`${DATE_MON}T16:00:00`)
      expect(s.dependsOn ?? []).toEqual([])
    })
  })

  describe('commitUpdate forward cascade per type', () => {
    test('FS: shifts successor when predecessor.end extends past successor.start', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('p', { end: `${DATE_MON}T12:30:00` })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T12:30:00`)
      expect(s.end).toBe(`${DATE_MON}T13:30:00`)
    })

    test('SS: shifts successor when predecessor.start moves later past successor.start', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T10:30:00`,
            end: `${DATE_MON}T11:30:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'SS' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('p', {
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T11:00:00`)
      expect(s.end).toBe(`${DATE_MON}T12:00:00`)
    })

    test('FF: shifts successor when predecessor.end moves past successor.end', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T10:30:00`,
            end: `${DATE_MON}T11:30:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FF' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('p', { end: `${DATE_MON}T13:00:00` })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('SF: shifts successor when predecessor.start moves past successor.end', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'SF' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('p', {
        start: `${DATE_MON}T13:00:00`,
        end: `${DATE_MON}T14:00:00`,
      })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('does not shift when constraint stays satisfied', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T14:00:00`,
            end: `${DATE_MON}T15:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('p', { end: `${DATE_MON}T11:30:00` })

      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T14:00:00`)
      expect(s.end).toBe(`${DATE_MON}T15:00:00`)
    })

    test('mixed-type chain propagates correctly: A -SS→ B -FS→ C', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'a',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [allDayResource],
          },
          {
            id: 'b',
            title: 'B',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:30:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'a', type: 'SS' }],
          },
          {
            id: 'c',
            title: 'C',
            start: `${DATE_MON}T10:30:00`,
            end: `${DATE_MON}T11:30:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'b', type: 'FS' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('a', {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      })

      const events = cal.getEvents()
      const b = events.find((e) => e.id === 'b')!
      const c = events.find((e) => e.id === 'c')!
      expect(b.start).toBe(`${DATE_MON}T10:00:00`)
      expect(b.end).toBe(`${DATE_MON}T11:30:00`)
      expect(c.start).toBe(`${DATE_MON}T11:30:00`)
      expect(c.end).toBe(`${DATE_MON}T12:30:00`)
    })

    test('shifts only the dependents of the changed predecessor - unrelated events stay put', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
          {
            id: 'unrelated',
            title: 'Unrelated',
            start: `${DATE_MON}T11:30:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [allDayResource],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('p', { end: `${DATE_MON}T13:00:00` })

      const u = cal.getEvents().find((e) => e.id === 'unrelated')!
      expect(u.start).toBe(`${DATE_MON}T11:30:00`)
      expect(u.end).toBe(`${DATE_MON}T12:30:00`)
    })
  })

  describe('commitUpdate backward cascade per type', () => {
    test('FS: pulls predecessor back when successor.start moves before predecessor.end', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('s', {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      })

      const p = cal.getEvents().find((e) => e.id === 'p')!

      expect(p.start).toBe(`${DATE_MON}T09:00:00`)
      expect(p.end).toBe(`${DATE_MON}T10:00:00`)
    })

    test('SS: pulls predecessor back when successor.start moves before predecessor.start', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:30:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'SS' }],
          },
        ],
        resources: [allDayResource],
      })

      cal.commitUpdate('s', {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      })

      const p = cal.getEvents().find((e) => e.id === 'p')!

      expect(p.start).toBe(`${DATE_MON}T10:00:00`)
      expect(p.end).toBe(`${DATE_MON}T11:00:00`)
    })
  })

  describe('validateResize top-edge dependency check', () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    }

    test('FS: blocked when shrinking start before predecessor.end', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T14:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FS' }],
          },
        ],
        resources: [allDayResource],
      })

      const r = cal.validateResize({
        eventId: 's',
        originalStart: `${DATE_MON}T12:00:00`,
        originalEnd: `${DATE_MON}T14:00:00`,
        edge: 'top',
        totalDeltaMinutes: -60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(r.blocked).toBe(true)
      expect(r.error?.reason).toBe('blocked')
      expect(r.error?.message).toContain('FS')
    })

    test('SS: blocked when shrinking start before predecessor.start', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T14:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'SS' }],
          },
        ],
        resources: [allDayResource],
      })

      const r = cal.validateResize({
        eventId: 's',
        originalStart: `${DATE_MON}T11:00:00`,
        originalEnd: `${DATE_MON}T14:00:00`,
        edge: 'top',
        totalDeltaMinutes: -120,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(r.blocked).toBe(true)
      expect(r.error?.message).toContain('SS')
    })

    test('FF: not blocked by top-edge resize because end stays unchanged', () => {
      const cal = createCalendar({
        events: [
          {
            id: 'p',
            title: 'P',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [allDayResource],
          },
          {
            id: 's',
            title: 'S',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [allDayResource],
            dependsOn: [{ id: 'p', type: 'FF' }],
          },
        ],
        resources: [allDayResource],
      })

      const r = cal.validateResize({
        eventId: 's',
        originalStart: `${DATE_MON}T11:00:00`,
        originalEnd: `${DATE_MON}T13:00:00`,
        edge: 'top',
        totalDeltaMinutes: -90,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(r.blocked).toBe(false)
    })
  })
})
