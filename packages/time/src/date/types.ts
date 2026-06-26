import type { Temporal } from "@js-temporal/polyfill";

export type DateInput =
  | string
  | number
  | Date
  | Temporal.ZonedDateTime
  | Temporal.PlainDate;

export interface DateOptions {
  calendar?: string;
  timeZone?: string;
}

export type DurationLike = Temporal.DurationLike;

export interface Range {
  start: DateInput;
  end: DateInput;
}
