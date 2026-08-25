import { Temporal } from '@js-temporal/polyfill'
import { toPlainDateString, toPlainDateTimeString } from '~/date/parse'
import { calculateResizedEvent, getSegmentInfo } from '../getResizeProps'
import { ResizeController } from '../resizeController'
import {
  describeUnavailability,
  formatMinutesToTime,
  MINUTES_IN_DAY,
  toUnavailabilityConflict,
} from '~/validation/availability'
import type { AvailabilityConflict } from '~/validation/availability'
import type { SegmentInfo, UnavailableTimeRange } from '../getResizeProps'
import type { ResizeControllerOptions, ResizeHost } from '../resizeController'
import type {
  Event,
  Resource,
  ResizeError,
  ValidateResizeOptions,
  ValidateResizeResult,
} from '../types'
import type { AvailabilityApi, UnavailabilityDetail } from './availability'
import type { DependencyGraphApi } from './dependency'
import type { RecurrenceEditApi, RecurrenceReadApi } from './recurrence'
import type { CalendarFeature, CalendarHost } from './types'

export interface ResizeFeatureApi<TResource extends Resource, TEvent extends Event<TResource>> {
  createResizeController: (options?: ResizeControllerOptions) => ResizeController<TResource, TEvent>
  getEventSegmentInfo: (event: TEvent) => SegmentInfo
  validateResize: (options: ValidateResizeOptions) => ValidateResizeResult
}

export interface ResizePeers<TResource extends Resource, TEvent extends Event<TResource>> {
  recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>
  availability?: AvailabilityApi<TResource, TEvent>
  dependency?: DependencyGraphApi<TResource, TEvent>
}

export function eventResizeFeature<
  TResource extends Resource,
  TEvent extends Event<TResource>,
>(): CalendarFeature<
  TResource,
  TEvent,
  object,
  ResizeFeatureApi<TResource, TEvent>,
  'resize',
  ResizePeers<TResource, TEvent>
