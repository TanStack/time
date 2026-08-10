---
id: eventDurationFeature
title: eventDurationFeature
---

# Function: eventDurationFeature()

```ts
function eventDurationFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, DurationModuleApi, DurationApi<TResource, TEvent>, "duration">;
```

Defined in: [calendar/features/duration.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/duration.ts#L26)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `DurationModuleApi`, [`DurationApi`](../interfaces/DurationApi.md)\<`TResource`, `TEvent`\>, `"duration"`\>
