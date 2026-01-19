import { describe, expect, test } from 'vitest'
import { startOf } from '../startOf'

describe('startOf', () => {
  describe('with string input', () => {
    test('should return start of year', () => {
      const result = startOf(
        '2024-03-15T14:42:12.789Z',
        { unit: 'year' },
        {
          timeZone: 'UTC',
        },
      )
      expect(result.value).toBe('2024-01-01T00:00:00Z')
      expect(result.options.timeZone).toBe('UTC')
      expect(result.options.calendar).toBeDefined()
    })

    test('should return start of month', () => {
      const result = startOf(
        '2024-03-15T14:42:12.789Z',
        { unit: 'month' },
        {
          timeZone: 'UTC',
        },
      )
      expect(result.value).toBe('2024-03-01T00:00:00Z')
    })

    test('should return start of day', () => {
      const result = startOf(
        '2024-03-15T14:42:12.789Z',
        { unit: 'day' },
        {
          timeZone: 'UTC',
        },
      )
      expect(result.value).toBe('2024-03-15T00:00:00Z')
    })

    test('should return start of hour', () => {
      const result = startOf('2024-03-15T14:42:12.789Z', { unit: 'hour' })
      expect(result.value).toContain('2024-03-15T14:00:00')
    })

    test('should return start of minute', () => {
      const result = startOf('2024-03-15T14:42:12.789Z', { unit: 'minute' })
      expect(result.value).toContain('2024-03-15T14:42:00')
    })

    test('should return start of second', () => {
      const result = startOf('2024-03-15T14:42:12.789Z', { unit: 'second' })
      expect(result.value).toContain('2024-03-15T14:42:12')
    })

    test('should return start of millisecond', () => {
      const result = startOf('2024-03-15T14:42:12.789Z', {
        unit: 'millisecond',
      })
      expect(result.value).toContain('2024-03-15T14:42:12.789')
    })
  })

  describe('week calculation', () => {
    test('should return start of week (Monday)', () => {
      // 2024-03-15 is a Friday (day 5), so start of week should be Monday (2024-03-11)
      const result = startOf('2024-03-15T14:42:12.789Z', { unit: 'week' })
      const resultDate = new Date(result.value as unknown as string)
      expect(resultDate.getDay()).toBe(1) // Monday
    })

    test('should return start of week for Sunday', () => {
      // 2024-03-17 is a Sunday (day 7), so start of week should be Monday (2024-03-11)
      const result = startOf('2024-03-17T14:42:12.789Z', { unit: 'week' })
      const resultDate = new Date(result.value as unknown as string)
      expect(resultDate.getDay()).toBe(1) // Monday
    })

    test('should return start of week for Monday', () => {
      // 2024-03-11 is a Monday (day 1), so start of week should be itself
      const result = startOf('2024-03-11T14:42:12.789Z', { unit: 'week' })
      const resultDate = new Date(result.value as unknown as string)
      expect(resultDate.getDay()).toBe(1) // Monday
      expect(resultDate.toISOString()).toContain('2024-03-11')
    })
  })

  describe('edge cases', () => {
    test('should handle start of year for January 1st', () => {
      const result = startOf(
        '2024-01-01T00:00:00Z',
        { unit: 'year' },
        {
          timeZone: 'UTC',
        },
      )
      expect(result.value).toBe('2024-01-01T00:00:00Z')
    })

    test('should handle start of month for first day', () => {
      const result = startOf(
        '2024-03-01T00:00:00Z',
        { unit: 'month' },
        {
          timeZone: 'UTC',
        },
      )
      expect(result.value).toBe('2024-03-01T00:00:00Z')
    })

    test('should handle start of day at midnight', () => {
      const result = startOf(
        '2024-03-15T00:00:00Z',
        { unit: 'day' },
        {
          timeZone: 'UTC',
        },
      )
      expect(result.value).toBe('2024-03-15T00:00:00Z')
    })

    test('should handle start of hour at 00:00', () => {
      const result = startOf('2024-03-15T14:00:00Z', { unit: 'hour' })
      expect(result.value).toContain('2024-03-15T14:00:00')
    })
  })
})
