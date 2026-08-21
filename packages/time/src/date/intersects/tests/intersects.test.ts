import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { intersects } from '../intersects'

describe('intersects', () => {
  describe('basic functionality', () => {
    test('should return true when date is between start and end', () => {
      const result = intersects('2024-03-16T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-17T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true when date equals start', () => {
      const result = intersects('2024-03-15T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-17T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return true when date equals end', () => {
      const result = intersects('2024-03-17T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-17T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should return false when date is before start', () => {
      const result = intersects('2024-03-14T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-17T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })

    test('should return false when date is after end', () => {
      const result = intersects('2024-03-18T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-17T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })
  })

  describe('with different input types', () => {
    test('should work with Date objects', () => {
      const date = new Date('2024-03-16T14:42:12.789Z')
      const result = intersects(date, {
        range: {
          start: new Date('2024-03-15T14:42:12.789Z'),
          end: new Date('2024-03-17T14:42:12.789Z'),
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with epoch time', () => {
      const date = new Date('2024-03-16T14:42:12.789Z').getTime()
      const result = intersects(date, {
        range: {
          start: new Date('2024-03-15T14:42:12.789Z').getTime(),
          end: new Date('2024-03-17T14:42:12.789Z').getTime(),
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from(
        '2024-03-16T14:42:12.789Z[UTC][u-ca=gregory]',
      )
      const result = intersects(zdt, {
        range: {
          start: Temporal.ZonedDateTime.from(
            '2024-03-15T14:42:12.789Z[UTC][u-ca=gregory]',
          ),
          end: Temporal.ZonedDateTime.from(
            '2024-03-17T14:42:12.789Z[UTC][u-ca=gregory]',
          ),
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should work with mixed input types', () => {
      const result = intersects('2024-03-16T14:42:12.789Z', {
        range: {
          start: new Date('2024-03-15T14:42:12.789Z'),
          end: '2024-03-17T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })
  })

  describe('timezone handling', () => {
    test('should respect timezone', () => {
      const result = intersects('2024-03-16T14:00:00Z', {
        range: {
          start: '2024-03-15T14:00:00Z',
          end: '2024-03-17T14:00:00Z',
        },
        timeZone: 'America/New_York',
      })
      expect(result).toBe(true)
    })
  })

  describe('calendar handling', () => {
    test('should respect calendar', () => {
      const result = intersects('2024-03-16T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-17T14:42:12.789Z',
        },
        calendar: 'japanese',
      })
      expect(result).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle milliseconds precision', () => {
      const result = intersects('2024-03-15T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.788Z',
          end: '2024-03-15T14:42:12.790Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should handle same start and end date', () => {
      const result = intersects('2024-03-15T14:42:12.789Z', {
        range: {
          start: '2024-03-15T14:42:12.789Z',
          end: '2024-03-15T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(true)
    })

    test('should handle reversed range (start after end)', () => {
      const result = intersects('2024-03-16T14:42:12.789Z', {
        range: {
          start: '2024-03-17T14:42:12.789Z',
          end: '2024-03-15T14:42:12.789Z',
        },
        timeZone: 'UTC',
      })
      expect(result).toBe(false)
    })
  })
})
