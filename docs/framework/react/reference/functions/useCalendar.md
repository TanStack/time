---
id: useCalendar
title: useCalendar
---

# Function: useCalendar()

```ts
function useCalendar<TFeatures, TResource, TEvent>(options): UseCalendarResult<TFeatures, TResource, TEvent>;
```

Defined in: [useCalendar.ts:90](https://github.com/TanStack/time/blob/main/packages/react-time/src/useCalendar/useCalendar.ts#L90)

## Type Parameters

### TFeatures

`TFeatures` *extends* `CalendarFeatureList`

### TResource

`TResource` *extends* `Resource` = `Resource`

### TEvent

`TEvent` *extends* `Event`\<`TResource`\> = `Event`\<`TResource`\>

## Parameters

### options

[`UseCalendarOptions`](../interfaces/UseCalendarOptions.md)\<`TFeatures`, `TResource`, `TEvent`\>

## Returns

`UseCalendarResult`\<`TFeatures`, `TResource`, `TEvent`\>
