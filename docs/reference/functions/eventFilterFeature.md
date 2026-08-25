---
id: eventFilterFeature
title: eventFilterFeature
---

# Function: eventFilterFeature()

```ts
function eventFilterFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, object, EventFilterApi<TResource, TEvent>, "filter">;
```

Defined in: [calendar/features/filter.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L22)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `object`, [`EventFilterApi`](../interfaces/EventFilterApi.md)\<`TResource`, `TEvent`\>, `"filter"`\>
