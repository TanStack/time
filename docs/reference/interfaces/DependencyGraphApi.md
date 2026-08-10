---
id: DependencyGraphApi
title: DependencyGraphApi
---

# Interface: DependencyGraphApi\<TResource, TEvent\>

Defined in: [calendar/features/dependency.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L35)

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

Defined in: [calendar/features/dependency.ts:53](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L53)

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

Defined in: [calendar/features/dependency.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L49)

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

Defined in: [calendar/features/dependency.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L58)

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

Defined in: [calendar/features/dependency.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L44)

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

Defined in: [calendar/features/dependency.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L39)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]
