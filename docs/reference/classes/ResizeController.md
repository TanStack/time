---
id: ResizeController
title: ResizeController
---

# Class: ResizeController\<TResource, TEvent\>

Defined in: [calendar/resizeController.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L76)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Constructors

### Constructor

```ts
new ResizeController<TResource, TEvent>(host, options): ResizeController<TResource, TEvent>;
```

Defined in: [calendar/resizeController.ts:115](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L115)

#### Parameters

##### host

[`CalendarHost`](../interfaces/CalendarHost.md)\<`TResource`, `TEvent`\>

##### options

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md) = `{}`

#### Returns

`ResizeController`\<`TResource`, `TEvent`\>

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [calendar/resizeController.ts:213](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L213)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/resizeController.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L223)

#### Returns

`void`

***

### getDayFromElement()

```ts
getDayFromElement(element): string | null;
```

Defined in: [calendar/resizeController.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L166)

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

Defined in: [calendar/resizeController.ts:151](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L151)

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

Defined in: [calendar/resizeController.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L139)

#### Returns

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): ResizeState;
```

Defined in: [calendar/resizeController.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L133)

#### Returns

[`ResizeState`](../interfaces/ResizeState.md)

***

### handleMouseMove()

```ts
handleMouseMove(e): void;
```

Defined in: [calendar/resizeController.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L235)

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

Defined in: [calendar/resizeController.ts:246](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L246)

#### Returns

`void`

***

### registerDayColumn()

```ts
registerDayColumn(date, element): void;
```

Defined in: [calendar/resizeController.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L143)

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

Defined in: [calendar/resizeController.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L135)

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

Defined in: [calendar/resizeController.ts:173](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L173)

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

Defined in: [calendar/resizeController.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L126)

#### Parameters

##### listener

[`ResizeListener`](../type-aliases/ResizeListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
