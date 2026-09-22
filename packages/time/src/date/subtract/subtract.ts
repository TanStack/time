import { withDateOperation } from '../withDateOperation'
import type { DateOperationOptions } from '../withDateOperation'
import type { DateInput, DurationLike } from '../types'

export interface SubtractOptions extends DateOperationOptions {
  duration: DurationLike
}

/**
 * subtract
 * Subtracts a duration from a date/time instance
 */
export function subtract(input: DateInput, options: SubtractOptions) {
  return withDateOperation<SubtractOptions>((zdt, { duration }) => {
    return zdt.subtract(duration)
  })(input, options)
}
