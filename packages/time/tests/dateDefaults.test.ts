import { describe, expect, test } from 'vitest'
import {
  getDateDefaults,
  getDefaultCalendar,
  getDefaultLocale,
  getDefaultTimeZone,
} from '../src/date/dateDefaults'

const {
  calendar: defaultCalendar,
  locale: defaultLocale,
  timeZone: defaultTimeZone,
} = new Intl.DateTimeFormat().resolvedOptions()

describe('dateDefaults', () => {
  test('should return the default calendar', () => {
    expect(getDefaultCalendar()).toBe(defaultCalendar)
  })

  test('should return the default locale', () => {
    expect(getDefaultLocale()).toBe(defaultLocale)
  })

  test('should return the default time zone', () => {
    expect(getDefaultTimeZone()).toBe(defaultTimeZone)
  })

  test('should return the default date defaults', () => {
    expect(getDateDefaults()).toEqual({
      calendar: defaultCalendar,
      locale: defaultLocale,
      timeZone: defaultTimeZone,
    })
  })
})
