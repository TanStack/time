---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:240](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L240)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\> = [`Event`](Event.md)\<`TResource`\>

## Properties

### events

```ts
events: TimelineEventLayout<TResource, TEvent>[];
```

Defined in: [calendar/types.ts:245](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L245)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:246](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L246)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:244](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L244)
