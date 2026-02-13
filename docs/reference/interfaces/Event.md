---
id: Event
title: Event
---

# Interface: Event\<TResource\>

Defined in: [calendar/types.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L35)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### \_originalEnd?

```ts
optional _originalEnd: string;
```

Defined in: [calendar/types.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L44)

Original end time before splitting (only set on split segments of multi-day events)

***

### \_originalStart?

```ts
optional _originalStart: string;
```

Defined in: [calendar/types.ts:42](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L42)

Original start time before splitting (only set on split segments of multi-day events)

***

### end

```ts
end: string;
```

Defined in: [calendar/types.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L38)

***

### id

```ts
id: string;
```

Defined in: [calendar/types.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L36)

***

### resources?

```ts
optional resources: TResource[];
```

Defined in: [calendar/types.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L40)

***

### start

```ts
start: string;
```

Defined in: [calendar/types.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L37)

***

### title

```ts
title: string;
```

Defined in: [calendar/types.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L39)
