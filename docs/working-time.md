---
id: working-time
title: Working time
---

Working time answers *which minutes of a day can be worked*. You describe it once as shared
`WorkingCalendar` data, point resources at it by id, and `workingTimeFeature` resolves it for any
resource, resource set or event override. Availability validation, shading and
[slot generation](./booking) all read the same answer. See
[ADR 0008](https://github.com/TanStack/time/blob/main/docs/adr/0008-working-time-calendar-hierarchy.md)
for the hierarchy and
[ADR 0010](https://github.com/TanStack/time/blob/main/docs/adr/0010-schedule-rule-blocks.md) for
the schedule blocks.

## The model

```ts
interface WorkingCalendar {
  id: string
  label?: string
  parentId?: string
  timeZone?: string
  intervals: Array<WorkingInterval>
}

interface WorkingInterval {
  isWorking: boolean
  recurrent?: RecurrentWorkingInterval
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
}

interface RecurrentWorkingInterval {
  weekdays: Array<number>
  startTime: string
  endTime: string
}
```

Weekdays are ISO numbers: `1` is Monday, `7` is Sunday. Times are `HH:MM`, and `24:00` means end
of day. Dates are `YYYY-MM-DD`. All of it is **civil** time: `09:00` means nine on the wall clock.

An interval with `recurrent` repeats every week, optionally bounded by `startDate`/`endDate`. An
interval without it is a one-off span. `isWorking: false` closes time instead of opening it.

A one-off span with times is **continuous**. `startTime` clips only its first day and `endTime`
only its last. `2026-06-01`–`2026-06-03` with `10:00`–`14:00` is open from Monday 10:00 straight
through to Wednesday 14:00, not 10–14 each day. For a daily window, add weekdays:
`merge(weekday(1, 2, 3, 4, 5, 6, 7), dateRange(...), between('10:00', '14:00'))` compiles to a
bounded `recurrent` interval.

## Building calendars with blocks

Compose calendars from blocks instead of hand-writing intervals:

```ts
import { between, compileSchedule, dateRange, dates, merge, weekday } from '@tanstack/time'

const office = compileSchedule({
  id: 'office',
  label: 'Office hours',
  timeZone: 'Europe/Warsaw',
  on: [merge(weekday(1, 2, 3, 4, 5), between('09:00', '17:00'))],
  except: [dates(['2026-12-24', '2026-12-25']), dateRange('2026-12-28', '2026-12-31')],
})
```

| Block | Produces |
| --- | --- |
| `weekday(...days)` | Recurring interval, full civil day. Accepts names or `1`–`7`, dedupes. |
| `between(start, end)` | Time-of-day window. Throws unless `end` is after `start`. |
| `after(start)` | `between(start, '24:00')` |
| `before(end)` | `between('00:00', end)` |
| `date(iso)` | One full day. |
| `dates(isos)` | An array of `date()` intervals. |
| `dateRange(start, end)` | Inclusive span of full days. Throws if `end` is before `start`. |
| `merge(...fragments)` | One interval combining fragments that constrain *different* axes. |

`compileSchedule(spec)` takes a `ScheduleSpec` — `id`, optional `label`, `parentId`, `timeZone`,
`on` and `except` — and returns a plain `WorkingCalendar`. Everything in `on` becomes
`isWorking: true`, everything in `except` becomes `isWorking: false`. Nested arrays are flattened,
so `dates([...])` can sit directly in the list.

`merge()` is **not** a union. It has three axes — weekdays, time of day, dates — and throws when
two fragments constrain the same one. `merge(between('08:00', '12:00'), between('13:00', '17:00'))` is
a caller error. For a split shift, put two merged intervals in `on`:

```ts
import { after, before, between, compileSchedule, date, merge, weekday } from '@tanstack/time'

const splitShift = compileSchedule({
  id: 'split-shift',
  on: [
    merge(weekday(1, 2, 3, 4, 5), between('08:00', '12:00')),
    merge(weekday(1, 2, 3, 4, 5), after('13:00')),
  ],
  except: [merge(date('2026-07-03'), before('12:00'))],
})
```

The library ships **no** holiday tables. `except` takes whatever dates you supply.

## How a day resolves

Every interval that touches the day paints its minutes open or closed. The order of painting
decides the result. Later paint wins:

1. Undated recurring intervals.
2. Dated recurring intervals.
3. One-off spans.

Inside the same tier, parents paint before children, and a resource's calendar before an event
override. Array order breaks the last tie.

So a dated closure on a parent beats a child's weekly shift, a child's dated exception beats a
parent's dated shutdown, and `except: dates([...])` beats the recurring rule in `on` no matter
where you list it. Specificity comes **first**, hierarchy second.

## Calendar hierarchy

`parentId` layers a calendar over another one. The child doesn't replace the parent. It paints on
top, and wherever it paints nothing the parent shows through:

```ts
import { between, compileSchedule, merge, weekday } from '@tanstack/time'
import type { WorkingCalendar } from '@tanstack/time'

const calendars: Array<WorkingCalendar> = [
  compileSchedule({
    id: 'office',
    timeZone: 'Europe/Warsaw',
    on: [merge(weekday(1, 2, 3, 4, 5), between('09:00', '17:00'))],
  }),
  compileSchedule({
    id: 'early',
    parentId: 'office',
    on: [merge(weekday(1, 2, 3, 4, 5), between('07:00', '09:00'))],
  }),
]
```

`early` works 07:00–17:00: its own two hours plus the office day it inherits.

- A missing parent ends the chain silently. The calendars found so far still apply.
- A `parentId` cycle **throws** `Working calendar cycle: a -> b -> a`.
- An unknown calendar id resolves to no calendar at all, so it has no working time.
- `timeZone` is inherited: the nearest calendar in the chain that sets one wins. Slot generation
  uses it and falls back to the instance `timeZone`. The minute queries below don't use it.

## The feature

```ts
import { calendarFeatures, createCalendar, workingTimeFeature } from '@tanstack/time'

const calendar = createCalendar({
  features: calendarFeatures([workingTimeFeature]),
  timeZone: 'Europe/Warsaw',
  viewMode: { value: 1, unit: 'week' },
  calendars,
  defaultCalendarId: 'office',
  resources: [
    { id: 'r1', label: 'Early room', calendarId: 'early' },
    { id: 'r2', label: 'Office room', calendarId: 'office' },
  ],
})
```

A resource uses its own `calendarId`, or `defaultCalendarId` when it has none. Every method takes an
optional `WorkingTimeTarget`: `resourceId`, `resourceIds` and `calendarId`, all optional. The
target's `calendarId` is an **override layer**, painted over the resource's calendar the way an
event's own `calendarId` is. Without a resource, the default calendar is the base.

```ts
calendar.getEffectiveCalendar({ resourceId: 'r1' })
calendar.getEffectiveCalendar()

calendar.getWorkingIntervals(
  { start: '2026-01-05T00:00:00', end: '2026-01-06T00:00:00' },
  { resourceId: 'r1' },
)

calendar.getWorkingMinutes('2026-01-05', { resourceId: 'r2' })
calendar.getNonWorkingMinutes('2026-01-05', { resourceId: 'r2' })

calendar.isWorkingTime(
  { start: '2026-01-05T08:00:00', end: '2026-01-05T10:00:00' },
  { resourceId: 'r1' },
)
```

- `getEffectiveCalendar(target?)` returns the id governing the target: the target's `calendarId`,
  else the resource's, else the default. An unknown resource falls back to the default.
- `getWorkingIntervals(range, target?)` returns `{ start, end }` plain date-time strings, clipped to
  the range. The range end is exclusive. Spans that meet at midnight are joined.
- `getWorkingMinutes(date, target?)` and `getNonWorkingMinutes(date, target?)` return
  `{ startMinutes, endMinutes }` ranges for one day, from midnight. They are cached until the
  `resources` or `calendars` array is **replaced**. Mutating one in place serves stale minutes.
- `isWorkingTime(range, target?)` is `true` only when one working span covers the whole range. An
  empty or inverted range is `false`, and so is a range crossing a closed gap.

`resourceIds` gives the **union** of those resources' working time: a minute counts when any of
them works. An empty `resourceIds` has no working time. This is the feature's query, not the
availability policy. Validation applies `multiResource` (`'intersection'` by default) on its own.

Range bounds are `WorkingTimeRange` strings read as wall-clock values. A trailing `Z` or offset is
**dropped**, not converted into the calendar's `timeZone`. Pass plain `YYYY-MM-DDTHH:mm:ss`.

With no calendar configured, the queries report no working time at all, and availability
validation flags the resource with a `no-calendar` reason. Set `defaultCalendarId` unless "never
works" is really what you mean.

`resourceAvailabilityFeature` and `bookingFeature` require `workingTimeFeature`. Composing either
without it throws at `createCalendar`.

## Without a calendar instance

`getWorkingTime(calendarId, range, calendars)` is the same resolution as a pure function. It needs
no kernel or feature, so a server can run it:

```ts
import { getWorkingTime } from '@tanstack/time'

getWorkingTime('early', { start: '2026-01-05T00:00', end: '2026-01-06T00:00' }, calendars)
```

It resolves one calendar chain with no override layer and returns `[]` when the id resolves to
nothing.