> {
  const resourceIdsOf = (event: { resources?: Array<TResource | string> }): Array<string> =>
    (event.resources ?? []).map((r) => (typeof r === 'string' ? r : r.id))

  const epochMs = (host: CalendarHost<TResource, TEvent>, value: string): number =>
    Temporal.PlainDateTime.from(value).toZonedDateTime(host.getOptions().timeZone).epochMilliseconds

  return {
    name: 'resize',
    requires: ['recurrence'],
    api: (host, _module, peers) => {
      const readUnavailableMinutes = (
        date: string,
        options?: { resourceIds?: Array<string> },
      ): Array<UnavailableTimeRange> =>
        peers.availability?.getUnavailableMinuteRanges(date, options) ?? []

      const readUnavailabilityDetails = (
        date: string,
        startMinutes: number,
        endMinutes: number,
        options?: { resourceIds?: Array<string> },
      ): Array<UnavailabilityDetail> =>
        peers.availability?.getUnavailabilityDetails(date, startMinutes, endMinutes, options) ?? []

      const readDaySpanConflicts = (
        date: string,
        startMinutes: number,
        endMinutes: number,
        eventId: string,
        resourceIds: Array<string>,
        event?: TEvent,
      ): Array<AvailabilityConflict> =>
        peers.availability?.getDaySpanConflicts({
          date,
          startMinutes,
          endMinutes,
          eventId,
          resourceIds,
          event,
        }) ?? []

      const readAvailabilityConflict = (
        event: TEvent,
        newStart: string,
        newEnd: string,
      ): AvailabilityConflict | null =>
        peers.availability?.checkEventAvailability(event, newStart, newEnd) ?? null

      const validateResize = (options: ValidateResizeOptions): ValidateResizeResult => {
        const {
          eventId,
          originalStart,
          originalEnd,
          edge,
          totalDeltaMinutes,
          targetDayDate,
          originalDayDate,
          constraints,
        } = options

        const occurrenceStart =
          options.occurrenceStart != null
            ? toPlainDateTimeString(options.occurrenceStart)
            : undefined
        const event = peers.recurrence.resolveOccurrence(eventId, occurrenceStart, originalStart)
        const resourceIds = event ? resourceIdsOf(event) : undefined

        const unavailableRanges = readUnavailableMinutes(targetDayDate, {
          resourceIds,
        })

        const originalStartDate = originalStart.split('T')[0] ?? ''
        const originalEndDate = originalEnd.split('T')[0] ?? ''

        const origStartHourMins =
          ((originalStart.charCodeAt(11) - 48) * 10 + (originalStart.charCodeAt(12) - 48)) * 60 +
          (originalStart.charCodeAt(14) - 48) * 10 +
          (originalStart.charCodeAt(15) - 48)
        const origEndHourMins =
          ((originalEnd.charCodeAt(11) - 48) * 10 + (originalEnd.charCodeAt(12) - 48)) * 60 +
          (originalEnd.charCodeAt(14) - 48) * 10 +
          (originalEnd.charCodeAt(15) - 48)

        const effectiveEdge = edge === 'left' ? 'top' : edge === 'right' ? 'bottom' : edge

        let shouldBlockResize = false
        let blockReason: ResizeError['reason'] = 'blocked'
        let blockMessage = 'Resize blocked'
        const conflicts: Array<AvailabilityConflict> = []

        const snapToMinutes = constraints?.snapToMinutes ?? 1
        const snapMins = (minutes: number): number => {
          if (snapToMinutes <= 1) return minutes
          return Math.round(minutes / snapToMinutes) * snapToMinutes
        }

        if (effectiveEdge === 'top' && targetDayDate < originalStartDate) {
          const rawStartMinutes = origStartHourMins + totalDeltaMinutes
          const targetStartMinutes =
            ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
          const snappedTargetStartMinutes = snapMins(targetStartMinutes)
          const currentStartMinutes = origStartHourMins

          if (resourceIds?.length) {
            const unavailabilityDetails = readUnavailabilityDetails(
              targetDayDate,
              snappedTargetStartMinutes,
              MINUTES_IN_DAY,
              { resourceIds },
            )

            if (unavailabilityDetails.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedTargetStartMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`
              conflicts.push(
                toUnavailabilityConflict({
                  date: targetDayDate,
                  startMinutes: snappedTargetStartMinutes,
                  endMinutes: MINUTES_IN_DAY,
                  details: unavailabilityDetails,
                }),
              )
            }
          }

          if (!shouldBlockResize && resourceIds?.length) {
            const sourceUnavailabilityDetails = readUnavailabilityDetails(
              originalStartDate,
              0,
              currentStartMinutes,
              { resourceIds },
            )

            if (sourceUnavailabilityDetails.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalStartDate} - ${describeUnavailability(sourceUnavailabilityDetails)}`
              conflicts.push(
                toUnavailabilityConflict({
                  date: originalStartDate,
                  startMinutes: 0,
                  endMinutes: currentStartMinutes,
                  details: sourceUnavailabilityDetails,
                }),
              )
            }
          }
        } else if (effectiveEdge === 'bottom' && targetDayDate > originalEndDate) {
          const rawEndMinutes = origEndHourMins + totalDeltaMinutes
          const targetEndMinutes =
            ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
          const snappedTargetEndMinutes = snapMins(targetEndMinutes)
          const currentEndMinutes = origEndHourMins

          if (resourceIds?.length) {
            const unavailabilityDetails = readUnavailabilityDetails(
              targetDayDate,
              0,
              snappedTargetEndMinutes,
              { resourceIds },
            )

            if (unavailabilityDetails.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = `Unavailable: Event ending at ${formatMinutesToTime(snappedTargetEndMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`
              conflicts.push(
                toUnavailabilityConflict({
                  date: targetDayDate,
                  startMinutes: 0,
                  endMinutes: snappedTargetEndMinutes,
                  details: unavailabilityDetails,
                }),
              )
            }
          }

          if (!shouldBlockResize && resourceIds?.length) {
            const sourceUnavailabilityDetails = readUnavailabilityDetails(
              originalEndDate,
              currentEndMinutes,
              MINUTES_IN_DAY,
              { resourceIds },
            )

            if (sourceUnavailabilityDetails.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalEndDate} - ${describeUnavailability(sourceUnavailabilityDetails)}`
              conflicts.push(
                toUnavailabilityConflict({
                  date: originalEndDate,
                  startMinutes: currentEndMinutes,
                  endMinutes: MINUTES_IN_DAY,
                  details: sourceUnavailabilityDetails,
                }),
              )
            }
          }
        }

        if (
          !shouldBlockResize &&
          targetDayDate === originalStartDate &&
          targetDayDate === originalEndDate
        ) {
          const rawStartMinutes =
            origStartHourMins + (effectiveEdge === 'top' ? totalDeltaMinutes : 0)
          const rawEndMinutes =
            origEndHourMins + (effectiveEdge === 'bottom' ? totalDeltaMinutes : 0)

          const snappedStartMinutes = snapMins(
            ((rawStartMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
          )
          const snappedEndMinutes = snapMins(
            ((rawEndMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY,
          )

          if (resourceIds?.length) {
            const unavailabilityDetails = readUnavailabilityDetails(
              targetDayDate,
              snappedStartMinutes,
              snappedEndMinutes,
              { resourceIds },
            )

            if (unavailabilityDetails.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`
              conflicts.push(
                toUnavailabilityConflict({
                  date: targetDayDate,
                  startMinutes: snappedStartMinutes,
                  endMinutes: snappedEndMinutes,
                  details: unavailabilityDetails,
                }),
              )
            }
          }

          if (!shouldBlockResize && resourceIds?.length) {
            const detailedConflicts = readDaySpanConflicts(
              targetDayDate,
              snappedStartMinutes,
              snappedEndMinutes,
              eventId,
              resourceIds,
              event,
            )

            const capacityConflicts = detailedConflicts.filter((c) =>
              c.resourceDetails.some((d) => d.reason === 'capacity'),
            )

            if (capacityConflicts.length > 0) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              const detailsText = describeUnavailability(capacityConflicts[0]!.resourceDetails)
              blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
              conflicts.push(...capacityConflicts)
            }
          }
        }

        if (!shouldBlockResize && resourceIds?.length) {
          const originalStartMs = new Date(originalStart).getTime()
          const originalEndMs = new Date(originalEnd).getTime()
          const snapMs = snapToMinutes * 60_000
          const snappedDeltaMs = Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs

          let checkFromMs: number | null = null
          let checkToMs: number | null = null

          if (effectiveEdge === 'bottom') {
            const newEndMs = originalEndMs + snappedDeltaMs
            if (newEndMs > originalEndMs) {
              checkFromMs = originalEndMs
              checkToMs = newEndMs
            }
          } else {
            const newStartMs = originalStartMs + snappedDeltaMs
            if (newStartMs < originalStartMs) {
              checkFromMs = newStartMs
              checkToMs = originalStartMs
            }
          }

          if (checkFromMs !== null && checkToMs !== null) {
            const dayMs = 24 * 60 * 60 * 1_000
            const cursor = new Date(checkFromMs)
            cursor.setHours(0, 0, 0, 0)

            while (cursor.getTime() < checkToMs && !shouldBlockResize) {
              const dayStr = toPlainDateString(cursor)
              const dayStartMs = cursor.getTime()
              const dayEndMs = dayStartMs + dayMs

              const overlapStartMs = Math.max(checkFromMs, dayStartMs)
              const overlapEndMs = Math.min(checkToMs, dayEndMs)

              if (overlapStartMs < overlapEndMs) {
                const overlapStartMins = Math.floor((overlapStartMs - dayStartMs) / 60_000)
                const overlapEndMins = Math.ceil((overlapEndMs - dayStartMs) / 60_000)

                const dayConflicts = readDaySpanConflicts(
                  dayStr,
                  overlapStartMins,
                  overlapEndMins,
                  eventId,
                  resourceIds,
                  event,
                )

                if (dayConflicts.length > 0) {
                  shouldBlockResize = true
                  blockReason = 'unavailable-time'
                  const detailsText = describeUnavailability(dayConflicts[0]!.resourceDetails)
                  blockMessage = `Unavailable: ${dayStr} ${formatMinutesToTime(overlapStartMins)}–${formatMinutesToTime(overlapEndMins)} conflicts with ${detailsText}`
                  conflicts.push(...dayConflicts)
                }
              }

              cursor.setTime(cursor.getTime() + dayMs)
            }
          }
        }

        const snapMs = (constraints?.snapToMinutes ?? 1) * 60_000
        const snappedDeltaMs = Math.round((totalDeltaMinutes * 60_000) / snapMs) * snapMs

        if (!shouldBlockResize && effectiveEdge === 'top') {
          const resized = host.getEvent(eventId)
          if (resized?.dependsOn?.length) {
            const proposedStartMs = epochMs(host, originalStart) + snappedDeltaMs
            const proposedEndMs = epochMs(host, originalEnd)

            const violated = peers.dependency?.findViolatedDependency(
              resized,
              proposedStartMs,
              proposedEndMs,
            )
            if (violated) {
              shouldBlockResize = true
              blockReason = 'blocked'
              blockMessage = `"${resized.title}" violates ${violated.dependency.type} dependency on "${violated.predecessor.title}"`
            }
          }
        }

        if (!shouldBlockResize && effectiveEdge === 'bottom' && snappedDeltaMs > 0) {
          const affected = peers.dependency?.getAffectedByDelta(eventId, snappedDeltaMs) ?? []

          for (const { event: affectedEvent, newStart, newEnd } of affected) {
            const alreadyConflicting = readAvailabilityConflict(
              affectedEvent,
              toPlainDateTimeString(affectedEvent.start),
              toPlainDateTimeString(affectedEvent.end),
            )
            if (alreadyConflicting) continue

            const conflict = readAvailabilityConflict(affectedEvent, newStart, newEnd)
            if (conflict) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = `Blocked: "${affectedEvent.title}" would be pushed to unavailable time`
              conflicts.push(conflict)
              break
            }
          }
        }

        if (!shouldBlockResize && resourceIds?.length && originalStartDate === originalEndDate) {
          const selfEvent = event
          if (selfEvent) {
            const proposedNewStart =
              effectiveEdge === 'top'
                ? Temporal.PlainDateTime.from(originalStart)
                    .add({ milliseconds: snappedDeltaMs })
                    .toString({ smallestUnit: 'second' })
                : originalStart
            const proposedNewEnd =
              effectiveEdge === 'bottom'
                ? Temporal.PlainDateTime.from(originalEnd)
                    .add({ milliseconds: snappedDeltaMs })
                    .toString({ smallestUnit: 'second' })
                : originalEnd

            const spanConflict = readAvailabilityConflict(
              selfEvent,
              proposedNewStart,
              proposedNewEnd,
            )
            if (spanConflict) {
              shouldBlockResize = true
              blockReason = 'unavailable-time'
              blockMessage = spanConflict.description
              const alreadyReported = conflicts.some(
                (c) =>
                  c.date === spanConflict.date &&
                  c.conflictRange.start === spanConflict.conflictRange.start &&
                  c.conflictRange.end === spanConflict.conflictRange.end,
              )
              if (!alreadyReported) conflicts.push(spanConflict)
            }
          }
        }

        const effectiveDeltaMinutes = shouldBlockResize ? 0 : totalDeltaMinutes

        const result = calculateResizedEvent({
          originalStart,
          originalEnd,
          edge,
          deltaMinutes: effectiveDeltaMinutes,
          timeZone: host.getOptions().timeZone,
          constraints: {
            ...constraints,
            unavailableRanges: shouldBlockResize ? [] : unavailableRanges,
          },
        })

        return {
          blocked: shouldBlockResize,
          error: shouldBlockResize
            ? {
                reason: blockReason,
                message: blockMessage,
                conflicts,
              }
            : undefined,
          result,
          targetDayDate: shouldBlockResize ? originalDayDate : targetDayDate,
        }
      }

      return {
        createResizeController: (options = {}) =>
          new ResizeController<TResource, TEvent>(
            {
              ...host,
              validateResize,
              editRecurringEvent: peers.recurrence.editRecurringEvent,
            } satisfies ResizeHost<TResource, TEvent>,
            options,
          ),
        getEventSegmentInfo: (event) =>
          getSegmentInfo({
            start: toPlainDateTimeString(event.start),
            end: toPlainDateTimeString(event.end),
            ...(event._originalStart != null ? { _originalStart: event._originalStart } : {}),
            ...(event._originalEnd != null ? { _originalEnd: event._originalEnd } : {}),
          }),
        validateResize,
      }
    },
  }
}
