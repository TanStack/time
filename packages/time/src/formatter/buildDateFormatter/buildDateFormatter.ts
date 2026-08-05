import type { DateFormatterBuildParams, DateFormatterOptions } from "../shared";
import { normalizeLocale } from "~/date/helpers";
import { getDateTimeDefaults } from "~/utils";
import { extractLocaleOptions } from "~/formatter/extractLocaleOptions";

export function buildDateFormatter({
  locale = getDateTimeDefaults().locale,
  options,
}: DateFormatterBuildParams): Intl.DateTimeFormat {
  const normalizedLocale = normalizeLocale(locale);
  const opts =
    typeof options === "string" ? { dateStyle: options } : (options ?? {});
  const { formatOptions = {}, ...localeOptions } = extractLocaleOptions(opts);
  const { dateStyle, ...rest } = formatOptions as DateFormatterOptions;
  const newOptions = {
    ...localeOptions,
    ...(dateStyle ? { dateStyle } : rest),
  };
  return new Intl.DateTimeFormat(normalizedLocale, newOptions);
}
