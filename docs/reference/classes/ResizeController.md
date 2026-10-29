---
id: ResizeController
title: ResizeController
---

# Class: ResizeController\<TResource, TEvent\>

Defined in: [calendar/resizeController.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L107)

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

Defined in: [calendar/resizeController.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L143)

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

Defined in: [calendar/resizeController.ts:238](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L238)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/resizeController.ts:248](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L248)

#### Returns

`void`

***

### getDayFromElement()

```ts
getDayFromElement(element): string | null;
```

Defined in: [calendar/resizeController.ts:191](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L191)

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

Defined in: [calendar/resizeController.ts:176](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L176)

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

Defined in: [calendar/resizeController.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L164)

#### Returns

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): ResizeState;
```

Defined in: [calendar/resizeController.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L158)

#### Returns

[`ResizeState`](../interfaces/ResizeState.md)

***

### handleMouseMove()

```ts
handleMouseMove(e): void;
```

Defined in: [calendar/resizeController.ts:260](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L260)

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

Defined in: [calendar/resizeController.ts:271](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L271)

#### Returns

`void`

***

### registerDayColumn()

```ts
registerDayColumn(date, element): void;
```

Defined in: [calendar/resizeController.ts:168](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L168)

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

Defined in: [calendar/resizeController.ts:160](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L160)

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

Defined in: [calendar/resizeController.ts:198](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L198)

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

Defined in: [calendar/resizeController.ts:151](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/resizeController.ts#L151)

#### Parameters

##### listener

[`ResizeListener`](../type-aliases/ResizeListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
