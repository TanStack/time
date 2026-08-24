---
id: CreateCalendarOptions
title: CreateCalendarOptions
---

# Interface: CreateCalendarOptions\<TFeatures, TResource, TEvent\>

Defined in: [createCalendar.ts:39](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L39)

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

### resize?

```ts
optional resize: ResizeControllerOptions | Accessor<ResizeControllerOptions>;
```

Defined in: [createCalendar.ts:44](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L44)
