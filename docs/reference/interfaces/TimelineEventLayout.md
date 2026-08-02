---
id: TimelineEventLayout
title: TimelineEventLayout
---

# Interface: TimelineEventLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L242)

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

Defined in: [calendar/types.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L255)

End as a fraction of the visible range (0-1)

***

### event

```ts
event: TEvent;
```

Defined in: [calendar/types.ts:246](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L246)

***

### isEndClipped

```ts
isEndClipped: boolean;
```

Defined in: [calendar/types.ts:259](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L259)

True when the event ends after the last visible day (right edge is clipped)

***

### isStartClipped

```ts
isStartClipped: boolean;
```

Defined in: [calendar/types.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L257)

True when the event starts before the first visible day (left edge is clipped)

***

### lane

```ts
lane: number;
```

Defined in: [calendar/types.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L251)

***

### left

```ts
left: number;
```

Defined in: [calendar/types.ts:248](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L248)

Offset along the time axis as a percentage of the visible range

***

### startFraction

```ts
startFraction: number;
```

Defined in: [calendar/types.ts:253](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L253)

Start as a fraction of the visible range (0-1)

***

### width

```ts
width: number;
```

Defined in: [calendar/types.ts:250](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L250)

Size along the time axis as a percentage of the visible range
