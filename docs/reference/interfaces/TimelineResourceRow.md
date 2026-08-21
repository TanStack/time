---
id: TimelineResourceRow
title: TimelineResourceRow
---

# Interface: TimelineResourceRow\<TResource, TEvent\>

Defined in: [calendar/types.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L265)

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

Defined in: [calendar/types.ts:270](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L270)

***

### laneCount

```ts
laneCount: number;
```

Defined in: [calendar/types.ts:271](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L271)

***

### resource

```ts
resource: TResource;
```

Defined in: [calendar/types.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L269)
