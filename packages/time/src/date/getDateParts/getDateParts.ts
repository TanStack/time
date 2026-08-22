import { Temporal } from '@js-temporal/polyfill'
import { getDateTimeDefaults } from '~/utils'
import type { DateInput, DateOptions } from '../types'

const REFERENCE_ISO_DATE = '2020-01-01'
const CACHE_LIMIT = 8192

export interface DateParts {
  calendar: string

  /** Temporal-backed. Read lazily: non-ISO calendar support depends on the runtime. */
  year: number
  month: number
  monthCode: string
  day: number
  isLeapMonth: boolean

  dayOfMonth: string
  weekdayShort: string
  weekdayLong: string
  monthShort: string
  monthLong: string
  yearLabel: string
  yearName?: string
}

export interface GetDatePartsOptions extends DateOptions {
  locale?: Intl.UnicodeBCP47LocaleIdentifier
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()
const plainDateCache = new Map<string, Temporal.PlainDate>()
const partsCache = new Map<string, DateParts>()

function cacheSet<K, V>(cache: Map<K, V>, key: K, value: V): V {
  if (cache.size >= CACHE_LIMIT) {
    let dropped = 0
    for (const staleKey of cache.keys()) {
      cache.delete(staleKey)
      if (++dropped >= CACHE_LIMIT / 2) break
    }
  }
  cache.set(key, value)
  return value
}

// ICU has no localized patterns for `iso8601`: it drops the weekday and forces
// year-first output regardless of locale. Format as `gregory` instead, which
// yields identical y/m/d values for the dates a calendar UI displays.
function intlCalendarId(calendarId: string): string {
  return calendarId === 'iso8601' ? 'gregory' : calendarId
}

export function resolveCalendarId(calendar: Temporal.CalendarLike): string {
  return Temporal.PlainDate.from(REFERENCE_ISO_DATE).withCalendar(calendar).calendarId
}

export function toIsoDateString(date: DateInput, timeZone: string): string {
  if (typeof date === 'string') {
    return date.length === 7 ? `${date}-01` : date.slice(0, 10)
  }
  if (date instanceof Temporal.PlainDate) {
    return date.toString({ calendarName: 'never' })
  }
  if (date instanceof Temporal.ZonedDateTime) {
    return date.toPlainDate().toString({ calendarName: 'never' })
  }

  const epochMilliseconds = date instanceof Date ? date.getTime() : date
  return Temporal.Instant.fromEpochMilliseconds(epochMilliseconds)
    .toZonedDateTimeISO(timeZone)
    .toPlainDate()
    .toString({ calendarName: 'never' })
}

export function toCalendarDate(isoDate: string, calendarId: string): Temporal.PlainDate {
  const key = `${calendarId}|${isoDate}`
  return (
    plainDateCache.get(key) ??
    cacheSet(plainDateCache, key, Temporal.PlainDate.from(isoDate).withCalendar(calendarId))
  )
}

export function getDateFormatter(
  locale: string,
  calendarId: string,
  presetKey: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${calendarId}|${presetKey}`
  return (
    formatterCache.get(key) ??
    cacheSet(
      formatterCache,
      key,
      new Intl.DateTimeFormat(locale, {
        timeZone: 'UTC',
        calendar: intlCalendarId(calendarId),
        ...options,
      }),
    )
  )
}

function partsOf(formatter: Intl.DateTimeFormat, date: Date): Map<string, string> {
  const parts = new Map<string, string>()
  for (const part of formatter.formatToParts(date)) {
    if (part.type === 'literal') continue
    parts.set(part.type, part.value)
  }
  return parts
}

function buildParts(isoDate: string, calendarId: string, locale: string): DateParts {
  const utcDate = new Date(`${isoDate}T00:00:00Z`)

  const long = partsOf(
    getDateFormatter(locale, calendarId, 'long', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    utcDate,
  )
  const short = partsOf(
    getDateFormatter(locale, calendarId, 'short', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    utcDate,
  )
  // Component options force latin digits, so a lunisolar day reads "9" instead
  // of "初九". The locale's stock pattern carries the calendar's own day
  // symbols, and matches the component output for every other calendar.
  const stock = partsOf(
    getDateFormatter(locale, calendarId, 'stock', { dateStyle: 'long' }),
    utcDate,
  )

  const parts: DateParts = {
    calendar: calendarId,
    dayOfMonth: stock.get('day') ?? long.get('day') ?? '',
    weekdayShort: short.get('weekday') ?? '',
    weekdayLong: long.get('weekday') ?? '',
    monthShort: short.get('month') ?? '',
    monthLong: long.get('month') ?? '',
    yearLabel: long.get('year') ?? long.get('relatedYear') ?? '',
    yearName: long.get('yearName'),
  } as DateParts

  // Reading these converts the date through Temporal, whose lunisolar calendars
  // break on runtimes ICU renders numeric months for differently (it throws
  // "Unexpected leap month suffix: Mo6" on current Chrome). Keeping them lazy
  // means rendering localized labels never depends on that support.
  const calendarDate = () => toCalendarDate(isoDate, calendarId)
  Object.defineProperties(parts, {
    year: { enumerable: true, get: () => calendarDate().year },
    month: { enumerable: true, get: () => calendarDate().month },
    monthCode: { enumerable: true, get: () => calendarDate().monthCode },
    day: { enumerable: true, get: () => calendarDate().day },
    isLeapMonth: {
      enumerable: true,
      get: () => calendarDate().monthCode.endsWith('L'),
    },
  })

  return parts
}

export function getDateParts(date: DateInput, options?: GetDatePartsOptions): DateParts {
  const defaults = getDateTimeDefaults()
  const locale = options?.locale ?? defaults.locale
  const calendarId = options?.calendar ?? defaults.calendar
  const timeZone = options?.timeZone ?? defaults.timeZone

  const isoDate = toIsoDateString(date, timeZone)
  const key = `${locale}|${calendarId}|${isoDate}`

  return partsCache.get(key) ?? cacheSet(partsCache, key, buildParts(isoDate, calendarId, locale))
}
