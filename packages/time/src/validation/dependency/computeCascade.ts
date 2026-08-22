import { Temporal } from '@js-temporal/polyfill'
import { lagMs, requiredForwardShiftMs } from './shift'
import type { DependencyGraphEvent } from './validateDependencies'

export interface CascadeInput {
  sourceId: string
  deltaMs: number
  events: Array<DependencyGraphEvent>
  timeZone: Temporal.TimeZoneLike
  visited?: Set<string>
}

export interface CascadeShift {
  id: string
  newStart: string
  newEnd: string
}

export function computeCascade(input: CascadeInput): Array<CascadeShift> {
  const { sourceId, deltaMs, events, timeZone } = input
  if (deltaMs === 0) return []

  const visited = input.visited ?? new Set<string>()
  const byId = new Map(events.map((e) => [e.id, e]))

  const dependents = new Map<string, Set<string>>()
  for (const event of events) {
    for (const dep of event.dependsOn ?? []) {
      if (!dependents.has(dep.id)) dependents.set(dep.id, new Set())
      dependents.get(dep.id)!.add(event.id)
    }
  }

  const sourceEvent = byId.get(sourceId)
  if (!sourceEvent) return []

  const affected: Array<CascadeShift> = []
  const projected = new Map<string, { startMs: number; endMs: number }>()

  const srcStartMs =
    Temporal.PlainDateTime.from(sourceEvent.start).toZonedDateTime(timeZone).epochMilliseconds +
    deltaMs
  const srcEndMs =
    Temporal.PlainDateTime.from(sourceEvent.end).toZonedDateTime(timeZone).epochMilliseconds +
    deltaMs
  projected.set(sourceId, { startMs: srcStartMs, endMs: srcEndMs })

  const queue: Array<string> = [sourceId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const cur = projected.get(currentId)!

    const successorIds = dependents.get(currentId)
    if (!successorIds || successorIds.size === 0) continue

    for (const sId of successorIds) {
      if (visited.has(sId)) continue
      const s = byId.get(sId)
      if (!s) continue
      if (s.manuallyScheduled) {
        visited.add(sId)
        continue
      }

      const link = s.dependsOn?.find((d) => d.id === currentId)
      if (!link) continue

      const sStartMs = Temporal.PlainDateTime.from(s.start).toZonedDateTime(
        timeZone,
      ).epochMilliseconds
      const sEndMs = Temporal.PlainDateTime.from(s.end).toZonedDateTime(timeZone).epochMilliseconds

      const shiftMs = requiredForwardShiftMs(
        link.type,
        cur.startMs,
        cur.endMs,
        sStartMs,
        sEndMs,
        lagMs(link),
      )
      if (shiftMs <= 0) continue

      visited.add(sId)
      const newStart = Temporal.PlainDateTime.from(s.start)
        .add({ milliseconds: shiftMs })
        .toString({ smallestUnit: 'second' })
      const newEnd = Temporal.PlainDateTime.from(s.end)
        .add({ milliseconds: shiftMs })
        .toString({ smallestUnit: 'second' })
      affected.push({ id: sId, newStart, newEnd })

      projected.set(sId, {
        startMs: sStartMs + shiftMs,
        endMs: sEndMs + shiftMs,
      })
      queue.push(sId)
    }
  }

  return affected
}
