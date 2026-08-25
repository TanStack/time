import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { toInstantDate, withDateOperation } from './withDateOperation'

describe('withDateOperation', () => {
  const identity = withDateOperation((zdt, _args: { unit: string }) => zdt)

  describe('return contract', () => {
    test('should return a native Date and nothing else', () => {
      const result = identity('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'UTC',
      })

      expect(result).toBeInstanceOf(Date)
      expect(result.toISOString()).toBe('2024-03-15T14:42:12.789Z')
    })

    test('should not carry the timezone or calendar in the result', () => {
      const result = identity('2024-03-15T14:42:12.789Z', {
        unit: 'test',
        timeZone: 'America/New_York',
        calendar: 'gregory',
      })

      expect(Object.keys(result)).toEqual([])
      expect(result.toISOString()).not.toContain('[')
    })

    test('should compose as a DateInput, which is the point of returning a Date', () => {
      const addDays = withDateOperation((zdt, { days }: { days: number }) => zdt.add({ days }))

      const once = addDays('2024-03-15T00:00:00Z', {
        days: 1,
        timeZone: 'UTC',
      })
      const twice = addDays(once, { days: 1, timeZone: 'UTC' })

      expect(twice.toISOString()).toBe('2024-03-17T00:00:00.000Z')
    })
  })

  describe('timezone and calendar are inputs only', () => {
    test('should default the timezone when none is given', () => {
      expect(identity('2024-03-15T14:42:12.789Z', { unit: 'test' })).toEqual(
        new Date('2024-03-15T14:42:12.789Z'),
      )
    })

    test('should run the operation on the local clock of the given timezone', () => {
      const startOfDay = withDateOperation((zdt, _args: { unit: string }) =>
        zdt.with({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          microsecond: 0,
          nanosecond: 0,
        }),
      )

      expect(
        startOfDay('2024-03-15T14:42:12.789Z', {
          unit: 'day',
          timeZone: 'Asia/Tokyo',
        }).toISOString(),
      ).toBe('2024-03-14T15:00:00.000Z')

      expect(
        startOfDay('2024-03-15T14:42:12.789Z', {
          unit: 'day',
          timeZone: 'UTC',
        }).toISOString(),
      ).toBe('2024-03-15T00:00:00.000Z')
    })

    test('should run the operation in the given calendar', () => {
      const addMonth = withDateOperation((zdt, _args: { unit: string }) => zdt.add({ months: 1 }))

      expect(
        addMonth('2024-03-15T14:42:12.789Z', {
          unit: 'month',
          timeZone: 'UTC',
          calendar: 'islamic',
        }).toISOString(),
      ).toBe('2024-04-13T14:42:12.789Z')

      expect(
        addMonth('2024-03-15T14:42:12.789Z', {
          unit: 'month',
          timeZone: 'UTC',
          calendar: 'iso8601',
        }).toISOString(),
      ).toBe('2024-04-15T14:42:12.789Z')
    })
  })

  describe('operation execution', () => {
    test('should pass args to the operation function', () => {
      const scaleDay = withDateOperation((zdt, { multiplier }: { multiplier: number }) =>
        zdt.with({ day: zdt.day * multiplier }),
      )

      expect(
        scaleDay('2024-03-15T00:00:00Z', {
          multiplier: 2,
          timeZone: 'UTC',
        }).toISOString(),
      ).toContain('2024-03-30')
    })
  })

  describe('toInstantDate', () => {
    test('should floor sub-millisecond precision instead of truncating toward zero', () => {
      const zdt = Temporal.ZonedDateTime.from('1969-12-31T23:59:59.9995Z[UTC][u-ca=iso8601]')

      expect(toInstantDate(zdt).getTime()).toBe(-1)
    })
  })
})
