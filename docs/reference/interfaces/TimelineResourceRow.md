---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:275](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L275)

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

Defined in: [calendar/types.ts:280](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L280)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:281](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L281)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L279)
