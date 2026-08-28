# Schedule rule blocks: compose `WorkingCalendar` data, no new predicate engine

## Status

accepted

## Context

Recurring, exception-aware scheduling rules keep coming up in a shape that isn't domain-specific:
"deliver on Tuesdays, except public holidays, shifted to the next working day", "respond within 3
business days", "if ordered before 16:00 the lead time starts today, otherwise tomorrow". None of
this is particular to delivery — appointments, callbacks, SLAs, and shipment ETAs all want the
same "recurring day-or-time predicate, plus exceptions, plus a resolution policy when the
predicate lands on a non-working day" pattern.

The library already has the primitives that answer the hard part of this — `workingTime/`
(Phase 2 of `docs/plans/phase-2-solver.md`) resolves layered `WorkingCalendar` data into working
minutes and can walk forward/backward to the nearest working instant
(`nextWorkingInstant`/`previousWorkingInstant`, `addWorkingMinutes`/`subtractWorkingMinutes`).
What's missing is an ergonomic way to *build* a `WorkingCalendar` from small composable rule
blocks (`weekday(...)`, `date(...)`, `between(...)`, `after(...)`, `before(...)`) instead of
hand-writing `WorkingInterval` objects, plus a day-granularity lead-time primitive for the
cutoff-based case.

Two shapes were on the table: compile the blocks into the existing `WorkingCalendar`/
`WorkingInterval` data model (pure sugar, no new engine), or build a new tagged-data rule AST
with its own evaluator that treats `WorkingCalendar` as just one possible input. The purity
constraint (`src/workingTime` is inside `PURE_DIRS` — no closures, no non-serializable state,
enforced by `validation/tests/purity.test.ts`) rules out plain JS-closure predicates either way;
both options have to represent rules as data.

## Decision

- **Blocks compile to `WorkingInterval` fragments, not a new predicate type.** `weekday('tuesday')`,
  `date('2026-12-24')`, `dates([...])`, `dateRange(a, b)`, `between('09:00','17:00')`, and
  `after`/`before` (open-ended `between`) each produce the recurrent-or-dated `WorkingInterval`
  shape ADR 0008 already defines. `merge(a, b)` combines fragments that constrain different axes —
  `merge(weekday('tuesday'), between('08:00','16:00'))` is one interval, not two. `businessDays(n)`
  is not a block: it's a lead-time span, and doesn't participate in `on`/`except`.
- **`compileSchedule(spec)` assembles a `WorkingCalendar`, and that's the entire new surface.**
  `spec.on` sets the base recurring intervals (`isWorking: true`); `spec.except` layers in
  `isWorking: false` overrides (holidays, closures) on top, using the same most-specific-wins
  layering `resolveLayeredDayMinutes` already implements. The output is a plain `WorkingCalendar` —
  nothing bespoke. A fluent `schedule(id).on(...).except(...).build()` may ship as sugar over it,
  but the plain-data function is canonical: it is what serializes, what a server builds, and what
  the purity boundary wants.
- **`except` takes caller-supplied calendar/date data. No built-in per-country holiday
  tables.** Holiday data is jurisdiction-specific and goes stale; shipping it would be scope creep
  the library doesn't otherwise take on (mirrors the existing headless/data-only stance — see
  ADR 0005/0007 on arrows, editors, and histograms being the consumer's job, not the library's).
  A consumer (or a separate, explicitly-versioned holiday-data package) supplies the input.
- **One new resolver combinator — `resolveScheduleDay` — because "skip" and "shift" are different
  questions.** See *Exception policy* below. Everything else stays: a range query is
  `getLayeredWorkingTime`, and both policy branches are implemented in terms of
  `nextWorkingInstant`/`previousWorkingInstant` rather than a parallel walker.
- **The cutoff/lead-time case composes separately, via a new `addWorkingDays` primitive.**
  `resolveCutoffStart(instant, cutoffTime, layers, calendars)` decides whether the lead-time count
  starts today or tomorrow; `addWorkingDays(from, n, layers, calendars)` (a day-granularity sibling
  of `addWorkingMinutes`, not yet built) walks `n` working days forward. Neither needs the block
  compiler — they consume a `WorkingCalendar` directly, same as everything else in `workingTime/`.

### Exception policy: `skip` is not `shift`

An earlier draft of this ADR claimed `nextWorkingInstant(from, layers, calendars)` already answers
"next matching day, skipping exceptions" and therefore no new resolver entry point was needed.
That is only half true, and the missing half is the case consumers ask for most.

When Tuesday's delivery lands on a public holiday there are two defensible answers, and a single
`WorkingCalendar` walk can only give one of them:

