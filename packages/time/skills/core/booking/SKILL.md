---
name: booking
description: >
  Appointment booking and slot generation in TanStack Time. Load when working
  with SlotRule, bookingFeature, calendar.getSlots, calendar.book,
  calendar.hold, generateSlots on a server, compileSchedule working calendars,
  minNotice, maxHorizon, buffers, capacity, unbackedRanges, or DST behavior of
  bookable slots.
metadata:
  type: sub-skill
  library: '@tanstack/time'
  library_version: '0.0.0'
requires:
  - '@tanstack/time#core'
sources:
  - 'TanStack/time:docs/booking.md'
  - 'TanStack/time:docs/adr/0011-slot-rules-and-booking.md'
---

# TanStack Time — Booking

`checkAvailability` asks whether one proposed event fits. `generateSlots` and
`calendar.getSlots` enumerate what fits.

## Model

- A `WorkingCalendar` says which minutes are workable.
- A `SlotRule` references one calendar by `calendarId` and adds only
  discretisation: `duration`, `step`, `bufferBefore`, `bufferAfter`,
  `minNotice`, `minNoticeIsWorkingTime`, `maxHorizon`, `resourceIds`,
  `capacity`.
- A `SlotRule` has no recurrence. Repetition belongs to the calendar.

## Build calendars with compileSchedule

```ts
import { between, compileSchedule, dates, merge, weekday } from '@tanstack/time'

const calendars = [
  compileSchedule({
    id: 'clinic-mornings',
    timeZone: 'Europe/Warsaw',
    on: [merge(weekday('monday', 'wednesday'), between('08:00', '10:00'))],
    except: dates(['2026-12-24', '2026-12-25']),
  }),
  compileSchedule({
    id: 'clinic-afternoons',
    timeZone: 'Europe/Warsaw',
    on: [merge(weekday('monday', 'wednesday'), between('12:00', '16:00'))],
  }),
]
```

Use one calendar per slot granularity. Adjacent intervals in one calendar
merge (`08:00–10:00` + `10:00–12:00` → `08:00–12:00`) and the boundary is lost.

`merge()` combines fragments on different axes. It throws when two fragments
constrain the same axis: `merge(between(...), between(...))` is a caller error.

## Generate and book

```ts
import {
  add,
  bookingFeature,
  calendarFeatures,
  createCalendar,
  resourceAvailabilityFeature,
  workingTimeFeature,
} from '@tanstack/time'

const calendar = createCalendar({
  features: calendarFeatures([workingTimeFeature, resourceAvailabilityFeature, bookingFeature]),
  timeZone: 'Europe/Warsaw',
  calendars,
  slotRules: [
    { id: 'consult', calendarId: 'clinic-mornings', duration: 60, resourceIds: ['dr-a'] },
  ],
  resources: [{ id: 'dr-a', label: 'Dr A' }],
})

const now = new Date()
const { slots, unbackedRanges, truncated } = calendar.getSlots({
  start: now,
  end: add(now, { duration: { days: 30 } }),
  now,
})

const result = calendar.book(slots[0], { id: 'booking-1', title: 'Consult', resourceId: 'dr-a' })
if (!result.success) result.conflicts
```

- `step` defaults to `duration`. The grid anchors to the window start; slots
  that overflow the window are not generated.
- One slot per `(rule, start)`, with `availableResourceIds` and
  `remainingCapacity`.
- `book()` returns `{ success: false, conflicts }` on a lost race. It does not
  throw. Handle the result.
- `hold(slot, { ..., expiresAt })` creates an event with an expiry. Nothing
  removes lapsed holds; the consumer must.
- `truncated: true` means the list is a prefix. Do not present it as complete.

## Time and DST

- Pass `now` explicitly. The core never reads the clock for rule limits.
- Civil minutes win: `09:00–17:00` at 30 minutes is 16 slots on every date.
- Slots starting in a spring-forward gap are not generated. The fall-back hour
  yields two slots with the same wall-clock label and different instants. Key
  slots by instant, never by label.
- Zone resolution: `WorkingCalendar` → `parentId` chain → instance `timeZone`.

## Client answers are advisory

The client has partial data. `unbackedRanges` lists ranges where events were
needed but not loaded; slots there are optimistic. Never treat a client
`book()` success as final. Re-check on the server inside the write transaction:

```ts
import { generateSlots } from '@tanstack/time'

const { slots } = generateSlots({
  rules,
  range,
  now,
  timeZone,
  calendars,
  resources: await loadResources(),
  events: await loadEvents(requiredRange),
})
```

## Not supported

Interval or set-position recurrence ("every other Tuesday", "first Monday of
the month") cannot be expressed as a `SlotRule`. Do not fake it with extra
rules.
