---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L219)

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

Defined in: [calendar/types.ts:224](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L224)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L225)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L223)
