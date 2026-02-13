import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react'
import { useStore } from '@tanstack/react-store'
import {
  CalendarCore,
  calculateDeltaMinutesFromPixels,
  calculateResizedEvent,
  getTimeClient,
} from '@tanstack/time'
import type {
  AvailabilityConflict,
  CalendarApi,
  CalendarCoreOptions,
  Event,
  ResizeConstraints,
  ResizeEdge,
  ResizeError,
  Resource,
} from '@tanstack/time'

export interface ResizeState {
  isResizing: boolean
  eventId: string | null
  edge: ResizeEdge | null
  previewStart: string | null
  previewEnd: string | null
  targetDayDate: string | null
}

export interface ResizeOptions {
  enabled?: boolean
  containerHeight?: number
  constraints?: ResizeConstraints
  onResizeStart?: (eventId: string, edge: ResizeEdge) => void
  onResizeEnd?: (eventId: string, newStart: string, newEnd: string) => void
  onResizeError?: (error: ResizeError) => void
}

interface ResizeHandleHandlers {
  onMouseDown: (e: React.MouseEvent) => void
}

interface DayColumnProps {
  ref: (element: HTMLElement | null) => void
}

export interface UseCalendarOptions<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> extends CalendarCoreOptions<TResource, TEvent> {
  resize?: ResizeOptions
}

const initialResizeState: ResizeState = {
  isResizing: false,
  eventId: null,
  edge: null,
  previewStart: null,
  previewEnd: null,
  targetDayDate: null,
}

