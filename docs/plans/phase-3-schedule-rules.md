# Phase 3 — Schedule rule blocks and lead time

Implements ADR 0010. Adds a small block vocabulary that compiles to `WorkingInterval` data, one
resolver combinator (`resolveScheduleDay`) that answers "when does this rule next fire, given
exceptions", and two day-granularity lead-time primitives (`addWorkingDays`,
`resolveCutoffStart`). No new engine: everything resolves through the ADR 0008 hierarchy that
`src/workingTime/` already implements.

**Why Phase 3.** It depends on nothing after Phase 1 — the calendar hierarchy landed with
`docs/plans/phase-1-working-time-hierarchy.md`, and none of this touches the solver. It sits in
Phase 3 because it answers the same *kind* of question as `generateSlots` (given calendars, when
can this happen?) and both are consumer-facing scheduling reads rather than write-pipeline work.
Nothing in Phase 2 blocks pulling it earlier if a consumer needs it.

**Method:** same strangler-fig discipline as the working-time plan. Every slice leaves the suite
green and ships something callable; no slice both introduces an algorithm and changes a public
shape. The blocks land as pure data transforms first and prove themselves against the *existing*
resolver before any feature wiring exists.

---

## What exists today

`src/workingTime/` is five files and answers four questions:

| Function | Answers |
|----------|---------|
| `resolveLayeredDayMinutes(calendarIds, date, calendars)` | which minutes of this date are working, across layered parent chains |
| `getLayeredWorkingTime(layers, range, calendars)` | working intervals across a range, contiguous across midnight |
| `nextWorkingInstant` / `previousWorkingInstant` | nearest working instant forward/backward, bounded by `MAX_WORKING_SKEW_DAYS` |
| `addWorkingMinutes` / `subtractWorkingMinutes` | walk n *minutes* of working time |

The gap is at both ends. At the input end, expressing "Tuesdays, except these three dates" means
hand-writing `WorkingInterval` literals — a `recurrent` object plus one dated interval per holiday,
with `isWorking` flags the author has to get right. At the output end, every walker is
minute-granular, so "three business days" has no primitive; `addWorkingMinutes(start, 3 * 1440)`
counts working *minutes*, which for a 9-to-5 calendar is nine business days, not three.

The specificity sort in `resolve.ts` is what makes the exception half work with no new code:
dated intervals outrank recurrent ones across the whole chain, so a holiday painted `isWorking:
false` wins over the recurring Tuesday regardless of declaration order or which calendar in the
chain declared it. The block compiler's whole job is producing that data, not reimplementing it.

## The surface

```ts
type Weekday = "monday" | "tuesday" | ... | "sunday";

weekday(...days: Array<Weekday | number>): WorkingInterval
date(isoDate: string): WorkingInterval
dates(isoDates: Array<string>): Array<WorkingInterval>
dateRange(start: string, end: string): WorkingInterval
between(startTime: string, endTime: string): WorkingInterval
after(startTime: string): WorkingInterval
before(endTime: string): WorkingInterval
merge(...fragments: Array<WorkingInterval>): WorkingInterval

interface ScheduleSpec {
  id: string;
  label?: string;
  parentId?: string;
  on: Array<WorkingInterval | Array<WorkingInterval>>;
  except?: Array<WorkingInterval | Array<WorkingInterval>>;
}

compileSchedule(spec: ScheduleSpec): WorkingCalendar
```

Blocks return `isWorking: true` fragments; `compileSchedule` flips the ones under `except`. The
nested-array acceptance is so `dates([...])` composes without a spread at every call site.

```ts
type ExceptionPolicy = "skip" | "shift-forward" | "shift-backward";

resolveScheduleDay(
  from: string,
  ruleLayers: Array<Array<string | undefined>>,
  policy: ExceptionPolicy,
  workingLayers: Array<Array<string | undefined>>,
  calendars: Array<WorkingCalendar> | null | undefined,
): string | null

addWorkingDays(from, days, layers, calendars): string | null
resolveCutoffStart(instant, cutoffTime, layers, calendars): string | null
```

The layer-stack argument shape (`Array<Array<string | undefined>>`) is copied from
`getLayeredWorkingTime` deliberately — one convention for "these calendars, each resolved through
its own parent chain, then unioned" across the whole module.

The store case end to end:

```ts
const calendars = [
  compileSchedule({ id: "store-42-rule", on: [weekday("tuesday")] }),
  compileSchedule({
    id: "store-42",
    parentId: "store-42-rule",
    on: [],
    except: dates(["2026-12-25", "2026-12-26", "2027-01-01"]),
  }),
];

resolveScheduleDay(orderedAt, [["store-42"]], "skip", [], calendars);
resolveScheduleDay(orderedAt, [["store-42-rule"]], "shift-forward", [["business-week"]], calendars);
```

Two calendars, not one, because `shift-forward` needs the un-excepted candidate — see ADR 0010's
exception-policy section. `skip` callers can collapse both into a single calendar.

## Slices

### Slice 1 — blocks and `compileSchedule`

`src/workingTime/blocks.ts`, exported from the module barrel. Pure functions returning plain
objects, no state, so `PURE_DIRS` needs no change and the purity test covers it the moment the
file exists.

