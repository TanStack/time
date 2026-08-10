---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L81)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L107)

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L109)

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L103)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L101)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L105)

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:99](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L99)

***

### calendarId?

```ts
optional calendarId: string;
```

Defined in: [calendar/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L89)

***

### constraint?

```ts
optional constraint: SchedulingConstraint;
```

Defined in: [calendar/types.ts:95](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L95)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L87)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L91)

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L84)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L82)

***

### manuallyScheduled?

```ts
optional manuallyScheduled: boolean;
```

Defined in: [calendar/types.ts:93](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L93)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L97)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L86)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L83)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L85)
