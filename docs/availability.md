---
id: availability
title: Availability & Validation
---

Three features decide whether an event may sit where it is: `resourceAvailabilityFeature` checks
working hours and capacity, `schedulingConstraintFeature` checks date constraints, and
`eventDurationFeature` checks declared duration and effort. Each one answers queries and also
**vetoes writes**. See
[ADR 0004](https://github.com/TanStack/time/blob/main/docs/adr/0004-advisory-client-validation-authoritative-server-package.md)
for why client answers are only advisory.

## Setup

```ts
import {
  between,
  calendarFeatures,
  compileSchedule,
  createCalendar,
  eventDurationFeature,
  merge,
  resourceAvailabilityFeature,
  schedulingConstraintFeature,
  weekday,
  workingTimeFeature,
} from '@tanstack/time'

const calendar = createCalendar({
  features: calendarFeatures([
    workingTimeFeature,
    resourceAvailabilityFeature,
    schedulingConstraintFeature,
    eventDurationFeature,
  ]),
  timeZone: 'Europe/Warsaw',
  calendars: [
    compileSchedule({
      id: 'office',
      timeZone: 'Europe/Warsaw',
      on: [merge(weekday(1, 2, 3, 4, 5), between('09:00', '17:00'))],
    }),
  ],
  defaultCalendarId: 'office',
  resources: [
    { id: 'ana', label: 'Ana' },
    { id: 'room-a', label: 'Room A', calendarId: 'office', capacity: [1] },
  ],
})
```

`resourceAvailabilityFeature` requires `workingTimeFeature`; composing it alone throws. Working
calendars, `parentId` inheritance and `defaultCalendarId` are covered in
[Working time](./working-time).

## Resources and capacity

A `Resource` is `{ id, label, calendarId?, capacity? }`. A resource's minutes come from its `calendarId`, falling back to `defaultCalendarId`. An event's own
`calendarId` is layered on top, so an `after-hours` calendar on the event can open time the resource
calendar keeps closed.

`capacity` and an event's `consumption` are both **summed**. `capacity: [1, 2]` is three units, and
`consumption: [0, 1]` uses one. Missing `consumption` counts as `1`. Placement is blocked when the
overlapping usage plus the new event exceeds the sum; equal to capacity is allowed.

Pitfalls worth knowing:

- A resource with **no** `capacity` is never capacity-checked. Two events can overlap on it freely.
- A resource with no calendar and no `defaultCalendarId` is closed all day. Every placement on it
  fails with reason `no-calendar`.
- An event with no `resources` is never availability-checked at all.

## Multiple resources

`multiResource` on the calendar options decides how an event assigned to several resources is
judged:

- `'intersection'` (default) blocks when **any** assigned resource is unavailable.
- `'union'` blocks only when **every** assigned resource is unavailable.

The shading queries below always merge working minutes across the selected resources, so a range is
shaded only when all of them are off. Under the default policy validation can block time that is
not shaded.

## Shading unavailable time

```ts
const ranges = calendar.getUnavailableRanges('2026-10-05', { resourceIds: ['room-a'] })
const minutes = calendar.getUnavailableMinuteRanges('2026-10-05', { resourceIds: ['room-a'] })
```

`getUnavailableRanges` returns render-ready `UnavailableRange` objects: `startFraction`,
`endFraction`, percentage `top` and `height`, and `startTime`/`endTime` labels. It never emits
pixels. `getUnavailableMinuteRanges` returns plain `{ startMinutes, endMinutes }` pairs.

Omit `resourceIds` to use every resource. Both return `[]` when the calendar has no resources.

## Explaining why

```ts
const details = calendar.getUnavailabilityDetails('2026-10-05', 7 * 60, 10 * 60, {
  resourceIds: ['room-a'],
})
```

Each `UnavailabilityDetail` carries `resourceId`, `resourceLabel`, a `reason` of `'outside-hours'`,
`'capacity'` or `'no-calendar'`, and a human-readable `description`. An empty array means the span
fits. This is a working-hours check only; it does not look at other events.

For a single day span that also counts other events, use `getDaySpanConflicts`:

```ts
const conflicts = calendar.getDaySpanConflicts({
  date: '2026-10-05',
  startMinutes: 9 * 60,
  endMinutes: 10 * 60,
  eventId: 'standup',
  resourceIds: ['room-a'],
})
```

It returns every conflicting sub-range, one `AvailabilityConflict` per closed range plus one per
over-capacity resource. The event named by `eventId` is excluded from the count.

## Checking a proposal

```ts
const event = calendar.getEvents()[0]!

const conflict = calendar.checkEventAvailability(
  event,
  '2026-10-05T16:00:00',
  '2026-10-05T18:00:00',
)

const { blocked, message } = calendar.validateEventPlacement({
  title: 'Review',
  start: '2026-10-05T09:30:00',
  end: '2026-10-05T10:30:00',
  resources: ['room-a'],
  consumption: [1],
})
```

`checkEventAvailability(event, newStart, newEnd, newResources?, newConsumption?)` returns the
**first** conflict or `null`. Multi-day spans are walked day by day and the walk stops at the first
failing day. `validateEventPlacement` is the same check for an event that does not exist yet,
reduced to `{ blocked, message? }`.

Both accept resources as objects or ids. An id that matches no configured resource gets no calendar
of its own and falls back to `defaultCalendarId`.

## The AvailabilityConflict shape

```ts
interface AvailabilityConflict {
  date: string
  conflictRange: { start: string; end: string }
  resourceIds: Array<string>
  resourceDetails: Array<UnavailabilityReason>
  description: string
}
```

`conflictRange` is `HH:mm` on `date`. For capacity failures the matching `UnavailabilityReason`
also carries `capacityInfo: { max, used, remaining }`.

## Constraints

An event's `constraint` pins its start or finish:

```ts
import type { Event } from '@tanstack/time'

const event: Event = {
  id: 'launch',
  title: 'Launch',
  start: '2026-10-05T10:00:00',
  end: '2026-10-05T11:00:00',
  constraint: { type: 'finish-no-later-than', date: '2026-10-05T12:00:00' },
}

calendar.checkEventConstraint(event, '2026-10-05T12:00:00', '2026-10-05T13:00:00')
```

`type` is one of `start-no-earlier-than`, `start-no-later-than`, `finish-no-earlier-than`,
`finish-no-later-than`, `must-start-on`, `must-finish-on`. `checkEventConstraint(event, newStart?,
newEnd?, newConstraint?)` returns a conflict with `type`, `anchor`, `date` and `message`, or `null`.

A date-only `date` compares **calendar days**: `must-start-on: '2026-10-05'` accepts any start on
that day. Add a time to compare to the minute. Constraints are checked, not solved; see
[Scheduling](./scheduling).

## Duration and effort

`getWorkingDuration(event, newStart?, newEnd?)` counts **working** minutes of the span for the event's resources, not wall
clock: `07:00`–`12:00` against a `08:00` opening is `240`. With no calendar configured it falls
back to wall-clock minutes.

`checkEventDuration(event, newStart?, newEnd?, newResources?)` returns an array. An event declaring
`duration` gets `duration-mismatch` when the span's working minutes differ from it. An event
declaring `effort` gets `effort-exceeds-duration` when effort is larger than `duration` (or the
working span, if no `duration`). Events declaring neither are never checked.

## How writes are vetoed

Each feature adds a validate stage to the write pipeline. Any conflict rejects the whole write,
dependency cascades included, and nothing is applied: no partial state and no undo entry.

```ts
const result = await calendar.editEvent('launch', {
  start: '2026-10-06T10:00:00',
  end: '2026-10-06T11:00:00',
})
if (!result.success) console.log(result.error.message)
```

`addEvent` and `editEvent` return `{ success: false, error }` whose `message` describes the first
conflict. `validateMove` answers the same question without writing. `commitAdd` and `commitUpdate` return
nothing: a vetoed write there is **silently** dropped. Use them only after validating.

Write-pipeline conflicts use a small common shape, `code`, `message` and `eventIds`, where `code` is
`availability/<reason>`, `constraint/<type>` or `duration/<reason>`. `book()` returns these
directly; see [Booking](./booking).

## Client answers are advisory

Every check above runs against the events the client has loaded. It cannot see unloaded ranges or
other users' concurrent writes, so a passing check is instant feedback, **not** a guarantee.

Re-validate on the server inside the same transaction as the write, and back raw overlap with a
database constraint. `@tanstack/time` does not yet export a server-side validator for these rules;
`generateSlots` is the only pure core available today. See
[ADR 0006](https://github.com/TanStack/time/blob/main/docs/adr/0006-client-server-data-strategy.md)
for the planned client and server modes.
