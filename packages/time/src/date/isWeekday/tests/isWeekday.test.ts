import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { isWeekday } from '../isWeekday'

describe('isWeekday', () => {
  describe('weekday days', () => {
    test('should return true for Monday', () => {
      const result = isWeekday('2024-03-18T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Tuesday', () => {
      const result = isWeekday('2024-03-19T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Wednesday', () => {
      const result = isWeekday('2024-03-20T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Thursday', () => {
      const result = isWeekday('2024-03-21T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Friday', () => {
      const result = isWeekday('2024-03-22T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Monday at midnight', () => {
      const result = isWeekday('2024-03-18T00:00:00Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true for Friday at end of day', () => {
      const result = isWeekday('2024-03-22T23:59:59Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('weekend days', () => {
    test('should return false for Saturday', () => {
      const result = isWeekday('2024-03-16T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should return false for Sunday', () => {
      const result = isWeekday('2024-03-17T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })
  })

  describe('with different input types', () => {
    test('should work with Date object', () => {
      const date = new Date('2024-03-18T14:42:12.789Z')
      const result = isWeekday(date, {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with epoch time', () => {
      const epoch = new Date('2024-03-18T14:42:12.789Z').getTime()
      const result = isWeekday(epoch, {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2024-03-18T14:42:12.789Z[UTC][u-ca=gregory]',
      )
      const result = isWeekday(zdt, {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with date string', () => {
      const result = isWeekday('2024-03-18T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('timezone handling', () => {
    test('should respect timeZone option', () => {
      const result = isWeekday('2024-03-18T14:42:12.789Z', {
        timeZone: 'America/New_York',
      })
      expect(result).toBe(true)
    })

    test('should use default timeZone when not provided', () => {
      const result = isWeekday('2024-03-18T14:42:12.789Z')
      expect(result).toBe(true)
    })

    test('should handle timezone differences correctly', () => {
      const mondayUTC = '2024-03-18T23:00:00Z'
      const result1 = isWeekday(mondayUTC, {
        timeZone: 'UTC',
      })
      const result2 = isWeekday(mondayUTC, {
        timeZone: 'America/New_York',
      })
      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar option', () => {
      const result = isWeekday('2024-03-18T14:42:12.789Z', {
        calendar: 'japanese',
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should use default calendar when not provided', () => {
      const result = isWeekday('2024-03-18T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle year boundaries correctly', () => {
      const result = isWeekday('2024-01-01T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should handle leap year dates correctly', () => {
      const result = isWeekday('2024-02-29T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should handle all days of the week correctly', () => {
      const monday = isWeekday('2024-03-18T00:00:00Z', { timeZone: 'UTC' })
      const tuesday = isWeekday('2024-03-19T00:00:00Z', { timeZone: 'UTC' })
      const wednesday = isWeekday('2024-03-20T00:00:00Z', { timeZone: 'UTC' })
      const thursday = isWeekday('2024-03-21T00:00:00Z', { timeZone: 'UTC' })
      const friday = isWeekday('2024-03-22T00:00:00Z', { timeZone: 'UTC' })
      const saturday = isWeekday('2024-03-23T00:00:00Z', { timeZone: 'UTC' })
      const sunday = isWeekday('2024-03-24T00:00:00Z', { timeZone: 'UTC' })

      expect(monday).toBe(true)
      expect(tuesday).toBe(true)
      expect(wednesday).toBe(true)
      expect(thursday).toBe(true)
      expect(friday).toBe(true)
      expect(saturday).toBe(false)
      expect(sunday).toBe(false)
    })
  })

  describe('locale-specific weekday handling', () => {
    test('should respect Arabic locale (Friday-Saturday weekend)', () => {
      const thursday = isWeekday('2024-03-14T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })
      const friday = isWeekday('2024-03-15T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })
      const saturday = isWeekday('2024-03-16T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })
      const sunday = isWeekday('2024-03-17T14:42:12.789Z', {
        locale: 'ar-SA',
        timeZone: 'UTC',
      })

      expect(thursday).toBe(true)
      expect(friday).toBe(false)
      expect(saturday).toBe(false)
      expect(sunday).toBe(true)
    })

    test('should respect default locale (Saturday-Sunday weekend)', () => {
      const friday = isWeekday('2024-03-15T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      const saturday = isWeekday('2024-03-16T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      const sunday = isWeekday('2024-03-17T14:42:12.789Z', {
        timeZone: 'UTC',
      })
      const monday = isWeekday('2024-03-18T14:42:12.789Z', {
        timeZone: 'UTC',
      })

      expect(friday).toBe(true)
      expect(saturday).toBe(false)
      expect(sunday).toBe(false)
      expect(monday).toBe(true)
    })

    test('should work with Intl.Locale object', () => {
      const locale = new Intl.Locale('ar-SA')
      const thursday = isWeekday('2024-03-14T14:42:12.789Z', {
        locale,
        timeZone: 'UTC',
      })
      expect(thursday).toBe(true)
    })
  })
})
