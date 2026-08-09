# Phase 1 — Solver event model

The Phase 1 half of ADR 0007: dependency **lag/lead**, scheduling **constraints**,
**`manuallyScheduled`**, and **`effort`/`duration`** land on the event model and are honoured by
the *existing* validation and cascade code. The fixpoint `schedule` stage itself is Phase 2.

Lands after the working-time hierarchy (`docs/plans/phase-1-working-time-hierarchy.md`, slices 1-5
✅) because a constraint is a date and a duration is a span, and both mean "in working time" the
moment the solver arrives.

**Method:** same strangler-fig. The suite stays green after every slice (1,095 in `@tanstack/time`
at the start of this plan, plus 5 in `@tanstack/solid-time`). Each slice adds one field and makes
the code that already exists honour it; nothing here builds a scheduler.

**Why now and not with the solver.** The roadmap splits these deliberately: the fields are breaking
changes to the public event model, so they belong before the alpha, while the fixpoint loop is
additive and can land after. Doing them together would mean shipping the alpha with a model the
solver forces us to break again.

---

## What exists today

The dependency core is four pure functions over `{ id, type }` links, all of them asking the same
question through one primitive:

| Consumer | Uses |
|----------|------|
| `validateDependencies` | `requiredForwardShiftMs` — a positive shortfall is a conflict |
| `computeCascade` | the same shortfall, applied as a delta down the dependents |
| `propagateToDependents` / `propagateToPredecessors` | the same, forwards and backwards |
| `eventDependencyFeature` | `findViolatedDependency` inline, plus `shiftToSatisfyLink` on connect |

`requiredForwardShiftMs(type, predStart, predEnd, succStart, succEnd)` returns
`predecessorAnchor - successorAnchor` per type, and every caller treats `> 0` as "must move". One
primitive is the whole reason lag is a one-field change: lag moves the anchor, and the four
behaviours follow.

Nothing in the model is a constraint today. The only thing that pins an event in place is a
predecessor, and the only thing that stops a move is availability.

## The model

```ts
interface EventDependency {
  id: string;
  type: "FS" | "SS" | "FF" | "SF";
  lag?: number;
}

type ConstraintType =
  | "start-no-earlier-than" | "start-no-later-than"
  | "finish-no-earlier-than" | "finish-no-later-than"
  | "must-start-on" | "must-finish-on";

interface SchedulingConstraint {
  type: ConstraintType;
  date: string;
}

interface Event {
  constraint?: SchedulingConstraint;
  manuallyScheduled?: boolean;
  duration?: number;
  effort?: number;
}
```

**Everything measured in time is minutes.** `Resource.buffer.before/after` and the resize path's
`totalDeltaMinutes` already are, and minutes are what a working-time calendar is painted in
(`MINUTES_IN_DAY`, `MinuteRange`). A `lagUnit`/`durationUnit` pair the way Bryntum has it buys
nothing a number of minutes does not, and it would put a second unit vocabulary next to the one the
resolver already speaks. Lag is signed — negative is lead.

**A constraint is one optional object, not a list.** Bryntum allows one constraint per event and
that is also the only shape a fixpoint clamp can apply without ordering rules between constraints.
`date` is an ISO civil string per ADR 0002, so a date-only constraint and a datetime one are the
same field.

## Slices

### Slice 1 — dependency lag/lead ✅

`lag` on the link, honoured by the one primitive every consumer goes through. 1,106 tests.

`requiredForwardShiftMs` and `requiredBackwardShiftMs` take a sixth `lagMilliseconds` argument
defaulting to `0`, added to the predecessor anchor before the successor anchor is subtracted. That
is the whole change: `validateDependencies`, `computeCascade`, both `propagate` directions,
`shiftToSatisfyLink` and the feature's `findViolatedDependency` each pass `lagMs(link)` and inherit
the behaviour. A default of zero is why the existing 1,095 tests stayed green through the threading
— the field's arrival is observable only where a lag is declared.

**Minutes at the boundary, milliseconds inside.** `lag` is signed minutes on the public link;
`lagMs(link)` converts once at each call site, next to the epoch-millisecond arithmetic the shift
math already speaks. The alternative — storing milliseconds — would have made the field the only
one on the model that is not in the unit `buffer` and `snapToMinutes` use.

`createDependency(source, target, type, lag)` stores `lag` only when non-zero, so an unlagged link
still serializes as `{ id, type }` and the existing fixtures compare equal. It also had to widen its
duplicate check: the same predecessor at the same type but a different lag is a different link, not
a no-op.

The conflict message names the lag with its sign — `"B" cannot start before "A" ends +30m (FS)` —
because a link that reads as satisfiable from the two dates alone is otherwise inexplicable to
whoever is looking at it.

The timeline example seeds one lagged link (a 60-minute handoff after `UI Mockups`) and its
dependency editor grew a lag input, so the field is exercised through a consumer rather than only
through tests.

### Slice 2 — `manuallyScheduled` ✅

A manually-scheduled event is an anchor: cascade and propagation must not move it, and a link into
one that cannot be satisfied is a conflict rather than a silent shift. This is the field that makes
"conflicts are data" (ADR 0007) reachable before the solver exists, because it is the first way the
graph can be unsatisfiable without a cycle. 1,127 tests.

