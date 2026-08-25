---
id: ResizeControllerOptions
title: ResizeControllerOptions
---

# Interface: ResizeControllerOptions

Defined in: [calendar/resizeController.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L46)

## Properties

### constraints?

```ts
optional constraints: ResizeConstraints;
```

Defined in: [calendar/resizeController.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L51)

***

### containerHeight?

```ts
optional containerHeight: number;
```

Defined in: [calendar/resizeController.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L48)

***

### containerWidth?

```ts
optional containerWidth: number;
```

Defined in: [calendar/resizeController.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L49)

***

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [calendar/resizeController.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L47)

***

### onRecurringResizeEnd()?

```ts
optional onRecurringResizeEnd: (resize) => void;
```

Defined in: [calendar/resizeController.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L54)

#### Parameters

##### resize

###### eventId

`string`

###### newEnd

`string`

###### newStart

`string`

###### occurrenceStart

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### originalEnd

`string`

###### originalStart

`string`

#### Returns

`void`

***

### onResizeEnd()?

```ts
optional onResizeEnd: (eventId, newStart, newEnd) => void;
```

Defined in: [calendar/resizeController.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L53)

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

Defined in: [calendar/resizeController.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L62)

#### Parameters

##### error

[`EventMutationError`](EventMutationError.md)

#### Returns

`void`

***

### onResizeStart()?

```ts
optional onResizeStart: (eventId, edge) => void;
```

Defined in: [calendar/resizeController.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L52)

#### Parameters

##### eventId

`string`

##### edge

[`ResizeEdge`](../type-aliases/ResizeEdge.md)

#### Returns

`void`

***

### orientation?

```ts
optional orientation: "vertical" | "horizontal";
```

Defined in: [calendar/resizeController.ts:50](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L50)
