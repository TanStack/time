---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L73)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_occurrenceIndex?

```ts
optional _occurrenceIndex: number;
```

Defined in: [calendar/types.ts:93](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L93)

***

### \_occurrenceOriginalStart?

```ts
optional _occurrenceOriginalStart: string;
```

Defined in: [calendar/types.ts:95](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L95)

***

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L89)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L87)

***

### \_recurringMasterId?

```ts
optional _recurringMasterId: string;
```

Defined in: [calendar/types.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L91)

***

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L85)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L79)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L81)

***

### end

```ts
end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L76)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L74)

***

### recurrence?

```ts
optional recurrence: RecurrenceRule<TResource>;
```

Defined in: [calendar/types.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L83)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L78)

***

### start

```ts
start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L75)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:77](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L77)
