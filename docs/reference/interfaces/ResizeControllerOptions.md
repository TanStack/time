---
id: ResizeControllerOptions
title: ResizeControllerOptions
---

# Interface: ResizeControllerOptions

Defined in: [calendar/resizeController.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L28)

## Properties

### constraints?

```ts
optional constraints: ResizeConstraints;
```

Defined in: [calendar/resizeController.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L33)

***

### containerHeight?

```ts
optional containerHeight: number;
```

Defined in: [calendar/resizeController.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L30)

***

### containerWidth?

```ts
optional containerWidth: number;
```

Defined in: [calendar/resizeController.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L31)

***

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [calendar/resizeController.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L29)

***

### onRecurringResizeEnd()?

```ts
optional onRecurringResizeEnd: (resize) => void;
```

Defined in: [calendar/resizeController.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L36)

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

Defined in: [calendar/resizeController.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L35)

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

Defined in: [calendar/resizeController.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L44)

#### Parameters

##### error

[`ResizeError`](ResizeError.md)

#### Returns

`void`

***

### onResizeStart()?

```ts
optional onResizeStart: (eventId, edge) => void;
```

Defined in: [calendar/resizeController.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L34)

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

Defined in: [calendar/resizeController.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L32)
