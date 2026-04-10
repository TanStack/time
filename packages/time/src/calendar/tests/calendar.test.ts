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

describe('toPlainDateTimeString', () => {
  test('passes through full ISO datetime unchanged', () => {
    expect(toPlainDateTimeString('2024-03-18T09:00:00')).toBe(
      '2024-03-18T09:00:00',
    )
  })

  test('adds midnight time to date-only string', () => {
    expect(toPlainDateTimeString('2024-03-18')).toBe('2024-03-18T00:00:00')
  })

  test('fills in missing seconds from partial time', () => {
    expect(toPlainDateTimeString('2024-03-18T09:30')).toBe(
      '2024-03-18T09:30:00',
    )
  })

  test('fills in missing minutes and seconds from hour-only time', () => {
    expect(toPlainDateTimeString('2024-03-18T09')).toBe('2024-03-18T09:00:00')
  })

  test('handles space separator instead of T', () => {
    expect(toPlainDateTimeString('2024-03-18 14:30:00')).toBe(
      '2024-03-18T14:30:00',
    )
  })

  test('strips timezone offset and returns plain datetime', () => {
    expect(toPlainDateTimeString('2024-03-18T09:00:00Z')).toBe(
      '2024-03-18T09:00:00',
    )
  })

  test('converts Date object to ISO datetime string using local time', () => {
    const date = new Date(2024, 2, 18, 10, 30, 0)
    expect(toPlainDateTimeString(date)).toBe('2024-03-18T10:30:00')
  })

  test('converts epoch number to ISO datetime string', () => {
    const date = new Date(2024, 2, 18, 0, 0, 0)
    const result = toPlainDateTimeString(date.getTime())
    expect(result).toBe(toPlainDateTimeString(date))
  })

  test('throws on invalid string input', () => {
    expect(() => toPlainDateTimeString('not-a-date')).toThrow()
  })
})

