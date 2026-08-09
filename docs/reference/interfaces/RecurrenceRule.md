---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L33)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L42)

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L40)

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L44)

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L34)

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L36)

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L46)

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L38)
