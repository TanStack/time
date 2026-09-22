import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { isFuture } from '../isFuture'

describe('isFuture', () => {
  describe('with string input', () => {
    test('should return true for future date', () => {
      const result = isFuture('2030-01-01T00:00:00Z', { timeZone: 'UTC' })
      expect(result).toBe(true)
    })

    test('should return false for past date', () => {
      const result = isFuture('2020-01-01T00:00:00Z', { timeZone: 'UTC' })
      expect(result).toBe(false)
    })
  })

  describe('with different input types', () => {
    test('should work with Date object', () => {
      const result = isFuture(new Date('2030-01-01T00:00:00Z'), {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2030-01-01T00:00:00Z').getTime()
      const result = isFuture(epoch, { timeZone: 'UTC' })
      expect(result).toBe(true)
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2030-01-01T00:00:00Z[UTC][u-ca=gregory]',
      )
      const result = isFuture(zdt, { timeZone: 'UTC' })
      expect(result).toBe(true)
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = isFuture('2030-01-01T00:00:00Z', {
        timeZone: 'America/New_York',
      })
      expect(result).toBe(true)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = isFuture('2030-01-01T00:00:00Z', {
        timeZone: 'UTC',
        calendar: 'japanese',
      })
      expect(result).toBe(true)
    })
  })
})
