---
id: RecurrenceOverride
title: RecurrenceOverride
---

# Interface: RecurrenceOverride\<TResource\>

Defined in: [calendar/types.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L22)

Single-occurrence replacement keyed by the original occurrence start.

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

Defined in: [calendar/types.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L33)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L31)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L32)

***

### end?

```ts
optional end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L28)

***

### id?

```ts
optional id: string;
```

Defined in: [calendar/types.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L26)

Optional replacement occurrence id. Defaults to the generated occurrence id.

***

### originalStart

```ts
originalStart: EventDateTimeInput;
```

Defined in: [calendar/types.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L24)

Original occurrence start (RECURRENCE-ID equivalent).

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L30)

***

### start?

```ts
optional start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L27)

***

### title?

```ts
optional title: string;
```

Defined in: [calendar/types.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L29)
