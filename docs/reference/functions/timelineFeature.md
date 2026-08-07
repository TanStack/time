---
id: timelineFeature
title: timelineFeature
---

# Function: timelineFeature()

```ts
function timelineFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, object, TimelineApi<TResource, TEvent>, "timeline">;
```

Defined in: [calendar/features/timeline.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L20)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `object`, [`TimelineApi`](../interfaces/TimelineApi.md)\<`TResource`, `TEvent`\>, `"timeline"`\>
