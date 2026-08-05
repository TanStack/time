import { withDateOperation } from "../withDateOperation";
import type { DateOperationOptions } from "../withDateOperation";
import type { DateInput, DurationLike } from "../types";

export interface AddOptions extends DateOperationOptions {
  duration: DurationLike;
}

export function add(input: DateInput, options: AddOptions) {
  return withDateOperation<AddOptions>((zdt, { duration }) => {
    return zdt.add(duration);
  })(input, options);
}
