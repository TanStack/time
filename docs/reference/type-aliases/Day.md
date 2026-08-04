---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L136)

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

Defined in: [calendar/types.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L145)

All-day events occurring on this day (segments of multi-day all-day events included).

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L143)

Timed events occurring on this day (sub-day events + segments of timed multi-day events).

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:147](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L147)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L141)

ISO date string (YYYY-MM-DD).

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:146](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L146)
