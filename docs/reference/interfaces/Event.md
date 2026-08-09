---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L66)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:90](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L90)

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:92](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L92)

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L86)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L84)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:88](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L88)

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L82)

***

### calendarId?

```ts
optional calendarId: string;
```

Defined in: [calendar/types.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L74)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:72](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L72)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L76)

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L69)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L67)

***

### manuallyScheduled?

```ts
optional manuallyScheduled: boolean;
```

Defined in: [calendar/types.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L78)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L80)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L71)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L68)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L70)
