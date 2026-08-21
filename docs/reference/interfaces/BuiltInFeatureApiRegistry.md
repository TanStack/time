---
id: BuiltInFeatureApiRegistry
title: BuiltInFeatureApiRegistry
---

# Interface: BuiltInFeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L21)

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

Defined in: [calendar/features/registry.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L26)

***

### constraint

```ts
constraint: ConstraintApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L34)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:39](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L39)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L31)

***

### duration

```ts
duration: DurationApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:35](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L35)

***

### filter

```ts
filter: EventFilterApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L36)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L27)

***

### move

```ts
move: MoveFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:38](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L38)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L28)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L37)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:40](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L40)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)
