import { describe, expect, test } from 'vitest'
import { until } from '../until'

describe('until', () => {
  describe('with string inputs', () => {
    test('should calculate duration in days', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-16T14:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(1)
    })

    test('should calculate duration in hours', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T16:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'hour',
        },
      )
      expect(duration).toBe(2)
    })

    test('should calculate duration in minutes', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:44:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'minute',
        },
      )
      expect(duration).toBe(2)
    })

    test('should calculate duration in seconds', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:57.789Z',
        {
          timeZone: 'UTC',
          unit: 'second',
        },
      )
      expect(duration).toBe(45)
    })

    test('should calculate duration in milliseconds', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:12.889Z',
        {
          timeZone: 'UTC',
          unit: 'millisecond',
        },
      )
      expect(duration).toBe(100)
    })

    test('should calculate complex duration', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-16T17:12:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBeCloseTo(1.104, 2)
    })

    test('should calculate duration in months', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-04-15T14:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'month',
        },
      )
      expect(duration).toBe(1)
    })

    test('should calculate duration in years', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2025-03-15T14:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'year',
        },
      )
      expect(duration).toBe(1)
    })

    test('should calculate duration in weeks', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-29T14:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'week',
        },
      )
      expect(duration).toBe(2)
    })
  })

  describe('with negative duration', () => {
    test('should return negative duration when end is before start', () => {
      const duration = until(
        '2024-03-16T14:42:12.789Z',
        '2024-03-15T14:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(-1)
    })

    test('should return zero duration when dates are equal', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:12.789Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle month boundaries', () => {
      const duration = until(
        '2024-03-31T00:00:00Z',
        '2024-04-01T00:00:00Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(1)
    })

    test('should handle year boundaries', () => {
      const duration = until(
        '2024-12-31T00:00:00Z',
        '2025-01-01T00:00:00Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(1)
    })

    test('should handle leap years', () => {
      const duration = until(
        '2024-02-28T00:00:00Z',
        '2024-02-29T00:00:00Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(1)
    })

    test('should handle non-leap years', () => {
      const duration = until(
        '2023-02-28T00:00:00Z',
        '2023-03-01T00:00:00Z',
        {
          timeZone: 'UTC',
          unit: 'day',
        },
      )
      expect(duration).toBe(1)
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const start = new Date('2024-03-15T14:42:12.789Z')
      const end = new Date('2024-03-16T14:42:12.789Z')
      const duration = until(start, end, {
        timeZone: 'UTC',
        unit: 'day',
      })
      expect(duration).toBe(1)
    })

    test('should work with epoch time', () => {
      const start = new Date('2024-03-15T14:42:12.789Z').getTime()
      const end = new Date('2024-03-16T14:42:12.789Z').getTime()
      const duration = until(start, end, {
        timeZone: 'UTC',
        unit: 'day',
      })
      expect(duration).toBe(1)
    })

    test('should work with mixed input types', () => {
      const start = '2024-03-15T14:42:12.789Z'
      const end = new Date('2024-03-16T14:42:12.789Z')
      const duration = until(start, end, {
        timeZone: 'UTC',
        unit: 'day',
      })
      expect(duration).toBe(1)
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const duration = until(
        '2024-03-15T14:00:00Z',
        '2024-03-15T15:00:00Z',
        {
          timeZone: 'America/New_York',
          unit: 'hour',
        },
      )
      expect(duration).toBe(1)
    })

    test('should handle different timezones correctly', () => {
      const duration = until(
        '2024-03-15T00:00:00Z',
        '2024-03-15T01:00:00Z',
        {
          timeZone: 'UTC',
          unit: 'hour',
        },
      )
      expect(duration).toBe(1)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const duration = until(
        '2024-03-15T14:42:12.789Z',
        '2024-03-16T14:42:12.789Z',
        {
          calendar: 'japanese',
          unit: 'day',
        },
      )
      expect(duration).toBe(1)
    })
  })
})
