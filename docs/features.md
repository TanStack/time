---
id: features
title: Features
---

A calendar instance is a small always-on core plus the features you compose into it. A feature
brings its own kernel module and its own methods; leave it out and neither the code nor the methods
are there. See [ADR 0009](https://github.com/TanStack/time/blob/main/docs/adr/0009-feature-composition-public-api.md)
for the composition model and [ADR 0001](https://github.com/TanStack/time/blob/main/docs/adr/0001-one-kernel-modules-as-pipeline-stages.md)
for the kernel underneath it.

## Creating a calendar

```ts
import { calendarFeatures, createCalendar, historyFeature } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'week' },
  timeZone: 'UTC',
  features: calendarFeatures([historyFeature]),
  events: [{ id: '1', title: 'Standup', start: '2025-06-02T09:00:00', end: '2025-06-02T09:15:00' }],
})
```

`viewMode` and `features` are **required**. There is no implicit feature set: `features: []` gives
you the core API and nothing else.

## Options

These options belong to the core. Some are only read when the matching feature is composed.

| Option                                                | Type                                                                | Read by                  |
| ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------ |
| `viewMode`                                            | `{ value: number; unit: 'month' \| 'week' \| 'day' \| 'workWeek' }` | core                     |
| `timeZone`                                            | `Temporal.TimeZoneLike`                                             | core                     |
| `locale`                                              | `Intl.UnicodeBCP47LocaleIdentifier`                                 | core                     |
| `calendar`                                            | `Temporal.CalendarLike`                                             | core                     |
| `range`                                               | `{ start: DateInput \| null; end: DateInput \| null }`              | core (navigation bounds) |
| `dateFormatter`, `timeFormatter`, `dateTimeFormatter` | `Intl.DateTimeFormat`                                               | core                     |
| `events`                                              | `Array<TEvent> \| null`                                             | core                     |
| `resources`                                           | `Array<TResource> \| null`                                          | core                     |
| `fetchEvents`                                         | `(range: { start: string; end: string }) => Promise<Array<TEvent>>` | core                     |
| `calendars`, `defaultCalendarId`, `multiResource`     | working calendars                                                   | `workingTimeFeature`     |
| `slotRules`                                           | `Array<SlotRule> \| null`                                           | `bookingFeature`         |
| `layout`                                              | `LayoutOptions`                                                     | `dayEventLayoutFeature`  |

## Composing features

`calendarFeatures` takes an array of feature factories. Pass the factory itself, not its result:

```ts
import {
  calendarFeatures,
  eventMoveFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
} from '@tanstack/time'

const features = calendarFeatures([eventRecurrenceFeature, eventResizeFeature, eventMoveFeature])
```

It is an identity function with a `const` type parameter. Its only job is to keep the tuple type
exact so the instance type can be derived from it. Order in the array does not matter.

### `stockFeatures`

`stockFeatures` is every built-in feature, as one tuple:

```ts
import { calendarFeatures, createCalendar, stockFeatures } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'month' },
  features: calendarFeatures(stockFeatures),
})
```

Membership, exactly: `historyFeature`, `eventRecurrenceFeature`, `eventDependencyFeature`,
`schedulingConstraintFeature`, `eventDurationFeature`, `eventFilterFeature`, `workingTimeFeature`,
`resourceAvailabilityFeature`, `bookingFeature`, `eventResizeFeature`, `eventMoveFeature`,
`dayEventLayoutFeature`, `timelineFeature`.

It is convenient, not free: it pulls every feature into your bundle. Compose the list by hand once
you know what the view needs.

## The instance type follows the features

Feature methods are mounted directly on the instance. The type is the intersection of what you
composed, so a method from a missing feature is **absent** at the type level:

```ts
import { calendarFeatures, createCalendar, dayEventLayoutFeature } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'day' },
  features: calendarFeatures([dayEventLayoutFeature]),
})

calendar.getEventProps(calendar.getEventsByDate('2025-06-02')[0]!)
calendar.undo()
```

The last line does not type-check: `undo` needs `historyFeature`. If you force it through with a
cast, the call throws:

```
CalendarCore: "undo" requires historyFeature. Compose it via calendarFeatures([historyFeature, ...]).
```

To name the instance type, use `Calendar`, or `CalendarApi` for just the public surface:

```ts
import type { CalendarApi } from '@tanstack/time'

type Api = CalendarApi<typeof features>
```

Pass your own event type as the third type argument and feature methods pick it up:
`createCalendar<typeof features, Resource, MyEvent>({ ... })`.

`calendar.hasFeature('history')` checks by feature name at runtime.

## Required peers

Some features build on others. Construction **throws** if a required peer is missing:

| Feature                       | Requires                                            |
| ----------------------------- | --------------------------------------------------- |
| `resourceAvailabilityFeature` | `workingTimeFeature`                                |
| `bookingFeature`              | `workingTimeFeature`, `resourceAvailabilityFeature` |
| `eventResizeFeature`          | `eventRecurrenceFeature`                            |
| `eventMoveFeature`            | `eventRecurrenceFeature`                            |

```
CalendarCore: feature "resize" requires "recurrence", which is not composed. Add it to the features option.
```

Some peers are optional. Resize and move check availability only when `resourceAvailabilityFeature`
is composed, and resize consults dependencies only when `eventDependencyFeature` is. Without them
the drag succeeds where it would otherwise block.

Two features contributing the same method name, or a feature shadowing a core method, also throw
at construction.

## The core API

Always present, whatever you compose:

- Navigation: `goToPreviousPeriod`, `goToNextPeriod`, `goToCurrentPeriod`, `goToSpecificPeriod`,
  `canGoPreviousPeriod`, `canGoNextPeriod`, `changeViewMode`.
- Reading: `getEvents`, `getEventsByDate`, `getAllDayEventsByDate`, `getDaysWithEvents`,
  `getDaysInRange`, `getDaysNames`, `groupDaysBy`, `getTimeAxisLabels`, `getTimeSlots`.
- Writing: `addEvent`, `editEvent`, `removeEvent`, `setEvents`, `setResources`, `validateMove`.
- Loading: `fetchEventsForRange`, `getLoadedRanges`.
- Formatting: `formatPeriodLabel`, `formatCurrentPeriod`, `formatPeriod`, `getDateParts`.
- State: `calendar.store`, with `currentPeriod`, `activeDate`, `viewMode`, `eventsVersion` and
  `isPending`.

`setEvents` rebuilds the kernel and every feature from scratch. Undo history and registered event
filters do **not** survive it.

## `historyFeature`

Undo and redo for every write that goes through the kernel.

```ts
import { calendarFeatures, createCalendar, historyFeature } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'week' },
  features: calendarFeatures([historyFeature]),
})

await calendar.addEvent({
  id: 'e1',
  title: 'E',
  start: '2025-06-02T09:00:00',
  end: '2025-06-02T10:00:00',
})

calendar.canUndo()
calendar.undo()
calendar.canRedo()
calendar.redo()
```

`undo` and `redo` are no-ops when there is nothing to undo or redo.

## `eventFilterFeature`

Named visibility predicates. Every registered filter must pass, so filters combine with AND.

```ts
import { calendarFeatures, createCalendar, eventFilterFeature } from '@tanstack/time'
import type { Event, Resource } from '@tanstack/time'

type TaggedEvent = Event & { categoryId?: string }

const work: TaggedEvent = {
  id: 'work',
  title: 'Work',
  start: '2025-06-02T09:00:00',
  end: '2025-06-02T10:00:00',
  categoryId: 'work',
}

const features = calendarFeatures([eventFilterFeature])

const calendar = createCalendar<typeof features, Resource, TaggedEvent>({
  viewMode: { value: 1, unit: 'day' },
  features,
  events: [work],
})

calendar.setEventFilter('category', (event) => event.categoryId === 'work')
calendar.setEventFilter('search', (event) => event.title.startsWith('P'))
calendar.setEventFilter('search', null)

calendar.getEventFilterIds()
calendar.isEventVisible(work)
calendar.getHiddenEvents()
calendar.clearEventFilters()
```

Passing `null` removes that filter. Filters hide, they do not delete: `getEventsByDate` and the day
lists drop hidden events, but `getEvents` still returns them. Hidden events take no layout space in
`getEventProps`, and filters apply to expanded recurrence occurrences.

## Feature reference

| Feature                       | Adds                                                                                                                                                                | Docs                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `workingTimeFeature`          | `getEffectiveCalendar`, `getWorkingIntervals`, `getWorkingMinutes`, `getNonWorkingMinutes`, `isWorkingTime`                                                         | [Working time](./working-time) |
| `resourceAvailabilityFeature` | `getUnavailableRanges`, `getUnavailableMinuteRanges`, `getUnavailabilityDetails`, `getDaySpanConflicts`, `checkEventAvailability`, `validateEventPlacement`         | [Availability](./availability) |
| `schedulingConstraintFeature` | `checkEventConstraint`                                                                                                                                              | [Availability](./availability) |
| `eventDurationFeature`        | `getWorkingDuration`, `checkEventDuration`                                                                                                                          | [Availability](./availability) |
| `eventDependencyFeature`      | `createDependency`, `validateEventDependencies`, `getPredecessorShifts`, `getDependentShifts`, `getAffectedByDelta`, `findViolatedDependency`, `getAnchorConflicts` | [Scheduling](./scheduling)     |
| `eventRecurrenceFeature`      | `getMasterEvent`, `resolveOccurrence`, `goToNextOccurrence`, `goToPreviousOccurrence`, `editRecurringEvent`, `removeRecurringEvent`                                 | [Recurrence](./recurrence)     |
| `eventMoveFeature`            | `createMoveController`, `validateEventMove`                                                                                                                         | [Interaction](./interaction)   |
| `eventResizeFeature`          | `createResizeController`, `getEventSegmentInfo`, `validateResize`                                                                                                   | [Interaction](./interaction)   |
| `dayEventLayoutFeature`       | `getEventProps`                                                                                                                                                     | [Interaction](./interaction)   |
| `timelineFeature`             | `getEventsByResource`, `getTimelineLayout`                                                                                                                          | [Timeline](./timeline)         |
| `bookingFeature`              | `getSlotRules`, `getSlots`, `book`, `hold`                                                                                                                          | [Booking](./booking)           |
| `historyFeature`              | `undo`, `redo`, `canUndo`, `canRedo`                                                                                                                                | this page                      |
| `eventFilterFeature`          | `setEventFilter`, `clearEventFilters`, `getEventFilterIds`, `isEventVisible`, `getHiddenEvents`                                                                     | this page                      |
