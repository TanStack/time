import { describe, expect, test } from 'vitest'
import { CalendarCore } from '../calendar'
import type { DependencyType, Event, Resource } from '../types'

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
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
  ],
}

const allDayResource: TestResource = {
  id: 'all',
  label: 'All Day',
  availability: [
    { weekdays: [1, 2, 3, 4, 5, 6, 7], startTime: '00:00', endTime: '24:00' },
  ],
}

const DATE_MON = '2024-03-18'

function pairCalendar(
  type: DependencyType,
  p: { start: string; end: string },
  s: { start: string; end: string },
) {
  return createCalendar({
    events: [
      {
        id: 'p',
        title: 'P',
        start: p.start,
        end: p.end,
        resources: [allDayResource],
      },
      {
        id: 's',
        title: 'S',
        start: s.start,
        end: s.end,
        resources: [allDayResource],
        dependsOn: [{ id: 'p', type }],
      },
    ],
    resources: [allDayResource],
  })
}

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
        `${DATE_MON}T08:00:00`,
        `${DATE_MON}T09:00:00`,
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
      const cal = pairCalendar(
        'FS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T13:00:00` },
      )
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'FS')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T14:00:00`)
      expect(s.dependsOn).toEqual([{ id: 'p', type: 'FS' }])
    })

    test('SS: reschedules target forward when target.start < source.start', () => {
      const cal = pairCalendar(
        'SS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T09:00:00`, end: `${DATE_MON}T10:30:00` },
      )
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'SS')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T10:00:00`)
      expect(s.end).toBe(`${DATE_MON}T11:30:00`)
    })

    test('FF: reschedules target forward when target.end < source.end', () => {
      const cal = pairCalendar(
        'FF',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T13:00:00` },
        { start: `${DATE_MON}T09:00:00`, end: `${DATE_MON}T11:00:00` },
      )
      cal.commitUpdate('s', { dependsOn: [] })

      const result = cal.createDependency('p', 's', 'FF')

      expect(result.blocked).toBe(false)
      const s = cal.getEvents().find((e) => e.id === 's')!
      expect(s.start).toBe(`${DATE_MON}T11:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('SF: reschedules target forward when target.end < source.start', () => {
      const cal = pairCalendar(
        'SF',
        { start: `${DATE_MON}T13:00:00`, end: `${DATE_MON}T15:00:00` },
        { start: `${DATE_MON}T09:00:00`, end: `${DATE_MON}T10:00:00` },
      )
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
      const cal = pairCalendar(
        'FS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T11:00:00` },
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T12:00:00` },
      )

      cal.commitUpdate('p', { end: `${DATE_MON}T12:30:00` })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T12:30:00`)
      expect(s.end).toBe(`${DATE_MON}T13:30:00`)
    })

    test('SS: shifts successor when predecessor.start moves later past successor.start', () => {
      const cal = pairCalendar(
        'SS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T11:00:00` },
        { start: `${DATE_MON}T10:30:00`, end: `${DATE_MON}T11:30:00` },
      )

      cal.commitUpdate('p', {
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T11:00:00`)
      expect(s.end).toBe(`${DATE_MON}T12:00:00`)
    })

    test('FF: shifts successor when predecessor.end moves past successor.end', () => {
      const cal = pairCalendar(
        'FF',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T11:00:00` },
        { start: `${DATE_MON}T10:30:00`, end: `${DATE_MON}T11:30:00` },
      )

      cal.commitUpdate('p', { end: `${DATE_MON}T13:00:00` })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('SF: shifts successor when predecessor.start moves past successor.end', () => {
      const cal = pairCalendar(
        'SF',
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T09:00:00`, end: `${DATE_MON}T10:00:00` },
      )

      cal.commitUpdate('p', {
        start: `${DATE_MON}T13:00:00`,
        end: `${DATE_MON}T14:00:00`,
      })

      const s = cal.getEvents().find((e) => e.id === 's')!

      expect(s.start).toBe(`${DATE_MON}T12:00:00`)
      expect(s.end).toBe(`${DATE_MON}T13:00:00`)
    })

    test('does not shift when constraint stays satisfied', () => {
      const cal = pairCalendar(
        'FS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T11:00:00` },
        { start: `${DATE_MON}T14:00:00`, end: `${DATE_MON}T15:00:00` },
      )

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
      const cal = pairCalendar(
        'FS',
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T12:00:00`, end: `${DATE_MON}T13:00:00` },
      )

      cal.commitUpdate('s', {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      })

      const p = cal.getEvents().find((e) => e.id === 'p')!

      expect(p.start).toBe(`${DATE_MON}T09:00:00`)
      expect(p.end).toBe(`${DATE_MON}T10:00:00`)
    })

    test('SS: pulls predecessor back when successor.start moves before predecessor.start', () => {
      const cal = pairCalendar(
        'SS',
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T11:30:00`, end: `${DATE_MON}T12:30:00` },
      )

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
      const cal = pairCalendar(
        'FS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T12:00:00`, end: `${DATE_MON}T14:00:00` },
      )

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
      const cal = pairCalendar(
        'SS',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T14:00:00` },
      )

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
      const cal = pairCalendar(
        'FF',
        { start: `${DATE_MON}T10:00:00`, end: `${DATE_MON}T12:00:00` },
        { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T13:00:00` },
      )

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
