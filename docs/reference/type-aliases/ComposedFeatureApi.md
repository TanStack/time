---
id: ComposedFeatureApi
title: ComposedFeatureApi
---

# Type Alias: ComposedFeatureApi\<TFeatures\>

```ts
type ComposedFeatureApi<TFeatures> = UnionToIntersection<{ [K in keyof TFeatures]: FeatureApi<TFeatures[K]> & FeatureModuleApi<TFeatures[K]> }[keyof TFeatures]>;
```

Defined in: [calendar/features/types.ts:150](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L150)

## Type Parameters

### TFeatures

`TFeatures`