- **`skip`** — the next occurrence of the rule itself, i.e. *next Tuesday*. This is
  `nextWorkingInstant` over the compiled calendar, exceptions and all, exactly as claimed.
- **`shift-forward` / `shift-backward`** — the nearest working day either side of the blocked
  occurrence, i.e. *Wednesday*. The compiled calendar cannot produce this, because Wednesday is
  non-working in it by construction — the rule says Tuesdays.

`shift-*` therefore needs two calendars: the **rule** calendar (when the thing nominally happens)
and a **working-day** calendar (which days the business operates at all). The rule calendar
supplies the candidate, and the shift is a walk over the working-day calendar from that candidate.
Both are `WorkingCalendar`s and both resolve through the existing hierarchy, so this is a
composition question, not a new engine:

```ts
resolveScheduleDay(from, ruleLayers, policy, workingLayers, calendars) -> string | null
```

For `skip`, `workingLayers` is unused and the call collapses to today's `nextWorkingInstant`. For
`shift-*`, the rule's exceptions must live in a *separate* layer from its base recurrence — the
candidate is resolved against the base, then tested and moved against the working-day calendar.
ADR 0008's `parentId` chain is how that separation is expressed: a `store-42-delivery` calendar
whose parent holds the recurrence, with the holiday overrides on the child.

### Day granularity is a convention, not a new type

`WorkingCalendar` resolves minutes. "Delivery on Tuesday" has no time-of-day, so a block with no
time constraint compiles to the full civil day, `00:00`-`24:00`. Consequences worth stating
because callers would otherwise guess: `resolveScheduleDay` returns a timestamp at `T00:00` for
such a rule; `addWorkingDays` counts a day as working if it has *any* working minute, which is
deliberately not `addWorkingMinutes`-with-`n * 1440`; and a rule that does carry a window
(`merge(weekday('tuesday'), between('08:00','16:00'))`) answers the same queries at the finer
granularity with no branch anywhere in the resolver.

## Considered Options

- **`every(n, unit)` as a block.** Dropped from the surface, not merely deferred: it is not
  expressible in the target model. `RecurrentWorkingInterval` is `{ weekdays, startTime, endTime }`
  — there is nowhere to record a period or an anchor, so "every 2 weeks" has no representation.
  The three ways out are all worse than declining: materialize to dated intervals over a finite
  horizon (a compiler that silently bounds the future, and a calendar whose size scales with the
  horizon), add `interval`/`anchorDate` to `RecurrentWorkingInterval` (a breaking change to ADR
  0008's model, in service of one block), or accept a second recurrence model alongside the one
  `recurrence/` already owns. Interval and set-position recurrence is RRULE's job; the roadmap
  already carries `BYSETPOS` / "2nd Tuesday" in Phase 4, and that is where an `every`-shaped block
  belongs, expressed over the recurrence engine rather than over `WorkingInterval`.
- **New tagged-data rule AST with its own interpreter**, `WorkingCalendar` becoming one possible
  input among several. Rejected for now: real scope (new pure module, new test suite, a decision
  about whether it replaces or layers under ADR 0008's calendar hierarchy) for expressiveness
  nothing currently on the table needs. `WorkingInterval` already covers recurring-with-exceptions,
  which is every example gathered so far. Revisit only when a concrete rule can't be expressed as
  `WorkingInterval` data — the `every(n, unit)` case above is the first candidate, and it has a
  cheaper home.
- **Built-in per-country holiday tables** (e.g. `holidays('PL')` shipping real dates). Rejected:
  holiday calendars change yearly, are jurisdiction-specific, and the library has already drawn
  the headless/data-only line elsewhere (ADR 0005/0007) — this would be the one exception.
- **A single `nextOccurrence` with no policy argument.** Rejected once the skip/shift split above
  was clear: whichever behaviour the default picked would be silently wrong for the other half of
  the use cases, and the wrongness is a week-long date error, not a rounding difference.

## Consequences

- New surface is small: a block-to-`WorkingInterval` compiler and `compileSchedule`, both pure data
  transforms living in `workingTime/`. No new purity-boundary risk — data in, data out, same as
  every existing module there.
- `resolveScheduleDay` adds one resolver entry point rather than none, and with it a documented
  requirement that `shift-*` callers keep base recurrence and exceptions in separate layers.
  Callers that only need `skip` can put everything in one calendar.
- `addWorkingDays` and `resolveCutoffStart` are new work, independent of the block compiler, needed
  for the cutoff-based case specifically.
- Interval recurrence ("every 2 weeks", "2nd Tuesday of the month") is explicitly *not* served by
  this ADR and is not a gap in it — it is Phase 4 recurrence work.
- Slice plan in `docs/plans/phase-3-schedule-rules.md`.
