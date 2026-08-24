---
id: SolidCalendar
title: SolidCalendar
---

# Type Alias: SolidCalendar\<TFeatures, TResource, TEvent\>

```ts
type SolidCalendar<TFeatures, TResource, TEvent> = object & ComposedResizeApi<TFeatures>;
```

Defined in: [createCalendar.ts:62](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L62)

## Type Declaration

### calendar

```ts
calendar: Calendar<TFeatures, TResource, TEvent>;
```

### days

```ts
days: Accessor<Day<TResource, TEvent>[]>;
```

### isPending

```ts
isPending: Accessor<boolean>;
```

### state

```ts
state: Accessor<CalendarStore>;
```

## Type Parameters

### TFeatures

`TFeatures` *extends* `CalendarFeatureList`

### TResource

`TResource` *extends* `Resource` = `Resource`

### TEvent

`TEvent` *extends* `Event`\<`TResource`\> = `Event`\<`TResource`\>
