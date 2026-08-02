---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:262](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L262)

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

Defined in: [calendar/types.ts:267](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L267)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:268](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L268)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:266](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L266)
