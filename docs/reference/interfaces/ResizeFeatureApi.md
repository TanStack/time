---
id: ResizeFeatureApi
title: ResizeFeatureApi
---

# Interface: ResizeFeatureApi\<TResource, TEvent\>

Defined in: [calendar/features/resize.ts:9](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L9)

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

Defined in: [calendar/features/resize.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L13)

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

Defined in: [calendar/features/resize.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/resize.ts#L16)

#### Parameters

##### event

`TEvent`

#### Returns

[`SegmentInfo`](SegmentInfo.md)
