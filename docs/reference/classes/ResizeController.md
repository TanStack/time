---
id: ResizeController
title: ResizeController
---

# Class: ResizeController\<TResource, TEvent\>

Defined in: [calendar/resizeController.ts:95](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L95)

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

Defined in: [calendar/resizeController.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L134)

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

Defined in: [calendar/resizeController.ts:232](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L232)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/resizeController.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L242)

#### Returns

`void`

***

### getDayFromElement()

```ts
getDayFromElement(element): string | null;
```

Defined in: [calendar/resizeController.ts:185](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L185)

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

Defined in: [calendar/resizeController.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L170)

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

Defined in: [calendar/resizeController.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L158)

#### Returns

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): ResizeState;
```

Defined in: [calendar/resizeController.ts:152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L152)

#### Returns

[`ResizeState`](../interfaces/ResizeState.md)

***

### handleMouseMove()

```ts
handleMouseMove(e): void;
```

Defined in: [calendar/resizeController.ts:254](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L254)

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

Defined in: [calendar/resizeController.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L269)

Mouse-up handler. Auto-attached by `start()`; commits if the preview
differs from the original event range, then detaches DOM listeners.

#### Returns

`void`

***

### registerDayColumn()

```ts
registerDayColumn(date, element): void;
```

Defined in: [calendar/resizeController.ts:162](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L162)

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

Defined in: [calendar/resizeController.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L154)

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

Defined in: [calendar/resizeController.ts:192](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L192)

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

Defined in: [calendar/resizeController.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L145)

#### Parameters

##### listener

[`ResizeListener`](../type-aliases/ResizeListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
