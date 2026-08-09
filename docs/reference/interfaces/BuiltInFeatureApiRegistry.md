---
id: BuiltInFeatureApiRegistry
title: BuiltInFeatureApiRegistry
---

# Interface: BuiltInFeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L16)

## Extended by

- [`FeatureApiRegistry`](FeatureApiRegistry.md)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### availability

```ts
availability: AvailabilityApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L21)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L29)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L26)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L22)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L23)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L30)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L20)
