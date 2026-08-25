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

Defined in: [calendar/moveController.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L121)

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

Defined in: [calendar/moveController.ts:299](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L299)

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [calendar/moveController.ts:306](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L306)

#### Returns

`void`

***

### end()

```ts
end(): void;
```

Defined in: [calendar/moveController.ts:233](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L233)

#### Returns

`void`

***

### getOptions()

```ts
getOptions(): MoveControllerOptions;
```

Defined in: [calendar/moveController.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L139)

#### Returns

[`MoveControllerOptions`](../interfaces/MoveControllerOptions.md)

***

### getSnapshot()

```ts
getSnapshot(): MoveState;
```

Defined in: [calendar/moveController.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L133)

#### Returns

[`MoveState`](../interfaces/MoveState.md)

***

### moveTo()

```ts
moveTo(args): void;
```

Defined in: [calendar/moveController.ts:175](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L175)

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

Defined in: [calendar/moveController.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L135)

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

Defined in: [calendar/moveController.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L143)

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

Defined in: [calendar/moveController.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/moveController.ts#L126)

#### Parameters

##### listener

[`MoveListener`](../type-aliases/MoveListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
