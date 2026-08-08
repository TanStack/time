---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L226)

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

Defined in: [calendar/types.ts:231](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L231)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:232](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L232)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:230](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L230)
