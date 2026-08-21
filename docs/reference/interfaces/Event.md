---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L82)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:112](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L112)

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:114](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L114)

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:108](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L108)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:106](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L106)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:110](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L110)

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L104)

***

### calendarId?

```ts
optional calendarId: string;
```

Defined in: [calendar/types.ts:90](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L90)

***

### constraint?

```ts
optional constraint: SchedulingConstraint;
```

Defined in: [calendar/types.ts:96](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L96)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:88](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L88)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:92](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L92)

***

### duration?

```ts
optional duration: number;
```

Defined in: [calendar/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L98)

***

### effort?

```ts
optional effort: number;
```

Defined in: [calendar/types.ts:100](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L100)

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L85)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L83)

***

### manuallyScheduled?

```ts
optional manuallyScheduled: boolean;
```

Defined in: [calendar/types.ts:94](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L94)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L102)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L87)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L84)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L86)
