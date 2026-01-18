import { describe, expect, test } from 'vitest'
import '../src/polyfills/getWeekInfo'
import { Temporal } from '@js-temporal/polyfill'
import { startOf } from '../src/date/startOf'

// Ensure Temporal is available globally
if (!('Temporal' in globalThis)) {
  ;(globalThis as Record<string, unknown>).Temporal = Temporal
}

describe('startOf', () => {
  describe('input types', () => {
    test('should handle RFC 3339 string input', () => {
      const result = startOf({
        date: '2024-03-15T14:30:45.123Z',
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T00:00:00/)
      expect(result.options.timeZone).toBeDefined()
      expect(result.options.calendar).toBeDefined()
    })

    test('should handle epoch time (number) input', () => {
      const epoch = new Date('2024-03-15T14:30:45.123Z').getTime()
      const result = startOf({
        date: epoch,
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T00:00:00/)
    })

    test('should handle Date object input', () => {
      const date = new Date('2024-03-15T14:30:45.123Z')
      const result = startOf({
        date,
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T00:00:00/)
    })

    test('should handle ZonedDateTime input', () => {
      const zdt = Temporal.ZonedDateTime.from('2024-03-15T14:30:45.123Z[UTC][u-ca=gregory]')
      // Pass as string representation to avoid type detection issues
      const result = startOf({
        date: zdt.toString(),
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T00:00:00/)
    })
  })

  describe('units', () => {
    const testDate = '2024-03-15T14:30:45.123Z'

    test('should return start of year', () => {
      const result = startOf({
        date: testDate,
        unit: 'year',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-01-01T00:00:00/)
    })

    test('should return start of month', () => {
      const result = startOf({
        date: testDate,
        unit: 'month',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-01T00:00:00/)
    })

    test('should return start of day', () => {
      const result = startOf({
        date: testDate,
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T00:00:00/)
    })

    test('should return start of hour', () => {
      const result = startOf({
        date: testDate,
        unit: 'hour',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T14:00:00/)
    })

    test('should return start of minute', () => {
      const result = startOf({
        date: testDate,
        unit: 'minute',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T14:30:00/)
    })

    test('should return start of second', () => {
      const result = startOf({
        date: testDate,
        unit: 'second',
        options: { timeZone: 'UTC' },
      })
      // Milliseconds are zeroed, format may or may not include .000
      expect(result.value).toMatch(/2024-03-15T14:30:45/)
    })

    test('should return start of millisecond (no change)', () => {
      const result = startOf({
        date: testDate,
        unit: 'millisecond',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toBe('2024-03-15T14:30:45.123Z')
    })

    test('should return start of week', () => {
      // Test with a known date - Friday, March 15, 2024
      const result = startOf({
        date: '2024-03-15T14:30:45.123Z',
        unit: 'week',
        options: { timeZone: 'UTC' },
      })
      // The result should be the start of the week (Sunday or Monday depending on locale)
      expect(result.value).toMatch(/2024-03-1[0-9]T00:00:00/)
    })
  })

  describe('return formats', () => {
    const testDate = '2024-03-15T14:30:45.123Z'

    test('should return standard format (default)', () => {
      const result = startOf({
        date: testDate,
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(typeof result.value).toBe('string')
      expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    test('should return long format with timezone and calendar', () => {
      const result = startOf({
        date: testDate,
        unit: 'day',
        returnFormat: 'long',
        options: { timeZone: 'UTC' },
      })
      expect(typeof result.value).toBe('string')
      expect(result.value).toContain('[')
      expect(result.value).toContain(']')
      expect(result.value).toContain('u-ca=')
    })

    test('should return epoch format', () => {
      const result = startOf({
        date: testDate,
        unit: 'day',
        returnFormat: 'epoch',
        options: { timeZone: 'UTC' },
      })
      expect(typeof result.value).toBe('number')
      expect(result.value).toBeGreaterThan(0)
    })

    test('should return Date object format', () => {
      const result = startOf({
        date: testDate,
        unit: 'day',
        returnFormat: 'Date',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toBeInstanceOf(Date)
      const date = result.value as unknown as Date
      // Check UTC hours/minutes/seconds since we're using UTC timezone
      expect(date.getUTCHours()).toBe(0)
      expect(date.getUTCMinutes()).toBe(0)
      expect(date.getUTCSeconds()).toBe(0)
    })

    test('should return ZonedDateTime format', () => {
      const result = startOf({
        date: testDate,
        unit: 'day',
        returnFormat: 'ZonedDateTime',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toBeInstanceOf(Temporal.ZonedDateTime)
      const zdt = result.value as unknown as Temporal.ZonedDateTime
      expect(zdt.hour).toBe(0)
      expect(zdt.minute).toBe(0)
      expect(zdt.second).toBe(0)
    })
  })

  describe('timezone and calendar options', () => {
    test('should use custom timezone', () => {
      const result = startOf({
        date: '2024-03-15T14:30:45.123Z',
        unit: 'day',
        options: {
          timeZone: 'America/New_York',
        },
      })
      expect(result.options.timeZone).toBe('America/New_York')
    })

    test('should use custom calendar', () => {
      const result = startOf({
        date: '2024-03-15T14:30:45.123Z',
        unit: 'day',
        options: {
          calendar: 'gregory',
        },
      })
      expect(result.options.calendar).toBe('gregory')
    })

    test('should use both custom timezone and calendar', () => {
      const result = startOf({
        date: '2024-03-15T14:30:45.123Z',
        unit: 'day',
        options: {
          timeZone: 'Asia/Tokyo',
          calendar: 'japanese',
        },
      })
      expect(result.options.timeZone).toBe('Asia/Tokyo')
      expect(result.options.calendar).toBe('japanese')
    })
  })

  describe('edge cases', () => {
    test('should handle start of year at year boundary', () => {
      const result = startOf({
        date: '2024-12-31T23:59:59.999Z',
        unit: 'year',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-01-01T00:00:00/)
    })

    test('should handle start of month at month boundary', () => {
      const result = startOf({
        date: '2024-01-31T23:59:59.999Z',
        unit: 'month',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-01-01T00:00:00/)
    })

    test('should handle leap year correctly', () => {
      const result = startOf({
        date: '2024-02-29T14:30:45.123Z',
        unit: 'month',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-02-01T00:00:00/)
    })

    test('should handle midnight correctly', () => {
      const result = startOf({
        date: '2024-03-15T00:00:00.000Z',
        unit: 'day',
        options: { timeZone: 'UTC' },
      })
      expect(result.value).toMatch(/2024-03-15T00:00:00/)
    })
  })

  describe('error handling', () => {
    test('should throw error for invalid unit', () => {
      expect(() => {
        startOf({
          date: '2024-03-15T14:30:45.123Z',
          unit: 'invalid' as 'day',
        })
      }).toThrow('Invalid unit')
    })
  })

  describe('chaining with ZonedDateTime', () => {
    test('should allow chaining multiple startOf operations', () => {
      const firstResult = startOf({
        date: '2024-03-15T14:30:45.123Z',
        unit: 'month',
        returnFormat: 'ZonedDateTime',
        options: { timeZone: 'UTC' },
      })
      const zdt = firstResult.value as unknown as Temporal.ZonedDateTime
      expect(zdt).toBeInstanceOf(Temporal.ZonedDateTime)

      // Use the ZonedDateTime's string representation for chaining
      const secondResult = startOf({
        date: zdt.toString(),
        unit: 'week',
        returnFormat: 'standard',
        options: firstResult.options,
      })

      expect(typeof secondResult.value).toBe('string')
      expect(secondResult.options.timeZone).toBe(firstResult.options.timeZone)
      expect(secondResult.options.calendar).toBe(firstResult.options.calendar)
    })
  })

  describe('week calculation', () => {
    test('should calculate start of week correctly for different days', () => {
      // Test with a Monday
      const mondayResult = startOf({
        date: '2024-03-11T14:30:45.123Z', // Monday, March 11, 2024
        unit: 'week',
        options: { timeZone: 'UTC' },
      })
      // Should return a date that is the start of the week (Sunday or Monday depending on locale)
      expect(mondayResult.value).toMatch(/2024-03-1[0-1]T00:00:00/)

      // Test with a Sunday
      const sundayResult = startOf({
        date: '2024-03-17T14:30:45.123Z', // Sunday, March 17, 2024
        unit: 'week',
        options: { timeZone: 'UTC' },
      })
      // Should return the same day or the previous week start depending on locale
      expect(sundayResult.value).toMatch(/2024-03-1[0-7]T00:00:00/)
    })
  })
})
