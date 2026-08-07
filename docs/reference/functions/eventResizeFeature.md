---
id: eventResizeFeature
title: eventResizeFeature
---

# Function: eventResizeFeature()

```ts
function eventResizeFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, object, ResizeFeatureApi<TResource, TEvent>, "resize">;
```

Defined in: [calendar/features/resize.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L19)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `object`, [`ResizeFeatureApi`](../interfaces/ResizeFeatureApi.md)\<`TResource`, `TEvent`\>, `"resize"`\>
