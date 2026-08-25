import { toPlainDateTimeString } from '~/date/parse'
import {
  checkAvailability,
  type AvailabilityConflict,
  type AvailabilityOtherEvent,
  type AvailabilityResourceInput,
  type WorkingTimeConfig,
} from '~/validation/availability'
import type { Conflict, KernelEvent, Module } from '../types'

export interface AvailabilityModuleResource extends AvailabilityResourceInput {}

interface CalendarLikeEvent extends KernelEvent {
  title?: string
  resources?: Array<AvailabilityModuleResource | string>
  consumption?: Array<number>
  calendarId?: string
  masterId?: string
  _recurringMasterId?: string
  _originalStart?: string
  _originalEnd?: string
}

export interface AvailabilityModuleOptions {
  resources: Array<AvailabilityModuleResource> | (() => Array<AvailabilityModuleResource>)
  workingTime: WorkingTimeConfig | (() => WorkingTimeConfig)
  priority?: number
}

export interface AvailabilityQuery {
  id: string
  title?: string
  start: string
  end: string
  resources?: Array<AvailabilityModuleResource | string>
  consumption?: Array<number>
  calendarId?: string
}

export interface AvailabilityModuleApi {
  evaluateAvailability: (event: AvailabilityQuery) => Array<AvailabilityConflict>
}

function resolveResources(
  event: CalendarLikeEvent,
  known: Array<AvailabilityModuleResource>,
): Array<AvailabilityModuleResource> {
  return (event.resources ?? []).map((r) =>
    typeof r === 'string' ? (known.find((res) => res.id === r) ?? { id: r, label: r }) : r,
  )
}

function resourceIdsOf(event: CalendarLikeEvent): Array<string> {
  return (event.resources ?? []).map((r) => (typeof r === 'string' ? r : r.id))
}

function toConflict(event: CalendarLikeEvent, conflict: AvailabilityConflict): Conflict {
  const reason = conflict.resourceDetails[0]?.reason ?? 'outside-hours'
  return {
    code: `availability/${reason}`,
    message: conflict.description,
    eventIds: [event.id],
    detail: conflict,
  }
}

export function availabilityModule<E extends KernelEvent>(
  options: AvailabilityModuleOptions,
): Module<E, AvailabilityModuleApi> {
  const knownResources = (): Array<AvailabilityModuleResource> =>
    typeof options.resources === 'function' ? options.resources() : options.resources

  const workingTime = (): WorkingTimeConfig =>
    typeof options.workingTime === 'function' ? options.workingTime() : options.workingTime

  const evaluate = (
    event: CalendarLikeEvent,
    others: Array<CalendarLikeEvent>,
  ): Array<AvailabilityConflict> => {
    const resolved = resolveResources(event, knownResources())
    if (resolved.length === 0) return []

    const otherEvents: Array<AvailabilityOtherEvent> = others
      .filter((e) => e.id !== event.id && !e._originalStart)
      .map((e) => ({
        id: e.id,
        start: toPlainDateTimeString((e._originalStart ?? e.start) as string | Date | number),
        end: toPlainDateTimeString((e._originalEnd ?? e.end) as string | Date | number),
        resourceIds: resourceIdsOf(e),
        consumption: e.consumption,
        masterId: e._recurringMasterId ?? e.id,
      }))

    return checkAvailability({
      event: {
        id: event.id,
        title: event.title ?? event.id,
        start: toPlainDateTimeString(event.start),
        end: toPlainDateTimeString(event.end),
        calendarId: event.calendarId,
      },
      resources: resolved,
      workingTime: workingTime(),
      consumption: event.consumption,
      otherEvents,
    })
  }

  return {
    name: 'availability',
    api: (ctx) => ({
      evaluateAvailability: (event) =>
        evaluate(
          event as unknown as CalendarLikeEvent,
          ctx.getEvents() as Array<CalendarLikeEvent>,
        ),
    }),
    contributions: [
      {
        pipeline: 'write',
        kind: 'validate',
        stage: 'availability-validate',
        priority: options.priority,
        run: (batch, ctx) => {
          const conflicts: Array<Conflict> = []
          const settled = new Map<string, CalendarLikeEvent>(
            (ctx.getEvents() as Array<CalendarLikeEvent>).map((e) => [e.id, e]),
          )
          for (const op of batch.ops) {
            if (op.kind === 'intent') continue
            if (op.kind === 'remove') settled.delete(op.id)
            else if (op.kind === 'add') settled.set(op.event.id, op.event as CalendarLikeEvent)
            else settled.set(op.id, op.after as CalendarLikeEvent)
          }
          const others = [...settled.values()]

          for (const op of batch.ops) {
            if (op.kind === 'remove' || op.kind === 'intent') continue
            const event = (op.kind === 'add' ? op.event : op.after) as CalendarLikeEvent

            for (const conflict of evaluate(event, others)) {
              conflicts.push(toConflict(event, conflict))
            }
          }

          return conflicts
        },
      },
    ],
  }
}
