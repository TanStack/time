---
id: ResizePeers
title: ResizePeers
---

# Interface: ResizePeers\<TResource, TEvent\>

Defined in: [calendar/features/resize.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L32)

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

Defined in: [calendar/features/resize.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L34)

***

### dependency?

```ts
optional dependency: DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/resize.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L35)

***

### recurrence

```ts
recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>;
```

Defined in: [calendar/features/resize.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L33)
