---
id: AnyCalendarFeature
title: AnyCalendarFeature
---

# Interface: AnyCalendarFeature\<TResource, TEvent\>

Defined in: [calendar/features/types.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L97)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### api()?

```ts
optional api: (host, module, peers) => object | undefined;
```

Defined in: [calendar/features/types.ts:106](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L106)

#### Parameters

##### host

[`CalendarHost`](CalendarHost.md)\<`TResource`, `TEvent`\>

##### module

`never`

##### peers

`never`

#### Returns

`object` \| `undefined`

***

### module()?

```ts
optional module: (ctx) => Module<TEvent & KernelEvent, unknown>;
```

Defined in: [calendar/features/types.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L103)

#### Parameters

##### ctx

[`FeatureModuleCtx`](FeatureModuleCtx.md)\<`TResource`\>

#### Returns

`Module`\<`TEvent` & `KernelEvent`, `unknown`\>

***

### name

```ts
name: string;
```

Defined in: [calendar/features/types.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L101)

***

### requires?

```ts
optional requires: readonly string[];
```

Defined in: [calendar/features/types.ts:102](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/types.ts#L102)
