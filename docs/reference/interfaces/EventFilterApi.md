---
id: EventFilterApi
title: EventFilterApi
---

# Interface: EventFilterApi\<TResource, TEvent\>

Defined in: [calendar/features/filter.ts:10](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L10)

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

Defined in: [calendar/features/filter.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L13)

#### Returns

`void`

***

### getEventFilterIds()

```ts
getEventFilterIds: () => string[];
```

Defined in: [calendar/features/filter.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L15)

#### Returns

`string`[]

***

### getHiddenEvents()

```ts
getHiddenEvents: () => TEvent[];
```

Defined in: [calendar/features/filter.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L19)

#### Returns

`TEvent`[]

***

### isEventVisible()

```ts
isEventVisible: (event) => boolean;
```

Defined in: [calendar/features/filter.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L17)

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

Defined in: [calendar/features/filter.ts:11](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/filter.ts#L11)

#### Parameters

##### id

`string`

##### predicate

[`EventFilterPredicate`](../type-aliases/EventFilterPredicate.md)\<`TResource`, `TEvent`\> | `null`

#### Returns

`void`
