---
id: BuiltInFeatureApiRegistry
title: BuiltInFeatureApiRegistry
---

# Interface: BuiltInFeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L20)

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

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)

***

### constraint

```ts
constraint: ConstraintApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L33)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L37)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L30)

***

### duration

```ts
duration: DurationApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L34)

***

### filter

```ts
filter: EventFilterApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L35)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L26)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L27)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L36)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L38)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L24)
