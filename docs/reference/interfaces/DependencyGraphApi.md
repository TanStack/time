---
id: DependencyGraphApi
title: DependencyGraphApi
---

# Interface: DependencyGraphApi\<TResource, TEvent\>

Defined in: [calendar/features/dependency.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L31)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### findViolatedDependency()

```ts
findViolatedDependency: (event, proposedStartMs, proposedEndMs) => 
  | {
  dependency: EventDependency;
  predecessor: TEvent;
}
  | null;
```

Defined in: [calendar/features/dependency.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L49)

#### Parameters

##### event

`TEvent`

##### proposedStartMs

`number`

##### proposedEndMs

`number`

#### Returns

  \| \{
  `dependency`: [`EventDependency`](EventDependency.md);
  `predecessor`: `TEvent`;
\}
  \| `null`

***

### getAffectedByDelta()

```ts
getAffectedByDelta: (eventId, deltaMs) => DependencyShift<TEvent>[];
```

Defined in: [calendar/features/dependency.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L45)

#### Parameters

##### eventId

`string`

##### deltaMs

`number`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]

***

### getDependentShifts()

```ts
getDependentShifts: (eventId, newStart, newEnd) => DependencyShift<TEvent>[];
```

Defined in: [calendar/features/dependency.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L40)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]

***

### getPredecessorShifts()

```ts
getPredecessorShifts: (eventId, newStart, newEnd) => DependencyShift<TEvent>[];
```

Defined in: [calendar/features/dependency.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L35)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]
