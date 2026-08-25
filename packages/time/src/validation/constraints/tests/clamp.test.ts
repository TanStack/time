import { describe, expect, it } from 'vitest'
import { checkConstraint } from '../checkConstraint'
import { clampToConstraint, isInflexibleConstraint } from '../clamp'
import type { ConstraintType } from '../checkConstraint'

const SPAN = { start: '2026-03-02T09:00:00', end: '2026-03-02T11:00:00' }

const clamp = (type: ConstraintType, date: string, span = SPAN) =>
  clampToConstraint(span, { type, date })

describe('clampToConstraint', () => {
  it('returns the span untouched when there is no constraint', () => {
    expect(clampToConstraint(SPAN, undefined)).toBe(SPAN)
  })

  it.each([
    ['start-no-earlier-than', '2026-03-02T08:00:00'],
    ['start-no-later-than', '2026-03-02T10:00:00'],
    ['finish-no-earlier-than', '2026-03-02T10:00:00'],
    ['finish-no-later-than', '2026-03-02T12:00:00'],
    ['must-start-on', '2026-03-02T09:00:00'],
    ['must-finish-on', '2026-03-02T11:00:00'],
  ] as Array<[ConstraintType, string]>)('leaves a satisfied %s alone', (type, date) => {
    expect(clamp(type, date)).toBe(SPAN)
  })

  it.each([
    ['start-no-earlier-than', '2026-03-02T12:00:00', '2026-03-02T12:00:00'],
    ['start-no-later-than', '2026-03-02T07:00:00', '2026-03-02T07:00:00'],
    ['must-start-on', '2026-03-02T14:00:00', '2026-03-02T14:00:00'],
  ] as Array<[ConstraintType, string, string]>)(
    'moves the span so %s meets its date',
    (type, date, start) => {
      expect(clamp(type, date).start).toBe(start)
    },
  )

  it('anchors a finish constraint on the end and keeps the duration', () => {
    expect(clamp('finish-no-later-than', '2026-03-02T10:00:00')).toEqual({
      start: '2026-03-02T08:00:00',
      end: '2026-03-02T10:00:00',
    })
  })

  it('shifts whole days for a date-only constraint, keeping the time of day', () => {
    expect(clamp('start-no-earlier-than', '2026-03-05')).toEqual({
      start: '2026-03-05T09:00:00',
      end: '2026-03-05T11:00:00',
    })
  })

  it('leaves a date-only constraint satisfied on the same civil day alone', () => {
    expect(clamp('must-start-on', '2026-03-02')).toBe(SPAN)
  })

  it('pulls a multi-day span back to a date-only deadline on its finish', () => {
    const span = { start: '2026-03-02T09:00:00', end: '2026-03-06T17:00:00' }

    expect(clamp('must-finish-on', '2026-03-04', span)).toEqual({
      start: '2026-02-28T09:00:00',
      end: '2026-03-04T17:00:00',
    })
  })

  it.each([
    ['start-no-earlier-than', '2026-03-04T09:30:00'],
    ['start-no-later-than', '2026-03-01T09:30:00'],
    ['finish-no-earlier-than', '2026-03-04'],
    ['finish-no-later-than', '2026-02-27'],
    ['must-start-on', '2026-03-09T08:15:00'],
    ['must-finish-on', '2026-02-25'],
  ] as Array<[ConstraintType, string]>)(
    '%s satisfies checkConstraint once clamped',
    (type, date) => {
      const clamped = clamp(type, date)

      expect(checkConstraint({ title: 'A', ...clamped, constraint: { type, date } })).toBeNull()
    },
  )
})

describe('isInflexibleConstraint', () => {
  it.each([
    ['must-start-on', true],
    ['must-finish-on', true],
    ['start-no-earlier-than', false],
    ['start-no-later-than', false],
    ['finish-no-earlier-than', false],
    ['finish-no-later-than', false],
  ] as Array<[ConstraintType, boolean]>)('%s is inflexible: %s', (type, inflexible) => {
    expect(isInflexibleConstraint(type)).toBe(inflexible)
  })
})
