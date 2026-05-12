---
id: ResizeControllerOptions
title: ResizeControllerOptions
---

# Interface: ResizeControllerOptions

Defined in: [calendar/resizeController.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L22)

## Properties

### constraints?

```ts
optional constraints: ResizeConstraints;
```

Defined in: [calendar/resizeController.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L27)

***

### containerHeight?

```ts
optional containerHeight: number;
```

Defined in: [calendar/resizeController.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L24)

***

### containerWidth?

```ts
optional containerWidth: number;
```

Defined in: [calendar/resizeController.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L25)

***

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [calendar/resizeController.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L23)

***

### onResizeEnd()?

```ts
optional onResizeEnd: (eventId, newStart, newEnd) => void;
```

Defined in: [calendar/resizeController.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L29)

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

Defined in: [calendar/resizeController.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L30)

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

Defined in: [calendar/resizeController.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L28)

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

Defined in: [calendar/resizeController.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L26)
