import { describe, expect, it } from 'vitest'
import { checkConstraint } from '../checkConstraint'
import type { ConstraintType } from '../checkConstraint'

const event = (start: string, end: string, constraint?: ConstraintType, date?: string) => ({
  id: 'a',
  title: 'A',
  start,
  end,
  constraint: constraint && date ? { type: constraint, date } : undefined,
})

const START = '2026-03-02T09:00:00'
const END = '2026-03-02T11:00:00'

describe('checkConstraint', () => {
  it('passes an event with no constraint', () => {
    expect(checkConstraint(event(START, END))).toBeNull()
  })

  it.each([
    ['start-no-earlier-than', '2026-03-02T10:00:00', true],
    ['start-no-earlier-than', '2026-03-02T09:00:00', false],
    ['start-no-earlier-than', '2026-03-02T08:00:00', false],
    ['start-no-later-than', '2026-03-02T08:00:00', true],
    ['start-no-later-than', '2026-03-02T09:00:00', false],
    ['start-no-later-than', '2026-03-02T10:00:00', false],
    ['finish-no-earlier-than', '2026-03-02T12:00:00', true],
    ['finish-no-earlier-than', '2026-03-02T11:00:00', false],
    ['finish-no-later-than', '2026-03-02T10:00:00', true],
    ['finish-no-later-than', '2026-03-02T11:00:00', false],
    ['must-start-on', '2026-03-02T09:00:00', false],
    ['must-start-on', '2026-03-02T09:30:00', true],
    ['must-finish-on', '2026-03-02T11:00:00', false],
    ['must-finish-on', '2026-03-02T11:30:00', true],
  ] as Array<[ConstraintType, string, boolean]>)(
    '%s against %s conflicts: %s',
    (type, date, conflicts) => {
      const conflict = checkConstraint(event(START, END, type, date))
      expect(conflict !== null).toBe(conflicts)
    },
  )

  it('compares a date-only constraint by civil day', () => {
    expect(checkConstraint(event(START, END, 'start-no-earlier-than', '2026-03-02'))).toBeNull()
    expect(checkConstraint(event(START, END, 'must-start-on', '2026-03-02'))).toBeNull()
    expect(checkConstraint(event(START, END, 'must-start-on', '2026-03-03'))).not.toBeNull()
  })

  it('compares a datetime constraint by the second', () => {
    expect(
      checkConstraint(event(START, END, 'start-no-earlier-than', '2026-03-02T09:00:01')),
    ).not.toBeNull()
  })

  it('anchors a finish constraint on the end', () => {
    const conflict = checkConstraint(event(START, END, 'finish-no-later-than', '2026-03-01'))

    expect(conflict).toMatchObject({
      eventId: 'a',
      type: 'finish-no-later-than',
      date: '2026-03-01',
      anchor: 'finish',
      message: '"A" cannot finish after 2026-03-01 (finish-no-later-than)',
      start: START,
      end: END,
    })
  })

  it('names the violated rule in the message', () => {
    expect(checkConstraint(event(START, END, 'must-start-on', '2026-03-05'))?.message).toBe(
      '"A" must start on 2026-03-05 (must-start-on)',
    )
  })
})
