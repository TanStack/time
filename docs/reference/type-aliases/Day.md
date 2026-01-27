---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L28)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>

## Properties

### date

```ts
date: Temporal.PlainDate;
```

Defined in: [calendar/types.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L32)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L33)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L35)

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L34)
