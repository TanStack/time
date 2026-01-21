import type { Locale } from '../formatter/shared'

const defaults = new Intl.DateTimeFormat().resolvedOptions()

export function getDateTimeDefaults() {
  return defaults
}

export function normalizeLocale(locale: Locale): string | Array<string> {
  return Array.isArray(locale)
    ? locale.map((loc) => (typeof loc === 'string' ? loc : loc.toString()))
    : typeof locale === 'string'
      ? locale
      : locale.toString()
}
