---
id: RecurrenceOverride
title: RecurrenceOverride
---

# Interface: RecurrenceOverride\<TResource\>

Defined in: [calendar/types.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L34)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Indexable

```ts
[key: string]: unknown
```

## Properties

### allDay?

```ts
optional allDay: boolean;
```

Defined in: [calendar/types.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L44)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L42)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L43)

***

### end?

```ts
optional end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L39)

***

### id?

```ts
optional id: string;
```

Defined in: [calendar/types.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L37)

***

### originalStart

```ts
originalStart: EventDateTimeInput;
```

Defined in: [calendar/types.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L35)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:41](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L41)

***

### start?

```ts
optional start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L38)

***

### title?

```ts
optional title: string;
```

Defined in: [calendar/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L40)
