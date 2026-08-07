---
id: ComposedFeatureApi
title: ComposedFeatureApi
---

# Type Alias: ComposedFeatureApi\<TFeatures\>

```ts
type ComposedFeatureApi<TFeatures> = UnionToIntersection<{ [K in keyof TFeatures]: FeatureApi<TFeatures[K]> & FeatureModuleApi<TFeatures[K]> }[keyof TFeatures]>;
```

Defined in: [calendar/features/types.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L143)

## Type Parameters

### TFeatures

`TFeatures`
