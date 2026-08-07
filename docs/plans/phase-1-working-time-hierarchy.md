# Phase 1 — Working-time calendar hierarchy

Implements ADR 0008. Replaces the flat `Resource.availability: Availability[]` with **shared,
id-referenced working calendars** and a most-specific-wins resolution hierarchy
(`event → resource → project`), consumed through one pure function.

Lands after the feature-composition plan (`docs/plans/phase-1-feature-composition.md`, slices
1-10 ✅) and before ADR 0007's solver fields, because the solver skews dates across non-working
time and needs the resolved calendar to skew against.

**Method:** same strangler-fig. The suite stays green after every slice (1,047 in
`@tanstack/time` at the start of this plan, plus 5 in `@tanstack/solid-time`). The resolver
lands and proves itself against the *existing* model before the model changes, so no slice both
introduces the algorithm and breaks the public shape.

---

## What exists today

Availability is a per-resource array of weekday + `HH:mm` windows, read in exactly one place —
`resourceDayAvail(availability, weekday)` in `src/validation/availability/time.ts` — which turns
it into merged `MinuteRange[]` for one day. Every consumer is downstream of that:

| Consumer | Uses |
|----------|------|
| `checkAvailability` / `getUnavailabilityDetails` | per-resource slots for a day, for the veto and the messages |
| `checkDaySpan` | slots again, to decide which details actually block a range |
| `mergeUnavailableMinuteRanges` | union of *available* across resources, inverted — the shading read |
| `resourceAvailabilityFeature` | all three, plus a per-`(resourceIds, date)` minute cache |
| `availabilityModule` | `checkAvailability` from the kernel's `availability-validate` stage |

One read point is the whole reason this is tractable: the hierarchy is a different way to answer
`"which minutes of this date does this resource work?"`, and everything above consumes the
answer, not the model.

Two behaviours the current code encodes that the resolver must keep:

- `availability: undefined` and `availability: [{ weekdays: [1] }]` on a Tuesday are different.
  Nothing configured — undefined *or* empty — means `"no-availability"`; a configured array that
  does not cover the day means `"outside-hours"`. Both block, with different messages.
- Multi-resource validation already intersects — `getUnavailabilityDetails` pushes a detail for
  *every* resource that fails to cover the span, so one closed resource blocks. Only the shading
  read (`mergeUnavailableMinuteRanges`) unions. ADR 0008's "intersection by default" is therefore
  a statement about the validation path that is already true, and slice 4 only makes it
  configurable.

## The model

```ts
interface WorkingInterval {
  isWorking: boolean;
  recurrent?: { weekdays: Array<number>; startTime: string; endTime: string };
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface WorkingCalendar {
  id: string;
  label?: string;
  parentId?: string;
  intervals: Array<WorkingInterval>;
}
```

A recurring working week is `{ isWorking: true, recurrent: { weekdays: [1,2,3,4,5], startTime:
"09:00", endTime: "17:00" } }` — which is exactly today's `Availability` with a flag, so the
subsumption ADR 0008 claims is literal. A company shutdown is `{ isWorking: false, startDate:
"2026-12-24", endDate: "2026-12-31" }`; dates are inclusive on both ends, because "closed Dec
24-31" is how the data arrives and an exclusive end reads wrong at every call site.

**Resolution is painting, not merging.** For a date, start from a canvas of 1,440 non-working
minutes and paint intervals in order — root ancestor to leaf, and within one calendar recurrent
before dated. Later paint wins. That single rule produces all three behaviours the ADR asks for:
a child overrides its parent only where it paints, an unpainted day falls through to the parent,
and a one-off holiday overrides the recurring week for its span. No precedence table, no
interval subtraction.

Public entry point per ADR 0004/0006 (serializable in, serializable out):

```ts
getWorkingTime(calendarId, range, calendars) -> Array<{ start: string; end: string }>
```

with `resolveDayMinutes(calendarId, date, calendars) -> MinuteRange[]` underneath it as the
per-day shape the validation core already speaks.

## Slices

### Slice 1 — the pure resolver ✅

`src/workingTime/` ships `resolveCalendarChain`, `hasWorkingCalendar`, `resolveDayMinutes` and
`getWorkingTime`. The purity test's `PURE_DIRS` covers the new directory, so it is isomorphic by
the same enforcement as `validation/`, `recurrence/` and `projection/`. 16 tests, 1,063 total.

The painting model survived contact: `resolveDayMinutes` fills a `Uint8Array(1440)` root-to-leaf
and scans it back into ranges, and every hierarchy behaviour falls out of paint order rather than
a rule. A child that paints nothing on a day inherits the parent's day; a child non-working span
punches a hole in the parent's working week and the scan reports two ranges either side of it; a
child recurrent interval opens a Saturday the parent leaves closed.

Two things the write-up above did not pin down and the code had to:

**Specificity is a sort key, not array order.** Within one calendar, intervals paint unbounded
recurrent → date-bounded recurrent → one-off dated, ties broken by declaration order. So a
December shutdown listed *before* the working week in the same `intervals` array still wins, which
is the order data actually arrives in. Without it the model would have made authors sort their own
config.

**`getWorkingTime`'s range end is exclusive.** Half-open is the honest convention for a range of
instants, and it makes the day loop's clipping fall out (`upperBound > lowerBound` skips the end
day when the range ends at midnight). Note that this differs from the kernel viewport's inclusive
end — the two are not the same kind of range, and the projection stage already compensates for its
own convention. Contiguous output merges across midnight, so a 24/7 calendar over three days is one
range, not three.

