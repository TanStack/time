import { Temporal } from '@js-temporal/polyfill'
import { clampToConstraint } from '~/validation/constraints'
import { lagMs, requiredShiftMs } from '~/validation/dependency'
import { resolveWorkingLayers, workingMinutesBetween } from '~/validation/duration'
import {
  addWorkingMinutes,
  nextWorkingInstant,
  previousWorkingInstant,
  subtractWorkingMinutes,
} from '~/workingTime'
import type { WorkingCalendar } from '~/workingTime'
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
  const workingTime = request.workingTime ?? {}
  const calendars: Array<WorkingCalendar> | null | undefined = workingTime.calendars
  const direction = request.direction ?? 'ASAP'
  const anchors = new Set(request.anchors ?? [])
  for (const event of events) {
    if (event.manuallyScheduled) anchors.add(event.id)
  }

  const layersById = new Map<string, Array<Array<string | undefined>>>()
  const durationById = new Map<string, number>()
  for (const event of events) {
    const layers = resolveWorkingLayers(event.resources ?? [], workingTime, event.calendarId)
    layersById.set(event.id, layers)
    durationById.set(
      event.id,
      event.duration ??
        workingMinutesBetween(
          { start: event.start, end: event.end },
          event.resources ?? [],
          workingTime,
          event.calendarId,
        ),
    )
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
    return requiredShiftMs(
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
  const unschedulable = new Set<string>()

  for (let iteration = 0; iteration < cap; iteration++) {
    let changed = false

    const reportUnschedulable = (eventId: string) => {
      if (unschedulable.has(eventId)) return
      unschedulable.add(eventId)
      conflicts.push({
        code: 'unsatisfiable',
        eventIds: [eventId],
        message: `"${eventId}" has no working time to schedule into`,
      })
    }

    for (const dep of relaxable) {
      const shortfall = shortfallOf(dep)
      if (shortfall <= 0) continue

      const succAnchored = anchors.has(dep.successorId)
      const predAnchored = anchors.has(dep.predecessorId)
      const pullPredecessorBackward = succAnchored || (!predAnchored && direction === 'ALAP')

      if (pullPredecessorBackward) {
        const pred = positions.get(dep.predecessorId)!
        const pulled = shiftSpan(pred, -shortfall)
        const layers = layersById.get(dep.predecessorId)!
        const snappedEnd = previousWorkingInstant(pulled.end, layers, calendars)

        if (snappedEnd === null) {
          reportUnschedulable(dep.predecessorId)
          continue
        }

        const snappedStart = subtractWorkingMinutes(
          snappedEnd,
          durationById.get(dep.predecessorId)!,
          layers,
          calendars,
        )
        positions.set(dep.predecessorId, { start: snappedStart ?? pulled.start, end: snappedEnd })
        changed = true
        continue
      }

      const succ = positions.get(dep.successorId)!
      const pushed = shiftSpan(succ, shortfall)
      const layers = layersById.get(dep.successorId)!
      const snappedStart = nextWorkingInstant(pushed.start, layers, calendars)

      if (snappedStart === null) {
        reportUnschedulable(dep.successorId)
        continue
      }

      const snappedEnd = addWorkingMinutes(
        snappedStart,
        durationById.get(dep.successorId)!,
        layers,
        calendars,
      )
      positions.set(dep.successorId, { start: snappedStart, end: snappedEnd ?? pushed.end })
      changed = true
    }

    for (const event of events) {
      if (!event.constraint || anchors.has(event.id)) continue

      const span = positions.get(event.id)!
      const clamped = clampToConstraint(span, event.constraint)
      if (clamped !== span) {
        positions.set(event.id, clamped)
        changed = true
      }
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
