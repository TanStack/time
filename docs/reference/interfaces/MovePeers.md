---
id: MovePeers
title: MovePeers
---

# Interface: MovePeers\<TResource, TEvent\>

Defined in: [calendar/features/move.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L24)

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

Defined in: [calendar/features/move.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L30)

***

### recurrence

```ts
recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>;
```

Defined in: [calendar/features/move.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L28)
