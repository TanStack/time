import { withDateOperation } from "../withDateOperation";
import type { DateOperationOptions } from "../withDateOperation";
import type { DateInput, DurationLike } from "../types";

export interface SubtractOptions extends DateOperationOptions {
  duration: DurationLike;
}

export function subtract(input: DateInput, options: SubtractOptions) {
  return withDateOperation<SubtractOptions>((zdt, { duration }) => {
    return zdt.subtract(duration);
  })(input, options);
}
