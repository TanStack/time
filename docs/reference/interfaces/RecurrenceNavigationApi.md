---
id: RecurrenceNavigationApi
title: RecurrenceNavigationApi
---

# Interface: RecurrenceNavigationApi

Defined in: [calendar/features/recurrence.ts:47](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L47)

## Properties

### goToNextOccurrence()

```ts
goToNextOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/features/recurrence.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L48)

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

***

### goToPreviousOccurrence()

```ts
goToPreviousOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/features/recurrence.ts:49](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L49)

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`
