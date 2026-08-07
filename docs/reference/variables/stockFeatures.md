---
id: stockFeatures
title: stockFeatures
---

# Variable: stockFeatures

```ts
const stockFeatures: readonly [<TResource, TEvent>() => CalendarFeature<TResource, TEvent, UndoHistory<TEvent & KernelEvent>, HistoryApi, "history">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, RecurrenceApi<TEvent & KernelEvent>, RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>, "recurrence">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, DependencyApi, DependencyCreationApi & DependencyApi, "dependency">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, AvailabilityApi<TResource, TEvent>, "availability">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, ResizeFeatureApi<TResource, TEvent>, "resize">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, DayLayoutApi<TResource, TEvent>, "dayLayout">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, TimelineApi<TResource, TEvent>, "timeline">];
```

Defined in: [calendar/features/calendarFeatures.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/calendarFeatures.ts#L18)
