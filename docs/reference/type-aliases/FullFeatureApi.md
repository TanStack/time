---
id: FullFeatureApi
title: FullFeatureApi
---

# Type Alias: FullFeatureApi\<TResource, TEvent\>

```ts
type FullFeatureApi<TResource, TEvent> = UnionToIntersection<FeatureApiRegistry<TResource, TEvent>[keyof FeatureApiRegistry<TResource, TEvent>]>;
```

Defined in: [calendar/features/registry.ts:63](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L63)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>
