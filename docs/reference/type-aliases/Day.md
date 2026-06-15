---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:137](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L137)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>

## Properties

### allDayEvents

```ts
allDayEvents: TEvent[];
```

Defined in: [calendar/types.ts:147](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L147)

All-day events occurring on this day (segments of multi-day all-day events included).

***

### date

```ts
date: Temporal.PlainDate;
```

Defined in: [calendar/types.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L141)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L145)

Timed events occurring on this day (sub-day events + segments of timed multi-day events).

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L149)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L143)

Pre-computed ISO date string (YYYY-MM-DD) — use instead of manually formatting `date`

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:148](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L148)
