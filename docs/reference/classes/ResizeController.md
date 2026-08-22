---
id: ResizeController
title: ResizeController
---

# Class: ResizeController\<TResource, TEvent\>

Defined in: [calendar/resizeController.ts:94](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L94)

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

Defined in: [calendar/resizeController.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L130)

#### Parameters

##### host

[`ResizeHost`](../interfaces/ResizeHost.md)\<`TResource`, `TEvent`\>

##### options

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md) = `{}`

#### Returns

`ResizeController`\<`TResource`, `TEvent`\>

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [calendar/resizeController.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L225)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/resizeController.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L235)

#### Returns

`void`

***

### getDayFromElement()

```ts
getDayFromElement(element): string | null;
```

Defined in: [calendar/resizeController.ts:178](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L178)

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

Defined in: [calendar/resizeController.ts:163](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L163)

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

Defined in: [calendar/resizeController.ts:151](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L151)

#### Returns

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): ResizeState;
```

Defined in: [calendar/resizeController.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L145)

#### Returns

[`ResizeState`](../interfaces/ResizeState.md)

***

### handleMouseMove()

```ts
handleMouseMove(e): void;
```

Defined in: [calendar/resizeController.ts:247](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L247)

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

Defined in: [calendar/resizeController.ts:258](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L258)

#### Returns

`void`

***

### registerDayColumn()

```ts
registerDayColumn(date, element): void;
```

Defined in: [calendar/resizeController.ts:155](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L155)

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

Defined in: [calendar/resizeController.ts:147](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L147)

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

Defined in: [calendar/resizeController.ts:185](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L185)

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

Defined in: [calendar/resizeController.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L138)

#### Parameters

##### listener

[`ResizeListener`](../type-aliases/ResizeListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
