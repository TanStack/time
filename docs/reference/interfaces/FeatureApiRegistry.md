---
id: FeatureApiRegistry
title: FeatureApiRegistry
---

# Interface: FeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L16)

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

Defined in: [calendar/features/registry.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L20)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:27](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L27)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi;
```

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L21)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L22)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L26)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L28)
