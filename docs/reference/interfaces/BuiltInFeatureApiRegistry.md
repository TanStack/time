---
id: BuiltInFeatureApiRegistry
title: BuiltInFeatureApiRegistry
---

# Interface: BuiltInFeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:17](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L17)

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

Defined in: [calendar/features/registry.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L22)

***

### constraint

```ts
constraint: ConstraintApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L28)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L33)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L27)

***

### duration

```ts
duration: DurationApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L29)

***

### filter

```ts
filter: EventFilterApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L30)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L23)

***

### move

```ts
move: MoveFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L32)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L24)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L31)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L34)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L21)
