import { calculateDayShift, calculateMovedEvent } from '../getMoveProps'
import { MoveController } from '../moveController'
import type { MoveControllerOptions, MoveHost } from '../moveController'
import type { Event, Resource, ValidateMoveOptions, ValidateMoveResult } from '../types'
import type { AvailabilityApi } from './availability'
import type { RecurrenceEditApi, RecurrenceReadApi } from './recurrence'
import type { CalendarFeature, CalendarHost } from './types'

export interface MoveFeatureApi<TResource extends Resource, TEvent extends Event<TResource>> {
  createMoveController: (options?: MoveControllerOptions) => MoveController<TResource, TEvent>
  validateEventMove: (options: ValidateMoveOptions) => ValidateMoveResult
}

export interface MovePeers<TResource extends Resource, TEvent extends Event<TResource>> {
  recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>
  availability?: AvailabilityApi<TResource, TEvent>
}

export function eventMoveFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  MoveFeatureApi<TResource, TEvent>,
  'move',
  MovePeers<TResource, TEvent>
> {
  return {
    name: 'move',
    requires: ['recurrence'],
    api: (host, _module, peers) => {
      const findEvent = (eventId: string): TEvent | undefined =>
        host.getEvent(eventId) ?? host.getEvents().find((event) => event.id === eventId)

      const resolveMasterEventId = (eventId: string): string => {
        const event = findEvent(eventId)
        return event ? peers.recurrence.getMasterEvent(event).id : eventId
      }

      const validateEventMove = (options: ValidateMoveOptions): ValidateMoveResult => {
        const {
          eventId,
          originalStart,
          originalEnd,
          originalDayDate,
          targetDayDate,
          minuteShift,
          granularity,
          constraints,
        } = options

        const timeZone = host.getOptions().timeZone
        const unmoved = calculateMovedEvent({
          originalStart,
          originalEnd,
          timeZone,
          granularity,
          constraints,
        })

        const result = calculateMovedEvent({
          originalStart,
          originalEnd,
          dayShift: calculateDayShift(originalDayDate, targetDayDate),
          minuteShift,
          granularity,
          timeZone,
          constraints,
        })

        if (!result.moved) {
          return { blocked: false, result, targetDayDate }
        }

        const event = findEvent(eventId)
        const masterId = event ? peers.recurrence.getMasterEvent(event).id : eventId

        const check = host.validateMove(
          masterId,
          result.start,
          result.end,
          event?.resources,
          event?.consumption,
        )

        if (!check.blocked) {
          return { blocked: false, result, targetDayDate }
        }

        const conflict = event
          ? peers.availability?.checkEventAvailability(event, result.start, result.end)
          : null

        return {
          blocked: true,
          error: {
            reason: 'unavailable-time',
            message: check.message ?? 'This move is blocked.',
            eventTitle: check.blockedEventTitle,
            conflicts: conflict ? [conflict] : [],
          },
          result: unmoved,
          targetDayDate: originalDayDate,
        }
      }

      return {
        createMoveController: (options = {}) =>
          new MoveController<TResource, TEvent>(
            {
              ...(host as CalendarHost<TResource, TEvent>),
              validateEventMove,
              resolveMasterEventId,
              editRecurringEvent: peers.recurrence.editRecurringEvent,
            } satisfies MoveHost<TResource, TEvent>,
            options,
          ),
        validateEventMove,
      }
    },
  }
}
