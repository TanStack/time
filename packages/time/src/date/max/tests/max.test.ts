import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { max } from '../max'

describe('max', () => {
  describe('with string inputs', () => {
    test('should return latest date', () => {
      const result = max(
        [
          '2024-03-15T00:00:00Z',
          '2024-03-01T00:00:00Z',
          '2024-03-31T00:00:00Z',
        ],
        { timeZone: 'UTC' },
      )
      expect(result.value).toBe('2024-03-31T00:00:00Z')
    })

    test('should work with single date', () => {
      const result = max(['2024-03-15T00:00:00Z'], { timeZone: 'UTC' })
      expect(result.value).toBe('2024-03-15T00:00:00Z')
    })

    test('should work with two dates', () => {
      const result = max(['2024-03-31T00:00:00Z', '2024-03-01T00:00:00Z'], {
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-31T00:00:00Z')
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
      expect(result.value).toBe('2024-03-31T00:00:00Z')
    })

    test('should work with ZonedDateTime', () => {
      const result = max(
        [
          Temporal.ZonedDateTime.from(
            '2024-03-15T00:00:00Z[UTC][u-ca=gregory]',
          ),
          Temporal.ZonedDateTime.from(
            '2024-03-31T00:00:00Z[UTC][u-ca=gregory]',
          ),
        ],
        { timeZone: 'UTC' },
      )
      expect(result.value).toBe('2024-03-31T00:00:00Z')
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = max(['2024-03-15T00:00:00Z', '2024-03-01T00:00:00Z'], {
        timeZone: 'America/New_York',
      })
      expect(result.timeZone).toBe('America/New_York')
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = max(['2024-03-15T00:00:00Z', '2024-03-01T00:00:00Z'], {
        calendar: 'japanese',
      })
      expect(result.calendar).toBe('japanese')
    })
  })

  describe('edge cases', () => {
    test('should throw on empty array', () => {
      expect(() => max([], { timeZone: 'UTC' })).toThrow(
        'max requires at least one date',
      )
    })
  })
})
