---
id: TimelineEventLayout
title: TimelineEventLayout
---

# Interface: TimelineEventLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:215](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L215)

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

Defined in: [calendar/types.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L219)

***

### isEndClipped

```ts
isEndClipped: boolean;
```

Defined in: [calendar/types.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L226)

True when the event ends after the last visible day (right edge is clipped)

***

### isStartClipped

```ts
isStartClipped: boolean;
```

Defined in: [calendar/types.ts:224](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L224)

True when the event starts before the first visible day (left edge is clipped)

***

### lane

```ts
lane: number;
```

Defined in: [calendar/types.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L222)

***

### left

```ts
left: number;
```

Defined in: [calendar/types.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L220)

***

### width

```ts
width: number;
```

Defined in: [calendar/types.ts:221](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L221)
