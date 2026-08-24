---
id: DependencyGraphApi
title: DependencyGraphApi
---

# Interface: DependencyGraphApi\<TResource, TEvent\>

Defined in: [calendar/features/dependency.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L26)

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

Defined in: [calendar/features/dependency.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L38)

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

Defined in: [calendar/features/dependency.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L37)

#### Parameters

##### eventId

`string`

##### deltaMs

`number`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]

***

### getAnchorConflicts()

```ts
getAnchorConflicts: (eventId, newStart, newEnd) => DependencyConflict[];
```

Defined in: [calendar/features/dependency.ts:43](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L43)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

`DependencyConflict`[]

***

### getDependentShifts()

```ts
getDependentShifts: (eventId, newStart, newEnd) => DependencyShift<TEvent>[];
```

Defined in: [calendar/features/dependency.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L32)

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

Defined in: [calendar/features/dependency.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L27)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]
