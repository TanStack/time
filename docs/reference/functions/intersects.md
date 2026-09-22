---
id: intersects
title: intersects
---

# Function: intersects()

```ts
function intersects(date, options): boolean;
```

Defined in: [date/intersects/intersects.ts:16](https://github.com/TanStack/time/blob/main/packages/time/src/date/intersects/intersects.ts#L16)

intersects
Returns true if the date/time instance intersects with the range (i.e., is within or equal to the range boundaries)

## Parameters

### date

[`DateInput`](../type-aliases/DateInput.md)

The date to check

### options

[`IntersectsOptions`](../interfaces/IntersectsOptions.md)

Options including range, timeZone and calendar

## Returns

`boolean`
