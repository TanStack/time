---
id: resourceAvailabilityFeature
title: resourceAvailabilityFeature
---

# Function: resourceAvailabilityFeature()

```ts
function resourceAvailabilityFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, AvailabilityModuleApi, AvailabilityApi<TResource, TEvent>, "availability", AvailabilityPeers<TResource>>;
```

Defined in: [calendar/features/availability.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L68)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `AvailabilityModuleApi`, [`AvailabilityApi`](../interfaces/AvailabilityApi.md)\<`TResource`, `TEvent`\>, `"availability"`, [`AvailabilityPeers`](../interfaces/AvailabilityPeers.md)\<`TResource`\>\>
