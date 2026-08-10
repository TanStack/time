---
id: ConstraintApi
title: ConstraintApi
---

# Interface: ConstraintApi\<TResource, TEvent\>

Defined in: [calendar/features/constraint.ts:9](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/constraint.ts#L9)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### checkEventConstraint()

```ts
checkEventConstraint: (event, newStart?, newEnd?, newConstraint?) => ConstraintConflict | null;
```

Defined in: [calendar/features/constraint.ts:13](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/constraint.ts#L13)

#### Parameters

##### event

`TEvent`

##### newStart?

`string`

##### newEnd?

`string`

##### newConstraint?

[`SchedulingConstraint`](SchedulingConstraint.md)

#### Returns

`ConstraintConflict` \| `null`
