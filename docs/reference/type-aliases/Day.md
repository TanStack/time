---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:112](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L112)

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

Defined in: [calendar/types.ts:122](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L122)

All-day events occurring on this day (segments of multi-day all-day events included).

***

### date

```ts
date: Temporal.PlainDate;
```

Defined in: [calendar/types.ts:116](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L116)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L120)

Timed events occurring on this day (sub-day events + segments of timed multi-day events).

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:124](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L124)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:118](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L118)

Pre-computed ISO date string (YYYY-MM-DD) — use instead of manually formatting `date`

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:123](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L123)