**The minute primitives moved.** `MINUTES_IN_DAY`, `MinuteRange`, `parseHmToMinutes`,
`formatMinutesToTime`, `getWeekday`, `mergeMinuteRanges` and `invertMinuteRanges` now live in
`src/workingTime/minutes.ts`, and `validation/availability/time.ts` re-exports them. Slice 2 makes
validation depend on the resolver, so owning minute-range algebra there keeps the dependency
one-directional instead of leaving two copies for a slice or building a cycle. No import outside
the package changed.

An unknown `parentId` stops the chain rather than throwing — a calendar can reference a parent that
has not loaded yet — but a `parentId` *cycle* throws with the path, because that is always config
corruption and hanging is the alternative.

### Slice 2 — validation consumes the resolver ✅

`resourceDayAvail(availability, weekday)` is gone. `resourceDayWorkingTime(availability, date)`
synthesizes a one-level calendar from the resource's slots — each slot is a working recurrent
interval, which is the subsumption claim made executable — and returns
`{ working, nonWorking, configured }` from `resolveDayMinutes`. All three call sites
(`checkAvailability`, `checkDaySpan`, `mergeUnavailableMinuteRanges`) went with it. The public
model did not change, so the existing suite is the characterization net: green, 1,064.

**The weekday parameter became a date.** Every caller already had the date and derived the weekday
only to hand it back down; dated intervals need the date anyway. `getWeekday` now has one caller
inside the resolver.

**`slotsForWeekday` is gone, and that fixed a real bug.** Two callers used the *unmerged* slot list
to ask "does one slot contain this span" and "does any slot overlap this range", so a resource
declaring `09:00-12:00` and `12:00-17:00` as separate slots rejected a 10:00-16:00 event that no
human would call out of hours. The resolver has no way to express that — painted minutes have no
seams — so the answer is now merged working ranges and the adjacent case passes. No test pinned
the old behaviour, which is why it survived this long; there is one now.

`configured` carries the `undefined`-vs-configured distinction that minute ranges cannot, but
nothing consumes it yet — `getUnavailabilityDetails` still branches on the raw array to choose
between `"no-availability"` and `"outside-hours"`. Slice 3 has to answer what an empty calendar
means when there is no array to look at: a resource whose `calendarId` resolves to a calendar with
no intervals is *configured* and never works, which today's data shape cannot express and today's
message vocabulary calls `"no-availability"`.

### Slice 3 — the model swap

`Resource.calendarId?: string` replaces `Resource.availability`; `CalendarCoreOptions` gains
`calendars?: Array<WorkingCalendar>` and `defaultCalendarId?: string` (the project calendar —
referenced when a resource sets none). `Availability` stays exported as the shape of a recurring
working interval, nested one level down, as the ADR says.

Calendars reach features the way resources already do — `FeatureModuleCtx.getCalendars()` and
`CalendarHost.getOptions().calendars` — **not** as a kernel collection. ADR 0008 says "a
`calendars` collection on the kernel", but ADR 0001 says the kernel is feature-agnostic and owns
events; resources already ride in through module options for exactly that reason. Recording the
deviation here rather than quietly picking one.

Breaking, and the whole point of landing it pre-alpha. Both examples and every fixture in the
suite migrate: `availability: [{ weekdays, startTime, endTime }]` becomes a calendar plus a
`calendarId`. The examples are the honest test of whether the shape is usable — if declaring the
company week once and a per-person shift on top of it is not obviously nicer there, the model is
wrong.

### Slice 4 — event overrides and the intersection policy

`Event.calendarId` — the third layer. When an event names a calendar, that calendar is what the
event is validated against, layered over the resource's chain rather than replacing it, so an
override says "this meeting may run late" without restating the working week.

Multi-resource policy becomes explicit: `intersection` (default, and what the code already does)
or `union`, as a calendar option. The shading read keeps unioning regardless — it answers "when
does nobody work", which is a different question from "when can this event run".

### Slice 5 — `workingTimeFeature`

The resolver gets a public surface: `getWorkingIntervals(range, target)`, `getEffectiveCalendar`,
`isWorkingTime`. `resourceAvailabilityFeature` declares `requires: ["workingTime"]` and reads it
as a peer instead of resolving inline, which is the seam slice 8 of the previous plan built for.

The split earns itself twice over: the ADR 0007 solver and the non-continuous time axis both need
resolved working time and neither needs availability's capacity or conflict vocabulary. Registry
entry, `stockFeatures`, `composedApi.test-d.ts` and a bundle check that a `dayEventLayoutFeature`-
only composition still links none of it.

## Open questions

- **Where the project calendar default lives.** `defaultCalendarId` as a calendar option is the
  cheap answer; a reserved id or a `parentId`-less root convention are the alternatives. Decide in
  slice 3, against the examples.
- **Capacity stays on the resource** (the ADR says so), so a calendar cannot express "half the
  team is out". That is a resource-assignment question and belongs with Phase 4's M:N assignment
  entity, not here.
- **Timezone.** Intervals are civil `HH:mm` against the calendar's date, which is what today's
  code assumes and what ADR 0002 wants at the boundary. A calendar whose intervals mean something
  in a *different* zone from the calendar instance is not modelled and is not in this plan.

## Definition of done

- No `Resource.availability` anywhere in the packages or the examples; a resource references a
  calendar by id and a shared calendar is declared once.
- `getWorkingTime(calendarId, range, calendars)` is pure and serializable both ways — the
  purity test covers `src/workingTime/`, so it can run server-side or as a delegatable stage
  (ADR 0004/0006) without change.
- A three-level hierarchy resolves correctly through the *public* surface: project shutdown,
  resource shift, event override, verified against a composed calendar rather than the resolver
  alone.
- A `dayEventLayoutFeature`-only bundle links no working-time code.
