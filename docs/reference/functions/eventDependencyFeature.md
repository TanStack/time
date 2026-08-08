---
id: eventDependencyFeature
title: eventDependencyFeature
---

# Function: eventDependencyFeature()

```ts
function eventDependencyFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, DependencyApi, DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>, "dependency">;
```

Defined in: [calendar/features/dependency.ts:65](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/dependency.ts#L65)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `DependencyApi`, [`DependencyCreationApi`](../interfaces/DependencyCreationApi.md) & `DependencyApi` & [`DependencyGraphApi`](../interfaces/DependencyGraphApi.md)\<`TResource`, `TEvent`\>, `"dependency"`\>
