---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L30)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L39)

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L37)

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L41)

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L31)

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L33)

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L43)

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L35)
