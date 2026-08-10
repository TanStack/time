---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L242)

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

Defined in: [calendar/types.ts:247](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L247)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:248](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L248)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:246](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L246)
