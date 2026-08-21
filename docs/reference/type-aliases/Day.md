---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:117](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L117)

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

Defined in: [calendar/types.ts:129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L129)

***

### dayOfMonth

```ts
dayOfMonth: number;
```

Defined in: [calendar/types.ts:125](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L125)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:127](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L127)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L131)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L121)

***

### isoMonth

```ts
isoMonth: string;
```

Defined in: [calendar/types.ts:123](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L123)

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L130)
