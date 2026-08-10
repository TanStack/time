---
id: Calendar
title: Calendar
---

# Type Alias: Calendar\<TFeatures, TResource, TEvent\>

```ts
type Calendar<TFeatures, TResource, TEvent> = CalendarCore<TFeatures, TResource, TEvent> & ComposedApi<TFeatures, TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:171](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L171)

## Type Parameters

### TFeatures

`TFeatures` *extends* [`CalendarFeatureList`](CalendarFeatureList.md)

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>
