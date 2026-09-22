---
id: ViewMode
title: ViewMode
---

# Interface: ViewMode

Defined in: [calendar/types.ts:94](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L94)

Represents the configuration for the current viewing mode of a calendar,
specifying the scale and unit of time.

## Properties

### unit

```ts
unit: "month" | "day" | "week" | "workWeek";
```

Defined in: [calendar/types.ts:98](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L98)

The unit of time that the calendar view should display (month, week, workWeek or day).

***

### value

```ts
value: number;
```

Defined in: [calendar/types.ts:96](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L96)

The number of units for the view mode.
