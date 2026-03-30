import {
  useCallback,
  useEffect,
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
  calculateDeltaMinutesFromPixelsHorizontal,
  getTimeClient,
} from '@tanstack/time'
import type {
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
  lastValidPreviewStart: string | null
  lastValidPreviewEnd: string | null
  targetDayDate: string | null
  blocked: boolean
}

export interface ResizeOptions {
  enabled?: boolean
  containerHeight?: number
  containerWidth?: number
  orientation?: 'vertical' | 'horizontal'
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
  lastValidPreviewStart: null,
  lastValidPreviewEnd: null,
  targetDayDate: null,
  blocked: false,
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

  const [calendarCore] = useState(
    () => new CalendarCore<TResource, TEvent>(calendarOptions),
  )
  const state = useStore(calendarCore.store)
  const [isTransitionPending, startTransition] = useTransition()
  // Combine React's transition pending with the async fetch pending from the store
  const isPending = isTransitionPending || state.isPending

  // Trigger lazy loading when the period or view mode changes.
  // This must be done in an effect to avoid triggering fetches/state updates during render.
  useEffect(() => {
    calendarCore.ensureRangeLoaded()
  }, [calendarCore, state.currentPeriod, state.viewMode, state.activeDate])

  const resizeOptionsRef = useRef<ResizeOptions | undefined>(resize)
  resizeOptionsRef.current = resize

  const calendarOptionsRef =
    useRef<CalendarCoreOptions<TResource, TEvent>>(calendarOptions)
  calendarOptionsRef.current = calendarOptions

  const resizeStateRef = useRef<ResizeState>(initialResizeState)
  const resizeListenersRef = useRef<Set<() => void>>(new Set())
  const dayColumnRefsRef = useRef<Map<string, HTMLElement>>(new Map())
  const originalEventRef = useRef<{
    id: string
    start: string
    end: string
    edge: ResizeEdge
    startY: number
    startX: number
    originalDayDate: string
    currentDayDate: string
    totalDaysInView: number
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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!originalEventRef.current) return

      const resizeOpts = resizeOptionsRef.current
      const containerHeight = resizeOpts?.containerHeight ?? 0
      const containerWidth = resizeOpts?.containerWidth ?? 0
      const orientation = resizeOpts?.orientation ?? 'vertical'
      const constraints = resizeOpts?.constraints

      const { id, start, end, edge, startY, startX, originalDayDate } =
        originalEventRef.current

      let targetDayDate: string
      let totalDeltaMinutes: number

      if (orientation === 'horizontal') {
        if (containerWidth === 0) return
        const totalMinutesInView =
          originalEventRef.current.totalDaysInView * 24 * 60
        totalDeltaMinutes = calculateDeltaMinutesFromPixelsHorizontal(
          e.clientX - startX,
          containerWidth,
          totalMinutesInView,
        )
        targetDayDate = originalDayDate
      } else {
        const deltaMinutes = calculateDeltaMinutesFromPixels(
          e.clientY - startY,
          containerHeight,
        )

        targetDayDate = getDayFromPoint(e.clientX) ?? originalDayDate

        let dayOffsetMinutes = 0
        if (targetDayDate !== originalDayDate) {
          const originalDate = new Date(originalDayDate + 'T00:00:00')
          const targetDate = new Date(targetDayDate + 'T00:00:00')
          const dayDiff = Math.round(
            (targetDate.getTime() - originalDate.getTime()) /
              (1000 * 60 * 60 * 24),
          )
          dayOffsetMinutes = dayDiff * 24 * 60
          originalEventRef.current.currentDayDate = targetDayDate
        }

        totalDeltaMinutes = deltaMinutes + dayOffsetMinutes
      }

      const validation = calendarCore.validateResize({
        eventId: id,
        originalStart: start,
        originalEnd: end,
        edge,
        totalDeltaMinutes,
        targetDayDate,
        originalDayDate,
        constraints,
      })

      if (validation.blocked && validation.error) {
        const event = calendarOptionsRef.current.events?.find(
          (ev) => ev.id === id,
        )
        const now = Date.now()
        const lastError = lastEmittedErrorRef.current

        const shouldEmitError =
          !lastError ||
          lastError.eventId !== id ||
          lastError.message !== validation.error.message ||
          now - lastError.timestamp > 500

        if (shouldEmitError) {
          const resizeError: ResizeError = {
            eventId: id,
            eventTitle: event?.title ?? 'Unknown Event',
            reason: validation.error.reason,
            message: validation.error.message,
            originalStart: start,
            originalEnd: end,
            conflicts:
              validation.error.conflicts.length > 0
                ? validation.error.conflicts
                : undefined,
          }

          getTimeClient().emit('event:update:error', {
            eventId: id,
            eventTitle: event?.title ?? 'Unknown Event',
            reason: validation.error.reason,
            message: validation.error.message,
            originalStart: start,
            originalEnd: end,
            conflicts:
              validation.error.conflicts.length > 0
                ? validation.error.conflicts
                : undefined,
          })

          resizeOpts?.onResizeError?.(resizeError)

          lastEmittedErrorRef.current = {
            eventId: id,
            message: validation.error.message,
            timestamp: now,
          }
        }
      } else {
        lastEmittedErrorRef.current = null
      }

