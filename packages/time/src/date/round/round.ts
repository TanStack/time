import { withDateOperation } from "../withDateOperation";
import type { DateInput } from "../types";
import type { DateOperationOptions } from "../withDateOperation";
import type { Temporal } from "@js-temporal/polyfill";

export type RoundUnit =
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "microsecond"
  | "nanosecond";

export type RoundingMode = Temporal.RoundingMode;

export interface RoundOptions extends DateOperationOptions {
  unit: RoundUnit;
  roundingMode?: RoundingMode;
  roundingIncrement?: number;
}

export function round(input: DateInput, options: RoundOptions) {
  return withDateOperation<RoundOptions>((zdt, options) => {
    const { unit, roundingMode = "halfExpand", roundingIncrement } = options;
    return zdt.round({ smallestUnit: unit, roundingMode, roundingIncrement });
  })(input, options);
}
