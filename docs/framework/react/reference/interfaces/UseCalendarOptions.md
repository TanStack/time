---
id: UseCalendarOptions
title: UseCalendarOptions
---

# Interface: UseCalendarOptions\<TFeatures, TResource, TEvent\>

Defined in: [useCalendar.ts:46](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L46)

## Extends

- `CalendarCoreOptions`\<`TFeatures`, `TResource`, `TEvent`\>

## Type Parameters

### TFeatures

`TFeatures` *extends* `CalendarFeatureList`

### TResource

`TResource` *extends* `Resource` = `Resource`

### TEvent

`TEvent` *extends* `Event`\<`TResource`\> = `Event`\<`TResource`\>

## Properties

### move?

```ts
optional move: MoveControllerOptions;
```

Defined in: [useCalendar.ts:52](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L52)

***

### resize?

```ts
optional resize: ResizeControllerOptions;
```

Defined in: [useCalendar.ts:51](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L51)
