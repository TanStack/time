---
id: TimelineEventLayout
title: TimelineEventLayout
---

# Interface: TimelineEventLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L255)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\> = [`Event`](Event.md)\<`TResource`\>

## Properties

### endFraction

```ts
endFraction: number;
```

Defined in: [calendar/types.ts:268](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L268)

End as a fraction of the visible range (0-1)

***

### event

```ts
event: TEvent;
```

Defined in: [calendar/types.ts:259](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L259)

***

### isEndClipped

```ts
isEndClipped: boolean;
```

Defined in: [calendar/types.ts:272](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L272)

True when the event ends after the last visible day (right edge is clipped)

***

### isStartClipped

```ts
isStartClipped: boolean;
```

Defined in: [calendar/types.ts:270](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L270)

True when the event starts before the first visible day (left edge is clipped)

***

### lane

```ts
lane: number;
```

Defined in: [calendar/types.ts:264](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L264)

***

### left

```ts
left: number;
```

Defined in: [calendar/types.ts:261](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L261)

Offset along the time axis as a percentage of the visible range

***

### startFraction

```ts
startFraction: number;
```

Defined in: [calendar/types.ts:266](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L266)

Start as a fraction of the visible range (0-1)

***

### width

```ts
width: number;
```

Defined in: [calendar/types.ts:263](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L263)

Size along the time axis as a percentage of the visible range
