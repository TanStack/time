---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L225)

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

Defined in: [calendar/types.ts:230](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L230)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:231](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L231)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L229)