describe('CalendarCore', () => {
  describe('constructor', () => {
    test('initializes with events and resources', () => {
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'A',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ]
      const cal = createCalendar({ events, resources: [weekdayResource] })

      expect(cal.options.events).toHaveLength(1)
      expect(cal.options.resources).toHaveLength(1)
    })

    test('normalizes date-only event start/end to full datetime', () => {
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'Date-only',
          start: DATE_MON,
          end: DATE_TUE,
        },
      ]
      const cal = createCalendar({ events })

      expect(cal.options.events![0]!.start).toBe(`${DATE_MON}T00:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_TUE}T00:00:00`)
    })

    test('normalizes partial datetime event start/end', () => {
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'Partial time',
          start: `${DATE_MON}T09:30`,
          end: `${DATE_MON}T17`,
        },
      ]
      const cal = createCalendar({ events })

      expect(cal.options.events![0]!.start).toBe(`${DATE_MON}T09:30:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_MON}T17:00:00`)
    })

    test('normalizes Date objects in event start/end', () => {
      const startDate = new Date(2024, 2, 18, 9, 0, 0)
      const endDate = new Date(2024, 2, 18, 17, 0, 0)
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'Date objects',
          start: startDate,
          end: endDate,
        },
      ]
      const cal = createCalendar({ events })

      expect(cal.options.events![0]!.start).toBe(`${DATE_MON}T09:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_MON}T17:00:00`)
    })
  })

  describe('getEventsByDate', () => {
    test('returns events matching the date', () => {
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'Mon Event',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
        {
          id: '2',
          title: 'Tue Event',
          start: `${DATE_TUE}T14:00:00`,
          end: `${DATE_TUE}T15:00:00`,
        },
      ]
      const cal = createCalendar({ events })

      const monEvents = cal.getEventsByDate(DATE_MON)
      expect(monEvents).toHaveLength(1)
      expect(monEvents[0]!.title).toBe('Mon Event')
    })

    test('returns empty array for date without events', () => {
      const cal = createCalendar({ events: [] })

      expect(cal.getEventsByDate(DATE_MON)).toEqual([])
    })

    test('splits multi-day events across dates', () => {
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'Multi',
          start: `${DATE_MON}T14:00:00`,
          end: `${DATE_TUE}T10:00:00`,
        },
      ]
      const cal = createCalendar({ events })

      const monEvents = cal.getEventsByDate(DATE_MON)
      const tueEvents = cal.getEventsByDate(DATE_TUE)

      expect(monEvents).toHaveLength(1)
      expect(tueEvents).toHaveLength(1)
      expect(monEvents[0]!._originalStart).toBe(`${DATE_MON}T14:00:00`)
      expect(tueEvents[0]!._originalEnd).toBe(`${DATE_TUE}T10:00:00`)
    })

    test('returns empty when no events configured', () => {
      const cal = createCalendar()

      expect(cal.getEventsByDate(DATE_MON)).toEqual([])
    })
  })

  describe('addEvent', () => {
    test('adds an event to an empty calendar', () => {
      const cal = createCalendar()
      const event: TestEvent = {
        id: '1',
        title: 'New',
        start: `${DATE_MON}T09:00:00`,
        end: `${DATE_MON}T10:00:00`,
      }

      cal.addEvent(event)

      expect(cal.options.events).toHaveLength(1)
      expect(cal.getEventsByDate(DATE_MON)).toHaveLength(1)
    })

    test('adds an event to existing events', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Existing',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.addEvent({
        id: '2',
        title: 'New',
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      })

      expect(cal.options.events).toHaveLength(2)
    })

    test('increments store eventsVersion', () => {
      const cal = createCalendar()
      const versionBefore = cal.store.state.eventsVersion

      cal.addEvent({
        id: '1',
        title: 'E',
        start: `${DATE_MON}T09:00:00`,
        end: `${DATE_MON}T10:00:00`,
      })

      expect(cal.store.state.eventsVersion).toBe(versionBefore + 1)
    })

    test('normalizes date-only start/end when adding event', () => {
      const cal = createCalendar()

      cal.addEvent({
        id: '1',
        title: 'Date-only add',
        start: DATE_MON,
        end: DATE_TUE,
      })

      expect(cal.options.events![0]!.start).toBe(`${DATE_MON}T00:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_TUE}T00:00:00`)
    })

    test('normalizes Date objects when adding event', () => {
      const cal = createCalendar()

      cal.addEvent({
        id: '1',
        title: 'Date object add',
        start: new Date(2024, 2, 18, 14, 0, 0),
        end: new Date(2024, 2, 18, 15, 0, 0),
      })

      expect(cal.options.events![0]!.start).toBe(`${DATE_MON}T14:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_MON}T15:00:00`)
    })
  })

  describe('updateEvent', () => {
    test('updates an existing event', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Old Title',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.updateEvent('1', { title: 'New Title' })

      expect(cal.options.events![0]!.title).toBe('New Title')
    })

    test('updates start/end times', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'E',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.updateEvent('1', {
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      })

      expect(cal.options.events![0]!.start).toBe(`${DATE_MON}T11:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_MON}T12:00:00`)
    })

    test('normalizes date-only start/end when updating event', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'E',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.updateEvent('1', {
        start: DATE_TUE,
        end: DATE_TUE,
      })

      expect(cal.options.events![0]!.start).toBe(`${DATE_TUE}T00:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_TUE}T00:00:00`)
    })

    test('normalizes Date objects when updating event', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'E',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })

      cal.updateEvent('1', {
        start: new Date(2024, 2, 19, 11, 0, 0),
        end: new Date(2024, 2, 19, 12, 0, 0),
      })

      expect(cal.options.events![0]!.start).toBe(`${DATE_TUE}T11:00:00`)
      expect(cal.options.events![0]!.end).toBe(`${DATE_TUE}T12:00:00`)
    })

    test('does nothing when event not found', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'E',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })
      const versionBefore = cal.store.state.eventsVersion

      cal.updateEvent('nonexistent', { title: 'X' })

      expect(cal.store.state.eventsVersion).toBe(versionBefore)
      expect(cal.options.events![0]!.title).toBe('E')
    })

    test('does nothing when events is null', () => {
      const cal = createCalendar()

      cal.updateEvent('1', { title: 'X' })

      expect(cal.options.events).toBeNull()
    })
  })

  describe('removeEvent', () => {
    test('removes an existing event', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
          },
        ],
      })

      cal.removeEvent('1')

      expect(cal.options.events).toHaveLength(1)
      expect(cal.options.events![0]!.id).toBe('2')
    })

    test('does nothing when event not found', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })
      const versionBefore = cal.store.state.eventsVersion

      cal.removeEvent('nonexistent')

      expect(cal.store.state.eventsVersion).toBe(versionBefore)
      expect(cal.options.events).toHaveLength(1)
    })

    test('does nothing when events is null', () => {
      const cal = createCalendar()

      cal.removeEvent('1')

      expect(cal.options.events).toBeNull()
    })
  })

  describe('getUnavailableRanges', () => {
    test('returns empty when no resources', () => {
      const cal = createCalendar({ resources: [] })

      expect(cal.getUnavailableRanges(DATE_MON)).toEqual([])
    })

    test('returns full day unavailable when resource has no availability for that weekday', () => {
      const weekendOnlyResource: TestResource = {
        id: 'w',
        label: 'Weekend Only',
        availability: [
          { weekdays: [6, 7], startTime: '10:00', endTime: '15:00' },
        ],
      }
      const cal = createCalendar({ resources: [weekendOnlyResource] })

      const ranges = cal.getUnavailableRanges(DATE_MON)

      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.startTime).toBe('00:00')
      expect(ranges[0]!.endTime).toBe('24:00')
    })

    test('returns unavailable ranges before and after availability window', () => {
      const cal = createCalendar({ resources: [weekdayResource] })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 1440,
      })

      expect(ranges).toHaveLength(2)
      expect(ranges[0]).toEqual({
        top: 0,
        height: 480,
        startTime: '00:00',
        endTime: '08:00',
      })
      expect(ranges[1]).toEqual({
        top: 1020,
        height: 420,
        startTime: '17:00',
        endTime: '24:00',
      })
    })

    test('merges overlapping availability from multiple resources', () => {
      const cal = createCalendar({
        resources: [weekdayResource, afternoonResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 1440,
      })

      expect(ranges).toHaveLength(2)
      expect(ranges[0]!.startTime).toBe('00:00')
      expect(ranges[0]!.endTime).toBe('08:00')
      expect(ranges[1]!.startTime).toBe('18:00')
      expect(ranges[1]!.endTime).toBe('24:00')
    })

    test('filters by resourceIds when provided', () => {
      const cal = createCalendar({
        resources: [weekdayResource, afternoonResource],
      })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 1440,
        resourceIds: ['r2'],
      })

      expect(ranges).toHaveLength(2)
      expect(ranges[0]!.endTime).toBe('12:00')
      expect(ranges[1]!.startTime).toBe('18:00')
    })

    test('returns no unavailable ranges for all-day resource', () => {
      const cal = createCalendar({ resources: [allDayResource] })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 1440,
      })

      expect(ranges).toHaveLength(0)
    })

    test('returns full day when resource has no availability config', () => {
      const cal = createCalendar({ resources: [noAvailabilityResource] })

      const ranges = cal.getUnavailableRanges(DATE_MON)

      expect(ranges).toHaveLength(1)
      expect(ranges[0]!.startTime).toBe('00:00')
      expect(ranges[0]!.endTime).toBe('24:00')
    })

    test('scales pixel positions to containerHeight', () => {
      const cal = createCalendar({ resources: [weekdayResource] })

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        containerHeight: 720,
      })

      expect(ranges[0]!.top).toBe(0)
      expect(ranges[0]!.height).toBe(240)
    })
  })

  describe('getUnavailabilityDetails', () => {
    test('returns empty when no resources', () => {
      const cal = createCalendar({ resources: [] })

      expect(cal.getUnavailabilityDetails(DATE_MON, 480, 600)).toEqual([])
    })

    test('returns no-availability for resource without availability config', () => {
      const cal = createCalendar({ resources: [noAvailabilityResource] })

      const details = cal.getUnavailabilityDetails(DATE_MON, 480, 600, {
        resourceIds: ['r4'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.reason).toBe('no-availability')
    })

    test('returns outside-hours when resource not available on that weekday', () => {
      const weekendResource: TestResource = {
        id: 'w',
        label: 'Weekend',
        availability: [
          { weekdays: [6, 7], startTime: '10:00', endTime: '15:00' },
        ],
      }
      const cal = createCalendar({ resources: [weekendResource] })

      const details = cal.getUnavailabilityDetails(DATE_MON, 600, 720, {
        resourceIds: ['w'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.reason).toBe('outside-hours')
      expect(details[0]!.description).toContain('Not available on this day')
    })

    test('returns outside-hours when time range exceeds availability window', () => {
      const cal = createCalendar({ resources: [weekdayResource] })

      const details = cal.getUnavailabilityDetails(DATE_MON, 420, 540, {
        resourceIds: ['r1'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.reason).toBe('outside-hours')
      expect(details[0]!.description).toContain('08:00-17:00')
    })

    test('returns empty when time range is within availability', () => {
      const cal = createCalendar({ resources: [weekdayResource] })

      const details = cal.getUnavailabilityDetails(DATE_MON, 480, 600, {
        resourceIds: ['r1'],
      })

      expect(details).toHaveLength(0)
    })

    test('checks multiple resources independently', () => {
      const cal = createCalendar({
        resources: [weekdayResource, afternoonResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 480, 600, {
        resourceIds: ['r1', 'r2'],
      })

      expect(details).toHaveLength(1)
      expect(details[0]!.resourceId).toBe('r2')
      expect(details[0]!.reason).toBe('outside-hours')
    })

    test('uses all resources when resourceIds not specified', () => {
      const cal = createCalendar({
        resources: [weekdayResource, noAvailabilityResource],
      })

      const details = cal.getUnavailabilityDetails(DATE_MON, 480, 600)

      expect(details).toHaveLength(1)
      expect(details[0]!.resourceId).toBe('r4')
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
              id: '1',
              title: 'Meeting',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
        expect(result.error).toBeUndefined()
      })

      test('allows shrinking top edge within available time', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'Meeting',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T12:00:00`,
          edge: 'top',
          totalDeltaMinutes: 30,
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
              id: '1',
              title: 'Meeting',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T16:45:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T16:45:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error?.reason).toBe('unavailable-time')
        expect(result.error?.conflicts.length).toBeGreaterThan(0)
      })

      test('blocks extending top edge into unavailable time', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'Meeting',
              start: `${DATE_MON}T08:15:00`,
              end: `${DATE_MON}T09:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T08:15:00`,
          originalEnd: `${DATE_MON}T09:00:00`,
          edge: 'top',
          totalDeltaMinutes: -30,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error?.reason).toBe('unavailable-time')
      })
    })

    describe('capacity constraints', () => {
      test('allows resize when event already coexists with other events at capacity', () => {
        const resource: TestResource = {
          id: 'cap1',
          label: 'Cap Room',
          capacity: [1],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
          ],
        }
        const cal = createCalendar({
          events: [
            {
              id: 'conf',
              title: 'Conference',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [resource],
            },
            {
              id: 'lunch',
              title: 'Lunch',
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        })

        const result = cal.validateResize({
          eventId: 'lunch',
          originalStart: `${DATE_MON}T12:00:00`,
          originalEnd: `${DATE_MON}T13:00:00`,
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
          id: 'cap1',
          label: 'Cap Room',
          capacity: [1],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
          ],
        }
        const cal = createCalendar({
          events: [
            {
              id: 'morning',
              title: 'Morning',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [resource],
            },
            {
              id: 'afternoon',
              title: 'Afternoon',
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
            {
              id: 'target',
              title: 'Target',
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        })

        const result = cal.validateResize({
          eventId: 'target',
          originalStart: `${DATE_MON}T11:00:00`,
          originalEnd: `${DATE_MON}T12:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 180,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(
          result.error?.conflicts.some((c) =>
            c.resourceDetails.some((d) => d.reason === 'capacity'),
          ),
        ).toBe(true)
      })

      test('allows resize when capacity is not exceeded', () => {
        const resource: TestResource = {
          id: 'cap2',
          label: 'Big Room',
          capacity: [3],
          availability: [
            { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
          ],
        }
        const cal = createCalendar({
          events: [
            {
              id: 'other',
              title: 'Other',
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
            {
              id: 'target',
              title: 'Target',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        })

        const result = cal.validateResize({
          eventId: 'target',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 120,
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
              id: '1',
              title: 'Free',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 600,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
      })
    })

    describe('snap to minutes', () => {
      test('snaps resize delta to nearest interval', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 37,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
        })

        expect(result.blocked).toBe(false)
        const endTime = result.result.end
        const endMinutes =
          new Date(endTime).getHours() * 60 + new Date(endTime).getMinutes()
        expect(endMinutes % 15).toBe(0)
      })
    })

    describe('zero delta', () => {
      test('returns original times when delta is zero', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 0,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(false)
        expect(result.result.start).toContain('10:00')
        expect(result.result.end).toContain('11:00')
      })
    })

    describe('blocked resize returns original day date', () => {
      test('targetDayDate falls back to originalDayDate when blocked', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T16:45:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T16:45:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.targetDayDate).toBe(DATE_MON)
      })
    })

    describe('cross-day resize (top edge to earlier day)', () => {
      test('blocks when target day has unavailable time at the target range', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [afternoonResource],
            },
          ],
          resources: [afternoonResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_TUE}T09:00:00`,
          originalEnd: `${DATE_TUE}T10:00:00`,
          edge: 'top',
          totalDeltaMinutes: -1440,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_TUE,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.targetDayDate).toBe(DATE_TUE)
      })

      test('blocks when source day has unavailable time before event start', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_TUE}T09:00:00`,
          originalEnd: `${DATE_TUE}T10:00:00`,
          edge: 'top',
          totalDeltaMinutes: -1500,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_TUE,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error?.reason).toBe('unavailable-time')
      })
    })

    describe('cross-day resize (bottom edge to later day)', () => {
      test('blocks when target day has unavailable time at the target range', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T15:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [afternoonResource],
            },
          ],
          resources: [afternoonResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T15:00:00`,
          originalEnd: `${DATE_MON}T16:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 1440,
          targetDayDate: DATE_TUE,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.targetDayDate).toBe(DATE_MON)
      })

      test('blocks when source day has unavailable time after event end', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T15:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T15:00:00`,
          originalEnd: `${DATE_MON}T16:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 1500,
          targetDayDate: DATE_TUE,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error?.reason).toBe('unavailable-time')
      })
    })

    describe('result shape', () => {
      test('returns valid result structure when not blocked', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result).toHaveProperty('blocked', false)
        expect(result).toHaveProperty('result')
        expect(result.result).toHaveProperty('start')
        expect(result.result).toHaveProperty('end')
        expect(result.result).toHaveProperty('durationMinutes')
        expect(result).toHaveProperty('targetDayDate', DATE_MON)
        expect(result.error).toBeUndefined()
      })

      test('returns valid error structure when blocked', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T16:45:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T16:45:00`,
          edge: 'bottom',
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(result.error).toBeDefined()
        expect(result.error!.reason).toBe('unavailable-time')
        expect(typeof result.error!.message).toBe('string')
        expect(Array.isArray(result.error!.conflicts)).toBe(true)
      })
    })

    describe('multiple resources on one event', () => {
      test('blocks when any resource is unavailable for the new range', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [weekdayResource, afternoonResource],
            },
          ],
          resources: [weekdayResource, afternoonResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T12:00:00`,
          originalEnd: `${DATE_MON}T13:00:00`,
          edge: 'top',
          totalDeltaMinutes: -60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        })

        expect(result.blocked).toBe(true)
        expect(
          result.error?.conflicts.some((c) => c.resourceIds.includes('r2')),
        ).toBe(true)
      })

      test('allows when all resources are available for the new range', () => {
        const cal = createCalendar({
          events: [
            {
              id: '1',
              title: 'E',
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [weekdayResource, afternoonResource],
            },
          ],
          resources: [weekdayResource, afternoonResource],
        })

        const result = cal.validateResize({
          eventId: '1',
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
              id: '1',
              title: 'E',
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        })

        const result = cal.validateResize({
          eventId: '1',
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: 'bottom',
          totalDeltaMinutes: 7,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
        })

        expect(result.blocked).toBe(false)
      })
    })
  })

  describe('navigation', () => {
    test('goToSpecificPeriod updates store', () => {
      const cal = createCalendar()

      cal.goToSpecificPeriod('2024-06-15')

      expect(cal.store.state.currentPeriod.toString()).toContain('2024-06-15')
    })

    test('changeViewMode updates store', () => {
      const cal = createCalendar()

      cal.changeViewMode({ value: 1, unit: 'day' })

      expect(cal.store.state.viewMode).toEqual({ value: 1, unit: 'day' })
    })

    test('goToNextPeriod advances by one week in week mode', () => {
      const cal = createCalendar({ viewMode: { value: 1, unit: 'week' } })
      cal.goToSpecificPeriod('2024-03-18')
      const before = cal.store.state.currentPeriod.toString()

      cal.goToNextPeriod()

      expect(cal.store.state.currentPeriod.toString()).not.toBe(before)
    })

    test('goToPreviousPeriod goes back by one week in week mode', () => {
      const cal = createCalendar({ viewMode: { value: 1, unit: 'week' } })
      cal.goToSpecificPeriod('2024-03-18')
      const before = cal.store.state.currentPeriod.toString()

      cal.goToPreviousPeriod()

      expect(cal.store.state.currentPeriod.toString()).not.toBe(before)
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
      const names = cal.getDaysNames('short')

      expect(names).toHaveLength(7)
      names.forEach((name) => expect(typeof name).toBe('string'))
    })

    test('returns long day names', () => {
      const cal = createCalendar({ locale: 'en-US' })
      const names = cal.getDaysNames('long')

      expect(names).toHaveLength(7)
      expect(names.some((n) => n.length > 3)).toBe(true)
    })
  })

  describe('getTimeSlots', () => {
    test('returns time slots for the day', () => {
      const cal = createCalendar()
      const slots = cal.getTimeSlots()

      expect(slots.length).toBeGreaterThan(0)
      expect(slots[0]).toHaveProperty('hour')
      expect(slots[0]).toHaveProperty('minute')
      expect(slots[0]).toHaveProperty('label')
    })
  })

  describe('getDaysWithEvents', () => {
    test('returns days array with events mapped to dates', () => {
      const cal = createCalendar({
        viewMode: { value: 1, unit: 'day' },
        events: [
          {
            id: '1',
            title: 'E',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      })
      cal.goToSpecificPeriod(DATE_MON)

      const days = cal.getDaysWithEvents()

      expect(days.length).toBeGreaterThan(0)
      const targetDay = days.find(
        (d) => d.date.toString({ calendarName: 'never' }) === DATE_MON,
      )
      expect(targetDay).toBeDefined()
      expect(targetDay!.events).toHaveLength(1)
    })

    test('marks today correctly', () => {
      const cal = createCalendar({ viewMode: { value: 1, unit: 'month' } })
      const days = cal.getDaysWithEvents()

      const todayCount = days.filter((d) => d.isToday).length
      expect(todayCount).toBeLessThanOrEqual(1)
    })
  })

  describe('validateResize — horizontal timeline (multi-day events)', () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    }

    // In horizontal timeline mode, targetDayDate is always the original day —
    // so the per-day-minute checks in the existing cases don't fire for
    // multi-day events.  The comprehensive datetime check must catch these.

    test('blocks extending right edge of multi-day event into unavailable hours', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Spanning Event',
            start: `${DATE_MON}T13:00:00`,
            end: `${DATE_TUE}T17:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      // Resize right edge: +120 min → new end = TUE 19:00 (past 17:00 limit)
      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T13:00:00`,
        originalEnd: `${DATE_TUE}T17:00:00`,
        edge: 'right',
        totalDeltaMinutes: 120,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('unavailable-time')
    })

    test('allows extending right edge of multi-day event within available hours', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Spanning Event',
            start: `${DATE_MON}T13:00:00`,
            end: `${DATE_TUE}T15:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      // Resize right edge: +60 min → new end = TUE 16:00 (within 08:00-17:00)
      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T13:00:00`,
        originalEnd: `${DATE_TUE}T15:00:00`,
        edge: 'right',
        totalDeltaMinutes: 60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(false)
    })

    test('blocks extending left edge of multi-day event into unavailable hours', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Spanning Event',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_TUE}T12:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      // Resize left edge: -180 min → new start = MON 07:00 (before 08:00 limit)
      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T10:00:00`,
        originalEnd: `${DATE_TUE}T12:00:00`,
        edge: 'left',
        totalDeltaMinutes: -180,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('unavailable-time')
    })

    test('blocks large delta on single-day event that crosses midnight into next unavailable day', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Short Meeting',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      // Resize right edge by 10 hours → new end = MON 21:00 (past 17:00)
      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T11:00:00`,
        edge: 'right',
        totalDeltaMinutes: 600,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
    })

    test('shrinking is always allowed regardless of availability', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'Spanning Event',
            start: `${DATE_MON}T13:00:00`,
            end: `${DATE_TUE}T17:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      // Shrink right edge: -60 min → new end = TUE 16:00 (still within availability)
      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T13:00:00`,
        originalEnd: `${DATE_TUE}T17:00:00`,
        edge: 'right',
        totalDeltaMinutes: -60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(false)
    })
  })

  describe('getEvents', () => {
    test('returns a shallow copy of all events', () => {
      const events: Array<TestEvent> = [
        {
          id: '1',
          title: 'A',
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ]
      const cal = createCalendar({ events })
      const out = cal.getEvents()

      expect(out).toEqual(events)
      expect(out).not.toBe(cal.options.events)
    })

    test('returns empty array when no events configured', () => {
      const cal = createCalendar({ events: null })
      expect(cal.getEvents()).toEqual([])
    })
  })

  describe('updateEvent — dependsOn cascade (propagateEndDelta)', () => {
    test('shifts dependent forward when predecessor end extends past dependent start', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:30:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      cal.updateEvent('1', { end: `${DATE_MON}T12:00:00` })

      const b = cal.options.events!.find((e) => e.id === '2')!
      expect(b.start).toBe(`${DATE_MON}T12:00:00`)
      expect(b.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('does not shift dependent when predecessor end still ends before dependent start', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T14:00:00`,
            end: `${DATE_MON}T15:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      cal.updateEvent('1', { end: `${DATE_MON}T11:30:00` })

      const b = cal.options.events!.find((e) => e.id === '2')!
      expect(b.start).toBe(`${DATE_MON}T14:00:00`)
      expect(b.end).toBe(`${DATE_MON}T15:00:00`)
    })

    test('propagates through a chain A → B → C', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
          {
            id: '3',
            title: 'C',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: ['2'],
          },
        ],
        resources: [weekdayResource],
      })

      cal.updateEvent('1', { end: `${DATE_MON}T11:00:00` })

      const b = cal.options.events!.find((e) => e.id === '2')!
      const c = cal.options.events!.find((e) => e.id === '3')!
      expect(b.start).toBe(`${DATE_MON}T11:00:00`)
      expect(b.end).toBe(`${DATE_MON}T12:00:00`)
      expect(c.start).toBe(`${DATE_MON}T12:00:00`)
      expect(c.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('shifts multiple dependents of the same predecessor', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:15:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
          {
            id: '3',
            title: 'C',
            start: `${DATE_MON}T11:20:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      cal.updateEvent('1', { end: `${DATE_MON}T12:00:00` })

      const b = cal.options.events!.find((e) => e.id === '2')!
      const c = cal.options.events!.find((e) => e.id === '3')!
      expect(b.start).toBe(`${DATE_MON}T12:00:00`)
      expect(c.start).toBe(`${DATE_MON}T12:00:00`)
    })

    test('does not cascade when only start changes (end unchanged)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:30:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      cal.updateEvent('1', { start: `${DATE_MON}T09:30:00` })

      const b = cal.options.events!.find((e) => e.id === '2')!
      expect(b.start).toBe(`${DATE_MON}T11:30:00`)
    })
  })

  describe('validateMove', () => {
    test('returns blocked:false for unknown event id', () => {
      const cal = createCalendar({
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      expect(
        cal.validateMove(
          'missing',
          `${DATE_MON}T12:00:00`,
          `${DATE_MON}T13:00:00`,
        ),
      ).toEqual({ blocked: false })
    })

    test('allows move fully inside availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      expect(
        cal.validateMove('1', `${DATE_MON}T13:00:00`, `${DATE_MON}T14:00:00`),
      ).toEqual({ blocked: false })
    })

    test('blocks when the moved range overlaps unavailable hours', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        '1',
        `${DATE_MON}T18:00:00`,
        `${DATE_MON}T19:00:00`,
      )
      expect(r.blocked).toBe(true)
      expect(r.blockedEventTitle).toBe('A')
      expect(r.message).toContain('unavailable zone')
    })

    test('allows move when event has no resources (no availability to violate)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
          },
        ],
      })

      expect(
        cal.validateMove('1', `${DATE_MON}T22:00:00`, `${DATE_MON}T23:00:00`),
      ).toEqual({ blocked: false })
    })

    test('blocks when extending end pushes a dependent into unavailable time', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T16:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        '1',
        `${DATE_MON}T10:00:00`,
        `${DATE_MON}T13:00:00`,
      )
      expect(r.blocked).toBe(true)
      expect(r.blockedEventTitle).toBe('B')
      expect(r.message).toContain('pushed to unavailable')
    })

    test('blocks transitive dependent when cascade would violate availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
          {
            id: '3',
            title: 'C',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T16:00:00`,
            resources: [weekdayResource],
            dependsOn: ['2'],
          },
        ],
        resources: [weekdayResource],
      })

      const r = cal.validateMove(
        '2',
        `${DATE_MON}T15:00:00`,
        `${DATE_MON}T16:00:00`,
      )
      expect(r.blocked).toBe(true)
      expect(r.blockedEventTitle).toBe('C')
    })

    test('does not run downstream availability check when new end is not extended', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T16:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      expect(
        cal.validateMove('1', `${DATE_MON}T10:00:00`, `${DATE_MON}T10:30:00`),
      ).toEqual({ blocked: false })
    })

    test('treats split multi-day segment rows as non-targets (no _originalStart match)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T14:00:00`,
            end: `${DATE_MON}T18:00:00`,
            resources: [weekdayResource],
            _originalStart: `${DATE_MON}T14:00:00`,
            _originalEnd: `${DATE_TUE}T10:00:00`,
          },
        ],
        resources: [weekdayResource],
      })

      expect(
        cal.validateMove('1', `${DATE_MON}T18:00:00`, `${DATE_MON}T19:00:00`),
      ).toEqual({ blocked: false })
    })
  })

  describe('validateResize — dependsOn (finish-to-start)', () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    }

    test('blocks moving dependent start before predecessor end (edge left → top)', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: '2',
        originalStart: `${DATE_MON}T12:00:00`,
        originalEnd: `${DATE_MON}T13:00:00`,
        edge: 'left',
        totalDeltaMinutes: -90,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('blocked')
      expect(result.error?.message).toContain('cannot start before')
    })

    test('blocks extending predecessor when dependent would enter unavailable time', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T16:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T10:00:00`,
        originalEnd: `${DATE_MON}T11:00:00`,
        edge: 'right',
        totalDeltaMinutes: 120,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('unavailable-time')
      expect(result.error?.message).toContain('B')
    })

    test('allows extending predecessor when dependent stays inside availability', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T10:00:00`,
        originalEnd: `${DATE_MON}T11:00:00`,
        edge: 'right',
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
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
          {
            id: '3',
            title: 'C',
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T16:00:00`,
            resources: [weekdayResource],
            dependsOn: ['2'],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T10:00:00`,
        originalEnd: `${DATE_MON}T11:00:00`,
        edge: 'right',
        totalDeltaMinutes: 240,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('unavailable-time')
    })

    test('skips cascade availability check when dependent is already outside hours', () => {
      const cal = createCalendar({
        timeZone: 'UTC',
        events: [
          {
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T17:00:00`,
            end: `${DATE_MON}T18:00:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T10:00:00`,
        originalEnd: `${DATE_MON}T11:00:00`,
        edge: 'right',
        totalDeltaMinutes: 60,
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
            id: '1',
            title: 'A',
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: '2',
            title: 'B',
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T16:30:00`,
            resources: [weekdayResource],
            dependsOn: ['1'],
          },
        ],
        resources: [weekdayResource],
      })

      const result = cal.validateResize({
        eventId: '1',
        originalStart: `${DATE_MON}T10:00:00`,
        originalEnd: `${DATE_MON}T11:00:00`,
        edge: 'bottom',
        totalDeltaMinutes: 120,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      })

      expect(result.blocked).toBe(true)
      expect(result.error?.reason).toBe('unavailable-time')
    })
  })

  describe('groupDaysBy', () => {
    test('groups days into weeks', () => {
      const cal = createCalendar({ viewMode: { value: 1, unit: 'month' } })
      const days = cal.getDaysWithEvents()

      const grouped = cal.groupDaysBy({ days, unit: 'week' })

      expect(grouped.length).toBeGreaterThan(0)
      grouped.forEach((week) => {
        expect(week.length).toBeLessThanOrEqual(7)
      })
    })
  })
})
