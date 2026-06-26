import { withDateOperation } from "../withDateOperation";
import type { DateOperationOptions } from "../withDateOperation";
import type { DateInput } from "../types";

export type CeilUnit =
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "microsecond"
  | "nanosecond";

export interface CeilOptions extends DateOperationOptions {
  unit: CeilUnit;
}

export function ceil(input: DateInput, options: CeilOptions) {
  return withDateOperation<CeilOptions>((zdt, { unit }) => {
    return zdt.round({ smallestUnit: unit, roundingMode: "ceil" });
  })(input, options);
}
