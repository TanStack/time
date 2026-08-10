---
id: stockFeatures
title: stockFeatures
---

# Variable: stockFeatures

```ts
const stockFeatures: readonly [<TResource, TEvent>() => CalendarFeature<TResource, TEvent, UndoHistory<TEvent & KernelEvent>, HistoryApi, "history">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, RecurrenceApi<TEvent & KernelEvent>, RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>, "recurrence">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, DependencyApi, DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>, "dependency">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, ConstraintModuleApi, ConstraintApi<TResource, TEvent>, "constraint">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, DurationModuleApi, DurationApi<TResource, TEvent>, "duration">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, WorkingTimeApi<TResource>, "workingTime">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, AvailabilityModuleApi, AvailabilityApi<TResource, TEvent>, "availability", AvailabilityPeers<TResource>>, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, ResizeFeatureApi<TResource, TEvent>, "resize", ResizePeers<TResource, TEvent>>, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, DayLayoutApi<TResource, TEvent>, "dayLayout">, <TResource, TEvent>() => CalendarFeature<TResource, TEvent, object, TimelineApi<TResource, TEvent>, "timeline">];
```

Defined in: [calendar/features/stockFeatures.ts:12](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/stockFeatures.ts#L12)
