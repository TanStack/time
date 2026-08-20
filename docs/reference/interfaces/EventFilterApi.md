---
id: EventFilterApi
title: EventFilterApi
---

# Interface: EventFilterApi\<TResource, TEvent\>

Defined in: [calendar/features/filter.ts:11](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L11)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### clearEventFilters()

```ts
clearEventFilters: () => void;
```

Defined in: [calendar/features/filter.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L20)

#### Returns

`void`

***

### getEventFilterIds()

```ts
getEventFilterIds: () => string[];
```

Defined in: [calendar/features/filter.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L22)

#### Returns

`string`[]

***

### getHiddenEvents()

```ts
getHiddenEvents: () => TEvent[];
```

Defined in: [calendar/features/filter.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L26)

#### Returns

`TEvent`[]

***

### isEventVisible()

```ts
isEventVisible: (event) => boolean;
```

Defined in: [calendar/features/filter.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L24)

#### Parameters

##### event

`TEvent`

#### Returns

`boolean`

***

### setEventFilter()

```ts
setEventFilter: (id, predicate) => void;
```

Defined in: [calendar/features/filter.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L15)

#### Parameters

##### id

`string`

##### predicate

[`EventFilterPredicate`](../type-aliases/EventFilterPredicate.md)\<`TResource`, `TEvent`\> | `null`

#### Returns

`void`
