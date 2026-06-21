import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { count } from '../count'

describe('count', () => {
  describe('with day unit', () => {
    test('should count days between two dates', () => {
      const result = count('2024-03-01T00:00:00Z', '2024-03-31T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result).toBe(30)
    })

    test('should count zero when same day', () => {
      const result = count('2024-03-15T12:00:00Z', '2024-03-15T18:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result).toBe(0)
    })

    test('should count one day when crossing midnight', () => {
      const result = count('2024-03-15T12:00:00Z', '2024-03-16T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result).toBe(1)
    })
  })

  describe('with month unit', () => {
    test('should count months between two dates', () => {
      const result = count('2024-01-15T00:00:00Z', '2024-05-01T00:00:00Z', {
        unit: 'month',
        timeZone: 'UTC',
      })
      expect(result).toBe(4)
    })

    test('should count zero when same month', () => {
      const result = count('2024-03-01T00:00:00Z', '2024-03-31T00:00:00Z', {
        unit: 'month',
        timeZone: 'UTC',
      })
      expect(result).toBe(0)
    })
  })

  describe('with year unit', () => {
    test('should count years between two dates', () => {
      const result = count('2024-06-01T00:00:00Z', '2026-01-01T00:00:00Z', {
        unit: 'year',
        timeZone: 'UTC',
      })
      expect(result).toBe(2)
    })

    test('should count zero when same year', () => {
      const result = count('2024-01-01T00:00:00Z', '2024-12-31T00:00:00Z', {
        unit: 'year',
        timeZone: 'UTC',
      })
      expect(result).toBe(0)
    })
  })

  describe('with hour unit', () => {
    test('should count hours between two times', () => {
      const result = count('2024-03-01T00:00:00Z', '2024-03-01T12:00:00Z', {
        unit: 'hour',
        timeZone: 'UTC',
      })
      expect(result).toBe(12)
    })
  })

  describe('with week unit', () => {
    test('should count weeks between two dates', () => {
      const result = count('2024-03-01T00:00:00Z', '2024-03-29T00:00:00Z', {
        unit: 'week',
        timeZone: 'UTC',
      })
      expect(result).toBe(4)
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const result = count(
        new Date('2024-03-01T00:00:00Z'),
        new Date('2024-03-31T00:00:00Z'),
        { unit: 'day', timeZone: 'UTC' },
      )
      expect(result).toBe(30)
    })

    test('should work with epoch time', () => {
      const start = new Date('2024-03-01T00:00:00Z').getTime()
      const end = new Date('2024-03-31T00:00:00Z').getTime()
      const result = count(start, end, { unit: 'day', timeZone: 'UTC' })
      expect(result).toBe(30)
    })

    test('should work with ZonedDateTime', () => {
      const start = Temporal.ZonedDateTime.from(
        '2024-03-01T00:00:00Z[UTC][u-ca=gregory]',
      )
      const end = Temporal.ZonedDateTime.from(
        '2024-03-31T00:00:00Z[UTC][u-ca=gregory]',
      )
      const result = count(start, end, { unit: 'day', timeZone: 'UTC' })
      expect(result).toBe(30)
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = count('2024-03-01T00:00:00Z', '2024-03-31T00:00:00Z', {
        unit: 'day',
        timeZone: 'America/New_York',
      })
      expect(result).toBe(30)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = count('2024-03-01T00:00:00Z', '2024-03-31T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
        calendar: 'japanese',
      })
      expect(result).toBe(30)
    })
  })

  describe('edge cases', () => {
    test('should handle leap year', () => {
      const result = count('2024-02-01T00:00:00Z', '2024-03-01T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result).toBe(29)
    })

    test('should handle negative direction', () => {
      const result = count('2024-03-31T00:00:00Z', '2024-03-01T00:00:00Z', {
        unit: 'day',
        timeZone: 'UTC',
      })
      expect(result).toBe(-30)
    })
  })
})
