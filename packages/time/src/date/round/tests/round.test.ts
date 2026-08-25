import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { round } from '../round'

describe('round', () => {
  describe('rounding to day', () => {
    test('should round down when before noon', () => {
      const result = round('2024-03-15T10:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z')
    })

    test('should round up when at or after noon', () => {
      const result = round('2024-03-15T14:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T00:00:00.000Z')
    })

    test('should round down when exactly at midnight', () => {
      const result = round('2024-03-15T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z')
    })
  })

  describe('rounding to hour', () => {
    test('should round down when before 30 minutes', () => {
      const result = round('2024-03-15T14:20:00Z', {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:00:00.000Z')
    })

    test('should round up when at or after 30 minutes', () => {
      const result = round('2024-03-15T14:30:00Z', {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should round up when exactly at 30 minutes', () => {
      const result = round('2024-03-15T14:30:00.000Z', {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })
  })

  describe('rounding to minute', () => {
    test('should round down when before 30 seconds', () => {
      const result = round('2024-03-15T14:42:20Z', {
        unit: 'minute',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:00.000Z')
    })

    test('should round up when at or after 30 seconds', () => {
      const result = round('2024-03-15T14:42:30Z', {
        unit: 'minute',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:43:00.000Z')
    })
  })

  describe('rounding to second', () => {
    test('should round down when before 500 milliseconds', () => {
      const result = round('2024-03-15T14:42:12.400Z', {
        unit: 'second',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.000Z')
    })

    test('should round up when at or after 500 milliseconds', () => {
      const result = round('2024-03-15T14:42:12.500Z', {
        unit: 'second',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:13.000Z')
    })
  })

  describe('rounding to millisecond', () => {
    test('should round to nearest millisecond', () => {
      const result = round('2024-03-15T14:42:12.789456Z', {
        unit: 'millisecond',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.789Z')
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const date = new Date('2024-03-15T14:30:00Z')
      const result = round(date, {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should work with epoch time', () => {
      const date = new Date('2024-03-15T14:30:00Z').getTime()
      const result = round(date, {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from('2024-03-15T14:30:00Z[UTC][u-ca=gregory]')
      const result = round(zdt, {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })
  })

  describe('timezone handling', () => {
    test('should round to the local hour, not to the UTC hour', () => {
      expect(
        round('2024-03-15T14:20:00Z', {
          unit: 'hour',
          timeZone: 'Asia/Kolkata',
        }).toISOString(),
      ).toBe('2024-03-15T14:30:00.000Z')

      expect(
        round('2024-03-15T14:20:00Z', {
          unit: 'hour',
          timeZone: 'UTC',
        }).toISOString(),
      ).toBe('2024-03-15T14:00:00.000Z')
    })
  })

  describe('edge cases', () => {
    test('should handle year boundary correctly', () => {
      const result = round('2023-12-31T18:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    test('should handle month boundary correctly', () => {
      const result = round('2024-02-29T18:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })
  })
})
