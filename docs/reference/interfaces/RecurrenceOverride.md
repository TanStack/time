---
id: RecurrenceOverride
title: RecurrenceOverride
---

# Interface: RecurrenceOverride\<TResource\>

Defined in: [calendar/types.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L16)

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

Defined in: [calendar/types.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L26)

***

### consumption?

```ts
optional consumption: number[];
```

Defined in: [calendar/types.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L24)

***

### dependsOn?

```ts
optional dependsOn: EventDependency[];
```

Defined in: [calendar/types.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L25)

***

### end?

```ts
optional end: EventDateTimeInput;
```

Defined in: [calendar/types.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L21)

***

### id?

```ts
optional id: string;
```

Defined in: [calendar/types.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L19)

***

### originalStart

```ts
originalStart: EventDateTimeInput;
```

Defined in: [calendar/types.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L17)

***

### resources?

```ts
optional resources: (string | TResource)[];
```

Defined in: [calendar/types.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L23)

***

### start?

```ts
optional start: EventDateTimeInput;
```

Defined in: [calendar/types.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L20)

***

### title?

```ts
optional title: string;
```

Defined in: [calendar/types.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L22)