`merge` is the only block with a real decision in it: fragments that constrain *different* axes
combine (weekdays + times, dates + times), fragments that constrain the *same* axis are a caller
error and throw rather than silently picking one. `weekday("tuesday")` with no time fragment
compiles to the full civil day per ADR 0010, which means `startTime: "00:00"`, `endTime: "24:00"`
on the `recurrent` object — `parseHmToMinutes` handles `"24:00"` as 1440 already, and
`resolve.ts`'s `endMinutes > startMinutes` guard keeps it in range.

Done when a compiled Tuesday-with-holidays calendar and a hand-written one resolve to identical
minute ranges for a month of dates — the equivalence *is* the test, because the claim of this slice
is that it adds sugar and nothing else.

### Slice 2 — `resolveScheduleDay`

`src/workingTime/skew.ts`. `skip` delegates to `nextWorkingInstant` unchanged. `shift-forward`
resolves the candidate against `ruleLayers`, checks it against `workingLayers` via
`resolveLayeredDayMinutes`, and walks with `nextWorkingInstant` when the candidate day has no
working minutes; `shift-backward` is the same with `previousWorkingInstant`.

Two cases to pin because they are where a naive implementation goes wrong: a shift that lands on
*another* non-working day must keep walking (Christmas Eve Tuesday → Wednesday is also a holiday →
Thursday), and a `shift-backward` that would land *before* `from` must return the forward answer or
`null` rather than a date in the past — a delivery estimate earlier than the order is worse than no
estimate. The plan takes `null`; revisit if a consumer wants clamping.

Bounded by the existing `MAX_WORKING_SKEW_DAYS`, same as every other walker, so a rule whose
exceptions swallow the horizon returns `null` instead of hanging.

### Slice 3 — `addWorkingDays` and `resolveCutoffStart`

`src/workingTime/leadTime.ts`. `addWorkingDays` counts calendar days with any working minute,
starting the count from the day *after* `from` (three business days from Monday is Thursday), and
returns the start of that day's first working span. `resolveCutoffStart` compares the instant's
minutes against the cutoff and returns `from`'s day or the next working day accordingly — which is
`nextWorkingInstant` over a day boundary, so it is four lines rather than a walker.

Independent of slices 1-2; can land in parallel. Done when the cutoff example from ADR 0010
("before 16:00 counts today, otherwise tomorrow, then +2 business days") produces the same answers
as a hand-computed table across a week containing a holiday.

### Slice 4 — `scheduleRuleFeature`

`src/calendar/features/scheduleRule.ts` plus three entries in `features/registry.ts`, following
ADR 0009. Api: `getNextOccurrence(from, target)`, `getOccurrences(range, target)`,
`getLeadTimeEstimate(input, target)`. Returns are `Date` per ADR 0002; inputs accept `DateInput`
and normalize through `toPlainDateTimeString` the way `workingTimeFeature` already does.

The target extends `WorkingTimeTarget` with `policy` and the working-day calendar id, so
"which calendar governs this?" stays answerable about the same object across both features. The
feature declares `requires: ["workingTime"]` and reads calendars through the host options rather
than resolving them itself.

`getOccurrences` is `getLayeredWorkingTime` folded to distinct days — deliberately not a second
traversal.

Done when `linking.test.ts` shows a `dayEventLayoutFeature`-only entry still reaches no
`schedule`-rule code, and a `scheduleRuleFeature` entry does reach `workingTime/blocks.ts`.

### Slice 5 — docs and an example

Reference docs for the blocks and the three resolver functions; the store-delivery case as a
worked example, including the two-calendar split that `shift-forward` requires, because that is
the part of the API a reader will otherwise get wrong on first contact.

## Open questions

- **Where holiday data comes from in practice.** ADR 0010 says the consumer supplies it, and that
  stands, but if three examples all hand-roll the same Polish holiday array it is evidence for a
  separate `@tanstack/time-holidays`-style package — explicitly versioned, outside this plan.
- **Whether `shift-*` should also skip time-of-day.** A rule with an `08:00-16:00` window that
  shifts to another day currently keeps the window, because the working-day calendar decides the
  day and the rule decides the hours. If a consumer wants the *target day's* hours instead, that is
  a fourth policy, not a change to these three.
- **`getOccurrences` beyond the skew horizon.** Range queries are bounded by the range, not by
  `MAX_WORKING_SKEW_DAYS`, so a five-year range is five years of day iteration. Fine at current
  call sizes; a windowing story belongs with Phase 3's virtualization contract if it bites.

## Definition of done

- A schedule built from blocks and one built by hand resolve identically — the compiler is sugar,
  proven, not asserted.
- `skip` and `shift-forward` give *different, both correct* answers for a Tuesday rule hitting a
  Christmas holiday, through the public feature surface.
- `addWorkingDays(from, 3, ...)` over a week containing a holiday matches a hand-computed table,
  and is not equal to `addWorkingMinutes(from, 3 * 1440, ...)` on the same calendar.
- Everything new under `src/workingTime/` passes the purity test unchanged; no new entry in
  `PURE_DIRS`, no new forbidden import.
- `every(n, unit)` appears nowhere — ADR 0010 declines it, and the docs say where interval
  recurrence lives instead.
