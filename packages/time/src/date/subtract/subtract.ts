import { withDateOperation } from '../withDateOperation'
import type { DateOperationOptions } from '../withDateOperation'
import type { DateInput } from '../types'

export interface DurationLike {
  years?: number
  months?: number
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
  microseconds?: number
  nanoseconds?: number
}

export interface SubtractArgs extends Record<string, unknown> {
  duration: DurationLike
}

/**
 * subtract
 * Subtracts a duration from a date/time instance
 */
export function subtract(
  input: DateInput,
  args: SubtractArgs,
  options?: DateOperationOptions,
) {
  return withDateOperation<SubtractArgs>((zdt, { duration }) => {
    return zdt.subtract(duration)
  })(input, args, options)
}
