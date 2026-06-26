import { withDateOperation } from "../withDateOperation";
import type { DateOperationOptions } from "../withDateOperation";
import type { DateInput } from "../types";

export interface SetFields {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  microsecond?: number;
  nanosecond?: number;
}

export interface SetOptions extends DateOperationOptions {
  fields: SetFields;
}

export function set(input: DateInput, options: SetOptions) {
  return withDateOperation<SetOptions>((zdt, { fields }) => {
    return zdt.with(fields);
  })(input, options);
}
