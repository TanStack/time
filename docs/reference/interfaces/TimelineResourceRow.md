---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L220)

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

Defined in: [calendar/types.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L225)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L226)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:224](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L224)
