import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { min } from '../min'

describe('min', () => {
  describe('with string inputs', () => {
    test('should return earliest date', () => {
      const result = min(['2024-03-15T00:00:00Z', '2024-03-01T00:00:00Z', '2024-03-31T00:00:00Z'], {
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })

    test('should work with single date', () => {
      const result = min(['2024-03-15T00:00:00Z'], { timeZone: 'UTC' })
      expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z')
    })

    test('should work with two dates', () => {
      const result = min(['2024-03-31T00:00:00Z', '2024-03-01T00:00:00Z'], {
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })
  })

  describe('with mixed input types', () => {
    test('should work with mixed Date, string, and epoch', () => {
      const result = min(
        [
          '2024-03-15T00:00:00Z',
          new Date('2024-03-01T00:00:00Z'),
          new Date('2024-03-31T00:00:00Z').getTime(),
        ],
        { timeZone: 'UTC' },
      )
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })

    test('should work with ZonedDateTime', () => {
      const result = min(
        [
          Temporal.ZonedDateTime.from('2024-03-15T00:00:00Z[UTC][u-ca=gregory]'),
          Temporal.ZonedDateTime.from('2024-03-01T00:00:00Z[UTC][u-ca=gregory]'),
        ],
        { timeZone: 'UTC' },
      )
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })
  })

  describe('timezone handling', () => {
    test('should pick the same instant in any timezone', () => {
      const dates = ['2024-03-15T00:00:00Z', '2024-03-01T00:00:00Z']

      expect(min(dates, { timeZone: 'America/New_York' }).getTime()).toBe(
        min(dates, { timeZone: 'Asia/Tokyo' }).getTime(),
      )
    })
  })

  describe('edge cases', () => {
    test('should throw on empty array', () => {
      expect(() => min([], { timeZone: 'UTC' })).toThrow('min requires at least one date')
    })
  })
})
