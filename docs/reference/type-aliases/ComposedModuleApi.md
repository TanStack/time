---
id: ComposedModuleApi
title: ComposedModuleApi
---

# Type Alias: ComposedModuleApi\<TFeatures\>

```ts
type ComposedModuleApi<TFeatures> = UnionToIntersection<{ [K in keyof TFeatures]: FeatureModuleApi<TFeatures[K]> }[keyof TFeatures]>;
```

Defined in: [calendar/features/types.ts:148](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L148)

## Type Parameters

### TFeatures

`TFeatures`
