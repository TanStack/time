---
id: RecurrenceRule
title: RecurrenceRule
---

# Interface: RecurrenceRule

Defined in: [calendar/types.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L13)

Defines the repetition rule for a recurring event.
Occurrences are expanded automatically by the calendar within the current viewport.

## Properties

### byWeekday?

```ts
optional byWeekday: number[];
```

Defined in: [calendar/types.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L35)

For `weekly` frequency: ISO weekdays (1 = Mon … 7 = Sun) to repeat on.
Defaults to the weekday of the original event start.

***

### count?

```ts
optional count: number;
```

Defined in: [calendar/types.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L30)

Maximum total occurrences to generate (including the original).
Only used when `until` is not set.

***

### frequency

```ts
frequency: RecurrenceFrequency;
```

Defined in: [calendar/types.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L15)

How often the event repeats.

***

### interval?

```ts
optional interval: number;
```

Defined in: [calendar/types.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L20)

Repeat every N frequencies (default 1).
E.g. `{ frequency: 'weekly', interval: 2 }` = every other week.

***

### until?

```ts
optional until: string;
```

Defined in: [calendar/types.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L25)

ISO date string (YYYY-MM-DD) — no occurrences start on or after this date.
Takes precedence over `count`.
