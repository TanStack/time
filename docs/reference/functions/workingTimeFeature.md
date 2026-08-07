---
id: workingTimeFeature
title: workingTimeFeature
---

# Function: workingTimeFeature()

```ts
function workingTimeFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, object, WorkingTimeApi<TResource>, "workingTime">;
```

Defined in: [calendar/features/workingTime.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/workingTime.ts#L44)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `object`, [`WorkingTimeApi`](../interfaces/WorkingTimeApi.md)\<`TResource`\>, `"workingTime"`\>
