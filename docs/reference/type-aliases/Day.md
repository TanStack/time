---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L104)

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

Defined in: [calendar/types.ts:108](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L108)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L111)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:113](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L113)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:110](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L110)

Pre-computed ISO date string (YYYY-MM-DD) — use instead of manually formatting `date`

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:112](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L112)
