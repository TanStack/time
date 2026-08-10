---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:246](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L246)

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

Defined in: [calendar/types.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L251)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:252](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L252)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:250](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L250)
