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

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L31)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L27)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L23)

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

Defined in: [calendar/features/registry.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L30)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L32)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L21)
