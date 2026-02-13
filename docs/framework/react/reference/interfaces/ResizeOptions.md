---
id: ResizeOptions
title: ResizeOptions
---

# Interface: ResizeOptions

Defined in: [useCalendar.ts:36](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L36)

## Properties

### constraints?

```ts
optional constraints: ResizeConstraints;
```

Defined in: [useCalendar.ts:39](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L39)

***

### containerHeight?

```ts
optional containerHeight: number;
```

Defined in: [useCalendar.ts:38](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L38)

***

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [useCalendar.ts:37](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L37)

***

### onResizeEnd()?

```ts
optional onResizeEnd: (eventId, newStart, newEnd) => void;
```

Defined in: [useCalendar.ts:41](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L41)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

`void`

***

### onResizeError()?

```ts
optional onResizeError: (error) => void;
```

Defined in: [useCalendar.ts:42](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L42)

#### Parameters

##### error

`ResizeError`

#### Returns

`void`

***

### onResizeStart()?

```ts
optional onResizeStart: (eventId, edge) => void;
```

Defined in: [useCalendar.ts:40](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L40)

#### Parameters

##### eventId

`string`

##### edge

`ResizeEdge`

#### Returns

`void`
