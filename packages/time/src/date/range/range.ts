import { Temporal } from '@js-temporal/polyfill'
import { toZonedDateTime } from '../helpers'
import { resolveOptions, toInstantDate } from '../withDateOperation'
import type { DateOperationOptions } from '../withDateOperation'
import type { DateInput, DurationLike } from '../types'

export interface RangeOptions extends DateOperationOptions {
  start: DateInput
  end: DateInput
  step: DurationLike
}

export function range(options: RangeOptions): Array<Date> {
  const { start, end, step } = options
  const resolved = resolveOptions(options)
  const duration = Temporal.Duration.from(step)

  if (duration.blank) {
    throw new Error('Step duration cannot be zero')
  }

  const startZdt = toZonedDateTime(start, resolved.timeZone, resolved.calendar)
  const endZdt = toZonedDateTime(end, resolved.timeZone, resolved.calendar)

  const isForward = Temporal.ZonedDateTime.compare(startZdt, endZdt) <= 0
  const isPositiveStep = duration.sign === 1

  if (isForward !== isPositiveStep) {
    throw new Error(
      isForward
        ? 'Step must be positive when start is before or equal to end'
        : 'Step must be negative when start is after end',
    )
  }

  const result: Array<Date> = []
  let current = startZdt

  while (duration.sign * Temporal.ZonedDateTime.compare(current, endZdt) <= 0) {
    result.push(toInstantDate(current))
    current = current.add(duration)
  }

  return result
}
