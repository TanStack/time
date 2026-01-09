import { describe, expect, it } from 'vitest'
import { parseDate } from '../src/utils/parseDate'

describe('parseDate', () => {
  describe('Date input', () => {
    it('should parse valid Date object', () => {
      const date = new Date('2023-01-01T00:00:00Z')
      const result = parseDate(date)
      expect(result.success).toBe(true)

      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2023-01-01T00:00:00.000Z')
    })

    it('should return error for invalid Date object', () => {
      const invalidDate = new Date('invalid')
      const result = parseDate(invalidDate)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('number input', () => {
    it('should parse valid timestamp', () => {
      const timestamp = new Date('2023-01-01T00:00:00Z').getTime()
      const result = parseDate(timestamp)
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2023-01-01T00:00:00.000Z')
    })

    it('should parse timestamp with milliseconds', () => {
      const timestamp = new Date('2023-06-15T14:30:45.123Z').getTime()
      const result = parseDate(timestamp)
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2023-06-15T14:30:45.123Z')
    })

    it('should return error for invalid timestamp', () => {
      const result = parseDate(NaN)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('string input', () => {
    it('should parse ISO 8601 datetime with Z timezone', () => {
      const result = parseDate('2020-01-01T00:00:00Z')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2020-01-01T00:00:00.000Z')
    })

    it('should parse datetime with milliseconds', () => {
      const result = parseDate('2020-01-01T00:00:00.123Z')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.getMilliseconds()).toBe(123)
    })

    it('should parse datetime with arbitrary precision', () => {
      const result = parseDate('2020-01-01T00:00:00.123456Z')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
    })

    it('should parse datetime without seconds', () => {
      const result = parseDate('2020-01-01T00:00Z')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2020-01-01T00:00:00.000Z')
    })

    it('should parse datetime with positive timezone offset', () => {
      const result = parseDate('2020-01-01T00:00:00+02:00')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2019-12-31T22:00:00.000Z')
    })

    it('should parse datetime with negative timezone offset', () => {
      const result = parseDate('2020-01-01T12:00:00-05:00')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2020-01-01T17:00:00.000Z')
    })

    it('should parse datetime with short timezone offset format', () => {
      const result = parseDate('2020-01-01T00:00:00.123+0200')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
    })

    it('should parse datetime without seconds', () => {
      const result = parseDate('2020-01-01T00:00+02:00')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
    })

    it('should parse string representation of timestamp', () => {
      const timestamp = new Date('2023-01-01T00:00:00Z').getTime()
      const result = parseDate(String(timestamp))
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.toISOString()).toBe('2023-01-01T00:00:00.000Z')
    })

    it('should parse numeric timestamp string', () => {
      const timestamp = 1762259739191
      const result = parseDate(String(timestamp))
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
      expect(result.data!.getTime()).toBe(timestamp)
    })

    it.each(['invalid-date', '14:30:00', 'not-a-date'])(
      'should return error for %s input',
      (input) => {
        const result = parseDate(input)
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      },
    )
  })

  it.each([null, undefined, true, {}, [], 'not-a-date'])(
    'should return error for %s input',
    (input) => {
      // @ts-expect-error - intentionally passing invalid input
      const result = parseDate(input)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    },
  )
})
