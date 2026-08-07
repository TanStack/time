---
id: eventDependencyFeature
title: eventDependencyFeature
---

# Function: eventDependencyFeature()

```ts
function eventDependencyFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, DependencyApi, DependencyCreationApi & DependencyApi, "dependency">;
```

Defined in: [calendar/features/dependency.ts:18](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L18)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `DependencyApi`, [`DependencyCreationApi`](../interfaces/DependencyCreationApi.md) & `DependencyApi`, `"dependency"`\>
