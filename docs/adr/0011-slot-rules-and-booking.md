# Slot rules generate bookings; they are not working-time intervals

## Status

accepted

## Context

The booking use case ("Mondays 08:00-10:00 in one-hour units, 12:00-16:00 in half-hour units, with
repetition and holidays honoured") is `generateSlots` on the Phase 3 roadmap, and it is the
Scheduler product's whole reason to exist. Nothing in the library answers it today.

Two things in the codebase look like they should already cover it and do not.

`getTimeSlots` (`src/calendar/getTimeSlots.ts`) owns the name but builds a *display grid* — locale
formatted hour labels for a day column. It knows nothing about events, resources or capacity.

`WorkingCalendar` (ADR 0008) covers the recurring-window half and nothing else. Its
`WorkingInterval` is `{ weekdays, startTime, endTime, isWorking }`: a continuous predicate over
minutes, consumed by `resolve.ts`, the skew walkers, the solver and `checkAvailability`. There is
nowhere in it to record a slot length, and the example above needs *two different lengths on the
same day* — so it cannot be a call-site parameter either.

The third near-miss is `checkAvailability`, which is the veto side: it takes one proposed event and
asks "does this fit". Slot generation is the enumerating inverse — "what fits" — so it shares
concepts with that code but cannot reuse its entry point.

## Decision

- **A `SlotRule` is its own stored type, not a `WorkingInterval` field.** It carries
  `{ calendarId, duration, step, bufferBefore, bufferAfter, minNotice, maxHorizon, resourceIds?,
  capacity? }`. The window, its weekly repeat and its exceptions come from the referenced
  `WorkingCalendar`; the rule adds only the discretisation. `WorkingCalendar` keeps answering
  "which minutes are workable" for the solver, the skew walkers and validation, with no fields
  those consumers must ignore.
- **A Slot Rule has no recurrence of its own.** Repetition is the calendar's, expressed with ADR
  0010's `weekday()`/`between()` blocks and `compileSchedule`, so holidays and closures resolve
  through the ADR 0008 hierarchy exactly as they do for validation. This inherits ADR 0010's
  limitation deliberately: weekday-of-week only, no "every other Tuesday", no "first Monday of the
  month" until Phase 4 recurrence work.
- **`step` defaults to `duration`; the grid anchors to the window start; overflowing slots are not
  generated.** A smaller `step` yields rolling, overlapping candidates. An `08:15-10:00` window at
  30 minutes yields `08:15/08:45/09:15` and stops. Anchoring to a midnight wall-clock grid was
  rejected: it silently makes declared availability unbookable and never offers the start the
  author typed. Allowing overflow was rejected harder: it would offer a slot that
  `checkAvailability` then vetoes as outside-hours.
- **One Slot per `(rule, start)`, carrying `availableResourceIds` and `remainingCapacity`.** Not the
  resource cross product — a picker asks "is 09:00 bookable", and the per-resource view groups by
  `availableResourceIds`. `WorkingTimeConfig.multiResource` stays a validation-side setting; slot
  generation is union by construction.
- **Slots are free by construction.** Generation subtracts existing events, holds and buffers, and
  respects capacity, so an offered Slot is a bookable one. A candidate-with-status list was
  rejected because in server mode it leaks occupancy the booker may not be entitled to see.
- **`now` is an explicit input; the core never reads the clock.** `minNotice` and `maxHorizon` live
  on the rule. This keeps the core table-testable and keeps client and server answers identical,
  which is the whole premise of ADR 0004 — and it lets `minNotice` be expressed in *working*
  minutes via `addWorkingMinutes` ("four business hours' notice" is not four hours), which a
  consumer filtering the result list cannot easily do.
- **Buffers live on the Slot Rule, and `Resource.buffer` becomes live as a floor.** Padding is
  usually a property of the service, not the person; a resource-level minimum (this room needs
  twenty minutes' cleaning after anything) still exists, and generation takes the max of the two.
  `Resource.buffer` is currently declared in `src/calendar/types.ts` and read nowhere.
- **`timeZone` moves onto `WorkingCalendar`, inherited down the `parentId` chain.** A calendar
  describes a *place's* working time, so `08:00` means eight in the morning there. It defaults to
  the instance `timeZone` when absent. Without this, one core cannot serve providers in two zones.
  Putting the zone on the `Resource` was rejected: the same rule would then yield different
  instants per resource, which breaks the one-Slot-per-`(rule, start)` shape.
- **Civil minutes win across DST.** A `09:00-17:00` rule is sixteen half-hour slots on every date,
  because the business means "nine to five local", not "eight elapsed hours". Slots starting inside
  a spring-forward gap are not generated; on fall-back the repeated hour yields two slots at two
  distinct instants, both real and both bookable. Consequence worth stating because callers would
  otherwise guess: slot *count* varies by date, and twice a year two slots render with the same
  wall-clock label.
- **The pure core is `src/slots/`, added to `PURE_DIRS`.** Not inside `src/workingTime/`, which
  would then depend on the event collection when nothing else there does; not inside
  `src/validation/availability/`, which answers the veto question.
- **`bookingFeature`, not `schedulingFeature`.** "Scheduling" is taken twice over: ADR 0007's solver
  contributes a pipeline stage named `schedule`, and ADR 0010 owns `compileSchedule` /
  `resolveScheduleDay`. Rules reach it through a new `slotRules` entry on the calendar options,
  where `workingTime` already lives, so editing a rule re-derives slots the way editing a calendar
  re-derives working time.
- **`book()` writes through the kernel write pipeline** and returns
  `{ success: true; event } | { success: false; conflicts }`. It reuses `SaveEventResult`'s
  discriminated shape but carries `AvailabilityConflict` data rather than `ResizeError`, because a
  picker needs to say *why* (taken / outside hours / capacity). Losing a race is a normal outcome,
  not an exception, so it does not throw.
- **A Hold is an event with an expiry, not a new entity.** Generation subtracts it like any booking
  and stops once `now` passes the expiry — which works precisely because `now` is already an
  explicit input. Confirming a hold is an edit, not a second write path.
- **Client booking is Advisory; `src/slots/` is the authoritative story.** The consumer's server
  imports the same pure core and re-runs it inside its own write transaction against the full
  dataset via the `loadEvents` adapter — the Validation Core pattern ADR 0004 already defines. This
  deliberately does **not** wait on ADR 0006's `client | server` Data Strategy machinery.
- **Generation declares what it needed.** The result carries the Required Range it read events for,
  so the feature can compare that against what is loaded and return `unbackedRanges` alongside the
  slots. Without this the failure is silent and looks exactly like a working booking engine until
  someone double-books. The range argument is required, clamped by `maxHorizon`, and a hard slot
  cap truncates *and says so* rather than returning a silent prefix.
- **`getTimeSlots` is renamed `getTimeAxisLabels`.** Two unrelated public exports both called
  "slots" is worse than one pre-1.0 rename.

## Considered Options

- **Slot granularity as a field on `WorkingInterval`.** Rejected: it puts fields on a type that
  `resolve.ts`, `skew.ts`, the solver and `checkAvailability` must all ignore, and the resolver's
  most-specific-wins minute painting has no defined meaning for a duration when a child calendar
  overrides the parent's minutes but not its granularity.
- **Granularity as a `generateSlots` parameter only.** Rejected because it cannot express the
  motivating example: one duration per call makes 08:00-10:00 at one hour and 12:00-16:00 at half
  an hour two separate calls the consumer merges, with nothing durable recording the pairing.
- **A recurrence model on the Slot Rule**, or reuse of `src/recurrence/`. The former adds a third
  recurrence model to the codebase and needs its own exception mechanism, having left the calendar
  hierarchy. The latter is event-shaped throughout — `expandRecurringEvent<TEvent>`,
  `masterIdOf(eventId)`, overrides keyed by RECURRENCE-ID — so a window would have to be passed
  through it as a fake event. Revisit when biweekly or monthly-ordinal rules are actually needed;
  ADR 0010 already points at Phase 4 as the home.
- **Holds as a distinct entity** with their own collection and lifecycle. Rejected for now: it is a
  second thing generation must subtract, a second thing the server must lock, and a second write
  path, in exchange for keeping holds out of the calendar view and undo history.
- **Building ADR 0006's Data Strategy server mode** as part of this work. Rejected as scope: the
  pure core is importable by a consumer's server today, and server mode needs the write-sync
  protocol to be useful.
- **The core reading the clock**, so `generateSlots` needs no `now`. Rejected: it breaks the
  client/server-identical-logic contract and makes every test mock the clock.

## Consequences

- New surface: `src/slots/` (pure), a `slotRules` calendar option, `bookingFeature`, and an optional
  `timeZone` on `WorkingCalendar`. The last is additive to ADR 0008 but `resolveLayeredDayMinutes`
  now has to reconcile mixed zones when unioning layers — the one genuinely new hard case here.
- Each slot granularity needs its own `WorkingCalendar`, because `resolveLayeredDayMinutes` runs
  `mergeMinuteRanges` and would fuse adjacent 08:00-10:00 and 10:00-12:00 windows into one. The
  motivating example is two calendars and two rules, not one of each.
- `Resource.buffer` stops being dead code and starts changing which slots are offered. That is not
  an additive change for anyone already setting the field speculatively.
- `getTimeSlots` → `getTimeAxisLabels` is breaking.
- `bookingFeature` returns `Date` per ADR 0002 while `workingTimeFeature` returns strings. That
  inconsistency predates this work and is left as a follow-up rather than widened.
- No interval or set-position recurrence for slot rules. That is inherited from ADR 0010, not a gap
  introduced here.
- Slice plan in `docs/plans/phase-3-booking.md`.
