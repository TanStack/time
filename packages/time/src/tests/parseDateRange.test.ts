import { Temporal } from '@js-temporal/polyfill'
import { describe, expect, test } from 'vitest'
import { parseDateRange } from '../utils'

describe('parseDateRange', () => {
  const calendar = 'gregory'

  test('should parse a valid date range with string dates', () => {
    const result = parseDateRange({
      range: {
        start: '2024-01-01',
        end: '2024-12-31',
      },
      calendar,
    })

    expect(result.start).toEqual(
      Temporal.PlainDate.from('2024-01-01').withCalendar(calendar),
    )
    expect(result.end).toEqual(
      Temporal.PlainDate.from('2024-12-31').withCalendar(calendar),
    )
  })

  test('should parse a valid date range with Date objects', () => {
    const result = parseDateRange({
      range: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
      calendar,
    })

    expect(result.start).toEqual(
      Temporal.PlainDate.from('2024-01-01').withCalendar(calendar),
    )
    expect(result.end).toEqual(
      Temporal.PlainDate.from('2024-12-31').withCalendar(calendar),
    )
  })

  test('should parse a range with only start date', () => {
    const result = parseDateRange({
      range: {
        start: '2024-01-01',
        end: null,
      },
      calendar,
    })

    expect(result.start).toEqual(
      Temporal.PlainDate.from('2024-01-01').withCalendar(calendar),
    )
    expect(result.end).toBeNull()
  })

  test('should parse a range with only end date', () => {
    const result = parseDateRange({
      range: {
        start: null,
        end: '2024-12-31',
      },
      calendar,
    })

    expect(result.start).toBeNull()
    expect(result.end).toEqual(
      Temporal.PlainDate.from('2024-12-31').withCalendar(calendar),
    )
  })

  test('should parse an undefined range', () => {
    const result = parseDateRange({
      range: undefined,
      calendar,
    })

    expect(result.start).toBeNull()
    expect(result.end).toBeNull()
  })

  test('should parse a range with equal start and end dates', () => {
    const result = parseDateRange({
      range: {
        start: '2024-06-15',
        end: '2024-06-15',
      },
      calendar,
    })

    expect(result.start).toEqual(
      Temporal.PlainDate.from('2024-06-15').withCalendar(calendar),
    )
    expect(result.end).toEqual(
      Temporal.PlainDate.from('2024-06-15').withCalendar(calendar),
    )
  })

  test('should throw error when start date is invalid', () => {
    expect(() =>
      parseDateRange({
        range: {
          start: 'invalid-date',
          end: '2024-12-31',
        },
        calendar,
      }),
    ).toThrow('Invalid date range')
  })

  test('should throw error when end date is invalid', () => {
    expect(() =>
      parseDateRange({
        range: {
          start: '2024-01-01',
          end: 'invalid-date',
        },
        calendar,
      }),
    ).toThrow('Invalid date range')
  })

  test('should throw error when start is after end', () => {
    expect(() =>
      parseDateRange({
        range: {
          start: '2024-12-31',
          end: '2024-01-01',
        },
        calendar,
      }),
    ).toThrow('Invalid date range: start must be before or equal to end')
  })

  test('should apply calendar system to parsed dates', () => {
    const result = parseDateRange({
      range: {
        start: '2024-01-01',
        end: '2024-12-31',
      },
      calendar: 'japanese',
    })

    expect(result.start?.calendarId).toBe('japanese')
    expect(result.end?.calendarId).toBe('japanese')
  })
})
