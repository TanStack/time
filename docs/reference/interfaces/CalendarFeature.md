---
id: CalendarFeature
title: CalendarFeature
---

# Interface: CalendarFeature\<TResource, TEvent, TModuleApi, TApi, TName\>

Defined in: [calendar/features/types.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L89)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

### TModuleApi

`TModuleApi` = `object`

### TApi

`TApi` = `object`

### TName

`TName` *extends* `string` = `string`

## Properties

### api()?

```ts
optional api: (host, module) => TApi;
```

Defined in: [calendar/features/types.ts:99](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L99)

#### Parameters

##### host

[`CalendarHost`](CalendarHost.md)\<`TResource`, `TEvent`\>

##### module

`TModuleApi`

#### Returns

`TApi`

***

### module()?

```ts
optional module: (ctx) => Module<TEvent & KernelEvent, TModuleApi>;
```

Defined in: [calendar/features/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L98)

#### Parameters

##### ctx

[`FeatureModuleCtx`](FeatureModuleCtx.md)

#### Returns

`Module`\<`TEvent` & `KernelEvent`, `TModuleApi`\>

***

### name

```ts
name: TName;
```

Defined in: [calendar/features/types.ts:96](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L96)

***

### requires?

```ts
optional requires: readonly string[];
```

Defined in: [calendar/features/types.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L97)
