---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L214)

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

Defined in: [calendar/types.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L219)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L220)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L218)
