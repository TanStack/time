import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { ceil } from '../ceil'

describe('ceil', () => {
  describe('with string input', () => {
    test('should ceil up to next day', () => {
      const result = ceil('2024-03-15T10:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-16T00:00:00.000Z')
    })

    test('should ceil up to next hour', () => {
      const result = ceil('2024-03-15T14:20:00Z', {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should ceil up to next minute', () => {
      const result = ceil('2024-03-15T14:42:30Z', {
        unit: 'minute',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:43:00.000Z')
    })

    test('should ceil up to next second', () => {
      const result = ceil('2024-03-15T14:42:12.500Z', {
        unit: 'second',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:13.000Z')
    })

    test('should keep millisecond boundary for string input', () => {
      const result = ceil('2024-03-15T14:42:12.789Z', {
        unit: 'millisecond',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.789Z')
    })

    test('should not change when already at boundary', () => {
      const result = ceil('2024-03-15T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z')
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const date = new Date('2024-03-15T14:20:00Z')
      const result = ceil(date, {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-15T14:20:00Z').getTime()
      const result = ceil(epoch, {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from('2024-03-15T14:20:00Z[UTC][u-ca=gregory]')
      const result = ceil(zdt, {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T15:00:00.000Z')
    })

    test('should ceil sub-millisecond with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from('2024-03-15T14:42:12.789456789Z[UTC][u-ca=gregory]')
      const result = ceil(zdt, {
        unit: 'millisecond',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.790Z')
    })
  })

  describe('timezone handling', () => {
    test('should ceil to the local hour, not to the UTC hour', () => {
      expect(
        ceil('2024-03-15T14:20:00Z', {
          unit: 'hour',
          timeZone: 'Asia/Kolkata',
        }).toISOString(),
      ).toBe('2024-03-15T14:30:00.000Z')

      expect(
        ceil('2024-03-15T14:20:00Z', {
          unit: 'hour',
          timeZone: 'UTC',
        }).toISOString(),
      ).toBe('2024-03-15T15:00:00.000Z')
    })
  })

  describe('edge cases', () => {
    test('should handle year boundary', () => {
      const result = ceil('2024-12-31T12:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2025-01-01T00:00:00.000Z')
    })

    test('should handle month boundary', () => {
      const result = ceil('2024-02-29T12:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })
  })
})
