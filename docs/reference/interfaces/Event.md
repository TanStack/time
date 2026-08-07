---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L65)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L87)

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L89)

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L83)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L81)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L85)

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L79)

***

### calendarId?

```ts
optional calendarId: string;
```

Defined in: [calendar/types.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L73)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L71)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L75)

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L68)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L66)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:77](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L77)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L70)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L67)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L69)
