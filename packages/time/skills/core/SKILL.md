---
name: core
description: >
  Entry skill for @tanstack/time, the headless calendar engine. Load first when
  calling createCalendar, composing calendarFeatures / stockFeatures, resolving
  feature requires errors, using historyFeature or eventFilterFeature, reading
  getDaysWithEvents / getDaysInRange, or date helpers (add, subtract, startOf,
  format); routes to working-time, availability, booking, scheduling,
  recurrence, interaction and timeline sub-skills.
metadata:
  type: core
  library: '@tanstack/time'
  library_version: '0.0.0'
sources:
  - 'TanStack/time:docs/features.md'
  - 'TanStack/time:docs/overview.md'
  - 'TanStack/time:docs/quick-start.md'
---

# TanStack Time — Core

`@tanstack/time` owns time math and calendar state. It renders nothing. An
instance is an always-on core plus the features you compose into it.

## Create a calendar

```ts
import { calendarFeatures, createCalendar, historyFeature } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'week' },
  timeZone: 'UTC',
  features: calendarFeatures([historyFeature]),
  events: [{ id: '1', title: 'Standup', start: '2025-06-02T09:00:00', end: '2025-06-02T09:15:00' }],
})

const days = calendar.getDaysWithEvents()
const june = calendar.getDaysInRange('2025-06-01', '2025-06-30')
calendar.goToNextPeriod()
```

- `viewMode` and `features` are required. `unit` is `'month' | 'week' | 'day' | 'workWeek'`.
- Pass `timeZone` explicitly. It is optional in the type, but results depend on it.
- `features: []` is valid and gives only the core API.

## Composing features

`calendarFeatures` takes an ARRAY of feature factories (pass the factory, not a
call result). Order does not matter. It exists only to keep the tuple type exact.

`stockFeatures` is every built-in feature: `historyFeature`,
`eventRecurrenceFeature`, `eventDependencyFeature`, `schedulingConstraintFeature`,
`eventDurationFeature`, `eventFilterFeature`, `workingTimeFeature`,
`resourceAvailabilityFeature`, `bookingFeature`, `eventResizeFeature`,
`eventMoveFeature`, `dayEventLayoutFeature`, `timelineFeature`. It pulls all of
them into the bundle; compose by hand for production.

Required peers. Construction throws if one is missing:

| Feature                       | Requires                                            |
| ----------------------------- | --------------------------------------------------- |
| `resourceAvailabilityFeature` | `workingTimeFeature`                                |
| `bookingFeature`              | `workingTimeFeature`, `resourceAvailabilityFeature` |
| `eventMoveFeature`            | `eventRecurrenceFeature`                            |
| `eventResizeFeature`          | `eventRecurrenceFeature`                            |

The instance type is the intersection of composed features. A method from a
missing feature is absent at the type level (`calendar.undo()` without
`historyFeature` does not compile; forcing it with a cast throws at runtime).
Use `calendar.hasFeature('history')` for a runtime check by feature name. Name
the type with `Calendar<typeof features>` or `CalendarApi<typeof features>`;
pass a custom event type as the third generic of `createCalendar`.

## historyFeature and eventFilterFeature

```ts
import { calendarFeatures, createCalendar, eventFilterFeature, historyFeature } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'day' },
  timeZone: 'UTC',
  features: calendarFeatures([historyFeature, eventFilterFeature]),
})

await calendar.addEvent({ id: 'e1', title: 'Plan', start: '2025-06-02T09:00:00', end: '2025-06-02T10:00:00' })
if (calendar.canUndo()) calendar.undo()

calendar.setEventFilter('search', (event) => event.title.startsWith('P'))
calendar.setEventFilter('search', null)
calendar.clearEventFilters()
```

- History: `undo`, `redo`, `canUndo`, `canRedo`. Undo/redo are no-ops when empty.
- Filters: named predicates, combined with AND. `null` removes one. Filters hide,
  not delete: `getEventsByDate` and day lists drop hidden events, `getEvents`
  still returns them. Also `getEventFilterIds`, `isEventVisible`, `getHiddenEvents`.
- `setEvents` rebuilds the kernel and every feature. Undo history and registered
  filters are lost. Use `addEvent` / `editEvent` / `removeEvent` for edits.

## Date helpers

```ts
import { add, format, startOf } from '@tanstack/time'

const later = add(new Date(), { duration: { days: 30 }, timeZone: 'UTC' })
const monthStart = startOf(later, { unit: 'month', timeZone: 'UTC' })
const label = format(monthStart, { timeZone: 'UTC' })
```

Temporal-backed. Also `subtract`, `endOf`, `round`, `clamp`, `range`, `isBefore`,
`isAfter`, `isBetween`, `equals`, `min`, `max`.

## Sub-skills

| Load                                 | When                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `@tanstack/time#core/working-time`   | `workingTimeFeature`, working calendars, `compileSchedule`, `isWorkingTime` |
| `@tanstack/time#core/availability`   | `resourceAvailabilityFeature`, constraints, `eventDurationFeature`, placement validation |
| `@tanstack/time#core/booking`        | `bookingFeature`, `slotRules`, `getSlots` / `book` / `hold`, `generateSlots` |
| `@tanstack/time#core/scheduling`     | `eventDependencyFeature`, `createDependency`, dependency shifts            |
| `@tanstack/time#core/recurrence`     | `eventRecurrenceFeature`, recurring edits, occurrences                     |
| `@tanstack/time#core/interaction`    | `eventMoveFeature`, `eventResizeFeature`, `dayEventLayoutFeature`, `getEventProps` |
| `@tanstack/time#core/timeline`       | `timelineFeature`, `getEventsByResource`, `getTimelineLayout`              |

Framework code: React → `@tanstack/react-time#react`, Solid → `@tanstack/solid-time#solid`.

## Common mistakes

- Calling `calendar.getDays()`. It does not exist; use `getDaysWithEvents()` or `getDaysInRange(start, end)`.
- `calendarFeatures(historyFeature)` or `calendarFeatures([historyFeature()])`. Pass an array of factories.
- Omitting `viewMode` or `features`. Both are required; there is no default feature set.
- Composing `bookingFeature` or `eventMoveFeature` without its required peers. Construction throws.
- Casting to reach a method of an uncomposed feature. Compose the feature instead.
- Calling `setEvents` for a single change. It wipes undo history and filters.
- Inventing `addDays` / `addMonths`. Only `add(date, { duration })` exists.
- Importing hooks from `@tanstack/time`. Hooks live in the adapter packages.
