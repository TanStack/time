---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:205](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L205)

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

Defined in: [calendar/types.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L210)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L211)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:209](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L209)
