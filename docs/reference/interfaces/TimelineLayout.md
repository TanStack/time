---
id: TimelineLayout
title: TimelineLayout
---

# Interface: TimelineLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:234](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L234)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\> = [`Event`](Event.md)\<`TResource`\>

## Properties

### currentTimePosition

```ts
currentTimePosition: number | null;
```

Defined in: [calendar/types.ts:239](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L239)

***

### rows

```ts
rows: TimelineResourceRow<TResource, TEvent>[];
```

Defined in: [calendar/types.ts:238](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L238)
