import { Temporal } from '@js-temporal/polyfill'
import { toPlainDateTimeString } from '~/date/parse'
import {
  findAnchoredViolations,
  propagateToDependents,
  propagateToPredecessors,
  validateDependencies,
  type CascadeShift,
  type DependencyConflict,
  type DependencyGraphEvent,
  type DependencyLink,
} from '~/validation/dependency'
import type { Conflict, KernelEvent, Module, WriteOp } from '../types'

interface DependencyEvent extends KernelEvent {
  title?: string
  dependsOn?: Array<DependencyLink>
  manuallyScheduled?: boolean
}

export interface DependencyModuleOptions {
  timeZone?: Temporal.TimeZoneLike
  priority?: number
}

export interface DependencyValidationError {
  eventId: string
  eventTitle: string
  reason: 'blocked'
  message: string
  originalStart: string
  originalEnd: string
}

export interface DependencyApi {
  validateEventDependencies: (
    event: { id?: string; title: string; start: string; end: string },
    dependsOn: Array<DependencyLink>,
  ) => { valid: boolean; error?: DependencyValidationError }
}

function epochMs(value: unknown, timeZone: Temporal.TimeZoneLike): number {
  return Temporal.PlainDateTime.from(
    toPlainDateTimeString(value as string | Date | number),
  ).toZonedDateTime(timeZone).epochMilliseconds
}

function toGraph(events: Array<DependencyEvent>): Array<DependencyGraphEvent> {
  return events.map((e) => ({
    id: e.id,
    title: e.title ?? e.id,
    start: toPlainDateTimeString(e.start),
    end: toPlainDateTimeString(e.end),
    dependsOn: e.dependsOn,
    manuallyScheduled: e.manuallyScheduled,
  }))
}

function toConflict(conflict: DependencyConflict): Conflict {
  return {
    code: 'dependency/manually-scheduled',
    message: conflict.message,
    eventIds: [conflict.eventId, conflict.predecessorId],
    detail: conflict,
  }
}

function withSource(
  graph: Array<DependencyGraphEvent>,
  sourceId: string,
  after: DependencyEvent,
): Array<DependencyGraphEvent> {
  return graph.map((event) =>
    event.id === sourceId
      ? {
          ...event,
          start: toPlainDateTimeString(after.start),
          end: toPlainDateTimeString(after.end),
        }
      : event,
  )
}

function applyShifts(
  graph: Array<DependencyGraphEvent>,
  shifts: Array<CascadeShift>,
): Array<DependencyGraphEvent> {
  if (shifts.length === 0) return graph
  const byId = new Map(shifts.map((shift) => [shift.id, shift]))
  return graph.map((event) => {
    const shift = byId.get(event.id)
    return shift ? { ...event, start: shift.newStart, end: shift.newEnd } : event
  })
}

export function dependencyModule<E extends KernelEvent>(
  options: DependencyModuleOptions = {},
): Module<E, DependencyApi> {
  const timeZone = options.timeZone ?? 'UTC'

  return {
    name: 'dependency',
    api: (ctx) => ({
      validateEventDependencies: (event, dependsOn) => {
        const [conflict] = validateDependencies({
          event,
          dependsOn,
          events: toGraph(ctx.getEvents() as Array<DependencyEvent>),
          timeZone,
        })
        if (!conflict) return { valid: true }

        return {
          valid: false,
          error: {
            eventId: conflict.eventId,
            eventTitle: conflict.eventTitle,
            reason: 'blocked',
            message: conflict.message,
            originalStart: conflict.originalStart,
            originalEnd: conflict.originalEnd,
          },
        }
      },
    }),
    contributions: [
      {
        pipeline: 'write',
        kind: 'transform',
        stage: 'schedule',
        priority: options.priority,
        run: (batch, ctx) => {
          const extraOps: Array<WriteOp<E>> = []

          for (const op of batch.ops) {
            if (op.kind !== 'update') continue

            const startChanged =
              epochMs(op.after.start, timeZone) !== epochMs(op.before.start, timeZone)
            const endChanged = epochMs(op.after.end, timeZone) !== epochMs(op.before.end, timeZone)
            if (!startChanged && !endChanged) continue

            const graph = withSource(
              toGraph(ctx.getEvents() as Array<DependencyEvent>),
              op.id,
              op.after as DependencyEvent,
            )
            const visited = new Set([op.id])
            const shifts: Array<CascadeShift> = []

            if (startChanged) {
              shifts.push(
                ...propagateToPredecessors({
                  sourceId: op.id,
                  events: graph,
                  timeZone,
                  visited,
                }),
              )
            }

            shifts.push(
              ...propagateToDependents({
                sourceId: op.id,
                events: applyShifts(graph, shifts),
                timeZone,
                visited,
              }),
            )

            for (const shift of shifts) {
              const before = ctx.getEvent(shift.id)
              if (!before) continue
              extraOps.push({
                kind: 'update',
                id: shift.id,
                before,
                after: {
                  ...before,
                  start: shift.newStart,
                  end: shift.newEnd,
                },
              })
            }
          }

          if (extraOps.length === 0) return batch
          return { ...batch, ops: [...batch.ops, ...extraOps] }
        },
      },
      {
        pipeline: 'write',
        kind: 'validate',
        stage: 'dependency-validate',
        priority: options.priority,
        run: (batch, ctx) => {
          const settled = new Map<string, DependencyEvent>(
            (ctx.getEvents() as Array<DependencyEvent>).map((e) => [e.id, e]),
          )
          const changedIds = new Set<string>()

          for (const op of batch.ops) {
            if (op.kind === 'intent') continue
            if (op.kind === 'remove') {
              settled.delete(op.id)
              changedIds.add(op.id)
            } else if (op.kind === 'add') {
              settled.set(op.event.id, op.event as DependencyEvent)
              changedIds.add(op.event.id)
            } else {
              settled.set(op.id, op.after as DependencyEvent)
              changedIds.add(op.id)
            }
          }

          return findAnchoredViolations({
            events: toGraph([...settled.values()]),
            changedIds,
            timeZone,
          }).map(toConflict)
        },
      },
    ],
  }
}
