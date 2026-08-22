import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { add } from '../add'

describe('add', () => {
  describe('with string input', () => {
    test('should add days', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T14:42:12.789Z')
    })

    test('should add multiple days', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { days: 7 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-22T14:42:12.789Z')
    })

    test('should add hours', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { hours: 2 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T16:42:12.789Z')
    })

    test('should add minutes', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { minutes: 30 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:12:12.789Z')
    })

    test('should add seconds', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { seconds: 45 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:57.789Z')
    })

    test('should add milliseconds', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { milliseconds: 100 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.889Z')
    })

    test('should add months', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { months: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-04-15T14:42:12.789Z')
    })

    test('should add years', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { years: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2025-03-15T14:42:12.789Z')
    })

    test('should add weeks', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { weeks: 2 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-29T14:42:12.789Z')
    })
  })

  describe('with complex duration', () => {
    test('should add multiple duration units', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { days: 1, hours: 2, minutes: 30 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T17:12:12.789Z')
    })

    test('should handle year and month addition', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { years: 1, months: 2 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2025-05-15T14:42:12.789Z')
    })
  })

  describe('edge cases', () => {
    test('should handle month end correctly', () => {
      const result = add('2024-01-31T00:00:00Z', {
        duration: { months: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-02-29T00:00:00.000Z')
    })

    test('should handle leap year correctly', () => {
      const result = add('2024-02-29T00:00:00Z', {
        duration: { years: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2025-02-28T00:00:00.000Z')
    })

    test('should handle negative duration (subtraction)', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { days: -1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-14T14:42:12.789Z')
    })

    test('should handle zero duration', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { days: 0 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.789Z')
    })
  })

  describe('with different input types', () => {
    test('should work with Date object', () => {
      const date = new Date('2024-03-15T14:42:12.789Z')
      const result = add(date, {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T14:42:12.789Z')
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-15T14:42:12.789Z').getTime()
      const result = add(epoch, {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T14:42:12.789Z')
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from('2024-03-15T14:42:12.789Z[UTC][u-ca=gregory]')
      const result = add(zdt, {
        duration: { days: 1 },
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T14:42:12.789Z')
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = add('2024-03-15T14:42:12.789Z', {
        duration: { hours: 1 },
        timeZone: 'America/New_York',
      })
      expect(result.toISOString()).toContain('2024-03-15')
    })

    test('should add calendar days in the given timezone, not in UTC', () => {
      const options = { duration: { days: 1 } } as const

      expect(
        add('2024-03-09T12:00:00Z', {
          ...options,
          timeZone: 'America/New_York',
        }).toISOString(),
      ).toBe('2024-03-10T11:00:00.000Z')

      expect(
        add('2024-03-09T12:00:00Z', {
          ...options,
          timeZone: 'UTC',
        }).toISOString(),
      ).toBe('2024-03-10T12:00:00.000Z')
    })
  })

  describe('calendar handling', () => {
    test('should add months in the given calendar', () => {
      const options = { duration: { months: 1 }, timeZone: 'UTC' } as const

      expect(
        add('2024-03-15T14:42:12.789Z', {
          ...options,
          calendar: 'islamic',
        }).toISOString(),
      ).toBe('2024-04-13T14:42:12.789Z')

      expect(
        add('2024-03-15T14:42:12.789Z', {
          ...options,
          calendar: 'iso8601',
        }).toISOString(),
      ).toBe('2024-04-15T14:42:12.789Z')
    })
  })
})
