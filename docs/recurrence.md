---
id: recurrence
title: Recurrence
---

A recurring event is one stored event, the **master**, with a `recurrence` rule. The calendar never
stores its occurrences. `eventRecurrenceFeature` expands them for the visible window on every read
and turns occurrence edits into writes against the master.

## Setup

```ts
import {
  calendarFeatures,
  createCalendar,
  eventRecurrenceFeature,
  historyFeature,
} from '@tanstack/time'
import type { Event } from '@tanstack/time'

const events: Array<Event> = [
  {
    id: 'standup',
    title: 'Standup',
    start: '2025-06-02T09:00:00',
    end: '2025-06-02T09:15:00',
    recurrence: { frequency: 'weekly', byWeekday: [1, 2, 3, 4, 5] },
  },
]

const calendar = createCalendar({
  features: calendarFeatures([historyFeature, eventRecurrenceFeature]),
  viewMode: { value: 1, unit: 'week' },
  timeZone: 'Europe/Warsaw',
  events,
})
```

Without the feature, a master renders **once**, on its own start date. `eventResizeFeature` and
`eventMoveFeature` require it; see [Features](./features).

## The rule

```ts
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  until?: string
  count?: number
  byWeekday?: Array<number>
  exDates?: Array<EventDateTimeInput>
  overrides?: Array<RecurrenceOverride>
}
```

- `interval` defaults to `1`. `{ frequency: 'weekly', interval: 2 }` is every other week.
- `byWeekday` applies to `weekly` only. `1` is Monday, `7` is Sunday. It defaults to the master's
  weekday.
- `until` is a date, and it is **exclusive**. `until: '2025-06-16'` stops before the 16th.
- `count` counts every generated occurrence, including those removed by `exDates`. If you set
  `until`, `count` is ignored.
- `monthly` and `yearly` repeat the master's day of month and clamp it. A series on Jan 31 gives
  Feb 28, then Mar 31. `yearly` from Feb 29 gives Feb 28 in other years.

Every occurrence keeps the master's wall-clock time and duration. The master start is always the
first occurrence, even if its weekday is not in `byWeekday`.

### Not supported

