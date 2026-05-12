---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule

Defined in: [calendar/types.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L22)

Defines the repetition rule for a recurring event.
Occurrences are expanded automatically by the calendar within the current viewport.

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L44)

For `weekly` frequency: ISO weekdays (1 = Mon … 7 = Sun) to repeat on.
Defaults to the weekday of the original event start.

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L39)

Maximum total occurrences to generate (including the original).
Only used when `until` is not set.

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L24)

How often the event repeats.

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L29)

Repeat every N frequencies (default 1).
E.g. `{ frequency: 'weekly', interval: 2 }` = every other week.

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L34)

ISO date string (YYYY-MM-DD) — no occurrences start on or after this date.
Takes precedence over `count`.
