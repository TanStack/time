import { describe, expect, test } from 'vitest'
import { buildFinalFormatter } from '../src/utils/buildFinalFormatter'

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short',
  timeZone: 'America/New_York',
})

const timeOnlyFormat = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  // second: '2-digit',
  // timeZoneName: 'short',
  timeZone: 'America/New_York',
})

describe('buildFinalFormatter', () => {
  test('should return a function', () => {
    const formatter = buildFinalFormatter({
      formatter: dateTimeFormat,
      formatterName: 'dateTimeFormat',
    })
    expect(typeof formatter).toBe('function')
  })

  const format = buildFinalFormatter({
    formatter: dateTimeFormat,
    formatterName: 'dateTimeFormat',
  })

  test('should format a date string', () => {
    expect(format('2021-03-12T14:42')).toBe('03/12/2021, 02:42:00 PM EST')
  })

  const timeFormat = buildFinalFormatter({
    formatter: timeOnlyFormat,
    formatterName: 'timeOnlyFormat',
    forRange: true,
  })

  test('should format a time string range', () => {
    // output does not show 2-digit hour in range due to a bug in Intl.DateTimeFormat.formatRange
    expect(timeFormat('2021-03-12T14:42', '2021-03-12T15:42')).toBe(
      '2:42 – 3:42 PM',
    )
  })
})
