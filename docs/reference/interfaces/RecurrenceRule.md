---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L49)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L58)

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L56)

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L60)

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:50](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L50)

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L52)

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L62)

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L54)
