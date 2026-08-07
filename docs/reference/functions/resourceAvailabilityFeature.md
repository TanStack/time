---
id: resourceAvailabilityFeature
title: resourceAvailabilityFeature
---

# Function: resourceAvailabilityFeature()

```ts
function resourceAvailabilityFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, AvailabilityModuleApi, AvailabilityApi<TResource, TEvent>, "availability">;
```

Defined in: [calendar/features/availability.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/availability.ts#L71)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `AvailabilityModuleApi`, [`AvailabilityApi`](../interfaces/AvailabilityApi.md)\<`TResource`, `TEvent`\>, `"availability"`\>
