---
id: booking
title: Booking & slot rules
---

Slot generation answers the inverse of the availability check. `checkAvailability` takes one
proposed event and asks *does this fit*; `generateSlots` enumerates *what fits*. See
[ADR 0011](https://github.com/TanStack/time/blob/main/docs/adr/0011-slot-rules-and-booking.md) for
why this is its own layer rather than a field on `WorkingInterval`.

## A Slot Rule is not a Working Calendar

A `WorkingCalendar` (ADR 0008) says which *minutes* are workable — a continuous predicate the
solver, the skew walkers and validation all consume. A `SlotRule` says where the *bookable
boundaries* fall inside those minutes. It references a calendar and adds only the discretisation:

```ts
interface SlotRule {
  id: string
  calendarId: string
  duration: number
  step?: number
  bufferBefore?: number
  bufferAfter?: number
  minNotice?: number
  minNoticeIsWorkingTime?: boolean
  maxHorizon?: number
  resourceIds?: Array<string>
  capacity?: number
}
```

A Slot Rule carries **no recurrence of its own**. Repetition is the calendar's, so holidays and
closures resolve through the same hierarchy that validation uses.

## Building the window

Compile the calendar from ADR 0010's blocks rather than hand-writing intervals:

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
    except: dates(['2026-12-24', '2026-12-25']),
  }),
]
```

### Why two calendars, not one

This is the part readers get wrong on first contact. `resolveLayeredDayMinutes` runs
`mergeMinuteRanges`, so two adjacent intervals in **one** calendar fuse into a single opening: an
`08:00`–`10:00` and a `10:00`–`12:00` pair resolve to one `08:00`–`12:00` range, and the boundary
that separated the two granularities is gone before slot generation ever sees it.

One calendar per granularity. Non-adjacent windows (`08:00`–`10:00` and `12:00`–`16:00`) would
survive in one calendar, but keeping the rule-to-calendar mapping one-to-one is what makes the
model predictable.

`weekday()` with no time fragment compiles to the full civil day. `merge()` combines fragments
constraining *different* axes and throws when two constrain the same one — `merge(between('08:00',
'12:00'), between('13:00', '17:00'))` is a caller error, not a union.

## Generating slots

```ts
const slotRules = [
  { id: 'consult', calendarId: 'clinic-mornings', duration: 60, resourceIds: ['dr-a'] },
  { id: 'checkup', calendarId: 'clinic-afternoons', duration: 30, step: 15,
    resourceIds: ['dr-a', 'dr-b'] },
]

const calendar = createCalendar({
  features: calendarFeatures([workingTimeFeature, resourceAvailabilityFeature, bookingFeature]),
  timeZone: 'Europe/Warsaw',
  calendars,
  slotRules,
  resources: [{ id: 'dr-a', label: 'Dr A' }, { id: 'dr-b', label: 'Dr B' }],
})

const { slots, unbackedRanges, truncated } = calendar.getSlots({
  start: new Date(),
  end: add(new Date(), { duration: { days: 30 } }),
})
```

`step` defaults to `duration`, giving back-to-back slots. A smaller `step` gives rolling
candidates: 30-minute appointments offered every 15 minutes.

The grid **anchors to the window start** and a slot that would overflow the window is not
generated. An `08:15`–`10:00` window at 30 minutes yields `08:15`, `08:45`, `09:15` and stops.

Every returned slot is free: generation subtracts existing events, live holds and buffers, and
respects per-resource capacity. One slot exists per `(rule, start)` regardless of resource count,
carrying `availableResourceIds` and `remainingCapacity`.

## Booking

```ts
const result = calendar.book(slot, { id: 'booking-1', title: 'Consult', resourceId: 'dr-a' })

if (!result.success) {
  console.log(result.conflicts[0]?.message)
}
```

`book()` writes through the kernel pipeline, so the availability, constraint and duration validate
stages can veto it, and undo/redo works. Losing a race is a normal outcome, not an exception — it
returns a result rather than throwing.

### Holds

A hold is an event with an expiry, not a separate entity:

```ts
calendar.hold(slot, {
  id: 'hold-1',
  title: 'Checkout',
  expiresAt: new Date(Date.now() + 10 * 60_000),
})
```

Generation subtracts it like any booking and stops once `now` passes the expiry. Nothing reaps
lapsed holds from the event collection — that is the consumer's job.

## Time-relative limits

`minNotice` and `maxHorizon` live on the rule; `now` is an argument, never a clock read inside the
core. That keeps client and server answers identical and the core table-testable.

Set `minNoticeIsWorkingTime` to measure notice in **working** minutes: "four business hours'
notice" is not four hours, and it walks the rule's own calendar via `addWorkingMinutes`.

`maxHorizon` (in days from today) clamps the far end of the range and bounds enumeration. If the
slot cap is hit, `truncated` is `true` — the list is a prefix, not the whole answer.

## DST

Civil minutes win. A `09:00`–`17:00` rule is sixteen half-hour slots on every date, because the
business means "nine to five local", not "eight elapsed hours". Consequences worth knowing:

- A slot whose start falls inside a spring-forward gap is **not generated**.
- On fall-back, the repeated hour yields **two** slots at two distinct instants — both real, both
  bookable, and both rendering with the same wall-clock label.
- `endEpochMs - startEpochMs` is always exactly `duration`, so a 30-minute appointment is 30
  minutes of real time even across a transition.

The zone comes from the `WorkingCalendar`, inherited down the `parentId` chain, falling back to the
instance `timeZone`. This is what lets one core serve providers in two zones.

## Client answers are advisory

The client holds a partial dataset and cannot see other users' concurrent writes, so
`getSlots`/`book` are **Advisory** — two bookers can see the same free slot.

`getSlots` returns `unbackedRanges`: the parts of the range it needed events for but that were
never loaded. Slots there are optimistic. Without this the failure is silent and looks exactly like
a working booking engine until someone double-books.

The authoritative path is the same pure core. `src/slots/` imports nothing from the kernel, the
store or the DOM, so your server can run `generateSlots` inside its own write transaction against
the full dataset:

```ts
import { generateSlots } from '@tanstack/time'

const { slots } = generateSlots({
  rules, range, now, timeZone, calendars,
  resources: await loadResources(),
  events: await loadEvents(requiredRange),
})
```

This does not require ADR 0006's `client | server` Data Strategy — it is a plain import.

## Not covered

Interval and set-position recurrence ("every other Tuesday", "first Monday of the month") is not
expressible as a Slot Rule. `RecurrentWorkingInterval` has nowhere to record a period or an anchor;
see ADR 0010. That belongs with the recurrence engine, not here.
