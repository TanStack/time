import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useStore } from "@tanstack/react-store";
import { CalendarCore } from "@tanstack/time";
import type {
  AllCalendarFeatures,
  CalendarApi,
  CalendarCoreOptions,
  CalendarFeatureList,
  DependencyType,
  RecurrenceEditScope,
  Event,
  EventDateTimeInput,
  EventDependency,
  ResizeController,
  ResizeControllerOptions,
  ResizeEdge,
  ResizeState,
  Resource,
} from "@tanstack/time";

export type { ResizeState } from "@tanstack/time";

export type ResizeOptions = ResizeControllerOptions;

interface ResizeHandleHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
}

interface ResizeHandleOptions {
  occurrenceStart?: EventDateTimeInput;
  recurrenceScope?: RecurrenceEditScope;
}

interface DayColumnProps {
  ref: (element: HTMLElement | null) => void;
}

export interface UseCalendarOptions<
  TFeatures extends CalendarFeatureList = AllCalendarFeatures,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> extends CalendarCoreOptions<TFeatures, TResource, TEvent> {
  resize?: ResizeOptions;
}

export const useCalendar = <
  const TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  options: UseCalendarOptions<TFeatures, TResource, TEvent>,
): CalendarApi<TResource, TEvent> & {
  isPending: boolean;
  resizeState: ResizeState;
  getResizeHandleProps: (
    eventId: string,
    edge: ResizeEdge,
    originalStart: string,
    originalEnd: string,
    options?: ResizeHandleOptions,
  ) => ResizeHandleHandlers;
  getDayColumnProps: (dayDate: string) => DayColumnProps;
} => {
  const { resize, ...calendarOptions } = options;

  const [calendarCore] = useState(
    () => new CalendarCore<TFeatures, TResource, TEvent>(calendarOptions),
  );
  const state = useStore(calendarCore.store);
  const isPending = state.isPending;

  useEffect(() => {
    calendarCore.ensureRangeLoaded();
  }, [calendarCore, state.currentPeriod, state.viewMode, state.activeDate]);

  const [resizeController] = useState<ResizeController<TResource, TEvent>>(() =>
    calendarCore.createResizeController(resize),
  );

  useEffect(() => {
    resizeController.setOptions(resize ?? {});
  }, [resizeController, resize]);

  useEffect(() => {
    return () => {
      resizeController.destroy();
    };
  }, [resizeController]);

  const resizeState = useSyncExternalStore(
    resizeController.subscribe,
    resizeController.getSnapshot,
    resizeController.getSnapshot,
  );

  const resizeHandlePropsCacheRef = useRef(
    new Map<string, ResizeHandleHandlers>(),
  );
  const dayColumnPropsCacheRef = useRef(new Map<string, DayColumnProps>());

  const getResizeHandleProps = useCallback(
    (
      eventId: string,
      edge: ResizeEdge,
      originalStart: string,
      originalEnd: string,
      handleOptions?: ResizeHandleOptions,
    ): ResizeHandleHandlers => {
      const key = `${eventId}|${edge}|${originalStart}|${originalEnd}|${handleOptions?.occurrenceStart ?? ""}|${handleOptions?.recurrenceScope ?? ""}`;
      const cache = resizeHandlePropsCacheRef.current;
      const cached = cache.get(key);
      if (cached) return cached;

      const handlers: ResizeHandleHandlers = {
        onMouseDown: (e: React.MouseEvent) => {
          const started = resizeController.start({
            eventId,
            edge,
            originalStart,
            originalEnd,
            occurrenceStart: handleOptions?.occurrenceStart,
            recurrenceScope: handleOptions?.recurrenceScope,
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target as HTMLElement | null,
          });
          if (!started) return;

          e.preventDefault();
          e.stopPropagation();
        },
      };

      cache.set(key, handlers);
      return handlers;
    },
    [resizeController],
  );

  const getDayColumnProps = useCallback(
    (dayDate: string): DayColumnProps => {
      const cache = dayColumnPropsCacheRef.current;
      const cached = cache.get(dayDate);
      if (cached) return cached;
      const props: DayColumnProps = {
        ref: (element: HTMLElement | null) => {
          resizeController.registerDayColumn(dayDate, element);
        },
      };
      cache.set(dayDate, props);
      return props;
    },
    [resizeController],
  );

  const goToPreviousPeriod = useCallback<
    typeof calendarCore.goToPreviousPeriod
  >(() => {
    calendarCore.goToPreviousPeriod();
  }, [calendarCore]);

  const goToNextPeriod = useCallback<typeof calendarCore.goToNextPeriod>(() => {
    calendarCore.goToNextPeriod();
  }, [calendarCore]);

  const goToCurrentPeriod = useCallback<
    typeof calendarCore.goToCurrentPeriod
  >(() => {
    calendarCore.goToCurrentPeriod();
  }, [calendarCore]);

  const goToSpecificPeriod = useCallback<
    typeof calendarCore.goToSpecificPeriod
  >(
    (date) => {
      calendarCore.goToSpecificPeriod(date);
    },
    [calendarCore],
  );

  const changeViewMode = useCallback<typeof calendarCore.changeViewMode>(
    (newViewMode) => {
      calendarCore.changeViewMode(newViewMode);
    },
    [calendarCore],
  );

  const getEventProps = useCallback<typeof calendarCore.getEventProps>(
    (id, layoutOptions) => calendarCore.getEventProps(id, layoutOptions),
    [calendarCore],
  );

  const groupDaysBy = useCallback<typeof calendarCore.groupDaysBy>(
    (props) => calendarCore.groupDaysBy(props),
    [calendarCore],
  );

  const getDaysNames = useCallback<typeof calendarCore.getDaysNames>(
    (props) => calendarCore.getDaysNames(props),
    [calendarCore],
  );

  const getTimeSlots = useCallback<typeof calendarCore.getTimeSlots>(
    (slotOptions) => calendarCore.getTimeSlots(slotOptions),
    [calendarCore],
  );

  const getEventsByDate = useCallback<typeof calendarCore.getEventsByDate>(
    (date) => calendarCore.getEventsByDate(date),
    [calendarCore],
  );

  const getAllDayEventsByDate = useCallback<
    typeof calendarCore.getAllDayEventsByDate
  >((date) => calendarCore.getAllDayEventsByDate(date), [calendarCore]);

  const canGoPreviousPeriod = useCallback<
    typeof calendarCore.canGoPreviousPeriod
  >(() => calendarCore.canGoPreviousPeriod(), [calendarCore]);

  const canGoNextPeriod = useCallback<typeof calendarCore.canGoNextPeriod>(
    () => calendarCore.canGoNextPeriod(),
    [calendarCore],
  );

  const addEvent = useCallback<typeof calendarCore.addEvent>(
    (event, addOptions) => calendarCore.addEvent(event, addOptions),
    [calendarCore],
  );

  const editEvent = useCallback<typeof calendarCore.editEvent>(
    (eventId, updates, editOptions) =>
      calendarCore.editEvent(eventId, updates, editOptions),
    [calendarCore],
  );

  const editRecurringEvent = useCallback<
    typeof calendarCore.editRecurringEvent
  >(
    (eventId, updates, editOptions) =>
      calendarCore.editRecurringEvent(eventId, updates, editOptions),
    [calendarCore],
  );

  const removeRecurringEvent = useCallback<
    typeof calendarCore.removeRecurringEvent
  >(
    (eventId, removeOptions) =>
      calendarCore.removeRecurringEvent(eventId, removeOptions),
    [calendarCore],
  );
  const removeEvent = useCallback<typeof calendarCore.removeEvent>(
    (id) => calendarCore.removeEvent(id),
    [calendarCore],
  );

  const getUnavailableRanges = useCallback<
    typeof calendarCore.getUnavailableRanges
  >(
    (date, rangeOptions) =>
      calendarCore.getUnavailableRanges(date, {
        resourceIds: rangeOptions?.resourceIds,
      }),
    [calendarCore],
  );

  const getEventsByResource = useCallback<
    typeof calendarCore.getEventsByResource
  >(() => calendarCore.getEventsByResource(), [calendarCore]);

  const getTimelineLayout = useCallback<typeof calendarCore.getTimelineLayout>(
    () => calendarCore.getTimelineLayout(),
    [calendarCore],
  );

  const getEvents = useCallback<typeof calendarCore.getEvents>(
    () => calendarCore.getEvents(),
    [calendarCore],
  );

  const validateMove = useCallback<typeof calendarCore.validateMove>(
    (eventId, newStart, newEnd, newResources) =>
      calendarCore.validateMove(eventId, newStart, newEnd, newResources),
    [calendarCore],
  );

  const validateEventDependencies = useCallback(
    (
      event: { id?: string; title: string; start: string; end: string },
      dependsOn: Array<EventDependency>,
    ) => calendarCore.validateEventDependencies(event, dependsOn),
    [calendarCore],
  );

  const createDependency = useCallback(
    (sourceId: string, targetId: string, type?: DependencyType) =>
      calendarCore.createDependency(sourceId, targetId, type),
    [calendarCore],
  );

  const goToNextOccurrence = useCallback(
    (eventId: string, fromDate?: EventDateTimeInput) => {
      calendarCore.goToNextOccurrence(eventId, fromDate);
    },
    [calendarCore],
  );

  const goToPreviousOccurrence = useCallback(
    (eventId: string, fromDate?: EventDateTimeInput) => {
      calendarCore.goToPreviousOccurrence(eventId, fromDate);
    },
    [calendarCore],
  );

  const getMasterEvent = useCallback<typeof calendarCore.getMasterEvent>(
    (event) => calendarCore.getMasterEvent(event),
    [calendarCore],
  );

  const undo = useCallback(() => calendarCore.undo(), [calendarCore]);
  const redo = useCallback(() => calendarCore.redo(), [calendarCore]);
  const canUndo = useCallback(() => calendarCore.canUndo(), [calendarCore]);
  const canRedo = useCallback(() => calendarCore.canRedo(), [calendarCore]);

  const fetchEventsForRange = useCallback<
    typeof calendarCore.fetchEventsForRange
  >(
    (start, end) => calendarCore.fetchEventsForRange(start, end),
    [calendarCore],
  );

  const validateEventPlacement = useCallback<
    typeof calendarCore.validateEventPlacement
  >((event) => calendarCore.validateEventPlacement(event), [calendarCore]);

  const formatPeriodLabel = useCallback<typeof calendarCore.formatPeriodLabel>(
    (labelOptions) => calendarCore.formatPeriodLabel(labelOptions),
    [calendarCore],
  );

  const formatCurrentPeriod = useCallback<
    typeof calendarCore.formatCurrentPeriod
  >(
    (labelOptions) => calendarCore.formatCurrentPeriod(labelOptions),
    [calendarCore],
  );

  const getEventSegmentInfo = useCallback<
    typeof calendarCore.getEventSegmentInfo
  >((event) => calendarCore.getEventSegmentInfo(event), [calendarCore]);

  const daysKey = `${state.currentPeriod}|${state.activeDate}|${state.viewMode.value}|${state.viewMode.unit}|${state.eventsVersion}`;

  const days = useMemo(() => {
    void daysKey;
    return calendarCore.getDaysWithEvents();
  }, [calendarCore, daysKey]);

  const getDaysInRange = useCallback<typeof calendarCore.getDaysInRange>(
    (start, end) => calendarCore.getDaysInRange(start, end),
    [calendarCore],
  );

  const setResources = useCallback<typeof calendarCore.setResources>(
    (resources) => calendarCore.setResources(resources),
    [calendarCore],
  );

  const setEvents = useCallback<typeof calendarCore.setEvents>(
    (events) => calendarCore.setEvents(events),
    [calendarCore],
  );

  return {
    activeDate: state.activeDate,
    currentPeriod: state.currentPeriod,
    viewMode: state.viewMode,
    days,
    getDaysInRange,
    getDaysNames,
    getTimeSlots,
    getEventsByDate,
    getAllDayEventsByDate,
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
    editRecurringEvent,
    removeEvent,
    removeRecurringEvent,
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
    formatCurrentPeriod,
    getEventSegmentInfo,
    undo,
    redo,
    canUndo,
    canRedo,
    goToNextOccurrence,
    goToPreviousOccurrence,
    getMasterEvent,
    setResources,
    setEvents,
  };
};
