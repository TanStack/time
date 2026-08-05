---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L98)

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

Defined in: [calendar/types.ts:106](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L106)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L104)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:108](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L108)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L102)

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L107)
