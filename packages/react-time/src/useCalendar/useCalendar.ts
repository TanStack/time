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
} from '@tanstack/time'
import type {
  CalendarApi,
  CalendarCoreOptions,
  Event,
  ResizeConstraints,
  ResizeEdge,
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
  const constraints = resize?.constraints

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

      // Calculate day offset if moved to a different day
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

      const result = calculateResizedEvent({
        originalStart: start,
        originalEnd: end,
        edge,
        deltaMinutes: totalDeltaMinutes,
        timeZone: calendarOptions.timeZone ?? 'UTC',
        constraints,
      })

      updateResizeState({
        eventId: id,
        previewStart: result.start,
        previewEnd: result.end,
        targetDayDate,
      })
    },
    [
      containerHeight,
      calendarOptions.timeZone,
      constraints,
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
