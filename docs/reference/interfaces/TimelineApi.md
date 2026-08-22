---
id: TimelineApi
title: TimelineApi
---

# Interface: TimelineApi\<TResource, TEvent\>

Defined in: [calendar/features/timeline.ts:6](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L6)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### getEventsByResource()

```ts
getEventsByResource: () => Map<TResource["id"], TEvent[]>;
```

Defined in: [calendar/features/timeline.ts:7](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L7)

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

***

### getTimelineLayout()

```ts
getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/features/timeline.ts:8](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L8)

#### Returns

[`TimelineLayout`](TimelineLayout.md)\<`TResource`, `TEvent`\>
