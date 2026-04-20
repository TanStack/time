---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L69)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L91)

0-based index of this occurrence within the recurring series.

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L84)

Original end time before splitting (only set on split segments of multi-day events)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L82)

Original start time before splitting (only set on split segments of multi-day events)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L89)

ID of the master recurring event this occurrence was generated from.
Only present on ephemeral occurrence instances (index > 0).

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L75)

***

### dependsOn?

```ts
optional dependsOn: string[];
```

Defined in: [calendar/types.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L78)

IDs of events this event immediately follows (finish-to-start dependency).
When a predecessor's end time shifts, this event shifts by the same delta.

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L72)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L70)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule;
```

Defined in: [calendar/types.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L80)

Defines how and when this event repeats.

***

### resources?

```ts
optional resources: TResource[];
```

Defined in: [calendar/types.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L74)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L71)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L73)
