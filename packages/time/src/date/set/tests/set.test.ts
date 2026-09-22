import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { set } from '../set'

describe('set', () => {
  describe('with string input', () => {
    test('should set year', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { year: 2025 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2025-03-15T14:42:12Z')
    })

    test('should set month', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { month: 5 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-05-15T14:42:12Z')
    })

    test('should set day', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { day: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-01T14:42:12Z')
    })

    test('should set hour', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { hour: 9 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T09:42:12Z')
    })

    test('should set minute', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { minute: 30 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:30:12Z')
    })

    test('should set second', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { second: 45 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:42:45Z')
    })

    test('should set millisecond', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { millisecond: 500 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-15T14:42:12.5Z')
    })

    test('should set multiple fields', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { year: 2025, month: 6, day: 1 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2025-06-01T14:42:12Z')
    })
  })

  describe('edge cases', () => {
    test('should handle month end correctly', () => {
      const result = set('2024-01-31T00:00:00Z', {
        fields: { month: 2 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-02-29T00:00:00Z')
    })

    test('should handle leap year correctly', () => {
      const result = set('2024-02-29T00:00:00Z', {
        fields: { year: 2025 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2025-02-28T00:00:00Z')
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const date = new Date('2024-03-15T14:42:12Z')
      const result = set(date, {
        fields: { year: 2025 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2025-03-15T14:42:12Z')
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-15T14:42:12Z').getTime()
      const result = set(epoch, {
        fields: { year: 2025 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2025-03-15T14:42:12Z')
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2024-03-15T14:42:12Z[UTC][u-ca=gregory]',
      )
      const result = set(zdt, {
        fields: { year: 2025 },
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2025-03-15T14:42:12Z')
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { hour: 9 },
        timeZone: 'America/New_York',
      })
      expect(result.timeZone).toBe('America/New_York')
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = set('2024-03-15T14:42:12Z', {
        fields: { year: 2025 },
        calendar: 'japanese',
      })
      expect(result.calendar).toBe('japanese')
    })
  })
})
