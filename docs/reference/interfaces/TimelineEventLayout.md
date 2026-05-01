---
id: TimelineEventLayout
title: TimelineEventLayout
---

# Interface: TimelineEventLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:205](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L205)

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

Defined in: [calendar/types.ts:209](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L209)

***

### isEndClipped

```ts
isEndClipped: boolean;
```

Defined in: [calendar/types.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L216)

True when the event ends after the last visible day (right edge is clipped)

***

### isStartClipped

```ts
isStartClipped: boolean;
```

Defined in: [calendar/types.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L214)

True when the event starts before the first visible day (left edge is clipped)

***

### lane

```ts
lane: number;
```

Defined in: [calendar/types.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L212)

***

### left

```ts
left: number;
```

Defined in: [calendar/types.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L210)

***

### width

```ts
width: number;
```

Defined in: [calendar/types.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L211)
