---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L257)

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

Defined in: [calendar/types.ts:262](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L262)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:263](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L263)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:261](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L261)
