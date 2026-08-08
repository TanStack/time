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

### allDayEvents

```ts
allDayEvents: TEvent[];
```

Defined in: [calendar/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L102)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:100](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L100)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L104)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L98)

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L103)
