import { createEffect, createMemo } from "solid-js";
import { useStore } from "@tanstack/solid-store";
import { createCalendar as createCalendarCore } from "@tanstack/time";
import type { Accessor } from "solid-js";
import type {
  Calendar,
  CalendarCoreOptions,
  CalendarFeatureList,
  CalendarStore,
  Day,
  Event,
  Resource,
} from "@tanstack/time";

export interface CreateCalendarOptions<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> extends CalendarCoreOptions<TFeatures, TResource, TEvent> {}

export type SolidCalendar<
  TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = {
  calendar: Calendar<TFeatures, TResource, TEvent>;
  state: Accessor<CalendarStore>;
  days: Accessor<Array<Day<TResource, TEvent>>>;
  isPending: Accessor<boolean>;
};

export function createCalendar<
  const TFeatures extends CalendarFeatureList,
  TResource extends Resource = Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>(
  options: CreateCalendarOptions<TFeatures, TResource, TEvent>,
): SolidCalendar<TFeatures, TResource, TEvent> {
  const calendar = createCalendarCore<TFeatures, TResource, TEvent>(options);

  const state = useStore(calendar.store);
  const isPending = useStore(calendar.store, (snapshot) => snapshot.isPending);
  const rangeKey = useStore(
    calendar.store,
    (snapshot) =>
      `${snapshot.currentPeriod}|${snapshot.activeDate}|${snapshot.viewMode.value}|${snapshot.viewMode.unit}`,
  );
  const daysKey = useStore(
    calendar.store,
    (snapshot) =>
      `${snapshot.currentPeriod}|${snapshot.activeDate}|${snapshot.viewMode.value}|${snapshot.viewMode.unit}|${snapshot.eventsVersion}`,
  );

  createEffect(() => {
    rangeKey();
    calendar.ensureRangeLoaded();
  });

  const days = createMemo(() => {
    daysKey();
    return calendar.getDaysWithEvents();
  });

  return { calendar, state, days, isPending };
}
