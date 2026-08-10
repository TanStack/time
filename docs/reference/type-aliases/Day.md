---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:116](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L116)

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

Defined in: [calendar/types.ts:124](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L124)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:122](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L122)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L126)

***

### isoDate

```ts
isoDate: string;
```

Defined in: [calendar/types.ts:120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L120)

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:125](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L125)