**The anchor is a walk rule, not a shift rule.** `propagateToDependents`, `propagateToPredecessors`
and `computeCascade` each mark an anchored neighbour visited and `continue` — it is neither moved nor
walked through, so the events *behind* it keep their dates too. Skipping the move but recursing
anyway would push an anchor's successors off a predecessor that never moved.

**Not moving it is only half the field.** The write that could not be absorbed has to be rejected,
otherwise an anchor silently degrades into "the cascade stops here" and the graph is left
inconsistent. `findAnchoredViolations({ events, changedIds, timeZone })` is the new pure core: after
the batch has settled, any link whose successor or predecessor is an anchor, whose other end is in
`changedIds`, and whose shortfall is still positive becomes a `DependencyConflict` carrying
`anchorId`. `dependencyModule` runs it as a veto contribution and the kernel rejects with
`dependency/manually-scheduled`.

That veto needed a second validate stage. `WriteValidateStageName` was a single-member union
(`"availability-validate"`) and the kernel ran that one constant; it is now `WRITE_VALIDATE_ORDER`
with `"dependency-validate"` after it, so availability still reports first and both stages'
conflicts come back in one rejection.

**Advisory path stays ahead of the veto.** `validateMove` asks the feature for
`getAnchorConflicts(eventId, newStart, newEnd)`, which replays the same propagate-then-check
sequence the module performs, so a drag is blocked at preview time rather than at commit. The
message is the dependency violation with `— "X" is manually scheduled` appended; the shared text
comes from `describeDependencyViolation`, extracted out of `validateDependencies` so the two callers
cannot drift.

`createDependency` refuses to connect when the target is an anchor and the link would reschedule it,
returning a `blocked` error instead of moving it. An anchor whose link is already satisfied still
connects.

The anchor is only an anchor to *other* events' arithmetic: a write that targets it directly moves
it and cascades its dependents as usual. The timeline example pins `Integration Tests`, shows the
flag as a 📌 badge on the bar, and the event form toggles it.

### Slice 3 — scheduling constraints ✅

`Event.constraint` plus a pure `validation/constraints/` core returning structured conflicts, wired
into the kernel's veto stage next to availability. Honoured, not solved: a constraint that a move
would violate blocks the move; nothing clamps a date yet. 1,156 tests.

**The core needs no time zone.** `checkConstraint(event)` compares civil values on both sides — the
event's `start`/`end` are plain datetime strings and so is `constraint.date` — so unlike the
dependency core there is no epoch-millisecond arithmetic and nothing to convert. Six types collapse
to one anchor lookup (`start` or `finish`), one comparison, and one satisfaction rule per family
(`>= 0`, `<= 0`, `=== 0`).

**Precision picks the granularity.** A date-only `date` compares `PlainDate`s and a datetime one
compares `PlainDateTime`s, which is what makes "a date-only constraint and a datetime one are the
same field" true in behaviour and not just in typing. `must-start-on: "2026-03-02"` means *that
day*, not midnight on that day — reading it as midnight would make the most obvious constraint in
the vocabulary almost always false.

`constraintModule` is a validate-only module: no transform, no api beyond `evaluateConstraint`, and
`"constraint-validate"` sits between availability and dependency in `WRITE_VALIDATE_ORDER`. Because
the stage reads the *settled* batch, a dependency cascade that pushes a successor past its own
constraint is rejected without the constraint code knowing dependencies exist — the two features
compose through the pipeline rather than through each other.

`schedulingConstraintFeature` exposes `checkEventConstraint(event, start?, end?, constraint?)` and
`validateMove` calls it for the moved event and for every cascaded neighbour it already checks
availability for, so the advisory path blocks the same drags the veto would reject.

The timeline example gives `Deployment` a `finish-no-later-than` on the Friday of the work week and
shows constraints as a ⏱ badge; dragging its predecessor `Auth Module` late enough is the demo —
the cascade would push `Deployment` past Friday, so the write is refused.

### Slice 4 — `effort` / `duration`

Both optional minutes. `duration` is *working-time* duration, so it is derived through the ADR 0008
resolver rather than from wall-clock arithmetic; validation flags a declared `duration` that does
not match the span's working minutes. `effort` is carried and validated against duration but not
allocated — allocation is Phase 4's M:N assignment entity.

## Open questions

- **Does `duration` win over `end`, or the other way round?** Bryntum makes duration authoritative
  and recomputes `end`. Doing that here means a write to `end` has to back-propagate into
  `duration`, which is solver behaviour. Slice 4 keeps `end` authoritative and treats `duration` as
  a derived/asserted value; revisit when the `schedule` stage lands.
- **Constraint vs. availability precedence.** Both can block the same move. They are reported
  separately for now; whether a constraint should be allowed to override a non-working span is a
  solver question (ADR 0007's skew), not a validation one.
- **ASAP/ALAP direction** is on the solve request in ADR 0007, not on the event. Nothing in this
  plan carries it.

## Definition of done

- Every field above exists on the public model, is exported, and round-trips through the kernel
  without the solver.
- Each field changes at least one observable behaviour in the existing validation or cascade path —
  no field lands as an inert type.
- The pure cores stay pure: `validation/constraints/` is covered by `PURE_DIRS`.
- The examples show lag and a constraint, so the shapes are proven against a consumer rather than
  only against tests.
