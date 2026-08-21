---
id: MoveController
title: MoveController
---

# Class: MoveController\<TResource, TEvent\>

Defined in: [calendar/moveController.ts:96](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L96)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Constructors

### Constructor

```ts
new MoveController<TResource, TEvent>(host, options): MoveController<TResource, TEvent>;
```

Defined in: [calendar/moveController.ts:124](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L124)

#### Parameters

##### host

[`MoveHost`](../interfaces/MoveHost.md)\<`TResource`, `TEvent`\>

##### options

[`MoveControllerOptions`](../interfaces/MoveControllerOptions.md) = `{}`

#### Returns

`MoveController`\<`TResource`, `TEvent`\>

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [calendar/moveController.ts:309](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L309)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/moveController.ts:316](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L316)

#### Returns

`void`

***

### end()

```ts
end(): void;
```

Defined in: [calendar/moveController.ts:243](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L243)

#### Returns

`void`

***

### getOptions()

```ts
getOptions(): MoveControllerOptions;
```

Defined in: [calendar/moveController.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L145)

#### Returns

[`MoveControllerOptions`](../interfaces/MoveControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): MoveState;
```

Defined in: [calendar/moveController.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L139)

#### Returns

[`MoveState`](../interfaces/MoveState.md)

***

### moveTo()

```ts
moveTo(args): void;
```

Defined in: [calendar/moveController.ts:181](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L181)

#### Parameters

##### args

[`MoveToArgs`](../interfaces/MoveToArgs.md)

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [calendar/moveController.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L141)

#### Parameters

##### options

[`MoveControllerOptions`](../interfaces/MoveControllerOptions.md)

#### Returns

`void`

***

### start()

```ts
start(args): boolean;
```

Defined in: [calendar/moveController.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L149)

#### Parameters

##### args

[`MoveStartArgs`](../interfaces/MoveStartArgs.md)

#### Returns

`boolean`

***

### subscribe()

```ts
subscribe(listener): () => void;
```

Defined in: [calendar/moveController.ts:132](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L132)

#### Parameters

##### listener

[`MoveListener`](../type-aliases/MoveListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
