import type { Locale } from '../formatter/shared'

export interface DateDefaults {
  calendar: string
  locale: string
  timeZone: string
}

const {
  calendar: defaultCalendar,
  locale: defaultLocale,
  timeZone: defaultTimeZone,
} = new Intl.DateTimeFormat().resolvedOptions()

/**
 * getDateDefaults
 * @returns DateDefaults
 */
export function getDateDefaults(): DateDefaults {
  return {
    calendar: defaultCalendar,
    locale: defaultLocale,
    timeZone: defaultTimeZone,
  }
}

/**
 * getDefaultCalendar
 * @returns string - default calendar
 */
export function getDefaultCalendar(): string {
  return defaultCalendar
}

/**
 * getDefaultLocale
 * @returns string - default locale
 */
export function getDefaultLocale(): Locale {
  return defaultLocale
}

/**
 * getDefaultTimeZone
 * @returns string - default time zone
 */
export function getDefaultTimeZone(): string {
  return defaultTimeZone
}

export function normalizeLocale(locale: Locale): string | Array<string> {
  return Array.isArray(locale)
    ? locale.map((loc) => (typeof loc === 'string' ? loc : loc.toString()))
    : typeof locale === 'string'
      ? locale
      : locale.toString()
}
