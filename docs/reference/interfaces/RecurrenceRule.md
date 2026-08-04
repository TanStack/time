---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L40)

Defines the repetition rule for a recurring event.
Occurrences are expanded automatically by the calendar within the current viewport.

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L62)

For `weekly` frequency: ISO weekdays (1 = Mon … 7 = Sun) to repeat on.
Defaults to the weekday of the original event start.

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:57](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L57)

Maximum total occurrences to generate (including the original).
Only used when `until` is not set.

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L64)

Specific occurrence starts to exclude (EXDATE). Date-only values match by occurrence date.

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L42)

How often the event repeats.

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L47)

Repeat every N frequencies (default 1).
E.g. `{ frequency: 'weekly', interval: 2 }` = every other week.

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L66)

Per-occurrence replacements keyed by original occurrence start.

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L52)

ISO date string (YYYY-MM-DD) — no occurrences start on or after this date.
Takes precedence over `count`.