There is no RRULE string parser and no `.ics` import or export. The rule has no by-month-day,
set-position or by-year-day fields, so "2nd Tuesday of the month" and "last weekday" are not
expressible. Working-hours repetition is a different model; see [Working time](./working-time) and
[ADR 0010](https://github.com/TanStack/time/blob/main/docs/adr/0010-schedule-rule-blocks.md).

## Exceptions and overrides

`exDates` removes occurrences. `overrides` changes them. Both match an occurrence by its **original**
start:

```ts
const standup: Event = {
  id: 'standup',
  title: 'Standup',
  start: '2025-06-02T09:00:00',
  end: '2025-06-02T09:15:00',
  recurrence: {
    frequency: 'weekly',
    byWeekday: [1, 2, 3, 4, 5],
    exDates: ['2025-06-11T09:00:00'],
    overrides: [
      {
        originalStart: '2025-06-10T09:00:00',
        start: '2025-06-10T11:00:00',
        end: '2025-06-10T11:15:00',
        title: 'Standup (moved)',
      },
    ],
  },
}
```

A date-only value such as `'2025-06-11'` matches any occurrence on that day. A date-time value
matches only that exact start. An override with `start` but no `end` keeps the series duration. Any
other field on an override (`title`, `resources`, custom fields) replaces the master's value for
that occurrence only. Set `id` on an override to give the occurrence a stable id.

## Expansion

Occurrences are generated only for the requested window. `getEventsByDate` returns expanded
occurrences. `getEvents()` returns the stored masters.

Each occurrence is a copy of the master with its own `start` and `end`, plus three read-only tags:

| Field | Value |
| --- | --- |
| `_recurringMasterId` | The master's `id` |
| `_occurrenceIndex` | Position in the series, starting at `0` |
| `_occurrenceOriginalStart` | The start before any override |

The first occurrence has the master's `id`. Later ones are `${masterId}_${index}`. Do not give your
own events ids ending in `_<digits>`: the feature reads such an id as an occurrence and resolves
the master by removing the suffix.

An occurrence that starts before the window but ends inside it is included. Expansion steps from
the master start and stops after 3,650 steps, so a daily series renders for about ten years.

## Time zones and DST

Occurrences are **civil** date-times, with no offset. The rule is expanded on the wall clock, so a
`09:00` standup is `09:00` on both sides of a DST transition. Duration is also measured on the wall
clock: a 60-minute event stays 09:00–10:00.

The instance `timeZone` does not move occurrences. A `Z` or `+02:00` suffix on an input string is discarded and the wall-clock part is kept.
`Date` inputs are read with the runtime's local getters. Store starts as plain date-time strings to
get the same result in every environment.

## Editing a series

`editRecurringEvent` takes an event id (master or occurrence), the updates and a scope:

```ts
const result = await calendar.editRecurringEvent(
  'standup_1',
  { start: '2025-06-03T15:00:00', end: '2025-06-03T15:15:00', title: 'Moved' },
  { scope: 'this', occurrenceStart: '2025-06-03T09:00:00' },
)

if (!result.success) {
  console.log(result.error.message)
}
```

`occurrenceStart` is the occurrence's **original** start. Pass `_occurrenceOriginalStart` from the
occurrence, not its `start`, because an override can change `start`. If you omit it, the master's
start is used.

| Scope | Effect |
| --- | --- |
| `'this'` | Adds or replaces an override on the master. |
| `'thisAndFollowing'` | Ends the master with `until` at the occurrence's date and adds a new master from that occurrence. |
| `'all'` | Applies `updates` to the master as they are. |

With `'thisAndFollowing'`, the new master gets a new id derived from the master id and the
occurrence start. It keeps the later `exDates` and `overrides` and the remaining `count`. Include
`recurrence` in `updates` to give it a different rule. On the first occurrence, the master is
edited in place, and only that occurrence's own override is removed.

With **`'all'`**, `start` and `end` are written to the master. If you pass an occurrence's new
times, the whole series moves to begin on that occurrence's date. To change only the time of day,
compute new times from the master's `start` and `end`.

For `'this'` and `'thisAndFollowing'`, the edit first loads the old and new ranges through
`fetchEvents`. It checks `dependsOn` if you pass it (see [Scheduling](./scheduling)). If `start`,
`end`, `resources` or `consumption` change, it validates placement with
`resourceAvailabilityFeature` when that is composed (see [Availability](./availability)). A rejected edit returns `{ success: false, error }` and changes
nothing. An `occurrenceStart` that is not in the series returns
`Occurrence "<start>" not found.`

## Removing

```ts
calendar.removeRecurringEvent('standup_1', {
  scope: 'this',
  occurrenceStart: '2025-06-03T09:00:00',
})
```

`'this'` adds an entry to `exDates` and removes that occurrence's override. `'thisAndFollowing'`
sets `until` on the master; on the first occurrence it removes the master. `'all'` removes the
master. `removeRecurringEvent` returns nothing.

## Navigation and lookup

```ts
calendar.goToNextOccurrence('standup')
calendar.goToPreviousOccurrence('standup', '2025-06-16')

const [occurrence] = calendar.getEventsByDate('2025-06-10')
const master = occurrence ? calendar.getMasterEvent(occurrence) : undefined
const resolved = calendar.resolveOccurrence('standup', '2025-06-10T09:00:00')
```

`goToNextOccurrence` searches from the active date, or from `fromDate`, up to four years ahead.
`resolveOccurrence` returns the occurrence with overrides applied.

## Drag and resize

Move and resize controllers call `editRecurringEvent` when a drag starts with `occurrenceStart`.
Pass `recurrenceScope` to choose the scope. Otherwise, set `onRecurringMoveEnd` or
`onRecurringResizeEnd` to ask the user first. If you set neither, the scope is `'this'`. See
[Interaction](./interaction).

## Undo and redo

With `historyFeature`, one edit or remove is **one** undo step, including a
`'thisAndFollowing'` split. The history records the result (the master update and the added
master), so undo restores the original master and removes the new one together. Redo applies the
same result again. It does not evaluate the rule again.
