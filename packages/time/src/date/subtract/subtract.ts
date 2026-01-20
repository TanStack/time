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

export interface SubtractOptions extends DateOperationOptions {
  duration: DurationLike
}

/**
 * subtract
 * Subtracts a duration from a date/time instance
 */
export function subtract(input: DateInput, options: SubtractOptions) {
  return withDateOperation((zdt, { duration }) => {
    return zdt.subtract(duration)
  })(input, options)
}
