---
id: RecurrenceNavigationApi
title: RecurrenceNavigationApi
---

# Interface: RecurrenceNavigationApi

Defined in: [calendar/features/recurrence.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L44)

## Properties

### goToNextOccurrence()

```ts
goToNextOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/features/recurrence.ts:45](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L45)

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

Defined in: [calendar/features/recurrence.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L46)

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`
