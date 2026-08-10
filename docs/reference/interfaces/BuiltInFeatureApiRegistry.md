---
id: BuiltInFeatureApiRegistry
title: BuiltInFeatureApiRegistry
---

# Interface: BuiltInFeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L19)

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

Defined in: [calendar/features/registry.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L24)

***

### constraint

```ts
constraint: ConstraintApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L32)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L35)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L29)

***

### duration

```ts
duration: DurationApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L33)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L26)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L34)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L36)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L23)
