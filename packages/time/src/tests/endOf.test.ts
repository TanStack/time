import { Temporal } from '@js-temporal/polyfill'
import { describe, expect, test } from 'vitest'
import { endOf } from '../utils'

describe('endOf', () => {
  test('should get the end of the given day', () => {
    const date = Temporal.ZonedDateTime.from(
      '2023-07-16T12:34:56.789+01:00[Europe/London]',
    )
    const result = endOf({
      date,
      unit: 'day',
    })
    const expected = Temporal.ZonedDateTime.from(
      '2023-07-16T23:59:59.999999999+01:00[Europe/London]',
    )
    expect(result.equals(expected)).toBe(true)
  })

  test('should get the end of the given week', () => {
    const date = Temporal.ZonedDateTime.from(
      '2023-07-13T12:34:56.789+01:00[Europe/London]',
    )
    const result = endOf({
      date,
      unit: 'week',
    })
    const expected = Temporal.ZonedDateTime.from(
      '2023-07-16T23:59:59.999999999+01:00[Europe/London]',
    )
    expect(result.equals(expected)).toBe(true)
  })

  test('should get the end of the given month', () => {
    const date = Temporal.ZonedDateTime.from(
      '2023-07-16T12:34:56.789+01:00[Europe/London]',
    )
    const result = endOf({
      date,
      unit: 'month',
    })
    const expected = Temporal.ZonedDateTime.from(
      '2023-07-31T23:59:59.999999999+01:00[Europe/London]',
    )
    expect(result.equals(expected)).toBe(true)
  })

  test('should get the end of the given year', () => {
    const date = Temporal.ZonedDateTime.from(
      '2023-07-16T12:34:56.789+01:00[Europe/London]',
    )
    const result = endOf({
      date,
      unit: 'year',
    })
    const expected = Temporal.ZonedDateTime.from(
      '2023-12-31T23:59:59.999999999+00:00[Europe/London]',
    )
    expect(result.equals(expected)).toBe(true)
  })

  test('should get the end of the given work week', () => {
    const date = Temporal.ZonedDateTime.from(
      '2023-07-10T12:34:56.789+01:00[Europe/London]',
    )
    const result = endOf({
      date,
      unit: 'workWeek',
    })
    const expected = Temporal.ZonedDateTime.from(
      '2023-07-14T23:59:59.999999999+01:00[Europe/London]',
    )
    expect(result.equals(expected)).toBe(true)
  })

  test('should get the end of the given decade', () => {
    const date = Temporal.ZonedDateTime.from(
      '2023-07-16T12:34:56.789+01:00[Europe/London]',
    )
    const result = endOf({
      date,
      unit: 'decade',
    })
    const expected = Temporal.ZonedDateTime.from(
      '2029-12-31T23:59:59.999999999+00:00[Europe/London]',
    )
    expect(result.equals(expected)).toBe(true)
  })

  test('should handle daylight saving time changes', () => {
    // Test for a date just before the DST change
    const dateBeforeDST = Temporal.ZonedDateTime.from(
      '2023-10-28T12:00:00+01:00[Europe/London]',
    )
    const resultBeforeDST = endOf({
      date: dateBeforeDST,
      unit: 'day',
    })
    const expectedBeforeDST = Temporal.ZonedDateTime.from(
      '2023-10-28T23:59:59.999999999+01:00[Europe/London]',
    )
    expect(resultBeforeDST.equals(expectedBeforeDST)).toBe(true)

    // Test for a date just after the DST change
    const dateAfterDST = Temporal.ZonedDateTime.from(
      '2023-10-29T12:00:00+00:00[Europe/London]',
    )
    const resultAfterDST = endOf({
      date: dateAfterDST,
      unit: 'day',
    })
    const expectedAfterDST = Temporal.ZonedDateTime.from(
      '2023-10-29T23:59:59.999999999+00:00[Europe/London]',
    )
    expect(resultAfterDST.equals(expectedAfterDST)).toBe(true)
  })

  test('should handle different time zones', () => {
    const dateNY = Temporal.ZonedDateTime.from(
      '2023-07-16T12:34:56.789-04:00[America/New_York]',
    )
    const resultNY = endOf({
      date: dateNY,
      unit: 'day',
    })
    const expectedNY = Temporal.ZonedDateTime.from(
      '2023-07-16T23:59:59.999999999-04:00[America/New_York]',
    )
    expect(resultNY.equals(expectedNY)).toBe(true)
  })
})
