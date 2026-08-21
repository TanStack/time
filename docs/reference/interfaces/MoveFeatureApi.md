---
id: MoveFeatureApi
title: MoveFeatureApi
---

# Interface: MoveFeatureApi\<TResource, TEvent\>

Defined in: [calendar/features/move.ts:14](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L14)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### createMoveController()

```ts
createMoveController: (options?) => MoveController<TResource, TEvent>;
```

Defined in: [calendar/features/move.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L18)

#### Parameters

##### options?

[`MoveControllerOptions`](MoveControllerOptions.md)

#### Returns

[`MoveController`](../classes/MoveController.md)\<`TResource`, `TEvent`\>

***

### validateEventMove()

```ts
validateEventMove: (options) => ValidateMoveResult;
```

Defined in: [calendar/features/move.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/move.ts#L21)

#### Parameters

##### options

[`ValidateMoveOptions`](ValidateMoveOptions.md)

#### Returns

[`ValidateMoveResult`](ValidateMoveResult.md)
