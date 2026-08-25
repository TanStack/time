import { Temporal } from '@js-temporal/polyfill'
import { CONSTRAINT_ANCHOR, isDateOnlyConstraint } from './checkConstraint'
import type { ConstraintType, SchedulingConstraint } from './checkConstraint'

export interface ConstrainedSpan {
  start: string
  end: string
}

const DIRECTION: Record<ConstraintType, 'forward' | 'backward' | 'exact'> = {
  'start-no-earlier-than': 'forward',
  'finish-no-earlier-than': 'forward',
  'start-no-later-than': 'backward',
  'finish-no-later-than': 'backward',
  'must-start-on': 'exact',
  'must-finish-on': 'exact',
}

export function isInflexibleConstraint(type: ConstraintType): boolean {
  return DIRECTION[type] === 'exact'
}

function shifts(type: ConstraintType, delta: number): boolean {
  switch (DIRECTION[type]) {
    case 'forward':
      return delta > 0
    case 'backward':
      return delta < 0
    case 'exact':
      return delta !== 0
  }
}

function shiftSpan(span: ConstrainedSpan, amount: Temporal.DurationLike): ConstrainedSpan {
  return {
    start: Temporal.PlainDateTime.from(span.start).add(amount).toString({ smallestUnit: 'second' }),
    end: Temporal.PlainDateTime.from(span.end).add(amount).toString({ smallestUnit: 'second' }),
  }
}

export function clampToConstraint(
  span: ConstrainedSpan,
  constraint: SchedulingConstraint | undefined,
): ConstrainedSpan {
  if (!constraint) return span

  const anchorValue = CONSTRAINT_ANCHOR[constraint.type] === 'start' ? span.start : span.end
  const anchor = Temporal.PlainDateTime.from(anchorValue)

  if (isDateOnlyConstraint(constraint.date)) {
    const days = anchor.toPlainDate().until(Temporal.PlainDate.from(constraint.date)).days
    return shifts(constraint.type, days) ? shiftSpan(span, { days }) : span
  }

  const milliseconds = anchor
    .until(Temporal.PlainDateTime.from(constraint.date), { largestUnit: 'millisecond' })
    .total({ unit: 'millisecond' })

  return shifts(constraint.type, milliseconds) ? shiftSpan(span, { milliseconds }) : span
}
