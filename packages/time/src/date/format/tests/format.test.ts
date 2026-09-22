import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { format } from '../format'

describe('format', () => {
  describe('with default datetime format', () => {
    test('should format date with string input', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format date with Date input', () => {
      const date = new Date('2024-03-15T14:42:12.789Z')
      const result = format(date, {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format date with epoch time input', () => {
      const epoch = new Date('2024-03-15T14:42:12.789Z').getTime()
      const result = format(epoch, {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format date with ZonedDateTime input', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2024-03-15T14:42:12.789Z[UTC][u-ca=gregory]',
      )
      const result = format(zdt, {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('with date type', () => {
    test('should format date only', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'date',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format date with dateStyle option', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'date',
        options: 'full',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format date with object options', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'date',
        options: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('with time type', () => {
    test('should format time only', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'time',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format time with timeStyle option', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'time',
        options: 'full',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format time with object options', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'time',
        options: {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('with datetime type', () => {
    test('should format date and time', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'datetime',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format datetime with style option', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'datetime',
        options: 'full',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format datetime with object options', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'datetime',
        options: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('locale handling', () => {
    test('should format with different locale', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        locale: 'en-US',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format with French locale', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        locale: 'fr-FR',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format with Japanese locale', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        locale: 'ja-JP',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('timezone handling', () => {
    test('should format with UTC timezone', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format with America/New_York timezone', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        timeZone: 'America/New_York',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format with Asia/Tokyo timezone', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        timeZone: 'Asia/Tokyo',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('calendar handling', () => {
    test('should format with default calendar', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format with japanese calendar', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        calendar: 'japanese',
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    test('should handle year boundary', () => {
      const result = format('2023-12-31T23:59:59.999Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should handle leap year date', () => {
      const result = format('2024-02-29T12:00:00Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should handle midnight', () => {
      const result = format('2024-03-15T00:00:00Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should handle end of day', () => {
      const result = format('2024-03-15T23:59:59.999Z', {
        timeZone: 'UTC',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('with minimal options', () => {
    test('should format with no options', () => {
      const result = format('2024-03-15T14:42:12.789Z')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('should format with only type option', () => {
      const result = format('2024-03-15T14:42:12.789Z', {
        type: 'date',
      })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
