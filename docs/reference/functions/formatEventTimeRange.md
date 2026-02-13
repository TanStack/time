---
id: formatEventTimeRange
title: formatEventTimeRange
---

# Function: formatEventTimeRange()

```ts
function formatEventTimeRange(
   start, 
   end, 
   options): FormattedEventTime;
```

Defined in: [calendar/getResizeProps.ts:493](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/getResizeProps.ts#L493)

Formats an event's time range for display
For multi-day events: includes date and time
For single-day events: includes only time (unless alwaysShowDate is true)

## Parameters

### start

`string`

### end

`string`

### options

[`FormatEventTimeOptions`](../interfaces/FormatEventTimeOptions.md) = `{}`

## Returns

[`FormattedEventTime`](../interfaces/FormattedEventTime.md)
