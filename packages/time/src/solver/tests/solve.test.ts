import { Temporal } from '@js-temporal/polyfill'
import { describe, expect, it } from 'vitest'
import { solve } from '../solve'
import type { SolveDependency, SolveEvent } from '../types'

const UTC = 'UTC'

function event(
  id: string,
  start: string,
  end: string,
  extra: Partial<SolveEvent> = {},
): SolveEvent {
  return { id, start, end, ...extra }
}

function positionOf(events: Array<SolveEvent>, id: string) {
  const found = events.find((e) => e.id === id)
  return { start: found?.start, end: found?.end }
}

describe('solve', () => {
  it('leaves events untouched when every dependency is already satisfied', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T11:00:00', '2026-01-05T12:00:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(positionOf(result.events, 'b')).toEqual({
      start: '2026-01-05T11:00:00',
      end: '2026-01-05T12:00:00',
    })
  })

  it('pushes an unanchored successor forward to satisfy an FS link', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(positionOf(result.events, 'b')).toEqual({
      start: '2026-01-05T10:00:00',
      end: '2026-01-05T11:00:00',
    })
  })

  it('carries the lag into the push', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS', lag: 30 },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(positionOf(result.events, 'b')).toEqual({
      start: '2026-01-05T10:30:00',
      end: '2026-01-05T11:30:00',
    })
  })

  it('cascades a push transitively through a chain in one solve', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
      event('c', '2026-01-05T10:00:00', '2026-01-05T11:00:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
      { predecessorId: 'b', successorId: 'c', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(positionOf(result.events, 'b').start).toBe('2026-01-05T10:00:00')
    expect(positionOf(result.events, 'c').start).toBe('2026-01-05T11:00:00')
  })

  it('converges a diamond graph where two paths land on the same successor', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:00:00', '2026-01-05T12:00:00'),
      event('c', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
      event('d', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'c', type: 'FS' },
      { predecessorId: 'b', successorId: 'd', type: 'FS' },
      { predecessorId: 'c', successorId: 'd', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(positionOf(result.events, 'd').start).toBe('2026-01-05T12:00:00')
  })

  it('pulls an unanchored predecessor backward when its successor is manually scheduled', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00', {
        manuallyScheduled: true,
      }),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(positionOf(result.events, 'a')).toEqual({
      start: '2026-01-05T08:30:00',
      end: '2026-01-05T09:30:00',
    })
    expect(positionOf(result.events, 'b').start).toBe('2026-01-05T09:30:00')
  })

  it('treats an explicit anchor id as fixed for this call without the persistent flag', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
    ]

    const result = solve({
      events,
      dependencies,
      anchors: ['b'],
      timeZone: UTC,
    })

    expect(positionOf(result.events, 'b').start).toBe('2026-01-05T09:30:00')
    expect(positionOf(result.events, 'a').start).toBe('2026-01-05T08:30:00')
  })

  it('reports a conflict rather than moving either side when both ends are fixed', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00', {
        manuallyScheduled: true,
      }),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00', {
        manuallyScheduled: true,
      }),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toEqual([
      {
        code: 'unsatisfiable',
        eventIds: ['a', 'b'],
        message: '"b" and "a" are both fixed and violate a FS dependency',
      },
    ])
    expect(positionOf(result.events, 'a').start).toBe('2026-01-05T09:00:00')
    expect(positionOf(result.events, 'b').start).toBe('2026-01-05T09:30:00')
  })

  it('reports a cycle instead of hanging when the dependency graph loops', () => {
    const events = [
      event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00'),
      event('b', '2026-01-05T09:30:00', '2026-01-05T10:30:00'),
      event('c', '2026-01-05T10:00:00', '2026-01-05T11:00:00'),
    ]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'b', type: 'FS' },
      { predecessorId: 'b', successorId: 'c', type: 'FS' },
      { predecessorId: 'c', successorId: 'a', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]!.code).toBe('cycle')
    expect(new Set(result.conflicts[0]!.eventIds)).toEqual(new Set(['a', 'b', 'c']))
  })

  it('does not false-flag a long legal chain as unsatisfiable', () => {
    const length = 40
    const base = Temporal.PlainDateTime.from('2026-01-05T09:00:00')
    const stamp = (dt: Temporal.PlainDateTime) => dt.toString({ smallestUnit: 'second' })

    const events: Array<SolveEvent> = []
    const dependencies: Array<SolveDependency> = []

    for (let i = 0; i < length; i++) {
      const start = base.add({ hours: i })
      events.push(event(`e${i}`, stamp(start), stamp(start.add({ hours: 1 }))))
      if (i > 0) {
        dependencies.push({
          predecessorId: `e${i - 1}`,
          successorId: `e${i}`,
          type: 'FS',
        })
      }
    }

    const lastOriginalStart = base.add({ hours: length - 1 })
    events[0] = event('e0', stamp(base.add({ hours: 24 })), stamp(base.add({ hours: 25 })))

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(positionOf(result.events, `e${length - 1}`).start).toBe(
      stamp(lastOriginalStart.add({ hours: 24 })),
    )
  })

  it('ignores an unknown id in a dependency link', () => {
    const events = [event('a', '2026-01-05T09:00:00', '2026-01-05T10:00:00')]
    const dependencies: Array<SolveDependency> = [
      { predecessorId: 'a', successorId: 'missing', type: 'FS' },
    ]

    const result = solve({ events, dependencies, timeZone: UTC })

    expect(result.conflicts).toHaveLength(0)
    expect(result.events).toHaveLength(1)
  })
})
