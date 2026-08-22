import { Temporal } from '@js-temporal/polyfill'
import { lagMs, requiredBackwardShiftMs, requiredForwardShiftMs } from './shift'
import type { DependencyType } from './shift'
import type { CascadeShift } from './computeCascade'
import type { DependencyGraphEvent } from './validateDependencies'

interface PropagateInput {
  sourceId: string
  events: Array<DependencyGraphEvent>
  timeZone: Temporal.TimeZoneLike
  visited?: Set<string>
}

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

function positionsOf(events: Array<DependencyGraphEvent>): Map<string, Span> {
  return new Map(events.map((e) => [e.id, { start: e.start, end: e.end }]))
}

interface LinkShiftInput {
  type: DependencyType
  predecessor: Span
  successor: Span
  timeZone: Temporal.TimeZoneLike
  lag?: number
}

export function shiftToSatisfyLink(input: LinkShiftInput): Span | null {
  const predecessorMs = toMs(input.predecessor, input.timeZone)
  const successorMs = toMs(input.successor, input.timeZone)

  const shiftMs = requiredForwardShiftMs(
    input.type,
    predecessorMs.startMs,
    predecessorMs.endMs,
    successorMs.startMs,
    successorMs.endMs,
    lagMs(input),
  )
  if (shiftMs <= 0) return null

  return shiftSpan(input.successor, shiftMs)
}

export function propagateToPredecessors(input: PropagateInput): Array<CascadeShift> {
  const { sourceId, events, timeZone } = input
  const visited = input.visited ?? new Set<string>()
  const byId = new Map(events.map((e) => [e.id, e]))
  const positions = positionsOf(events)
  const shifts: Array<CascadeShift> = []

  const walk = (currentId: string) => {
    const current = byId.get(currentId)
    const currentSpan = positions.get(currentId)
    if (!current?.dependsOn?.length || !currentSpan) return

    const currentMs = toMs(currentSpan, timeZone)

    for (const dep of current.dependsOn) {
      if (visited.has(dep.id)) continue

      const predSpan = positions.get(dep.id)
      if (!predSpan) continue
      if (byId.get(dep.id)?.manuallyScheduled) {
        visited.add(dep.id)
        continue
      }

      const predMs = toMs(predSpan, timeZone)
      const pullBackMs = requiredBackwardShiftMs(
        dep.type,
        predMs.startMs,
        predMs.endMs,
        currentMs.startMs,
        currentMs.endMs,
        lagMs(dep),
      )
      if (pullBackMs <= 0) continue

      visited.add(dep.id)
      const moved = shiftSpan(predSpan, -pullBackMs)
      positions.set(dep.id, moved)
      shifts.push({ id: dep.id, newStart: moved.start, newEnd: moved.end })

      walk(dep.id)
    }
  }

  walk(sourceId)
  return shifts
}

export function propagateToDependents(input: PropagateInput): Array<CascadeShift> {
  const { sourceId, events, timeZone } = input
  const visited = input.visited ?? new Set<string>()
  const byId = new Map(events.map((e) => [e.id, e]))
  const positions = positionsOf(events)
  const shifts: Array<CascadeShift> = []

  const successors = new Map<string, Array<string>>()
  for (const event of events) {
    for (const dep of event.dependsOn ?? []) {
      const list = successors.get(dep.id)
      if (list) list.push(event.id)
      else successors.set(dep.id, [event.id])
    }
  }

  const walk = (currentId: string) => {
    const currentSpan = positions.get(currentId)
    const successorIds = successors.get(currentId)
    if (!currentSpan || !successorIds?.length) return

    const currentMs = toMs(currentSpan, timeZone)

    for (const successorId of successorIds) {
      if (visited.has(successorId)) continue

      const successor = byId.get(successorId)
      const successorSpan = positions.get(successorId)
      if (!successor || !successorSpan) continue
      if (successor.manuallyScheduled) {
        visited.add(successorId)
        continue
      }

      const link = successor.dependsOn?.find((d) => d.id === currentId)
      if (!link) continue

      visited.add(successorId)

      const successorMs = toMs(successorSpan, timeZone)
      const shiftMs = requiredForwardShiftMs(
        link.type,
        currentMs.startMs,
        currentMs.endMs,
        successorMs.startMs,
        successorMs.endMs,
        lagMs(link),
      )
      if (shiftMs <= 0) continue

      const moved = shiftSpan(successorSpan, shiftMs)
      positions.set(successorId, moved)
      shifts.push({
        id: successorId,
        newStart: moved.start,
        newEnd: moved.end,
      })

      walk(successorId)
    }
  }

  walk(sourceId)
  return shifts
}
