---
id: CalendarApi
title: CalendarApi
---

# Type Alias: CalendarApi\<TFeatures, TResource, TEvent\>

```ts
type CalendarApi<TFeatures, TResource, TEvent> = CalendarActions<TResource, TEvent> & CalendarState<TResource, TEvent> & ComposedApi<TFeatures, TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L163)

## Type Parameters

### TFeatures

`TFeatures` *extends* [`CalendarFeatureList`](CalendarFeatureList.md)

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>
