---
id: TimelineEventLayout
title: TimelineEventLayout
---

# Interface: TimelineEventLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L251)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\> = [`Event`](Event.md)\<`TResource`\>

## Properties

### event

```ts
event: TEvent;
```

Defined in: [calendar/types.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L255)

***

### isEndClipped

```ts
isEndClipped: boolean;
```

Defined in: [calendar/types.ts:262](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L262)

True when the event ends after the last visible day (right edge is clipped)

***

### isStartClipped

```ts
isStartClipped: boolean;
```

Defined in: [calendar/types.ts:260](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L260)

True when the event starts before the first visible day (left edge is clipped)

***

### lane

```ts
lane: number;
```

Defined in: [calendar/types.ts:258](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L258)

***

### left

```ts
left: number;
```

Defined in: [calendar/types.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L256)

***

### width

```ts
width: number;
```

Defined in: [calendar/types.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L257)
