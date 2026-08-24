import { Temporal } from '@js-temporal/polyfill'
import { lagMs, requiredForwardShiftMs } from '~/validation/dependency'
import type { SolveConflict, SolveDependency, SolveEvent, SolveRequest, SolveResult } from './types'

interface Span {
  start: string
  end: string
}

function toMs(span: Span, timeZone: Temporal.TimeZoneLike): { startMs: number; endMs: number } {
  return {
    startMs: Temporal.PlainDateTime.from(span.start).toZonedDateTime(timeZone).epochMilliseconds,
    endMs: Temporal.PlainDateTime.from(span.end).toZonedDateTime(timeZone).epochMilliseconds,
  }
}

function shiftSpan(span: Span, ms: number): Span {
  return {
    start: Temporal.PlainDateTime.from(span.start)
      .add({ milliseconds: ms })
      .toString({ smallestUnit: 'second' }),
    end: Temporal.PlainDateTime.from(span.end)
      .add({ milliseconds: ms })
      .toString({ smallestUnit: 'second' }),
  }
}

function findCycle(
  events: Array<SolveEvent>,
  dependencies: Array<SolveDependency>,
): Array<string> | null {
  const successors = new Map<string, Array<string>>()
  for (const dep of dependencies) {
    const list = successors.get(dep.predecessorId)
    if (list) list.push(dep.successorId)
    else successors.set(dep.predecessorId, [dep.successorId])
  }

  const state = new Map<string, 'visiting' | 'done'>()
  const stack: Array<string> = []

  const visit = (id: string): Array<string> | null => {
    state.set(id, 'visiting')
    stack.push(id)

    for (const nextId of successors.get(id) ?? []) {
      if (state.get(nextId) === 'visiting') {
        return stack.slice(stack.indexOf(nextId))
      }
      if (state.get(nextId) === 'done') continue

      const cycle = visit(nextId)
      if (cycle) return cycle
    }

    stack.pop()
    state.set(id, 'done')
    return null
  }

  for (const event of events) {
    if (state.has(event.id)) continue
    const cycle = visit(event.id)
    if (cycle) return cycle
  }

  return null
}

export function solve(request: SolveRequest): SolveResult {
  const { events, dependencies, timeZone } = request
  const anchors = new Set(request.anchors ?? [])
  for (const event of events) {
    if (event.manuallyScheduled) anchors.add(event.id)
  }

  const conflicts: Array<SolveConflict> = []
  const cycle = findCycle(events, dependencies)
  const cycleIds = new Set(cycle ?? [])
  if (cycle) {
    conflicts.push({
      code: 'cycle',
      eventIds: cycle,
      message: `dependency cycle: ${cycle.join(' -> ')}`,
    })
  }

  const positions = new Map<string, Span>(
    events.map((event) => [event.id, { start: event.start, end: event.end }]),
  )

  const shortfallOf = (dep: SolveDependency): number => {
    const pred = positions.get(dep.predecessorId)
    const succ = positions.get(dep.successorId)
    if (!pred || !succ) return 0

    const predMs = toMs(pred, timeZone)
    const succMs = toMs(succ, timeZone)
    return requiredForwardShiftMs(
      dep.type,
      predMs.startMs,
      predMs.endMs,
      succMs.startMs,
      succMs.endMs,
      lagMs(dep),
    )
  }

  const relaxable: Array<SolveDependency> = []
  for (const dep of dependencies) {
    if (cycleIds.has(dep.predecessorId) && cycleIds.has(dep.successorId)) {
      continue
    }

    const succAnchored = anchors.has(dep.successorId)
    const predAnchored = anchors.has(dep.predecessorId)
    if (succAnchored && predAnchored) {
      if (shortfallOf(dep) > 0) {
        conflicts.push({
          code: 'unsatisfiable',
          eventIds: [dep.predecessorId, dep.successorId],
          message: `"${dep.successorId}" and "${dep.predecessorId}" are both fixed and violate a ${dep.type} dependency`,
        })
      }
      continue
    }

    relaxable.push(dep)
  }

  const cap = events.length + 1
  let stalled = false

  for (let iteration = 0; iteration < cap; iteration++) {
    let changed = false

    for (const dep of relaxable) {
      const shortfall = shortfallOf(dep)
      if (shortfall <= 0) continue

      if (anchors.has(dep.successorId)) {
        const pred = positions.get(dep.predecessorId)!
        positions.set(dep.predecessorId, shiftSpan(pred, -shortfall))
      } else {
        const succ = positions.get(dep.successorId)!
        positions.set(dep.successorId, shiftSpan(succ, shortfall))
      }
      changed = true
    }

    if (!changed) break
    stalled = iteration === cap - 1
  }

  if (stalled) {
    conflicts.push({
      code: 'unsatisfiable',
      eventIds: [...new Set(relaxable.flatMap((dep) => [dep.predecessorId, dep.successorId]))],
      message: 'schedule did not converge within the iteration cap',
    })
  }

  return {
    events: events.map((event) => ({
      ...event,
      ...positions.get(event.id)!,
    })),
    conflicts,
  }
}
