import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { createCalendar } from "@tanstack/time";
import type {
  CalendarApi,
  CalendarCoreOptions,
  CalendarFeatureList,
  Event,
  Resource,
} from "@tanstack/time";

export interface UseCalendarOptions<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> extends CalendarCoreOptions<TFeatures, TResource, TEvent> {}

type UseCalendarResult<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource,
  TEvent extends Event<TResource>,
> = CalendarApi<TFeatures, TResource, TEvent> & {
  isPending: boolean;
};

export const useCalendar = <
  const TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  options: UseCalendarOptions<TFeatures, TResource, TEvent>,
): UseCalendarResult<TFeatures, TResource, TEvent> => {
  const [calendarCore] = useState(() =>
    createCalendar<TFeatures, TResource, TEvent>(options),
  );
  const state = useStore(calendarCore.store);
  const isPending = state.isPending;

  useEffect(() => {
    calendarCore.ensureRangeLoaded();
  }, [calendarCore, state.currentPeriod, state.viewMode, state.activeDate]);

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

  const removeEvent = useCallback<typeof calendarCore.removeEvent>(
    (id) => calendarCore.removeEvent(id),
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

  const fetchEventsForRange = useCallback<
    typeof calendarCore.fetchEventsForRange
  >(
    (start, end) => calendarCore.fetchEventsForRange(start, end),
    [calendarCore],
  );

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
    ...(calendarCore.featureApi as object),
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
    addEvent,
    editEvent,
    removeEvent,
    isPending,
    groupDaysBy,
    getEvents,
    validateMove,
    fetchEventsForRange,
    formatPeriodLabel,
    formatCurrentPeriod,
    setResources,
    setEvents,
  } as unknown as UseCalendarResult<TFeatures, TResource, TEvent>;
};
