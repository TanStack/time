---
id: ResizeController
title: ResizeController
---

# Class: ResizeController\<TResource, TEvent\>

Defined in: [calendar/resizeController.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L79)

Framework-agnostic controller that owns:
 - resize state machine (preview, blocked, lastValid)
 - rAF coalescing for `mousemove`
 - day-column registry + cached rects
 - last-processed dedupe + last-emitted-error dedupe
 - delegation to `CalendarCore.validateResize` / `commitUpdate`

UI bindings (React, Solid, etc.) only need to:
 1. Subscribe to state changes and read `getSnapshot()`.
 2. Forward DOM `mousedown` to `start()`, then attach `handleMouseMove` /
    `handleMouseUp` to `document` (the controller exposes these as bound
    methods so the same reference can be used for `addEventListener` /
    `removeEventListener`).
 3. Call `registerDayColumn(date, element)` from a ref callback.

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Constructors

### Constructor

```ts
new ResizeController<TResource, TEvent>(calendarCore, options): ResizeController<TResource, TEvent>;
```

Defined in: [calendar/resizeController.ts:116](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L116)

#### Parameters

##### calendarCore

[`CalendarCore`](CalendarCore.md)\<`TResource`, `TEvent`\>

##### options

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md) = `{}`

#### Returns

`ResizeController`\<`TResource`, `TEvent`\>

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [calendar/resizeController.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L212)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/resizeController.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L222)

#### Returns

`void`

***

### getDayFromElement()

```ts
getDayFromElement(element): string | null;
```

Defined in: [calendar/resizeController.ts:167](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L167)

#### Parameters

##### element

`HTMLElement`

#### Returns

`string` \| `null`

***

### getDayFromPoint()

```ts
getDayFromPoint(clientX): string | null;
```

Defined in: [calendar/resizeController.ts:152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L152)

#### Parameters

##### clientX

`number`

#### Returns

`string` \| `null`

***

### getOptions()

```ts
getOptions(): ResizeControllerOptions;
```

Defined in: [calendar/resizeController.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L140)

#### Returns

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): ResizeState;
```

Defined in: [calendar/resizeController.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L134)

#### Returns

[`ResizeState`](../interfaces/ResizeState.md)

***

### handleMouseMove()

```ts
handleMouseMove(e): void;
```

Defined in: [calendar/resizeController.ts:234](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L234)

#### Parameters

##### e

`MouseEvent`

#### Returns

`void`

***

### handleMouseUp()

```ts
handleMouseUp(): void;
```

Defined in: [calendar/resizeController.ts:249](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L249)

Mouse-up handler. Auto-attached by `start()`; commits if the preview
differs from the original event range, then detaches DOM listeners.

#### Returns

`void`

***

### registerDayColumn()

```ts
registerDayColumn(date, element): void;
```

Defined in: [calendar/resizeController.ts:144](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L144)

#### Parameters

##### date

`string`

##### element

`HTMLElement` | `null`

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [calendar/resizeController.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L136)

#### Parameters

##### options

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md)

#### Returns

`void`

***

### start()

```ts
start(args): boolean;
```

Defined in: [calendar/resizeController.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L174)

#### Parameters

##### args

[`ResizeStartArgs`](../interfaces/ResizeStartArgs.md)

#### Returns

`boolean`

***

### subscribe()

```ts
subscribe(listener): () => void;
```

Defined in: [calendar/resizeController.ts:127](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L127)

#### Parameters

##### listener

[`ResizeListener`](../type-aliases/ResizeListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
