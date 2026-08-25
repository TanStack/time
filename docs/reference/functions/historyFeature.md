---
id: historyFeature
title: historyFeature
---

# Function: historyFeature()

```ts
function historyFeature<TResource, TEvent>(): CalendarFeature<TResource, TEvent, UndoHistory<TEvent & KernelEvent>, HistoryApi, "history">;
```

Defined in: [calendar/features/history.ts:15](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/history.ts#L15)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Returns

[`CalendarFeature`](../interfaces/CalendarFeature.md)\<`TResource`, `TEvent`, `UndoHistory`\<`TEvent` & `KernelEvent`\>, [`HistoryApi`](../interfaces/HistoryApi.md), `"history"`\>
