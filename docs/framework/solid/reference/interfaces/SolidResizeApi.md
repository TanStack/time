---
id: SolidResizeApi
title: SolidResizeApi
---

# Interface: SolidResizeApi

Defined in: [createCalendar.ts:47](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L47)

## Properties

### getDayColumnProps()

```ts
getDayColumnProps: (dayDate) => DayColumnProps;
```

Defined in: [createCalendar.ts:56](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L56)

#### Parameters

##### dayDate

`string`

#### Returns

`DayColumnProps`

***

### getResizeHandleProps()

```ts
getResizeHandleProps: (eventId, edge, originalStart, originalEnd, options?) => ResizeHandleHandlers;
```

Defined in: [createCalendar.ts:49](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L49)

#### Parameters

##### eventId

`string`

##### edge

`ResizeEdge`

##### originalStart

`string`

##### originalEnd

`string`

##### options?

`ResizeHandleOptions`

#### Returns

`ResizeHandleHandlers`

***

### resizeState

```ts
resizeState: Accessor<ResizeState>;
```

Defined in: [createCalendar.ts:48](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L48)
