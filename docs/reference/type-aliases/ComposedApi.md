---
id: ComposedApi
title: ComposedApi
---

# Type Alias: ComposedApi\<TFeatures, TResource, TEvent\>

```ts
type ComposedApi<TFeatures, TResource, TEvent> = UnionToIntersection<FeatureApiRegistry<TResource, TEvent>[FeatureName<TFeatures[number]> & keyof FeatureApiRegistry<TResource, TEvent>]>;
```

Defined in: [calendar/features/registry.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L54)

## Type Parameters

### TFeatures

`TFeatures` *extends* `ReadonlyArray`\<[`CalendarFeatureFactory`](CalendarFeatureFactory.md)\>

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>
