import { describe, expect, test } from 'vitest'
import { equals } from '../equals'

describe('equals', () => {
  describe('with string inputs', () => {
    test('should return true for same year', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-12-31T23:59:59.999Z',
        'year',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different years', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2025-03-15T14:42:12.789Z',
        'year',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same month', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-31T23:59:59.999Z',
        'month',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different months', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-04-15T14:42:12.789Z',
        'month',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same week', () => {
      const result = equals(
        '2024-03-11T00:00:00Z',
        '2024-03-17T23:59:59.999Z',
        'week',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different weeks', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-18T14:42:12.789Z',
        'week',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same day', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T23:59:59.999Z',
        'day',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different days', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-16T14:42:12.789Z',
        'day',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same hour', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:59:59.999Z',
        'hour',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different hours', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T15:42:12.789Z',
        'hour',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same minute', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:59.999Z',
        'minute',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different minutes', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:43:12.789Z',
        'minute',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same second', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:12.999Z',
        'second',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different seconds', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:13.789Z',
        'second',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should return true for same millisecond', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:12.789Z',
        'millisecond',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should return false for different milliseconds', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:12.790Z',
        'millisecond',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })
  })

  describe('edge cases', () => {
    test('should handle year boundaries', () => {
      const result = equals(
        '2024-12-31T23:59:59.999Z',
        '2025-01-01T00:00:00.000Z',
        'year',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should handle month boundaries', () => {
      const result = equals(
        '2024-03-31T23:59:59.999Z',
        '2024-04-01T00:00:00.000Z',
        'month',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })

    test('should handle leap years', () => {
      const result = equals(
        '2024-02-28T00:00:00Z',
        '2024-02-29T00:00:00Z',
        'month',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(true)
    })

    test('should handle non-leap years', () => {
      const result = equals(
        '2023-02-28T00:00:00Z',
        '2023-03-01T00:00:00Z',
        'month',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const date1 = new Date('2024-03-15T14:42:12.789Z')
      const date2 = new Date('2024-03-15T23:59:59.999Z')
      const result = equals(date1, date2, 'day', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with epoch time', () => {
      const date1 = new Date('2024-03-15T14:42:12.789Z').getTime()
      const date2 = new Date('2024-03-15T23:59:59.999Z').getTime()
      const result = equals(date1, date2, 'day', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with mixed input types', () => {
      const date1 = '2024-03-15T14:42:12.789Z'
      const date2 = new Date('2024-03-15T23:59:59.999Z')
      const result = equals(date1, date2, 'day', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = equals(
        '2024-03-15T14:00:00Z',
        '2024-03-15T19:00:00Z',
        'day',
        {
          timeZone: 'America/New_York',
        },
      )
      expect(result).toBe(true)
    })

    test('should handle different timezones correctly', () => {
      const result = equals(
        '2024-03-15T00:00:00Z',
        '2024-03-16T00:00:00Z',
        'day',
        {
          timeZone: 'UTC',
        },
      )
      expect(result).toBe(false)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = equals(
        '2024-03-15T14:42:12.789Z',
        '2024-03-15T14:42:12.789Z',
        'day',
        {
          calendar: 'japanese',
        },
      )
      expect(result).toBe(true)
    })
  })
})
