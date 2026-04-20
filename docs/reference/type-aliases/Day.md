---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:94](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L94)

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

Defined in: [calendar/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L98)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L101)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L103)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:100](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L100)

Pre-computed ISO date string (YYYY-MM-DD) — use instead of manually formatting `date`

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L102)
