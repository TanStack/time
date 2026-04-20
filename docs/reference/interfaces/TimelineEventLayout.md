---
id: TimelineEventLayout
title: TimelineEventLayout
---

# Interface: TimelineEventLayout\<TResource, TEvent\>

Defined in: [calendar/types.ts:200](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L200)

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

Defined in: [calendar/types.ts:204](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L204)

***

### isEndClipped

```ts
isEndClipped: boolean;
```

Defined in: [calendar/types.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L211)

True when the event ends after the last visible day (right edge is clipped)

***

### isStartClipped

```ts
isStartClipped: boolean;
```

Defined in: [calendar/types.ts:209](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L209)

True when the event starts before the first visible day (left edge is clipped)

***

### lane

```ts
lane: number;
```

Defined in: [calendar/types.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L207)

***

### left

```ts
left: number;
```

Defined in: [calendar/types.ts:205](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L205)

***

### width

```ts
width: number;
```

Defined in: [calendar/types.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L206)