      const currentState = resizeStateRef.current
      const effectivePreviewStart = validation.blocked
        ? (currentState.lastValidPreviewStart ?? start)
        : validation.result.start
      const effectivePreviewEnd = validation.blocked
        ? (currentState.lastValidPreviewEnd ?? end)
        : validation.result.end

      updateResizeState({
        eventId: id,
        previewStart: effectivePreviewStart,
        previewEnd: effectivePreviewEnd,
        ...(!validation.blocked && {
          lastValidPreviewStart: validation.result.start,
          lastValidPreviewEnd: validation.result.end,
        }),
        targetDayDate: validation.targetDayDate,
        blocked: validation.blocked,
      })
    },
    [calendarCore, getDayFromPoint, updateResizeState],
  )

  const handleMouseUp = useCallback(() => {
    const currentState = resizeStateRef.current
    const original = originalEventRef.current

    if (
      currentState.eventId &&
      currentState.previewStart &&
      currentState.previewEnd
    ) {
      const hasChanged =
        !original ||
        currentState.previewStart !== original.start ||
        currentState.previewEnd !== original.end

      if (hasChanged) {
        calendarCore.updateEvent(currentState.eventId, {
          start: currentState.previewStart,
          end: currentState.previewEnd,
        } as Partial<Omit<TEvent, 'id'>>)
        resizeOptionsRef.current?.onResizeEnd?.(
          currentState.eventId,
          currentState.previewStart,
          currentState.previewEnd,
        )
      }
    }

    originalEventRef.current = null
    lastEmittedErrorRef.current = null
    updateResizeState(initialResizeState)

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [calendarCore, handleMouseMove, updateResizeState])

  const getResizeHandleProps = useCallback(
    (
      eventId: string,
      edge: ResizeEdge,
      originalStart: string,
      originalEnd: string,
    ): ResizeHandleHandlers => ({
      onMouseDown: (e: React.MouseEvent) => {
        if (!(resizeOptionsRef.current?.enabled ?? true)) return

        e.preventDefault()
        e.stopPropagation()

        const dayDate =
          getDayFromElement(e.target as HTMLElement) ??
          getDayFromPoint(e.clientX)
        if (!dayDate) return

        originalEventRef.current = {
          id: eventId,
          start: originalStart,
          end: originalEnd,
          edge,
          startY: e.clientY,
          startX: e.clientX,
          originalDayDate: dayDate,
          currentDayDate: dayDate,
          totalDaysInView: calendarCore.getDaysWithEvents().length,
        }

        updateResizeState({
          isResizing: true,
          eventId,
          edge,
          previewStart: originalStart,
          previewEnd: originalEnd,
          lastValidPreviewStart: originalStart,
          lastValidPreviewEnd: originalEnd,
          targetDayDate: dayDate,
        })

        resizeOptionsRef.current?.onResizeStart?.(eventId, edge)

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      },
    }),
    [
      calendarCore,
      getDayFromElement,
      getDayFromPoint,
      handleMouseMove,
      handleMouseUp,
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

  const containerHeight = resize?.containerHeight ?? 0

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

  const getEventsByResource = useCallback<
    typeof calendarCore.getEventsByResource
  >(() => calendarCore.getEventsByResource(), [calendarCore])

  const getTimelineLayout = useCallback<typeof calendarCore.getTimelineLayout>(
    () => calendarCore.getTimelineLayout(),
    [calendarCore],
  )

  const getEvents = useCallback<typeof calendarCore.getEvents>(
    () => calendarCore.getEvents(),
    [calendarCore],
  )

  const validateMove = useCallback<typeof calendarCore.validateMove>(
    (eventId, newStart, newEnd, newResources) =>
      calendarCore.validateMove(eventId, newStart, newEnd, newResources),
    [calendarCore],
  )

  const validateEventDependencies = useCallback(
    (
      event: { id?: string; title: string; start: string; end: string },
      dependsOn: Array<string>,
    ) => calendarCore.validateEventDependencies(event, dependsOn),
    [calendarCore],
  )

  const createDependency = useCallback(
    (sourceId: string, targetId: string) =>
      calendarCore.createDependency(sourceId, targetId),
    [calendarCore],
  )

  const formatPeriodLabel = useCallback<typeof calendarCore.formatPeriodLabel>(
    (options) => calendarCore.formatPeriodLabel(options),
    [calendarCore],
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
    getEventsByResource,
    getTimelineLayout,
    getEvents,
    validateMove,
    validateEventDependencies,
    createDependency,
    formatPeriodLabel,
  }
}
