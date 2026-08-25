---
id: MovePeers
title: MovePeers
---

# Interface: MovePeers\<TResource, TEvent\>

Defined in: [calendar/features/move.ts:14](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L14)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### availability?

```ts
optional availability: AvailabilityApi<TResource, TEvent>;
```

Defined in: [calendar/features/move.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L16)

***

### recurrence

```ts
recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>;
```

Defined in: [calendar/features/move.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L15)
