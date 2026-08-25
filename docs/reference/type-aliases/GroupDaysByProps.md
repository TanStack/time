---
id: GroupDaysByProps
title: GroupDaysByProps
---

# Type Alias: GroupDaysByProps\<TResource, TEvent\>

```ts
type GroupDaysByProps<TResource, TEvent> = 
  | GroupDaysByMonthProps<TResource, TEvent>
| GroupDaysByWeekProps<TResource, TEvent>;
```

Defined in: [calendar/groupDaysBy.ts:51](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/groupDaysBy.ts#L51)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>
