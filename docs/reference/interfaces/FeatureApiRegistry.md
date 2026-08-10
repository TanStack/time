---
id: FeatureApiRegistry
title: FeatureApiRegistry
---

# Interface: FeatureApiRegistry\<TResource, TEvent\>

Defined in: [calendar/features/registry.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L37)

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

Defined in: [calendar/features/registry.ts:23](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L23)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`availability`](BuiltInFeatureApiRegistry.md#availability)

***

### constraint

```ts
constraint: ConstraintApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:31](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L31)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`constraint`](BuiltInFeatureApiRegistry.md#constraint)

***

### dayLayout

```ts
dayLayout: DayLayoutApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:33](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L33)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`dayLayout`](BuiltInFeatureApiRegistry.md#daylayout)

***

### dependency

```ts
dependency: DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L28)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`dependency`](BuiltInFeatureApiRegistry.md#dependency)

***

### history

```ts
history: HistoryApi;
```

Defined in: [calendar/features/registry.ts:24](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L24)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`history`](BuiltInFeatureApiRegistry.md#history)

***

### peerReader

```ts
peerReader: PeerReaderApi<TResource, TEvent>;
```

Defined in: [calendar/tests/features.test.ts:37](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/tests/features.test.ts#L37)

***

### recurrence

```ts
recurrence: RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:25](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L25)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`recurrence`](BuiltInFeatureApiRegistry.md#recurrence)

***

### resize

```ts
resize: ResizeFeatureApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L32)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`resize`](BuiltInFeatureApiRegistry.md#resize)

***

### timeline

```ts
timeline: TimelineApi<TResource, TEvent>;
```

Defined in: [calendar/features/registry.ts:34](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L34)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`timeline`](BuiltInFeatureApiRegistry.md#timeline)

***

### workingTime

```ts
workingTime: WorkingTimeApi<TResource>;
```

Defined in: [calendar/features/registry.ts:22](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/registry.ts#L22)

#### Inherited from

[`BuiltInFeatureApiRegistry`](BuiltInFeatureApiRegistry.md).[`workingTime`](BuiltInFeatureApiRegistry.md#workingtime)
