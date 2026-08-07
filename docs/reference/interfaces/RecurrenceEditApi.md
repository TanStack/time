---
id: RecurrenceEditApi
title: RecurrenceEditApi
---

# Interface: RecurrenceEditApi\<TResource, TEvent\>

Defined in: [calendar/features/recurrence.ts:55](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L55)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### editRecurringEvent()

```ts
editRecurringEvent: (eventId, updates, options) => Promise<SaveEventResult>;
```

Defined in: [calendar/features/recurrence.ts:59](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L59)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

***

### removeRecurringEvent()

```ts
removeRecurringEvent: (eventId, options) => void;
```

Defined in: [calendar/features/recurrence.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L68)

#### Parameters

##### eventId

`string`

##### options

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`void`
