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
import { CalendarCore } from '@tanstack/time'
import type {
  CalendarApi,
  CalendarCoreOptions,
  DependencyType,
  Event,
  EventDateTimeInput,
  EventDependency,
  ResizeController,
  ResizeControllerOptions,
  ResizeEdge,
  ResizeState,
  Resource,
} from '@tanstack/time'

export type { ResizeState } from '@tanstack/time'

/**
 * Hook-level resize options. Identical to `ResizeControllerOptions` from core
 * but re-exported under a React-friendly name for backwards compatibility.
 */
export type ResizeOptions = ResizeControllerOptions

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
  const isPending = isTransitionPending || state.isPending

  useEffect(() => {
    calendarCore.ensureRangeLoaded()
  }, [calendarCore, state.currentPeriod, state.viewMode, state.activeDate])

  const [resizeController] = useState<ResizeController<TResource, TEvent>>(() =>
    calendarCore.createResizeController(resize),
  )

  useEffect(() => {
    resizeController.setOptions(resize ?? {})
  }, [resizeController, resize])

  useEffect(() => {
    return () => {
      resizeController.destroy()
    }
  }, [resizeController])

  const resizeState = useSyncExternalStore(
    resizeController.subscribe,
    resizeController.getSnapshot,
    resizeController.getSnapshot,
  )

  const resizeHandlePropsCacheRef = useRef(
    new Map<string, ResizeHandleHandlers>(),
  )
  const dayColumnPropsCacheRef = useRef(new Map<string, DayColumnProps>())

  const getResizeHandleProps = useCallback(
    (
      eventId: string,
      edge: ResizeEdge,
      originalStart: string,
      originalEnd: string,
    ): ResizeHandleHandlers => {
      const key = `${eventId}|${edge}|${originalStart}|${originalEnd}`
      const cache = resizeHandlePropsCacheRef.current
      const cached = cache.get(key)
      if (cached) return cached

      const handlers: ResizeHandleHandlers = {
        onMouseDown: (e: React.MouseEvent) => {
          const started = resizeController.start({
            eventId,
            edge,
            originalStart,
            originalEnd,
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target as HTMLElement | null,
          })
          if (!started) return

          e.preventDefault()
          e.stopPropagation()
        },
      }

      cache.set(key, handlers)
      return handlers
    },
    [resizeController],
  )

  const getDayColumnProps = useCallback(
    (dayDate: string): DayColumnProps => {
      const cache = dayColumnPropsCacheRef.current
      const cached = cache.get(dayDate)
      if (cached) return cached
      const props: DayColumnProps = {
        ref: (element: HTMLElement | null) => {
          resizeController.registerDayColumn(dayDate, element)
        },
      }
      cache.set(dayDate, props)
      return props
    },
    [resizeController],
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
    (slotOptions) => calendarCore.getTimeSlots(slotOptions),
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
    (event, addOptions) => calendarCore.addEvent(event, addOptions),
    [calendarCore],
  )

  const editEvent = useCallback<typeof calendarCore.editEvent>(
    (eventId, updates, editOptions) =>
      calendarCore.editEvent(eventId, updates, editOptions),
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
    (date, rangeOptions) =>
      calendarCore.getUnavailableRanges(date, {
        containerHeight: rangeOptions?.containerHeight ?? containerHeight,
        resourceIds: rangeOptions?.resourceIds,
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
      dependsOn: Array<EventDependency>,
    ) => calendarCore.validateEventDependencies(event, dependsOn),
    [calendarCore],
  )

  const createDependency = useCallback(
    (sourceId: string, targetId: string, type?: DependencyType) =>
      calendarCore.createDependency(sourceId, targetId, type),
    [calendarCore],
  )

  const goToNextOccurrence = useCallback(
    (eventId: string, fromDate?: EventDateTimeInput) => {
      startTransition(() => {
        calendarCore.goToNextOccurrence(eventId, fromDate)
      })
    },
    [calendarCore, startTransition],
  )

  const goToPreviousOccurrence = useCallback(
    (eventId: string, fromDate?: EventDateTimeInput) => {
      startTransition(() => {
        calendarCore.goToPreviousOccurrence(eventId, fromDate)
      })
    },
    [calendarCore, startTransition],
  )

  const getMasterEvent = useCallback<typeof calendarCore.getMasterEvent>(
    (event) => calendarCore.getMasterEvent(event),
    [calendarCore],
  )

  const undo = useCallback(() => calendarCore.undo(), [calendarCore])
  const redo = useCallback(() => calendarCore.redo(), [calendarCore])
  const canUndo = useCallback(() => calendarCore.canUndo(), [calendarCore])
  const canRedo = useCallback(() => calendarCore.canRedo(), [calendarCore])

  const fetchEventsForRange = useCallback<
    typeof calendarCore.fetchEventsForRange
  >(
    (start, end) => calendarCore.fetchEventsForRange(start, end),
    [calendarCore],
  )

  const validateEventPlacement = useCallback<
    typeof calendarCore.validateEventPlacement
  >((event) => calendarCore.validateEventPlacement(event), [calendarCore])

  const formatPeriodLabel = useCallback<typeof calendarCore.formatPeriodLabel>(
    (labelOptions) => calendarCore.formatPeriodLabel(labelOptions),
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
    editEvent,
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
    fetchEventsForRange,
    validateEventPlacement,
    formatPeriodLabel,
    undo,
    redo,
    canUndo,
    canRedo,
    goToNextOccurrence,
    goToPreviousOccurrence,
    getMasterEvent,
  }
}
