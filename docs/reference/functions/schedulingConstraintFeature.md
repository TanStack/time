---
id: schedulingConstraintFeature
title: schedulingConstraintFeature
---

# Function: schedulingConstraintFeature()

```ts
function schedulingConstraintFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, ConstraintModuleApi, ConstraintApi<TResource, TEvent>, "constraint">;
```

Defined in: [calendar/features/constraint.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/constraint.ts#L21)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `ConstraintModuleApi`, [`ConstraintApi`](../interfaces/ConstraintApi.md)\<`TResource`, `TEvent`\>, `"constraint"`\>
