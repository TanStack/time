import { describe, expect, it } from 'vitest'
import {
  bucketByDay,
  buildDays,
  spansMultipleDays,
  splitEventsByDay,
  splitMultiDay,
  type BuildDaysInput,
  type DayBuckets,
  type DayView,
  type SplittableEvent,
} from '../index'

const UTC = 'UTC'

const evt = (
  id: string,
  start: string,
  end: string,
  extra: Partial<SplittableEvent> = {},
): SplittableEvent => ({ id, start, end, ...extra })

describe('splitMultiDay', () => {
  it('leaves a single-day event untouched', () => {
    expect(spansMultipleDays(evt('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'))).toBe(false)
  })

  it('detects a multi-day span', () => {
    expect(spansMultipleDays(evt('a', '2026-01-05T09:00:00', '2026-01-07T10:00:00'))).toBe(true)
  })

  it('splits a 3-day event into one segment per day', () => {
    const segments = splitMultiDay(evt('a', '2026-01-05T09:00:00', '2026-01-07T10:00:00'), UTC)

    expect(segments).toHaveLength(3)
    expect(segments[0]!.start).toBe('2026-01-05T09:00:00')
    expect(segments[1]!.start).toBe('2026-01-06T00:00:00')
    expect(segments[2]!.end).toBe('2026-01-07T10:00:00')
  })

  it('tags every segment with the original span', () => {
    const segments = splitMultiDay(evt('a', '2026-01-05T09:00:00', '2026-01-06T10:00:00'), UTC)

    for (const segment of segments) {
      expect(segment._originalStart).toBe('2026-01-05T09:00:00')
      expect(segment._originalEnd).toBe('2026-01-06T10:00:00')
    }
  })

  it('splitEventsByDay is idempotent over already-split segments', () => {
    const once = splitEventsByDay([evt('a', '2026-01-05T09:00:00', '2026-01-07T10:00:00')], UTC)
    const twice = splitEventsByDay(once, UTC)

    expect(twice).toHaveLength(once.length)
    expect(twice.map((e) => e.start)).toEqual(once.map((e) => e.start))
  })
})

describe('bucketByDay', () => {
  it('keys events by their ISO day', () => {
    const buckets: DayBuckets<SplittableEvent> = bucketByDay(
      [
        evt('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
        evt('b', '2026-01-05T11:00:00', '2026-01-05T12:00:00'),
        evt('c', '2026-01-06T09:00:00', '2026-01-06T10:00:00'),
      ],
      UTC,
    )

    expect([...buckets.keys()].sort()).toEqual(['2026-01-05', '2026-01-06'])
    expect(buckets.get('2026-01-05')).toHaveLength(2)
  })

  it('places each segment of a multi-day event in its own day', () => {
    const buckets = bucketByDay([evt('a', '2026-01-05T22:00:00', '2026-01-07T02:00:00')], UTC)

    expect([...buckets.keys()].sort()).toEqual(['2026-01-05', '2026-01-06', '2026-01-07'])
  })
})

describe('buildDays', () => {
  it('returns one entry per requested date, including empty days', () => {
    const days: Array<DayView<SplittableEvent>> = buildDays({
      isoDates: ['2026-01-05', '2026-01-06', '2026-01-07'],
      events: [evt('a', '2026-01-06T09:00:00', '2026-01-06T10:00:00')],
      timeZone: UTC,
      today: '2026-01-05',
    })

    expect(days.map((d) => d.isoDate)).toEqual(['2026-01-05', '2026-01-06', '2026-01-07'])
    expect(days[0]!.events).toHaveLength(0)
    expect(days[1]!.events).toHaveLength(1)
  })

  it('separates all-day events from timed events', () => {
    const days = buildDays({
      isoDates: ['2026-01-05'],
      events: [
        evt('timed', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
        evt('whole', '2026-01-05T00:00:00', '2026-01-05T23:59:59', {
          allDay: true,
        }),
      ],
      timeZone: UTC,
      today: '2026-01-05',
    })

    expect(days[0]!.events.map((e) => e.id)).toEqual(['timed'])
    expect(days[0]!.allDayEvents.map((e) => e.id)).toEqual(['whole'])
  })

  it('flags today', () => {
    const days = buildDays({
      isoDates: ['2026-01-05', '2026-01-06'],
      events: [],
      timeZone: UTC,
      today: '2026-01-06',
    })

    expect(days.map((d) => d.isToday)).toEqual([false, true])
  })

  it('defers current-period membership to the supplied predicate', () => {
    const input: BuildDaysInput<SplittableEvent> = {
      isoDates: ['2026-01-31', '2026-02-01'],
      events: [],
      timeZone: UTC,
      today: '2026-01-05',
      isInCurrentPeriod: (isoDate) => isoDate.startsWith('2026-01'),
    }
    const days = buildDays(input)

    expect(days.map((d) => d.isInCurrentPeriod)).toEqual([true, false])
  })

  it('treats every day as in-period when no predicate is given', () => {
    const days = buildDays({
      isoDates: ['2026-01-31', '2026-02-01'],
      events: [],
      timeZone: UTC,
      today: '2026-01-05',
    })

    expect(days.every((d) => d.isInCurrentPeriod)).toBe(true)
  })
})
