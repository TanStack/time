---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L32)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L41)

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L39)

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L43)

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L33)

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L35)

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L45)

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L37)
