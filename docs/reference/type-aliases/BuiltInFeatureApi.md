---
id: BuiltInFeatureApi
title: BuiltInFeatureApi
---

# Type Alias: BuiltInFeatureApi\<TResource, TEvent\>

```ts
type BuiltInFeatureApi<TResource, TEvent> = UnionToIntersection<BuiltInFeatureApiRegistry<TResource, TEvent>[keyof BuiltInFeatureApiRegistry<TResource, TEvent>]>;
```

Defined in: [calendar/features/registry.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L71)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>
