export interface ILocaleFormatterOptions {
  localeMatcher?: 'lookup' | 'best fit'
  calendar?: string
  numberingSystem?: string
  hour12?: boolean
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24'
  timeZone?: string
}

type FormatStyle = 'full' | 'long' | 'medium' | 'short'

export interface IDateFormatterOptions extends ILocaleFormatterOptions {
  formatMatcher?: 'basic' | 'best fit'
  weekday?: 'narrow' | 'short' | 'long'
  era?: 'narrow' | 'short' | 'long'
  year?: '2-digit' | 'numeric'
  month?: '2-digit' | 'numeric' | 'narrow' | 'short' | 'long'
  day?: '2-digit' | 'numeric'
  // style shortcuts
  dateStyle?: FormatStyle
}

export interface ITimeFormatterOptions extends ILocaleFormatterOptions {
  formatMatcher?: 'basic' | 'best fit'
  dayPeriod?: 'narrow' | 'short' | 'long'
  hour?: '2-digit' | 'numeric'
  minute?: '2-digit' | 'numeric'
  second?: '2-digit' | 'numeric'
  fractionalSecondDigits?: 1 | 2 | 3
  timeZoneName?:
    | 'short'
    | 'long'
    | 'shortOffset'
    | 'longOffset'
    | 'shortGeneric'
    | 'longGeneric'
  // style shortcuts
  timeStyle?: FormatStyle
}

export interface IDateTimeFormatterOptions
  extends IDateFormatterOptions,
    ITimeFormatterOptions {}

export interface IDateFormatterBuildParams {
  locale?: string | Intl.Locale | Array<string | Intl.Locale>
  options?: FormatStyle | IDateFormatterOptions
}

export interface ITimeFormatterBuildParams {
  locale?: string | Intl.Locale | Array<string | Intl.Locale>
  options?: FormatStyle | ITimeFormatterOptions
}

export interface IDateTimeFormatterBuildParams {
  locale?: string | Intl.Locale | Array<string | Intl.Locale>
  options?: FormatStyle | IDateTimeFormatterOptions
}
