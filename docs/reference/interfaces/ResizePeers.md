---
id: ResizePeers
title: ResizePeers
---

# Interface: ResizePeers\<TResource, TEvent\>

Defined in: [calendar/features/resize.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L37)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### availability?

```ts
optional availability: AvailabilityApi<TResource, TEvent>;
```

Defined in: [calendar/features/resize.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L43)

***

### dependency?

```ts
optional dependency: DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/resize.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L44)

***

### recurrence

```ts
recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>;
```

Defined in: [calendar/features/resize.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L41)
