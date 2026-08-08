---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L67)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L91)

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:93](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L93)

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L87)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L85)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L89)

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L83)

***

### calendarId?

```ts
optional calendarId: string;
```

Defined in: [calendar/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L75)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L73)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:77](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L77)

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L70)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L68)

***

### manuallyScheduled?

```ts
optional manuallyScheduled: boolean;
```

Defined in: [calendar/types.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L79)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L81)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L72)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L69)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L71)
