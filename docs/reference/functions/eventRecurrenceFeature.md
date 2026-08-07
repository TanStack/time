---
id: eventRecurrenceFeature
title: eventRecurrenceFeature
---

# Function: eventRecurrenceFeature()

```ts
function eventRecurrenceFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, RecurrenceApi<TEvent & KernelEvent>, RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>, "recurrence">;
```

Defined in: [calendar/features/recurrence.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L89)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `RecurrenceApi`\<`TEvent` & `KernelEvent`\>, [`RecurrenceNavigationApi`](../interfaces/RecurrenceNavigationApi.md) & [`RecurrenceEditApi`](../interfaces/RecurrenceEditApi.md)\<`TResource`, `TEvent`\> & [`RecurrenceReadApi`](../interfaces/RecurrenceReadApi.md)\<`TResource`, `TEvent`\>, `"recurrence"`\>
