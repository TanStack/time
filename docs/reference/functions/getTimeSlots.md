---
id: getTimeSlots
title: getTimeSlots
---

# Function: getTimeSlots()

```ts
function getTimeSlots(locale, options?): TimeSlot[];
```

Defined in: [calendar/getTimeSlots.ts:19](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getTimeSlots.ts#L19)

Generates time slots for calendar day views.
Returns an array of time slots with labels formatted according to the locale.

## Parameters

### locale

`string`

The locale to use for formatting time labels (BCP 47 format)

### options?

`TimeSlotOptions`

Configuration options for time slots

## Returns

[`TimeSlot`](../interfaces/TimeSlot.md)[]

Array of time slots with hour, minute, and formatted label
