---
id: ResizeFeatureApi
title: ResizeFeatureApi
---

# Interface: ResizeFeatureApi\<TResource, TEvent\>

Defined in: [calendar/features/resize.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L26)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### createResizeController()

```ts
createResizeController: (options?) => ResizeController<TResource, TEvent>;
```

Defined in: [calendar/features/resize.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L30)

#### Parameters

##### options?

[`ResizeControllerOptions`](ResizeControllerOptions.md)

#### Returns

[`ResizeController`](../classes/ResizeController.md)\<`TResource`, `TEvent`\>

***

### getEventSegmentInfo()

```ts
getEventSegmentInfo: (event) => SegmentInfo;
```

Defined in: [calendar/features/resize.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L33)

#### Parameters

##### event

`TEvent`

#### Returns

[`SegmentInfo`](SegmentInfo.md)

***

### validateResize()

```ts
validateResize: (options) => ValidateResizeResult;
```

Defined in: [calendar/features/resize.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L34)

#### Parameters

##### options

[`ValidateResizeOptions`](ValidateResizeOptions.md)

#### Returns

[`ValidateResizeResult`](ValidateResizeResult.md)
