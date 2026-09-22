import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { getWeek } from '../getWeek'

describe('getWeek', () => {
  describe('with string input', () => {
    test('should return week for January 1st', () => {
      const result = getWeek('2024-01-01T00:00:00Z', { timeZone: 'UTC' })
      expect(result).toBe(1)
    })

    test('should return week for March 15th', () => {
      const result = getWeek('2024-03-15T00:00:00Z', { timeZone: 'UTC' })
      expect(result).toBe(11)
    })

    test('should return week for December 31st', () => {
      const result = getWeek('2024-12-31T00:00:00Z', { timeZone: 'UTC' })
      expect(result).toBe(1)
    })
  })

  describe('with different input types', () => {
    test('should work with Date object', () => {
      const result = getWeek(new Date('2024-03-15T00:00:00Z'), {
        timeZone: 'UTC',
      })
      expect(result).toBe(11)
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-15T00:00:00Z').getTime()
      const result = getWeek(epoch, { timeZone: 'UTC' })
      expect(result).toBe(11)
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2024-03-15T00:00:00Z[UTC][u-ca=gregory]',
      )
      const result = getWeek(zdt, { timeZone: 'UTC' })
      expect(result).toBe(11)
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = getWeek('2024-03-15T00:00:00Z', {
        timeZone: 'America/New_York',
      })
      expect(result).toBe(11)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = getWeek('2024-03-15T00:00:00Z', {
        timeZone: 'UTC',
        calendar: 'gregory',
      })
      expect(result).toBe(11)
    })
  })
})
