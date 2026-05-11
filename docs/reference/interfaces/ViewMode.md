---
id: ViewMode
title: ViewMode
---

# Interface: ViewMode

Defined in: [calendar/types.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L71)

Represents the configuration for the current viewing mode of a calendar,
specifying the scale and unit of time.

## Properties

### unit

```ts
unit: "month" | "day" | "week" | "workWeek";
```

Defined in: [calendar/types.ts:75](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L75)

The unit of time that the calendar view should display (month, week, workWeek or day).

***

### value

```ts
value: number;
```

Defined in: [calendar/types.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L73)

The number of units for the view mode.
