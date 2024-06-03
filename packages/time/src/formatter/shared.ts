export interface LocaleFormatterOptions {
  localeMatcher?: 'lookup' | 'best fit';
  calendar?: string;
  numberingSystem?: string;
  hour12?: boolean;
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
  timeZone?: string;
}

type FormatStyle = 'full' | 'long' | 'medium' | 'short';

export interface DateFormatterOptions extends LocaleFormatterOptions {
  formatMatcher?: 'basic' | 'best fit';
  weekday?: 'narrow' | 'short' | 'long';
  era?: 'narrow' | 'short' | 'long';
  year?: '2-digit' | 'numeric';
  month?: '2-digit' | 'numeric' | 'narrow' | 'short' | 'long';
  day?: '2-digit' | 'numeric';
  // style shortcuts
  dateStyle?: FormatStyle;
}

export interface TimeFormatterOptions extends LocaleFormatterOptions {
  formatMatcher?: 'basic' | 'best fit';
  dayPeriod?: 'narrow' | 'short' | 'long';
  hour?: '2-digit' | 'numeric';
  minute?: '2-digit' | 'numeric';
  second?: '2-digit' | 'numeric';
  fractionalSecondDigits?: 1 | 2 | 3;
  timeZoneName?: 'short' | 'long' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric';
  // style shortcuts
  timeStyle?: FormatStyle;
}

export type DateTimeFormatterOptions = DateFormatterOptions & TimeFormatterOptions

interface FormatterBuildParams<TOptions extends LocaleFormatterOptions> {
  locale?: string | Intl.Locale | Array<string | Intl.Locale>;
  options?: FormatStyle | TOptions;
}

export type DateFormatterBuildParams = FormatterBuildParams<DateFormatterOptions>;
export type TimeFormatterBuildParams = FormatterBuildParams<TimeFormatterOptions>;
export type DateTimeFormatterBuildParams = FormatterBuildParams<DateTimeFormatterOptions>;

export type UnionKeys<T> = T extends T ? keyof T : never;
export type StrictUnionHelper<T, TAll> = T extends any ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never;
export type StrictUnion<T> = StrictUnionHelper<T, T>