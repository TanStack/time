---
id: createCalendar
title: createCalendar
---

# Function: createCalendar()

```ts
function createCalendar<TFeatures, TResource, TEvent>(options): Calendar<TFeatures, TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:1240](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1240)

## Type Parameters

### TFeatures

`TFeatures` *extends* [`CalendarFeatureList`](../type-aliases/CalendarFeatureList.md)

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>

## Parameters

### options

[`CalendarCoreOptions`](../interfaces/CalendarCoreOptions.md)\<`TFeatures`, `TResource`, `TEvent`\>

## Returns

[`Calendar`](../type-aliases/Calendar.md)\<`TFeatures`, `TResource`, `TEvent`\>
