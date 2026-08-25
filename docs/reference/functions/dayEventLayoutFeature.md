---
id: dayEventLayoutFeature
title: dayEventLayoutFeature
---

# Function: dayEventLayoutFeature()

```ts
function dayEventLayoutFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, object, DayLayoutApi<TResource, TEvent>, "dayLayout">;
```

Defined in: [calendar/features/dayLayout.ts:12](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dayLayout.ts#L12)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `object`, [`DayLayoutApi`](../interfaces/DayLayoutApi.md)\<`TResource`, `TEvent`\>, `"dayLayout"`\>
