---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L78)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L109)

0-based index of this occurrence within the recurring series.

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L102)

Original end time before splitting (only set on split segments of multi-day events)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:100](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L100)

Original start time before splitting (only set on split segments of multi-day events)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L107)

ID of the master recurring event this occurrence was generated from.
Only present on ephemeral occurrence instances (index > 0).

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L98)

When true, event spans full day(s) and is rendered in the all-day strip
separately from timed events. `start` and `end` are still ISO datetime strings;
for an all-day event use the day's start (00:00:00) and the inclusive day's
end (23:59:59) — or any time within those days. Multi-day all-day events
are split per-day like regular events.

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L84)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:88](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L88)

Dependency links to other events this event is constrained by.
Each link has an `id` (predecessor event) and a `type` (FS/SS/FF/SF).
When a predecessor's relevant anchor shifts, this event shifts by the same delta.

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L81)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L79)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule;
```

Defined in: [calendar/types.ts:90](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L90)

Defines how and when this event repeats.

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L83)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L80)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L82)
