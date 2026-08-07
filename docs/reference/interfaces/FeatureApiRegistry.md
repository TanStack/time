---
id: FeatureApiRegistry
title: FeatureApiRegistry
---

# Interface: FeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L33)

## Extends

- [`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md)\<`TResource`, `TEvent`\>

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

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`availability`](BuiltInFeatureApiRegistry.md#availability)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:29](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L29)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`dayLayout`](BuiltInFeatureApiRegistry.md#daylayout)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`dependency`](BuiltInFeatureApiRegistry.md#dependency)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:21](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L21)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`history`](BuiltInFeatureApiRegistry.md#history)

***

### peerReader

```ts
peerReader: PeerReaderApi<TResource, TEvent>;
```

Defined in: [calendar/tests/features.test.ts:36](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/tests/features.test.ts#L36)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L22)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`recurrence`](BuiltInFeatureApiRegistry.md#recurrence)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L28)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`resize`](BuiltInFeatureApiRegistry.md#resize)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L30)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`timeline`](BuiltInFeatureApiRegistry.md#timeline)
