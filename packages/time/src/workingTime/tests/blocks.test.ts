import { describe, expect, it } from 'vitest'
import {
  after,
  before,
  between,
  compileSchedule,
  date,
  dateRange,
  dates,
  merge,
  resolveLayeredDayMinutes,
  weekday,
} from '../index'
import type { WorkingCalendar } from '../types'

describe('schedule rule blocks (ADR 0010)', () => {
  it('compiles a bare weekday to the full civil day', () => {
    expect(weekday('tuesday')).toEqual({
      isWorking: true,
      recurrent: { weekdays: [2], startTime: '00:00', endTime: '24:00' },
    })
  })

  it('accepts weekday numbers and dedupes', () => {
    expect(weekday('monday', 1, 'wednesday').recurrent?.weekdays).toEqual([1, 3])
  })

  it('rejects an out-of-range weekday', () => {
    expect(() => weekday(0)).toThrow(/Invalid weekday/)
    expect(() => weekday(8)).toThrow(/Invalid weekday/)
  })

  it('builds open-ended windows from after/before', () => {
    expect(after('16:00')).toEqual({ isWorking: true, startTime: '16:00', endTime: '24:00' })
    expect(before('09:00')).toEqual({ isWorking: true, startTime: '00:00', endTime: '09:00' })
  })

  it('rejects a window that does not move forward', () => {
    expect(() => between('17:00', '09:00')).toThrow(/not after/)
    expect(() => dateRange('2026-02-10', '2026-02-01')).toThrow(/before start/)
  })

  it('merges fragments constraining different axes into one interval', () => {
    expect(merge(weekday('tuesday'), between('08:00', '16:00'))).toEqual({
      isWorking: true,
      recurrent: { weekdays: [2], startTime: '08:00', endTime: '16:00' },
    })
  })

  it('merges a date range with a time window', () => {
    expect(merge(dateRange('2026-06-01', '2026-06-30'), between('10:00', '14:00'))).toEqual({
      isWorking: true,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      startTime: '10:00',
      endTime: '14:00',
    })
  })

  it('throws when two fragments constrain the same axis', () => {
    expect(() => merge(between('08:00', '12:00'), between('13:00', '17:00'))).toThrow(
      /constrain time of day/,
    )
    expect(() => merge(weekday('monday'), weekday('tuesday'))).toThrow(/constrain weekdays/)
    expect(() => merge(date('2026-01-01'), date('2026-01-02'))).toThrow(/constrain dates/)
  })

  it('flips except fragments to non-working', () => {
    const calendar = compileSchedule({
      id: 'store-42',
      on: [weekday('tuesday')],
      except: dates(['2026-12-25']),
    })

    expect(calendar.intervals).toEqual([
      { isWorking: true, recurrent: { weekdays: [2], startTime: '00:00', endTime: '24:00' } },
      { isWorking: false, startDate: '2026-12-25', endDate: '2026-12-25' },
    ])
  })

  it('resolves identically to a hand-written calendar for a month', () => {
    const compiled = compileSchedule({
      id: 'compiled',
      on: [merge(weekday('tuesday', 'thursday'), between('08:00', '16:00'))],
      except: dates(['2026-12-24', '2026-12-25']),
    })

    const handWritten: WorkingCalendar = {
      id: 'hand-written',
      intervals: [
        {
          isWorking: true,
          recurrent: { weekdays: [2, 4], startTime: '08:00', endTime: '16:00' },
        },
        { isWorking: false, startDate: '2026-12-24', endDate: '2026-12-24' },
        { isWorking: false, startDate: '2026-12-25', endDate: '2026-12-25' },
      ],
    }

    const calendars = [compiled, handWritten]
    for (let day = 1; day <= 31; day++) {
      const iso = `2026-12-${String(day).padStart(2, '0')}`
      expect(resolveLayeredDayMinutes(['compiled'], iso, calendars)).toEqual(
        resolveLayeredDayMinutes(['hand-written'], iso, calendars),
      )
    }
  })

  it('lets a dated exception beat the recurring rule it sits under', () => {
    const calendars = [
      compileSchedule({
        id: 'store-42',
        on: [merge(weekday('tuesday'), between('08:00', '16:00'))],
        except: dates(['2026-12-01']),
      }),
    ]

    expect(resolveLayeredDayMinutes(['store-42'], '2026-12-01', calendars)).toEqual([])
    expect(resolveLayeredDayMinutes(['store-42'], '2026-12-08', calendars)).toEqual([
      { startMinutes: 480, endMinutes: 960 },
    ])
  })

  it('carries the timeZone onto the compiled calendar', () => {
    expect(
      compileSchedule({ id: 'warsaw', timeZone: 'Europe/Warsaw', on: [weekday('monday')] })
        .timeZone,
    ).toBe('Europe/Warsaw')
  })
})
