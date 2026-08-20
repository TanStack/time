---
id: CalendarFeature
title: CalendarFeature
---

# Interface: CalendarFeature\<TResource, TEvent, TModuleApi, TApi, TName, TPeers\>

Defined in: [calendar/features/types.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L82)

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

Defined in: [calendar/features/types.ts:95](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L95)

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

Defined in: [calendar/features/types.ts:92](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L92)

#### Parameters

##### ctx

[`FeatureModuleCtx`](FeatureModuleCtx.md)\<`TResource`\>

#### Returns

`Module`\<`TEvent` & `KernelEvent`, `TModuleApi`\>

***

### name

```ts
name: TName;
```

Defined in: [calendar/features/types.ts:90](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L90)

***

### requires?

```ts
optional requires: readonly string[];
```

Defined in: [calendar/features/types.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L91)
