---
id: DependencyGraphApi
title: DependencyGraphApi
---

# Interface: DependencyGraphApi\<TResource, TEvent\>

Defined in: [calendar/features/dependency.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L30)

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

Defined in: [calendar/features/dependency.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L48)

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

Defined in: [calendar/features/dependency.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L44)

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

***

### getPredecessorShifts()

```ts
getPredecessorShifts: (eventId, newStart, newEnd) => DependencyShift<TEvent>[];
```

Defined in: [calendar/features/dependency.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L34)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

#### Returns

[`DependencyShift`](DependencyShift.md)\<`TEvent`\>[]