export const useCalendar = <
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  options: UseCalendarOptions<TResource, TEvent>,
): CalendarApi<TResource, TEvent> & {
  isPending: boolean
  resizeState: ResizeState
  getResizeHandleProps: (
    eventId: string,
    edge: ResizeEdge,
    originalStart: string,
    originalEnd: string,
  ) => ResizeHandleHandlers
  getDayColumnProps: (dayDate: string) => DayColumnProps
} => {
  const { resize, ...calendarOptions } = options
  const resizeEnabled = resize?.enabled ?? true
  const containerHeight = resize?.containerHeight ?? 0
  const resizeConstraints = resize?.constraints

  const [calendarCore] = useState(
    () => new CalendarCore<TResource, TEvent>(calendarOptions),
  )
  const state = useStore(calendarCore.store)
  const [isPending, startTransition] = useTransition()

  const resizeStateRef = useRef<ResizeState>(initialResizeState)
  const resizeListenersRef = useRef<Set<() => void>>(new Set())
  const dayColumnRefsRef = useRef<Map<string, HTMLElement>>(new Map())
  const originalEventRef = useRef<{
    id: string
    start: string
    end: string
    edge: ResizeEdge
    startY: number
    originalDayDate: string
    currentDayDate: string
  } | null>(null)
  const lastEmittedErrorRef = useRef<{
    eventId: string
    message: string
    timestamp: number
  } | null>(null)

  const subscribeResize = useCallback((listener: () => void) => {
    resizeListenersRef.current.add(listener)
    return () => resizeListenersRef.current.delete(listener)
  }, [])

  const getResizeSnapshot = useCallback(() => resizeStateRef.current, [])

  const notifyResizeListeners = useCallback(() => {
    resizeListenersRef.current.forEach((listener) => listener())
  }, [])

  const updateResizeState = useCallback(
    (newState: Partial<ResizeState>) => {
      resizeStateRef.current = { ...resizeStateRef.current, ...newState }
      notifyResizeListeners()
    },
    [notifyResizeListeners],
  )

  const resizeState = useSyncExternalStore(
    subscribeResize,
    getResizeSnapshot,
    getResizeSnapshot,
  )

  const getDayFromPoint = useCallback((x: number): string | null => {
    for (const [dayDate, element] of dayColumnRefsRef.current) {
      const rect = element.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right) {
        return dayDate
      }
    }
    return null
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!originalEventRef.current) return

      const { id, start, end, edge, startY, originalDayDate } =
        originalEventRef.current
      const deltaY = e.clientY - startY

      const deltaMinutes = calculateDeltaMinutesFromPixels(
        deltaY,
        containerHeight,
      )

      const targetDayDate = getDayFromPoint(e.clientX) ?? originalDayDate

      let dayOffsetMinutes = 0
      if (targetDayDate && targetDayDate !== originalDayDate) {
        const originalDate = new Date(originalDayDate + 'T00:00:00')
        const targetDate = new Date(targetDayDate + 'T00:00:00')
        const dayDiff = Math.round(
          (targetDate.getTime() - originalDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )

        dayOffsetMinutes = dayDiff * 24 * 60
        originalEventRef.current.currentDayDate = targetDayDate
      }

      const totalDeltaMinutes = deltaMinutes + dayOffsetMinutes

      const event = calendarOptions.events?.find((ev) => ev.id === id)
      const resourceIds = event?.resources?.map((r) => r.id)

      const getUnavailableMinutesForDay = (dayDate: string) => {
        const rawRanges = resourceIds?.length
          ? calendarCore.getUnavailableRanges(dayDate, {
              containerHeight: 1440,
              resourceIds,
            })
          : []
        return rawRanges.map((range) => {
          const startParts = range.startTime.split(':').map(Number)
          const endParts = range.endTime.split(':').map(Number)
          return {
            startMinutes: (startParts[0] ?? 0) * 60 + (startParts[1] ?? 0),
            endMinutes: (endParts[0] ?? 0) * 60 + (endParts[1] ?? 0),
          }
        })
      }

      const unavailableRanges = getUnavailableMinutesForDay(targetDayDate)

      const originalStartDate = start.split('T')[0] ?? ''
      const originalEndDate = end.split('T')[0] ?? ''

      let shouldBlockResize = false
      let blockReason: ResizeError['reason'] = 'blocked'
      let blockMessage = 'Resize blocked'
      const conflicts: Array<AvailabilityConflict> = []

      const formatMinutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      }

      const snapToMinutes = resizeConstraints?.snapToMinutes ?? 1
      const snapMinutes = (minutes: number): number => {
        if (snapToMinutes <= 1) return minutes
        return Math.round(minutes / snapToMinutes) * snapToMinutes
      }

      const getDetailedConflicts = (
        dayDate: string,
        startMins: number,
        endMins: number,
      ): Array<AvailabilityConflict> => {
        if (!resourceIds?.length) return []

        const conflicts: Array<AvailabilityConflict> = []

        const details = calendarCore.getUnavailabilityDetails(
          dayDate,
          startMins,
          endMins,
          {
            resourceIds,
          },
        )

        const unavailableRangesForDay = getUnavailableMinutesForDay(dayDate)

        for (const range of unavailableRangesForDay) {
          if (startMins < range.endMinutes && endMins > range.startMinutes) {
            const overlappingDetails = details.filter((d) => {
              const resource = calendarCore.options.resources?.find(
                (r) => r.id === d.resourceId,
              )
              if (!resource) return false

              const resourceAvailableSlots =
                resource.availability?.filter((slot) => {
                  const slotWeekday = new Date(dayDate).getDay() || 7
                  return slot.weekdays.includes(slotWeekday)
                }) || []

              if (resourceAvailableSlots.length === 0) return true

              return !resourceAvailableSlots.some((slot) => {
                const slotStartParts = slot.startTime.split(':').map(Number)
                const slotEndParts = slot.endTime.split(':').map(Number)
                const slotStart =
                  (slotStartParts[0] ?? 0) * 60 + (slotStartParts[1] ?? 0)
                const slotEnd =
                  (slotEndParts[0] ?? 0) * 60 + (slotEndParts[1] ?? 0)

                return !(
                  range.endMinutes <= slotStart || range.startMinutes >= slotEnd
                )
              })
            })

            if (overlappingDetails.length > 0) {
              conflicts.push({
                date: dayDate,
                conflictRange: {
                  start: formatMinutesToTime(
                    Math.max(startMins, range.startMinutes),
                  ),
                  end: formatMinutesToTime(Math.min(endMins, range.endMinutes)),
                },
                resourceIds: overlappingDetails.map((d) => d.resourceId),
                resourceDetails: overlappingDetails.map((d) => ({
                  resourceId: d.resourceId,
                  resourceLabel: d.resourceLabel,
                  reason: d.reason,
                  description: d.description,
                })),
                description: overlappingDetails
                  .map((d) => d.description)
                  .join('; '),
              })
            }
          }
        }

        const eventsOnDay = calendarCore.getEventsByDate(dayDate)
        const currentEventId = id

        for (const resourceId of resourceIds) {
          const resource = calendarCore.options.resources?.find(
            (r) => r.id === resourceId,
          )
          if (!resource || !resource.capacity) continue

          const overlappingEvents = eventsOnDay.filter((e) => {
            if (e.id === currentEventId) return false

            const eventResourceIds = e.resources?.map((r) => r.id) || []
            if (!eventResourceIds.includes(resourceId)) return false

            const eventStart = new Date(e.start)
            const eventEnd = new Date(e.end)
            const eventStartMins =
              eventStart.getHours() * 60 + eventStart.getMinutes()
            const eventEndMins =
              eventEnd.getHours() * 60 + eventEnd.getMinutes()

            return startMins < eventEndMins && endMins > eventStartMins
          })

          const currentUsage = overlappingEvents.length
          const maxCapacity = resource.capacity

          if (currentUsage >= maxCapacity) {
            conflicts.push({
              date: dayDate,
              conflictRange: {
                start: formatMinutesToTime(startMins),
                end: formatMinutesToTime(endMins),
              },
              resourceIds: [resourceId],
              resourceDetails: [
                {
                  resourceId: resource.id,
                  resourceLabel: resource.label,
                  reason: 'capacity',
                  description: `${resource.label}: Capacity exceeded (${currentUsage}/${maxCapacity} slots used)`,
                  capacityInfo: {
                    max: maxCapacity,
                    used: currentUsage,
                    remaining: 0,
                  },
                },
              ],
              description: `${resource.label}: Capacity exceeded (${currentUsage}/${maxCapacity} slots used)`,
            })
          }
        }

        return conflicts
      }

      if (edge === 'top' && targetDayDate < originalStartDate) {
        const rawStartMinutes =
          new Date(start).getHours() * 60 +
          new Date(start).getMinutes() +
          totalDeltaMinutes
        const targetStartMinutes = ((rawStartMinutes % 1440) + 1440) % 1440
        const snappedTargetStartMinutes = snapMinutes(targetStartMinutes)
        const currentStartMinutes =
          new Date(start).getHours() * 60 + new Date(start).getMinutes()

        if (resourceIds?.length) {
          const unavailabilityDetails = calendarCore.getUnavailabilityDetails(
            targetDayDate,
            snappedTargetStartMinutes,
            1440,
            { resourceIds },
          )

          if (unavailabilityDetails.length > 0) {
            shouldBlockResize = true
            blockReason = 'unavailable-time'
            const detailsText = unavailabilityDetails
              .map((d) => `${d.resourceLabel} (${d.reason})`)
              .join(', ')
            blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedTargetStartMinutes)} conflicts with ${detailsText}`
            conflicts.push({
              date: targetDayDate,
              conflictRange: {
                start: formatMinutesToTime(snappedTargetStartMinutes),
                end: formatMinutesToTime(1440),
              },
              resourceIds: unavailabilityDetails.map((d) => d.resourceId),
              resourceDetails: unavailabilityDetails.map((d) => ({
                resourceId: d.resourceId,
                resourceLabel: d.resourceLabel,
                reason: d.reason,
                description: d.description,
              })),
              description: unavailabilityDetails
                .map((d) => d.description)
                .join('; '),
            })
          }
        }

        // Check if we would need to pass through unavailable time on the source day
        if (!shouldBlockResize && resourceIds?.length) {
          const sourceUnavailabilityDetails =
            calendarCore.getUnavailabilityDetails(
              originalStartDate,
              0,
              currentStartMinutes,
              { resourceIds },
            )

          if (sourceUnavailabilityDetails.length > 0) {
            shouldBlockResize = true
            blockReason = 'unavailable-time'
            const detailsText = sourceUnavailabilityDetails
              .map((d) => `${d.resourceLabel} (${d.reason})`)
              .join(', ')
            blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalStartDate} - ${detailsText}`
            conflicts.push({
              date: originalStartDate,
              conflictRange: {
                start: formatMinutesToTime(0),
                end: formatMinutesToTime(currentStartMinutes),
              },
              resourceIds: sourceUnavailabilityDetails.map((d) => d.resourceId),
              resourceDetails: sourceUnavailabilityDetails.map((d) => ({
                resourceId: d.resourceId,
                resourceLabel: d.resourceLabel,
                reason: d.reason,
                description: d.description,
              })),
              description: sourceUnavailabilityDetails
                .map((d) => d.description)
                .join('; '),
            })
          }
        }
      } else if (edge === 'bottom' && targetDayDate > originalEndDate) {
        const rawEndMinutes =
          new Date(end).getHours() * 60 +
          new Date(end).getMinutes() +
          totalDeltaMinutes
        const targetEndMinutes = ((rawEndMinutes % 1440) + 1440) % 1440
        const snappedTargetEndMinutes = snapMinutes(targetEndMinutes)
        const currentEndMinutes =
          new Date(end).getHours() * 60 + new Date(end).getMinutes()

        // Check if any resource is unavailable at the target time on the target day
        if (resourceIds?.length) {
          const unavailabilityDetails = calendarCore.getUnavailabilityDetails(
            targetDayDate,
            0, // Check from start of day to end time
            snappedTargetEndMinutes,
            { resourceIds },
          )

          if (unavailabilityDetails.length > 0) {
            shouldBlockResize = true
            blockReason = 'unavailable-time'
            const detailsText = unavailabilityDetails
              .map((d) => `${d.resourceLabel} (${d.reason})`)
              .join(', ')
            blockMessage = `Unavailable: Event ending at ${formatMinutesToTime(snappedTargetEndMinutes)} conflicts with ${detailsText}`
            conflicts.push({
              date: targetDayDate,
              conflictRange: {
                start: formatMinutesToTime(0),
                end: formatMinutesToTime(snappedTargetEndMinutes),
              },
              resourceIds: unavailabilityDetails.map((d) => d.resourceId),
              resourceDetails: unavailabilityDetails.map((d) => ({
                resourceId: d.resourceId,
                resourceLabel: d.resourceLabel,
                reason: d.reason,
                description: d.description,
              })),
              description: unavailabilityDetails
                .map((d) => d.description)
                .join('; '),
            })
          }
        }

        // Check if we would need to pass through unavailable time on the source day
        if (!shouldBlockResize && resourceIds?.length) {
          const sourceUnavailabilityDetails =
            calendarCore.getUnavailabilityDetails(
              originalEndDate,
              currentEndMinutes,
              1440,
              { resourceIds },
            )

          if (sourceUnavailabilityDetails.length > 0) {
            shouldBlockResize = true
            blockReason = 'unavailable-time'
            const detailsText = sourceUnavailabilityDetails
              .map((d) => `${d.resourceLabel} (${d.reason})`)
              .join(', ')
            blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalEndDate} - ${detailsText}`
            conflicts.push({
              date: originalEndDate,
              conflictRange: {
                start: formatMinutesToTime(currentEndMinutes),
                end: formatMinutesToTime(1440),
              },
              resourceIds: sourceUnavailabilityDetails.map((d) => d.resourceId),
              resourceDetails: sourceUnavailabilityDetails.map((d) => ({
                resourceId: d.resourceId,
                resourceLabel: d.resourceLabel,
                reason: d.reason,
                description: d.description,
              })),
              description: sourceUnavailabilityDetails
                .map((d) => d.description)
                .join('; '),
            })
          }
        }
      }

      // Also check for conflicts when resizing within the same day
      if (
        !shouldBlockResize &&
        targetDayDate === originalStartDate &&
        targetDayDate === originalEndDate
      ) {
        // Calculate the new time range based on the resize
        const rawStartMinutes =
          new Date(start).getHours() * 60 +
          new Date(start).getMinutes() +
          (edge === 'top' ? totalDeltaMinutes : 0)
        const rawEndMinutes =
          new Date(end).getHours() * 60 +
          new Date(end).getMinutes() +
          (edge === 'bottom' ? totalDeltaMinutes : 0)

        const snappedStartMinutes = snapMinutes(
          ((rawStartMinutes % 1440) + 1440) % 1440,
        )
        const snappedEndMinutes = snapMinutes(
          ((rawEndMinutes % 1440) + 1440) % 1440,
        )

        // Directly check if any resource is unavailable for the new time range
        // This is more reliable than using getUnavailableRanges which merges availability
        if (resourceIds?.length) {
          const unavailabilityDetails = calendarCore.getUnavailabilityDetails(
            targetDayDate,
            snappedStartMinutes,
            snappedEndMinutes,
            { resourceIds },
          )

          if (unavailabilityDetails.length > 0) {
            shouldBlockResize = true
            blockReason = 'unavailable-time'
            const detailsText = unavailabilityDetails
              .map((d) => `${d.resourceLabel} (${d.reason})`)
              .join(', ')
            blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
            conflicts.push({
              date: targetDayDate,
              conflictRange: {
                start: formatMinutesToTime(snappedStartMinutes),
                end: formatMinutesToTime(snappedEndMinutes),
              },
              resourceIds: unavailabilityDetails.map((d) => d.resourceId),
              resourceDetails: unavailabilityDetails.map((d) => ({
                resourceId: d.resourceId,
                resourceLabel: d.resourceLabel,
                reason: d.reason,
                description: d.description,
              })),
              description: unavailabilityDetails
                .map((d) => d.description)
                .join('; '),
            })
          }
        }

        // Also check capacity constraints if not already blocked
        if (!shouldBlockResize) {
          const detailedConflicts = getDetailedConflicts(
            targetDayDate,
            snappedStartMinutes,
            snappedEndMinutes,
          )

          // Filter to only capacity conflicts (availability already checked above)
          const capacityConflicts = detailedConflicts.filter((c) =>
            c.resourceDetails.some((d) => d.reason === 'capacity'),
          )

          if (capacityConflicts.length > 0) {
            shouldBlockResize = true
            blockReason = 'unavailable-time'
            const conflict = capacityConflicts[0]!
            const detailsText = conflict.resourceDetails
              .map((d) => `${d.resourceLabel} (${d.reason})`)
              .join(', ')
            blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`
            conflicts.push(...capacityConflicts)
          }
        }
      }

      // Emit error if resize is blocked (throttle to avoid emitting on every mouse move)
      if (shouldBlockResize) {
        const event = calendarOptions.events?.find((ev) => ev.id === id)
        const now = Date.now()
        const lastError = lastEmittedErrorRef.current

        // Only emit if this is a different error or it's been more than 500ms
        const shouldEmitError =
          !lastError ||
          lastError.eventId !== id ||
          lastError.message !== blockMessage ||
          now - lastError.timestamp > 500

        if (shouldEmitError) {
          const resizeError: ResizeError = {
            eventId: id,
            eventTitle: event?.title ?? 'Unknown Event',
            reason: blockReason,
            message: blockMessage,
            originalStart: start,
            originalEnd: end,
            conflicts: conflicts.length > 0 ? conflicts : undefined,
          }

          // Emit to TimeClient for devtools
          getTimeClient().emit('event:resize:error', {
            eventId: id,
            eventTitle: event?.title ?? 'Unknown Event',
            reason: blockReason,
            message: blockMessage,
            originalStart: start,
            originalEnd: end,
            conflicts: conflicts.length > 0 ? conflicts : undefined,
          })

          // Call user-provided error handler
          resize?.onResizeError?.(resizeError)

          // Track this error emission
          lastEmittedErrorRef.current = {
            eventId: id,
            message: blockMessage,
            timestamp: now,
          }
        }
      } else {
        // Clear last error when resize is no longer blocked
        lastEmittedErrorRef.current = null
      }

      const effectiveDeltaMinutes = shouldBlockResize ? 0 : totalDeltaMinutes

      const result = calculateResizedEvent({
        originalStart: start,
        originalEnd: end,
        edge,
        deltaMinutes: effectiveDeltaMinutes,
        timeZone: calendarOptions.timeZone ?? 'UTC',
        constraints: {
          ...resizeConstraints,
          unavailableRanges: shouldBlockResize ? [] : unavailableRanges,
        },
      })

      updateResizeState({
        eventId: id,
        previewStart: result.start,
        previewEnd: result.end,
        targetDayDate: shouldBlockResize ? originalDayDate : targetDayDate,
      })
    },
    [
      containerHeight,
      calendarOptions.timeZone,
      calendarOptions.events,
      calendarCore,
      resizeConstraints,
      getDayFromPoint,
      updateResizeState,
    ],
  )

  const handleMouseUp = useCallback(() => {
    const currentState = resizeStateRef.current
    if (
      currentState.eventId &&
      currentState.previewStart &&
      currentState.previewEnd
    ) {
      calendarCore.updateEvent(currentState.eventId, {
        start: currentState.previewStart,
        end: currentState.previewEnd,
      } as Partial<Omit<TEvent, 'id'>>)
      resize?.onResizeEnd?.(
        currentState.eventId,
        currentState.previewStart,
        currentState.previewEnd,
      )
    }

    originalEventRef.current = null
    lastEmittedErrorRef.current = null
    updateResizeState(initialResizeState)

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [calendarCore, handleMouseMove, resize, updateResizeState])

  const getDayFromElement = useCallback(
    (element: HTMLElement): string | null => {
      for (const [dayDate, dayElement] of dayColumnRefsRef.current) {
        if (dayElement.contains(element)) {
          return dayDate
        }
      }
      return null
    },
    [],
  )

  const getResizeHandleProps = useCallback(
    (
      eventId: string,
      edge: ResizeEdge,
      originalStart: string,
      originalEnd: string,
    ): ResizeHandleHandlers => ({
      onMouseDown: (e: React.MouseEvent) => {
        if (!resizeEnabled) return

        e.preventDefault()
        e.stopPropagation()

        const dayDate = getDayFromElement(e.target as HTMLElement)
        if (!dayDate) return

        originalEventRef.current = {
          id: eventId,
          start: originalStart,
          end: originalEnd,
          edge,
          startY: e.clientY,
          originalDayDate: dayDate,
          currentDayDate: dayDate,
        }

        updateResizeState({
          isResizing: true,
          eventId,
          edge,
          previewStart: originalStart,
          previewEnd: originalEnd,
          targetDayDate: dayDate,
        })

        resize?.onResizeStart?.(eventId, edge)

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      },
    }),
    [
      resizeEnabled,
      getDayFromElement,
      handleMouseMove,
      handleMouseUp,
      resize,
      updateResizeState,
    ],
  )

  const getDayColumnProps = useCallback(
    (dayDate: string): DayColumnProps => ({
      ref: (element: HTMLElement | null) => {
        if (element) {
          dayColumnRefsRef.current.set(dayDate, element)
        } else {
          dayColumnRefsRef.current.delete(dayDate)
        }
      },
    }),
    [],
  )

  const goToPreviousPeriod = useCallback<
    typeof calendarCore.goToPreviousPeriod
  >(() => {
    startTransition(() => {
      calendarCore.goToPreviousPeriod()
    })
  }, [calendarCore, startTransition])

  const goToNextPeriod = useCallback<typeof calendarCore.goToNextPeriod>(() => {
    startTransition(() => {
      calendarCore.goToNextPeriod()
    })
  }, [calendarCore, startTransition])

  const goToCurrentPeriod = useCallback<
    typeof calendarCore.goToCurrentPeriod
  >(() => {
    startTransition(() => {
      calendarCore.goToCurrentPeriod()
    })
  }, [calendarCore, startTransition])

  const goToSpecificPeriod = useCallback<
    typeof calendarCore.goToSpecificPeriod
  >(
    (date) => {
      startTransition(() => {
        calendarCore.goToSpecificPeriod(date)
      })
    },
    [calendarCore, startTransition],
  )

  const changeViewMode = useCallback<typeof calendarCore.changeViewMode>(
    (newViewMode) => {
      startTransition(() => {
        calendarCore.changeViewMode(newViewMode)
      })
    },
    [calendarCore, startTransition],
  )

  const getEventProps = useCallback<typeof calendarCore.getEventProps>(
    (id) => calendarCore.getEventProps(id),
    [calendarCore],
  )

  const groupDaysBy = useCallback<typeof calendarCore.groupDaysBy>(
    (props) => calendarCore.groupDaysBy(props),
    [calendarCore],
  )

  const getDaysNames = useCallback<typeof calendarCore.getDaysNames>(
    (props) => calendarCore.getDaysNames(props),
    [calendarCore],
  )

  const getTimeSlots = useCallback<typeof calendarCore.getTimeSlots>(
    (options) => calendarCore.getTimeSlots(options),
    [calendarCore],
  )

  const getEventsByDate = useCallback<typeof calendarCore.getEventsByDate>(
    (date) => calendarCore.getEventsByDate(date),
    [calendarCore],
  )

  const canGoPreviousPeriod = useCallback<
    typeof calendarCore.canGoPreviousPeriod
  >(() => calendarCore.canGoPreviousPeriod(), [calendarCore])

  const canGoNextPeriod = useCallback<typeof calendarCore.canGoNextPeriod>(
    () => calendarCore.canGoNextPeriod(),
    [calendarCore],
  )

  const addEvent = useCallback<typeof calendarCore.addEvent>(
    (event) => calendarCore.addEvent(event),
    [calendarCore],
  )

  const updateEvent = useCallback<typeof calendarCore.updateEvent>(
    (id, updates) => calendarCore.updateEvent(id, updates),
    [calendarCore],
  )

  const removeEvent = useCallback<typeof calendarCore.removeEvent>(
    (id) => calendarCore.removeEvent(id),
    [calendarCore],
  )

  const getUnavailableRanges = useCallback<
    typeof calendarCore.getUnavailableRanges
  >(
    (date, options) =>
      calendarCore.getUnavailableRanges(date, {
        containerHeight: options?.containerHeight ?? containerHeight,
        resourceIds: options?.resourceIds,
      }),
    [calendarCore, containerHeight],
  )

  const days = useMemo(() => {
    void state
    return calendarCore.getDaysWithEvents()
  }, [calendarCore, state])

  return {
    activeDate: state.activeDate.toString(),
    currentPeriod: state.currentPeriod.toString(),
    viewMode: state.viewMode,
    days,
    getDaysNames,
    getTimeSlots,
    getEventsByDate,
    goToPreviousPeriod,
    goToNextPeriod,
    goToCurrentPeriod,
    goToSpecificPeriod,
    canGoPreviousPeriod,
    canGoNextPeriod,
    changeViewMode,
    getEventProps,
    addEvent,
    updateEvent,
    removeEvent,
    isPending,
    groupDaysBy,
    resizeState,
    getResizeHandleProps,
    getDayColumnProps,
    getUnavailableRanges,
  }
}
