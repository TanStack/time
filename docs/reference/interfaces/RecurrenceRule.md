---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L48)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:57](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L57)

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:55](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L55)

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L59)

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L49)

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L51)

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:61](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L61)

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L53)
