import type { Locale } from "~/formatter/shared";

export function normalizeLocale(locale: Locale): string | Array<string> {
  return Array.isArray(locale)
    ? locale.map((loc) => (typeof loc === "string" ? loc : loc.toString()))
    : typeof locale === "string"
      ? locale
      : locale.toString();
}
