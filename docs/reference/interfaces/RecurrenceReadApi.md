---
id: RecurrenceReadApi
title: RecurrenceReadApi
---

# Interface: RecurrenceReadApi\<TResource, TEvent\>

Defined in: [calendar/features/recurrence.ts:78](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L78)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### getMasterEvent()

```ts
getMasterEvent: (event) => TEvent;
```

Defined in: [calendar/features/recurrence.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L82)

#### Parameters

##### event

`TEvent`

#### Returns

`TEvent`

***

### resolveOccurrence()

```ts
resolveOccurrence: (eventId, occurrenceStart?, fallbackStart?) => TEvent | undefined;
```

Defined in: [calendar/features/recurrence.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L83)

#### Parameters

##### eventId

`string`

##### occurrenceStart?

`string`

##### fallbackStart?

`string`

#### Returns

`TEvent` \| `undefined`
