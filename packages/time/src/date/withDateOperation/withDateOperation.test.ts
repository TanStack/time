import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { withDateOperation } from './withDateOperation'

describe('withDateOperation', () => {
  const mockOperation = withDateOperation((zdt, _args: { unit: string }) => zdt)

  describe('timezone handling', () => {
    test('should use default timezone when not provided', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', { unit: 'test' })
      expect(result.options.timeZone).toBeDefined()
      expect(typeof result.options.timeZone).toBe('string')
    })

    test('should use custom timezone', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'Asia/Tokyo',
      })
      expect(result.options.timeZone).toBe('Asia/Tokyo')
    })

    test('should return timezone in options', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'Europe/London',
      })
      expect(result.options.timeZone).toBe('Europe/London')
    })
  })

  describe('calendar handling', () => {
    test('should use default calendar when not provided', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', { unit: 'test' })
      expect(result.options.calendar).toBeDefined()
      expect(typeof result.options.calendar).toBe('string')
    })

    test('should use custom calendar', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        calendar: 'japanese',
      })
      expect(result.options.calendar).toBe('japanese')
    })

    test('should return calendar in options', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        calendar: 'islamic',
      })
      expect(result.options.calendar).toBe('islamic')
    })
  })

  describe('conversion methods', () => {
    test('should have asDate method', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })
      const date = result.asDate()
      expect(date).toBeInstanceOf(Date)
      expect(date.toISOString()).toContain('2024-03-15')
    })

    test('should have asEpoch method', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })
      const epoch = result.asEpoch()
      expect(typeof epoch).toBe('number')
      expect(new Date(epoch).toISOString()).toContain('2024-03-15')
    })

    test('should have asString method', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })
      const str = result.asString()
      expect(typeof str).toBe('string')
      expect(str).toContain('2024-03-15')
    })

    test('should have asLong method', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'America/New_York',
        calendar: 'gregory',
      })
      const long = result.asLong()
      expect(typeof long).toBe('string')
      expect(long).toContain('2024-03-15')
      expect(long).toContain('[America/New_York]')
      expect(long).toContain('[u-ca=gregory]')
    })

    test('should have asZonedDateTime method', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })
      const zdt = result.asZonedDateTime()
      expect(zdt).toBeInstanceOf(Temporal.ZonedDateTime)
      expect(zdt.toInstant().toString()).toContain('2024-03-15')
    })
  })

  describe('result properties', () => {
    test('should have value property (defaults to string)', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })
      expect(typeof result.value).toBe('string')
      const valueStr = result.value
      expect(valueStr).toContain('2024-03-15')
    })

    test('should have options property', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', { unit: 'test' })
      expect(result.options).toHaveProperty('timeZone')
      expect(result.options).toHaveProperty('calendar')
      expect(typeof result.options.timeZone).toBe('string')
      expect(typeof result.options.calendar).toBe('string')
    })

    test('should have timeZone property', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'Asia/Tokyo',
      })
      expect(result.timeZone).toBe('Asia/Tokyo')
    })

    test('should have calendar property', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        calendar: 'japanese',
      })
      expect(result.calendar).toBe('japanese')
    })

    test('should support destructuring', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
        calendar: 'gregory',
      })
      const { value, timeZone, calendar, returnFormat } = result
      expect(typeof value).toBe('string')
      expect(timeZone).toBe('UTC')
      expect(calendar).toBe('gregory')
      expect(returnFormat).toBe('standard')
    })
  })

  describe('returnFormat', () => {
    test('should default to standard format', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })
      expect(result.returnFormat).toBe('standard')
      expect(typeof result.value).toBe('string')
      expect(result.value).toContain('2024-03-15')
      expect(result.value).not.toContain('[')
    })

    test('should return standard format (RFC 3339 string)', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
        returnFormat: 'standard',
      })
      expect(result.returnFormat).toBe('standard')
      expect(typeof result.value).toBe('string')
      const valueStr = result.value
      expect(valueStr).toContain('2024-03-15')
      expect(valueStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(valueStr).not.toContain('[')
    })

    test('should return long format (with timezone and calendar)', () => {
      const result = mockOperation('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'America/New_York',
        calendar: 'gregory',
        returnFormat: 'long',
      })
      expect(result.returnFormat).toBe('long')
      expect(typeof result.value).toBe('string')
      const valueStr = result.value
      expect(valueStr).toContain('2024-03-15')
      expect(valueStr).toContain('[America/New_York]')
      expect(valueStr).toContain('[u-ca=gregory]')
    })
  })

  describe('operation execution', () => {
    test('should execute the provided operation function', () => {
      const addDayOperation = withDateOperation(
        (zdt, { days }: { days: number }) => {
          return zdt.add({ days })
        },
      )
      const result = addDayOperation('2024-03-15T00:00:00Z', {
        days: 1,
        timeZone: 'UTC',
      })
      expect(result.value).toBe('2024-03-16T00:00:00Z')
    })

    test('should pass args to the operation function', () => {
      const customOperation = withDateOperation(
        (zdt, { multiplier }: { multiplier: number }) => {
          const days = zdt.day * multiplier
          return zdt.with({ day: days })
        },
      )
      const result = customOperation('2024-03-15T00:00:00Z', {
        multiplier: 2,
        timeZone: 'UTC',
      })
      const valueStr = result.value
      expect(valueStr).toContain('2024-03-30')
    })
  })
})
