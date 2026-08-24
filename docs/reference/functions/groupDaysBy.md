---
id: groupDaysBy
title: groupDaysBy
---

# Function: groupDaysBy()

```ts
function groupDaysBy<TResource, TEvent>(__namedParameters): (Day<TResource, TEvent> | null)[][];
```

Defined in: [calendar/groupDaysBy.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/groupDaysBy.ts#L56)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>

## Parameters

### \_\_namedParameters

[`GroupDaysByProps`](../type-aliases/GroupDaysByProps.md)\<`TResource`, `TEvent`\>

## Returns

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[][]
