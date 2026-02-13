---
id: Day
title: Day
---

# Type Alias: Day\<TResource, TEvent\>

```ts
type Day<TResource, TEvent> = object;
```

Defined in: [calendar/types.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L47)

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

Defined in: [calendar/types.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L51)

***

### events

```ts
events: TEvent[];
```

Defined in: [calendar/types.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L52)

***

### isInCurrentPeriod

```ts
isInCurrentPeriod: boolean;
```

Defined in: [calendar/types.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L54)

***

### isToday

```ts
isToday: boolean;
```

Defined in: [calendar/types.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L53)
