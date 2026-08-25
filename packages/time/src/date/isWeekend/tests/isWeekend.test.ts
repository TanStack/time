import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { isWeekend } from '../isWeekend'

describe('isWeekend', () => {
  describe('weekend days', () => {
    test('should return true for Saturday', () => {
      const result = isWeekend('2024-03-16T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Sunday', () => {
      const result = isWeekend('2024-03-17T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Saturday at midnight', () => {
      const result = isWeekend('2024-03-16T00:00:00Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Sunday at end of day', () => {
      const result = isWeekend('2024-03-17T23:59:59Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('weekday days', () => {
    test('should return false for Monday', () => {
      const result = isWeekend('2024-03-18T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should return false for Tuesday', () => {
      const result = isWeekend('2024-03-19T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should return false for Wednesday', () => {
      const result = isWeekend('2024-03-20T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should return false for Thursday', () => {
      const result = isWeekend('2024-03-21T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should return false for Friday', () => {
      const result = isWeekend('2024-03-22T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })
  })

  describe('with different input types', () => {
    test('should work with Date object', () => {
      const date = new Date('2024-03-16T14:42:12.789Z')
      const result = isWeekend(date, {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-16T14:42:12.789Z').getTime()
      const result = isWeekend(epoch, {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from('2024-03-16T14:42:12.789Z[UTC][u-ca=gregory]')
      const result = isWeekend(zdt, {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with date string', () => {
      const result = isWeekend('2024-03-16T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('timezone handling', () => {
    test('should respect timeZone option', () => {
      const result = isWeekend('2024-03-16T14:42:12.789Z', {
        timeZone: 'America/New_York',
      })
      expect(result).toBe(true)
    })

    test('should use default timeZone when not provided', () => {
      const result = isWeekend('2024-03-16T14:42:12.789Z')
      expect(result).toBe(true)
    })

    test('should handle timezone differences correctly', () => {
      const saturdayUTC = '2024-03-16T23:00:00Z'
      const result1 = isWeekend(saturdayUTC, {
        timeZone: 'UTC',
      })
      const result2 = isWeekend(saturdayUTC, {
        timeZone: 'America/New_York',
      })
      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar option', () => {
      const result = isWeekend('2024-03-16T14:42:12.789Z', {
        calendar: 'japanese',
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should use default calendar when not provided', () => {
      const result = isWeekend('2024-03-16T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle year boundaries correctly', () => {
      const result = isWeekend('2023-12-31T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should handle leap year dates correctly', () => {
      const result = isWeekend('2024-02-29T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should handle all days of the week correctly', () => {
      const monday = isWeekend('2024-03-18T00:00:00Z', { timeZone: 'UTC' })
      const tuesday = isWeekend('2024-03-19T00:00:00Z', { timeZone: 'UTC' })
      const wednesday = isWeekend('2024-03-20T00:00:00Z', { timeZone: 'UTC' })
      const thursday = isWeekend('2024-03-21T00:00:00Z', { timeZone: 'UTC' })
      const friday = isWeekend('2024-03-22T00:00:00Z', { timeZone: 'UTC' })
      const saturday = isWeekend('2024-03-23T00:00:00Z', { timeZone: 'UTC' })
      const sunday = isWeekend('2024-03-24T00:00:00Z', { timeZone: 'UTC' })

      expect(monday).toBe(false)
      expect(tuesday).toBe(false)
      expect(wednesday).toBe(false)
      expect(thursday).toBe(false)
      expect(friday).toBe(false)
      expect(saturday).toBe(true)
      expect(sunday).toBe(true)
    })
  })

  describe('locale-specific weekend handling', () => {
    test('should respect Arabic locale (Friday-Saturday weekend)', () => {
      const friday = isWeekend('2024-03-15T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })
      const saturday = isWeekend('2024-03-16T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })
      const sunday = isWeekend('2024-03-17T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })

      expect(friday).toBe(true)
      expect(saturday).toBe(true)
      expect(sunday).toBe(false)
    })

    test('should respect default locale (Saturday-Sunday weekend)', () => {
      const saturday = isWeekend('2024-03-16T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      const sunday = isWeekend('2024-03-17T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      const monday = isWeekend('2024-03-18T14:42:12.789Z', {
        timeZone: 'UTC',
      })

      expect(saturday).toBe(true)
      expect(sunday).toBe(true)
      expect(monday).toBe(false)
    })
  })
})
