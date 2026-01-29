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

const DEFAULT_CONTAINER_HEIGHT = 1440

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
} => {
  const { resize, ...calendarOptions } = options
  const resizeEnabled = resize?.enabled ?? true
  const containerHeight = resize?.containerHeight ?? DEFAULT_CONTAINER_HEIGHT
  const constraints = resize?.constraints

  const [calendarCore] = useState(
    () => new CalendarCore<TResource, TEvent>(calendarOptions),
  )
  const state = useStore(calendarCore.store)
  const [isPending, startTransition] = useTransition()

  const resizeStateRef = useRef<ResizeState>(initialResizeState)
  const resizeListenersRef = useRef<Set<() => void>>(new Set())
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

      // Detect which day column the mouse is over
      const dayColumns = document.querySelectorAll('[data-day-date]')
      let targetDayDate: string | null = null

      for (const column of dayColumns) {
        const rect = column.getBoundingClientRect()
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          targetDayDate = column.getAttribute('data-day-date')
          break
        }
      }

      // Calculate day offset if moved to a different day
      let dayOffsetMinutes = 0
      if (targetDayDate && targetDayDate !== originalDayDate) {
        const originalDate = new Date(originalDayDate + 'T00:00:00')
        const targetDate = new Date(targetDayDate + 'T00:00:00')
        const dayDiff = Math.round(
          (targetDate.getTime() - originalDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )

        // Apply day offset in both directions for flexible resizing
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
    [containerHeight, calendarOptions.timeZone, constraints, updateResizeState],
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

        // Find the day column this event is in
        const dayColumn = (e.target as HTMLElement).closest('[data-day-date]')
        const dayDate = dayColumn?.getAttribute('data-day-date') ?? ''

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
        document.body.style.cursor = 'ns-resize'
        document.body.style.userSelect = 'none'
      },
    }),
    [resizeEnabled, handleMouseMove, handleMouseUp, resize, updateResizeState],
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

  const days = useMemo(() => {
    // state dependency triggers recalculation when calendar state changes
    void state
    return calendarCore.getDaysWithEvents()
  }, [calendarCore, state])

  return {
    activeDate: state.activeDate.toString(),
    currentPeriod: state.currentPeriod.toString(),
    viewMode: state.viewMode,
    days: calendarCore.getDaysWithEvents(),
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
  }
}
