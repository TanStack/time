---
id: FeatureName
title: FeatureName
---

# Type Alias: FeatureName\<TFactory\>

```ts
type FeatureName<TFactory> = TFactory extends (...args) => object ? TName : never;
```

Defined in: [calendar/features/types.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L121)

## Type Parameters

### TFactory

`TFactory`
