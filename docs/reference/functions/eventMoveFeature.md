---
id: eventMoveFeature
title: eventMoveFeature
---

# Function: eventMoveFeature()

```ts
function eventMoveFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, object, MoveFeatureApi<TResource, TEvent>, "move", MovePeers<TResource, TEvent>>;
```

Defined in: [calendar/features/move.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L19)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `object`, [`MoveFeatureApi`](../interfaces/MoveFeatureApi.md)\<`TResource`, `TEvent`\>, `"move"`, [`MovePeers`](../interfaces/MovePeers.md)\<`TResource`, `TEvent`\>\>
