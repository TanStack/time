import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { max } from '../max'

describe('max', () => {
  describe('with string inputs', () => {
    test('should return latest date', () => {
      const result = max(['2024-03-15T00:00:00Z', '2024-03-01T00:00:00Z', '2024-03-31T00:00:00Z'], {
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-31T00:00:00.000Z')
    })

    test('should work with single date', () => {
      const result = max(['2024-03-15T00:00:00Z'], { timeZone: 'UTC' })
      expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z')
    })

    test('should work with two dates', () => {
      const result = max(['2024-03-31T00:00:00Z', '2024-03-01T00:00:00Z'], {
        timeZone: 'UTC',
      })
      expect(result.toISOString()).toBe('2024-03-31T00:00:00.000Z')
    })
  })

  describe('with mixed input types', () => {
    test('should work with mixed Date, string, and epoch', () => {
      const result = max(
        [
          '2024-03-15T00:00:00Z',
          new Date('2024-03-01T00:00:00Z'),
          new Date('2024-03-31T00:00:00Z').getTime(),
        ],
        { timeZone: 'UTC' },
      )
      expect(result.toISOString()).toBe('2024-03-31T00:00:00.000Z')
    })

    test('should work with ZonedDateTime', () => {
      const result = max(
        [
          Temporal.ZonedDateTime.from('2024-03-15T00:00:00Z[UTC][u-ca=gregory]'),
          Temporal.ZonedDateTime.from('2024-03-31T00:00:00Z[UTC][u-ca=gregory]'),
        ],
        { timeZone: 'UTC' },
      )
      expect(result.toISOString()).toBe('2024-03-31T00:00:00.000Z')
    })
  })

  describe('timezone handling', () => {
    test('should pick the same instant in any timezone', () => {
      const dates = ['2024-03-15T00:00:00Z', '2024-03-01T00:00:00Z']

      expect(max(dates, { timeZone: 'America/New_York' }).getTime()).toBe(
        max(dates, { timeZone: 'Asia/Tokyo' }).getTime(),
      )
    })
  })

  describe('edge cases', () => {
    test('should throw on empty array', () => {
      expect(() => max([], { timeZone: 'UTC' })).toThrow('max requires at least one date')
    })
  })
})
