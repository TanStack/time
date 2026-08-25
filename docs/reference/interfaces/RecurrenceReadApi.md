---
id: RecurrenceReadApi
title: RecurrenceReadApi
---

# Interface: RecurrenceReadApi\<TResource, TEvent\>

Defined in: [calendar/features/recurrence.ts:68](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L68)

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

Defined in: [calendar/features/recurrence.ts:69](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L69)

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

Defined in: [calendar/features/recurrence.ts:70](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/features/recurrence.ts#L70)

#### Parameters

##### eventId

`string`

##### occurrenceStart?

`string`

##### fallbackStart?

`string`

#### Returns

`TEvent` \| `undefined`
