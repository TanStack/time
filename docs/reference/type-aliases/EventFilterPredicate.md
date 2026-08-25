---
id: EventFilterPredicate
title: EventFilterPredicate
---

# Type Alias: EventFilterPredicate()\<TResource, TEvent\>

```ts
type EventFilterPredicate<TResource, TEvent> = (event) => boolean;
```

Defined in: [calendar/features/filter.ts:6](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L6)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Parameters

### event

`TEvent`

## Returns

`boolean`
