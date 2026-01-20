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

export interface AddArgs extends Record<string, unknown> {
  duration: DurationLike
}

/**
 * add
 * Adds a duration to a date/time instance
 */
export function add(
  input: DateInput,
  args: AddArgs,
  options?: DateOperationOptions,
) {
  return withDateOperation<AddArgs>((zdt, { duration }) => {
    return zdt.add(duration)
  })(input, args, options)
}
