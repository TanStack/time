---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L101)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:132](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L132)

0-based index of this occurrence within the recurring series.

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L134)

Original occurrence start before EXDATE/override changes.

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:125](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L125)

Original end time before splitting (only set on split segments of multi-day events)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:123](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L123)

Original start time before splitting (only set on split segments of multi-day events)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L130)

ID of the master recurring event this occurrence was generated from.
Only present on ephemeral occurrence instances (index > 0).

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L121)

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

Defined in: [calendar/types.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L107)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L111)

Dependency links to other events this event is constrained by.
Each link has an `id` (predecessor event) and a `type` (FS/SS/FF/SF).
When a predecessor's relevant anchor shifts, this event shifts by the same delta.

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L104)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L102)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:113](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L113)

Defines how and when this event repeats.

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:106](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L106)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L103)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L105)
