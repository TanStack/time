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

export interface AddOptions extends DateOperationOptions {
  duration: DurationLike
}

/**
 * add
 * Adds a duration to a date/time instance
 */
export function add(input: DateInput, options: AddOptions) {
  return withDateOperation<AddOptions>((zdt, { duration }) => {
    return zdt.add(duration)
  })(input, options)
}
