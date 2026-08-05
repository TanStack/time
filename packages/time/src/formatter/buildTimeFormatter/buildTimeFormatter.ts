import type { TimeFormatterBuildParams, TimeFormatterOptions } from "../shared";
import { getDateTimeDefaults } from "~/utils";
import { normalizeLocale } from "~/date/helpers";
import { extractLocaleOptions } from "~/formatter/extractLocaleOptions";

export function buildTimeFormatter({
  locale = getDateTimeDefaults().locale,
  options,
}: TimeFormatterBuildParams): Intl.DateTimeFormat {
  const normalizedLocale = normalizeLocale(locale);
  const opts =
    typeof options === "string" ? { dateStyle: options } : (options ?? {});
  const { formatOptions = {}, ...localeOptions } = extractLocaleOptions(opts);
  const { timeStyle, ...rest } = formatOptions as TimeFormatterOptions;
  const newOptions = {
    ...localeOptions,
    ...(timeStyle ? { timeStyle } : rest),
  };
  return new Intl.DateTimeFormat(normalizedLocale, newOptions);
}
