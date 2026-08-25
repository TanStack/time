import { describe, expect, it } from 'vitest'
import { concreteWriteOps, invertWriteOp, invertWriteOps } from '../history'
import type { KernelEvent } from '../types'

const event = (id: string, end: string): KernelEvent => ({
  id,
  start: '2026-01-05T10:00:00',
  end,
})

describe('invertWriteOp', () => {
  it('turns an add into a remove', () => {
    const added = event('e1', '2026-01-05T11:00:00')

    expect(invertWriteOp({ kind: 'add', event: added })).toEqual({
      kind: 'remove',
      id: 'e1',
      event: added,
    })
  })

  it('turns a remove into an add', () => {
    const removed = event('e1', '2026-01-05T11:00:00')

    expect(invertWriteOp({ kind: 'remove', id: 'e1', event: removed })).toEqual({
      kind: 'add',
      event: removed,
    })
  })

  it("swaps an update's endpoints", () => {
    const before = event('e1', '2026-01-05T11:00:00')
    const after = event('e1', '2026-01-05T12:00:00')

    expect(invertWriteOp({ kind: 'update', id: 'e1', before, after })).toEqual({
      kind: 'update',
      id: 'e1',
      before: after,
      after: before,
    })
  })
})

describe('invertWriteOps', () => {
  it('unwinds a batch back to front', () => {
    const a = event('a', '2026-01-05T11:00:00')
    const b = event('b', '2026-01-05T11:00:00')

    expect(
      invertWriteOps([
        { kind: 'add', event: a },
        { kind: 'add', event: b },
      ]),
    ).toEqual([
      { kind: 'remove', id: 'b', event: b },
      { kind: 'remove', id: 'a', event: a },
    ])
  })

  it('skips intents, which no longer exist after the transform stages', () => {
    const a = event('a', '2026-01-05T11:00:00')

    expect(
      invertWriteOps([
        { kind: 'intent', intent: 'test/thing', payload: null },
        { kind: 'add', event: a },
      ]),
    ).toEqual([{ kind: 'remove', id: 'a', event: a }])
  })
})

describe('concreteWriteOps', () => {
  it('keeps only the ops the kernel can apply', () => {
    const a = event('a', '2026-01-05T11:00:00')

    expect(
      concreteWriteOps([
        { kind: 'intent', intent: 'test/thing', payload: null },
        { kind: 'add', event: a },
      ]),
    ).toEqual([{ kind: 'add', event: a }])
  })
})
