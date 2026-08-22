---
id: FeatureModuleCtx
title: FeatureModuleCtx
---

# Interface: FeatureModuleCtx\<TResource\>

Defined in: [calendar/features/types.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L64)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### getResources()

```ts
getResources: () => TResource[];
```

Defined in: [calendar/features/types.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L66)

#### Returns

`TResource`[]

***

### getWorkingTime()

```ts
getWorkingTime: () => WorkingTimeConfig;
```

Defined in: [calendar/features/types.ts:67](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L67)

#### Returns

`WorkingTimeConfig`

***

### timeZone

```ts
timeZone: TimeZoneLike;
```

Defined in: [calendar/features/types.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L65)
