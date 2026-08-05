---
id: RecurrenceOverride
title: RecurrenceOverride
---

# Interface: RecurrenceOverride\<TResource\>

Defined in: [calendar/types.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L18)

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

Defined in: [calendar/types.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L28)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L26)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L27)

***

### end?

```ts
optional end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L23)

***

### id?

```ts
optional id: string;
```

Defined in: [calendar/types.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L21)

***

### originalStart

```ts
originalStart: EventDateTimeInput;
```

Defined in: [calendar/types.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L19)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L25)

***

### start?

```ts
optional start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L22)

***

### title?

```ts
optional title: string;
```

Defined in: [calendar/types.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L24)
