---
id: FeatureApiRegistry
title: FeatureApiRegistry
---

# Interface: FeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L15)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi;
```

Defined in: [calendar/features/registry.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L23)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L19)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:20](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L20)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L24)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:26](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L26)
