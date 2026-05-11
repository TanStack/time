---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L229)

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

Defined in: [calendar/types.ts:234](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L234)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L235)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:233](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L233)
