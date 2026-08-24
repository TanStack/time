---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:252](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L252)

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

Defined in: [calendar/types.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L257)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:258](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L258)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L256)
