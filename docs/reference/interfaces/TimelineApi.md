---
id: TimelineApi
title: TimelineApi
---

# Interface: TimelineApi\<TResource, TEvent\>

Defined in: [calendar/features/timeline.ts:12](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L12)

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

Defined in: [calendar/features/timeline.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L16)

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

***

### getTimelineLayout()

```ts
getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/features/timeline.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/timeline.ts#L17)

#### Returns

[`TimelineLayout`](TimelineLayout.md)\<`TResource`, `TEvent`\>
