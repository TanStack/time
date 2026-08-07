---
id: CalendarFeature
title: CalendarFeature
---

# Interface: CalendarFeature\<TResource, TEvent, TModuleApi, TApi, TName, TPeers\>

Defined in: [calendar/features/types.ts:76](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L76)

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

### TPeers

`TPeers` = `object`

## Properties

### api()?

```ts
optional api: (host, module, peers) => TApi;
```

Defined in: [calendar/features/types.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L87)

#### Parameters

##### host

[`CalendarHost`](CalendarHost.md)\<`TResource`, `TEvent`\>

##### module

`TModuleApi`

##### peers

`TPeers`

#### Returns

`TApi`

***

### module()?

```ts
optional module: (ctx) => Module<TEvent & KernelEvent, TModuleApi>;
```

Defined in: [calendar/features/types.ts:86](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L86)

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

Defined in: [calendar/features/types.ts:84](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L84)

***

### requires?

```ts
optional requires: readonly string[];
```

Defined in: [calendar/features/types.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L85)
