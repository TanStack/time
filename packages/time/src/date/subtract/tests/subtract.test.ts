import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { subtract } from '../subtract'

describe('subtract', () => {
  describe('with string input', () => {
    test('should subtract days', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-14T14:42:12.789Z')
    })

    test('should subtract multiple days', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 7 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-08T14:42:12.789Z')
    })

    test('should subtract hours', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { hours: 2 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T12:42:12.789Z')
    })

    test('should subtract minutes', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { minutes: 30 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:12:12.789Z')
    })

    test('should subtract seconds', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { seconds: 45 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:41:27.789Z')
    })

    test('should subtract milliseconds', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { milliseconds: 100 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:42:12.689Z')
    })

    test('should subtract months', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { months: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-02-15T14:42:12.789Z')
    })

    test('should subtract years', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { years: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2023-03-15T14:42:12.789Z')
    })

    test('should subtract weeks', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { weeks: 2 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-01T14:42:12.789Z')
    })
  })

  describe('with complex duration', () => {
    test('should subtract multiple duration units', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 1, hours: 2, minutes: 30 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-14T12:12:12.789Z')
    })

    test('should handle year and month subtraction', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { years: 1, months: 2 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2023-01-15T14:42:12.789Z')
    })
  })

  describe('edge cases', () => {
    test('should handle month start correctly', () => {
      const result = subtract('2024-03-01T00:00:00Z', {
        duration: { months: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-02-01T00:00:00Z')
    })

    test('should handle leap year correctly', () => {
      const result = subtract('2024-02-29T00:00:00Z', {
        duration: { years: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2023-02-28T00:00:00Z')
    })

    test('should handle negative duration (addition)', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: -1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-16T14:42:12.789Z')
    })

    test('should handle zero duration', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 0 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:42:12.789Z')
    })

    test('should handle crossing year boundary', () => {
      const result = subtract('2024-01-15T14:42:12.789Z', {
        duration: { months: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2023-12-15T14:42:12.789Z')
    })

    test('should handle subtracting more than available', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 100 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2023-12-06T14:42:12.789Z')
    })
  })

  describe('with different input types', () => {
    test('should work with Date object', () => {
      const date = new Date('2024-03-15T14:42:12.789Z')
      const result = subtract(date, {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-14T14:42:12.789Z')
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-15T14:42:12.789Z').getTime()
      const result = subtract(epoch, {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-14T14:42:12.789Z')
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2024-03-15T14:42:12.789Z[UTC][u-ca=gregory]',
      )
      const result = subtract(zdt, {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-14T14:42:12.789Z')
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { hours: 1 },
        timeZone: 'America/New_York',
      })
      expect(result.options.timeZone).toBe('America/New_York')
      expect(result.value).toContain('2024-03-15')
    })

    test('should return timezone in options', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 1 },
        timeZone: 'Asia/Tokyo',
      })
      expect(result.options.timeZone).toBe('Asia/Tokyo')
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = subtract('2024-03-15T14:42:12.789Z', {
        duration: { days: 1 },
        calendar: 'japanese',
      })
      expect(result.options.calendar).toBe('japanese')
    })
  })
})
