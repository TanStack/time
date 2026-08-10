import { withDateOperation } from "../withDateOperation";
import type { DateOperationOptions } from "../withDateOperation";
import type { DateInput } from "../types";

export type CeilUnit =
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

export interface CeilOptions extends DateOperationOptions {
  unit: CeilUnit;
}

export function ceil(input: DateInput, options: CeilOptions): Date {
  return withDateOperation<CeilOptions>((zdt, { unit }) => {
    return zdt.round({ smallestUnit: unit, roundingMode: "ceil" });
  })(input, options);
}
