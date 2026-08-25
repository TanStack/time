---
id: DurationApi
title: DurationApi
---

# Interface: DurationApi\<TResource, TEvent\>

Defined in: [calendar/features/duration.ts:9](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/duration.ts#L9)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### checkEventDuration()

```ts
checkEventDuration: (event, newStart?, newEnd?, newResources?) => DurationConflict[];
```

Defined in: [calendar/features/duration.ts:11](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/duration.ts#L11)

#### Parameters

##### event

`TEvent`

##### newStart?

`string`

##### newEnd?

`string`

##### newResources?

(`string` \| `TResource`)[]

#### Returns

`DurationConflict`[]

***

### getWorkingDuration()

```ts
getWorkingDuration: (event, newStart?, newEnd?) => number;
```

Defined in: [calendar/features/duration.ts:10](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/duration.ts#L10)

#### Parameters

##### event

`TEvent`

##### newStart?

`string`

##### newEnd?

`string`

#### Returns

`number`
