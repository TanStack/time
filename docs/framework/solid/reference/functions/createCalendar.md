---
id: createCalendar
title: createCalendar
---

# Function: createCalendar()

```ts
function createCalendar<TFeatures, TResource, TEvent>(options): SolidCalendar<TFeatures, TResource, TEvent>;
```

Defined in: [createCalendar.ts:73](https://github.com/TanStack/time/blob/main/packages/solid-time/src/createCalendar/createCalendar.ts#L73)

## Type Parameters

### TFeatures

`TFeatures` *extends* `CalendarFeatureList`

### TResource

`TResource` *extends* `Resource` = `Resource`

### TEvent

`TEvent` *extends* `Event`\<`TResource`\> = `Event`\<`TResource`\>

## Parameters

### options

[`CreateCalendarOptions`](../interfaces/CreateCalendarOptions.md)\<`TFeatures`, `TResource`, `TEvent`\>

## Returns

[`SolidCalendar`](../type-aliases/SolidCalendar.md)\<`TFeatures`, `TResource`, `TEvent`\>
