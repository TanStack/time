---
id: ViewMode
title: ViewMode
---

# Interface: ViewMode

Defined in: [calendar/types.ts:28](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L28)

Represents the configuration for the current viewing mode of a calendar,
specifying the scale and unit of time.

## Properties

### unit

```ts
unit: "month" | "week" | "day" | "workWeek";
```

Defined in: [calendar/types.ts:32](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L32)

The unit of time that the calendar view should display (month, week, workWeek or day).

***

### value

```ts
value: number;
```

Defined in: [calendar/types.ts:30](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/types.ts#L30)

The number of units for the view mode.
