import { describe, expect, it } from 'vitest'
import {
  computeCascade,
  requiredBackwardShiftMs,
  requiredForwardShiftMs,
  validateDependencies,
  type CascadeInput,
  type CascadeShift,
  type DependencyConflict,
  type DependencyGraphEvent,
  type DependencyTargetEvent,
  type ValidateDependenciesInput,
} from '../index'

const UTC = 'UTC'

const pred: DependencyGraphEvent = {
  id: 'a',
  title: 'A',
  start: '2026-01-05T09:00:00',
  end: '2026-01-05T10:00:00',
}

describe('shift math', () => {
  it('FS shortfall = predEnd - succStart', () => {
    expect(requiredForwardShiftMs('FS', 0, 100, 50, 150)).toBe(50)
    expect(requiredForwardShiftMs('SS', 20, 100, 50, 150)).toBe(-30)
    expect(requiredForwardShiftMs('FF', 0, 200, 50, 150)).toBe(50)
    expect(requiredForwardShiftMs('SF', 20, 100, 50, 150)).toBe(-130)
  })

  it('backward shift mirrors forward shift', () => {
    expect(requiredBackwardShiftMs('FS', 0, 100, 50, 150)).toBe(
      requiredForwardShiftMs('FS', 0, 100, 50, 150),
    )
  })

  it('moves the anchor by the lag', () => {
    expect(requiredForwardShiftMs('FS', 0, 100, 150, 250, 60_000)).toBe(
      requiredForwardShiftMs('FS', 0, 100, 150, 250) + 60_000,
    )
    expect(requiredBackwardShiftMs('SS', 20, 100, 50, 150, -60_000)).toBe(
      requiredBackwardShiftMs('SS', 20, 100, 50, 150) - 60_000,
    )
  })

  it('turns slack into a shortfall once the lag exceeds it', () => {
    expect(requiredForwardShiftMs('FS', 0, 100, 150, 250)).toBeLessThan(0)
    expect(requiredForwardShiftMs('FS', 0, 100, 150, 250, 60_000)).toBe(59_950)
  })
})

describe('validateDependencies', () => {
  it('passes when the successor starts after the predecessor ends (FS)', () => {
    const conflicts = validateDependencies({
      event: {
        id: 'b',
        title: 'B',
        start: '2026-01-05T11:00:00',
        end: '2026-01-05T12:00:00',
      },
      dependsOn: [{ id: 'a', type: 'FS' }],
      events: [pred],
      timeZone: UTC,
    })
    expect(conflicts).toHaveLength(0)
  })

  it('flags an FS violation when the successor starts before the predecessor ends', () => {
    const event: DependencyTargetEvent = {
      id: 'b',
      title: 'B',
      start: '2026-01-05T09:30:00',
      end: '2026-01-05T10:30:00',
    }
    const input: ValidateDependenciesInput = {
      event,
      dependsOn: [{ id: 'a', type: 'FS' }],
      events: [pred],
      timeZone: UTC,
    }
    const conflicts: Array<DependencyConflict> = validateDependencies(input)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.message).toBe('"B" cannot start before "A" ends (FS)')
  })

  it('flags a lagged link that the raw anchors would have passed', () => {
    const event: DependencyTargetEvent = {
      id: 'b',
      title: 'B',
      start: '2026-01-05T10:15:00',
      end: '2026-01-05T11:15:00',
    }

    expect(
      validateDependencies({
        event,
        dependsOn: [{ id: 'a', type: 'FS' }],
        events: [pred],
        timeZone: UTC,
      }),
    ).toHaveLength(0)

    const conflicts = validateDependencies({
      event,
      dependsOn: [{ id: 'a', type: 'FS', lag: 30 }],
      events: [pred],
      timeZone: UTC,
    })
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.message).toBe('"B" cannot start before "A" ends +30m (FS)')
  })

  it('names a lead with its sign', () => {
    const conflicts = validateDependencies({
      event: {
        id: 'b',
        title: 'B',
        start: '2026-01-05T09:00:00',
        end: '2026-01-05T10:00:00',
      },
      dependsOn: [{ id: 'a', type: 'FS', lag: -30 }],
      events: [pred],
      timeZone: UTC,
    })
    expect(conflicts[0]!.message).toBe('"B" cannot start before "A" ends -30m (FS)')
  })

  it('returns no conflict when the predecessor is unknown', () => {
    const conflicts = validateDependencies({
      event: {
        id: 'b',
        title: 'B',
        start: '2026-01-05T09:00:00',
        end: '2026-01-05T10:00:00',
      },
      dependsOn: [{ id: 'missing', type: 'FS' }],
      events: [pred],
      timeZone: UTC,
    })
    expect(conflicts).toHaveLength(0)
  })
})

describe('computeCascade', () => {
  it('shifts a dependent forward to preserve an FS link', () => {
    const events: Array<DependencyGraphEvent> = [
      pred,
      {
        id: 'b',
        title: 'B',
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T11:00:00',
        dependsOn: [{ id: 'a', type: 'FS' }],
      },
    ]

    const input: CascadeInput = {
      sourceId: 'a',
      deltaMs: 60 * 60 * 1000,
      events,
      timeZone: UTC,
    }
    const shifts: Array<CascadeShift> = computeCascade(input)

    expect(shifts).toEqual([
      {
        id: 'b',
        newStart: '2026-01-05T11:00:00',
        newEnd: '2026-01-05T12:00:00',
      },
    ])
  })

  it('carries the lag into the shift it cascades', () => {
    const shifts = computeCascade({
      sourceId: 'a',
      deltaMs: 60 * 60 * 1000,
      events: [
        pred,
        {
          id: 'b',
          title: 'B',
          start: '2026-01-05T10:00:00',
          end: '2026-01-05T11:00:00',
          dependsOn: [{ id: 'a', type: 'FS', lag: 15 }],
        },
      ],
      timeZone: UTC,
    })

    expect(shifts).toEqual([
      {
        id: 'b',
        newStart: '2026-01-05T11:15:00',
        newEnd: '2026-01-05T12:15:00',
      },
    ])
  })

  it('cascades transitively through a chain', () => {
    const events: Array<DependencyGraphEvent> = [
      pred,
      {
        id: 'b',
        title: 'B',
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T11:00:00',
        dependsOn: [{ id: 'a', type: 'FS' }],
      },
      {
        id: 'c',
        title: 'C',
        start: '2026-01-05T11:00:00',
        end: '2026-01-05T12:00:00',
        dependsOn: [{ id: 'b', type: 'FS' }],
      },
    ]

    const shifts = computeCascade({
      sourceId: 'a',
      deltaMs: 60 * 60 * 1000,
      events,
      timeZone: UTC,
    })

    expect(shifts.map((s) => s.id)).toEqual(['b', 'c'])
  })

  it('returns nothing when the delta introduces no violation', () => {
    const events: Array<DependencyGraphEvent> = [
      pred,
      {
        id: 'b',
        title: 'B',
        start: '2026-01-05T14:00:00',
        end: '2026-01-05T15:00:00',
        dependsOn: [{ id: 'a', type: 'FS' }],
      },
    ]

    const shifts = computeCascade({
      sourceId: 'a',
      deltaMs: 30 * 60 * 1000,
      events,
      timeZone: UTC,
    })

    expect(shifts).toHaveLength(0)
  })
})
