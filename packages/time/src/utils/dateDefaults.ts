export interface IDateDefaults {
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
 * @returns IDateDefaults
 */
export function getDateDefaults(): IDateDefaults {
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
export function getDefaultLocale(): string {
  return defaultLocale
}

/**
 * getDefaultTimeZone
 * @returns string - default time zone
 */
export function getDefaultTimeZone(): string {
  return defaultTimeZone
}
