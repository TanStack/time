---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule\<TResource\>

Defined in: [calendar/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L41)

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

Defined in: [calendar/types.ts:63](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L63)

For `weekly` frequency: ISO weekdays (1 = Mon … 7 = Sun) to repeat on.
Defaults to the weekday of the original event start.

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L58)

Maximum total occurrences to generate (including the original).
Only used when `until` is not set.

***

### exDates?

```ts
optional exDates: EventDateTimeInput[];
```

Defined in: [calendar/types.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L65)

Specific occurrence starts to exclude (EXDATE). Date-only values match by occurrence date.

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L43)

How often the event repeats.

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L48)

Repeat every N frequencies (default 1).
E.g. `{ frequency: 'weekly', interval: 2 }` = every other week.

***

### overrides?

```ts
optional overrides: RecurrenceOverride<TResource>[];
```

Defined in: [calendar/types.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L67)

Per-occurrence replacements keyed by original occurrence start.

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L53)

ISO date string (YYYY-MM-DD) — no occurrences start on or after this date.
Takes precedence over `count`.
