---
name: working-time
description: >
  Working hours and calendar hierarchy in TanStack Time. Load when working with
  WorkingCalendar, WorkingInterval, compileSchedule, weekday/between/after/before/
  date/dates/dateRange/merge blocks, parentId layering, workingTimeFeature,
  calendars/defaultCalendarId/calendarId, getWorkingIntervals, getWorkingMinutes,
  getNonWorkingMinutes, isWorkingTime, getEffectiveCalendar, or server-side getWorkingTime.
metadata:
  type: sub-skill
  library: '@tanstack/time'
  library_version: '0.0.0'
requires:
  - '@tanstack/time#core'
sources:
  - 'TanStack/time:docs/working-time.md'
---

# TanStack Time — Working time

A `WorkingCalendar` is plain shared data describing which civil minutes can be
worked. Resources point at it by `calendarId`. Availability validation, shading
and slot generation all read the same resolution.

## Model

- `WorkingCalendar`: `id`, `label?`, `parentId?`, `timeZone?`, `intervals`.
- `WorkingInterval`: `isWorking`, `recurrent?`, `startDate?`, `endDate?`,
  `startTime?`, `endTime?`. With `recurrent` it repeats weekly; without it it
  is a one-off span. `isWorking: false` closes time.
- Weekdays are ISO: `1` Monday … `7` Sunday. Times `HH:MM`, `24:00` = end of
  day. Dates `YYYY-MM-DD`. Everything is wall-clock (civil) time.

## Build calendars with blocks

```ts
import { after, between, compileSchedule, date, dateRange, dates, merge, weekday } from '@tanstack/time'
import type { WorkingCalendar } from '@tanstack/time'

const calendars: Array<WorkingCalendar> = [
  compileSchedule({
    id: 'office',
    timeZone: 'Europe/Warsaw',
    on: [
      merge(weekday('monday', 'tuesday', 'wednesday', 'thursday', 'friday'), between('08:00', '12:00')),
      merge(weekday(1, 2, 3, 4, 5), after('13:00')),
    ],
    except: [dates(['2026-12-24', '2026-12-25']), dateRange('2026-12-28', '2026-12-31')],
  }),
  compileSchedule({
    id: 'early',
    parentId: 'office',
    on: [merge(weekday(1, 2, 3, 4, 5), between('07:00', '08:00'))],
    except: [date('2026-07-03')],
  }),
]
```

- `on` compiles to `isWorking: true`, `except` to `isWorking: false`. Nested
  arrays are flattened, so `dates([...])` sits directly in the list.
- `merge()` joins fragments on different axes (weekdays, time of day, dates).
  It is not a union. Two fragments on the same axis throw. Split shifts are two
  merged entries in `on`.
- `between` throws unless end is after start; `dateRange` throws if end is
  before start. `after(t)` = `between(t, '24:00')`, `before(t)` =
  `between('00:00', t)`.
- No holiday tables ship. `except` takes the dates you supply.

## Resolution order

Intervals paint minutes open or closed; later paint wins. Ranking is by
interval type first, then hierarchy:

1. Undated recurring, 2. dated recurring, 3. one-off spans.
2. Within a tier: parent before child, resource calendar before override.
3. Then array order.

So `except: dates([...])` beats a weekly rule in `on` regardless of position,
and a parent's dated closure beats a child's weekly shift.

`parentId` layers a child over its parent: where the child paints nothing, the
parent shows through. `early` above works 07:00–12:00 and 13:00–24:00. A
missing parent ends the chain silently; a cycle throws
`Working calendar cycle: a -> b -> a`. `timeZone` comes from the nearest
calendar in the chain that sets one, and is used by slot generation only.

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
    { id: 'r2', label: 'Office room' },
  ],
})

const intervals = calendar.getWorkingIntervals(
  { start: '2026-01-05T00:00:00', end: '2026-01-06T00:00:00' },
  { resourceId: 'r1' },
)
const minutes = calendar.getWorkingMinutes('2026-01-05', { resourceId: 'r2' })
const closed = calendar.getNonWorkingMinutes('2026-01-05', { resourceId: 'r2' })
const fits = calendar.isWorkingTime(
  { start: '2026-01-05T08:00:00', end: '2026-01-05T10:00:00' },
  { resourceIds: ['r1', 'r2'], calendarId: 'office' },
)
const governing = calendar.getEffectiveCalendar({ resourceId: 'r2' })
```

- Target is `{ resourceId?, resourceIds?, calendarId? }`. A resource uses its
  own `calendarId`, else `defaultCalendarId`. The target `calendarId` is an
  override layer painted on top, not a replacement.
- `resourceIds` returns the union: a minute counts if any listed resource
  works. Availability validation applies `multiResource` (default
  `'intersection'`) separately.
- `getWorkingIntervals` returns plain date-time `{ start, end }` clipped to the
  range (end exclusive); spans meeting at midnight are joined.
- Minute results are `{ startMinutes, endMinutes }` from midnight.
- `isWorkingTime` is true only when one working span covers the whole range.

## Server side

`getWorkingTime(calendarId, range, calendars)` is the same resolution as a pure
function with no instance, no override layer. Returns `[]` for an unknown id.

```ts
import { getWorkingTime } from '@tanstack/time'

const spans = getWorkingTime('early', { start: '2026-01-05T00:00', end: '2026-01-06T00:00' }, calendars)
```

## Common mistakes

- A one-off span with times is continuous: `dateRange('2026-06-01', '2026-06-03')`
  merged with `between('10:00', '14:00')` is open Mon 10:00 through Wed 14:00.
  For a daily window add weekdays: `merge(weekday(1, 2, 3, 4, 5, 6, 7), dateRange(...), between(...))`.
- Passing `Z` or offsets in ranges: they are dropped, not converted. Pass plain
  `YYYY-MM-DDTHH:mm:ss` wall-clock values.
- Mutating `calendars` or `resources` in place: minute queries stay cached.
  Replace the array.
- No `defaultCalendarId` and no resource `calendarId`: queries report no
  working time and validation flags `no-calendar`.
- Unknown `resourceId` in a query yields no working time, although
  `getEffectiveCalendar` falls back to the default id. An empty `resourceIds`
  also yields none.
- `resourceAvailabilityFeature` and `bookingFeature` require
  `workingTimeFeature`; omitting it throws at `createCalendar`.
