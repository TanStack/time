---
id: splitMultiDayEvents
title: splitMultiDayEvents
---

# Function: splitMultiDayEvents()

```ts
function splitMultiDayEvents<TResource, TEvent>(event, timeZone): TEvent[];
```

Defined in: [calendar/splitMultiDayEvents.ts:5](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/splitMultiDayEvents.ts#L5)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>

## Parameters

### event

`TEvent`

### timeZone

`TimeZoneLike`

## Returns

`TEvent`[]
