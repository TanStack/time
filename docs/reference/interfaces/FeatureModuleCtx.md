---
id: FeatureModuleCtx
title: FeatureModuleCtx
---

# Interface: FeatureModuleCtx\<TResource\>

Defined in: [calendar/features/types.ts:74](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L74)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md) = [`Resource`](Resource.md)

## Properties

### getResources()

```ts
getResources: () => TResource[];
```

Defined in: [calendar/features/types.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L76)

#### Returns

`TResource`[]

***

### getWorkingTime()

```ts
getWorkingTime: () => WorkingTimeConfig;
```

Defined in: [calendar/features/types.ts:77](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L77)

#### Returns

`WorkingTimeConfig`

***

### timeZone

```ts
timeZone: TimeZoneLike;
```

Defined in: [calendar/features/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L75)
