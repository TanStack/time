# Phase 2 — Scheduling solver (ADR 0007)

Roadmap items: the five Phase 2 bullets. This plan covers the first four; **server re-validation** is
Phase 3 work that only needs the solver to already be pure, which is a property this plan
establishes rather than a task it performs.

ADR 0007's decision is that the solver is **one stage of the existing write pipeline**, not a
replacement for it: `dependency-transform` is generalised into a `schedule` stage that runs a
**fixpoint loop internally**, behind a pure serializable boundary. The stage name already exists and
already has an occupant.

## Where the code actually stands

`WRITE_TRANSFORM_ORDER` is `history-materialize → resize-materialize → recurrence-materialize →
schedule`, and `dependencyModule` contributes the `schedule` stage today. What it does there is a
**single-pass delta cascade**: for each changed `update` op, propagate once to predecessors, then
once to dependents, with a `visited` set to stop revisits. That is precisely the shape ADR 0007's
Considered Options rejects as "keep the linear single-pass and call it a scheduler".

| ADR 0007 requires | Today |
|---|---|
| `schedule` runs a fixpoint internally | stage exists; body is one sweep, `visited` prevents the re-propagation a fixpoint needs |
| pure `solve(request) → { events, conflicts }` | absent; the pieces are spread across `validation/dependency` |
| bounded iteration, cycle detection, cap → unsatisfiable conflict | no loop, so no cap and no cycle report |
| ASAP/ALAP direction on the request | nothing carries direction |
| constraints clamp during propagation | `checkConstraint` only **vetoes**, after the fact, from `constraint-validate` |
| working-time skew across non-working time | **no primitive exists** — see below |
| `manuallyScheduled` anchors honoured as fixed | done (`phase-1-solver-event-model.md`, slice 2) |
| conflicts are data | done per validate stage; no solver-level conflict shape yet |

Phase 1 delivered the event model the solver consumes — lag/lead, `constraint`, `manuallyScheduled`,
`effort`/`duration` — and four validate stages that define what a proposed schedule must not violate.
The solver proposes; those stages are the contract it has to satisfy.

## The missing primitive is skew, and everything waits on it

`workingTime/` answers "which minutes are working" — `getLayeredWorkingTime`,
`resolveLayeredDayMinutes`, `hasAnyWorkingCalendar` — and `workingMinutesBetween` (Phase 1) measures a
span. Nothing answers the **inverse**, which is the question scheduling actually asks:

- `nextWorkingInstant(t, layers, calendars)` — the first working instant at or after `t`.
- `addWorkingMinutes(start, minutes, layers, calendars)` — the instant `minutes` of *working* time
  after `start`.

Without those, a dependency can only push a successor by a wall-clock delta, which is the current
behaviour and is wrong the moment a calendar is configured: pushing a Friday task by one day lands it
on Saturday and silently invents non-working time. `addWorkingMinutes` is also what makes `duration`
authoritative *inside the loop* while `end` stays authoritative at the boundary — the solver computes
`end` from `start` + working duration, and Phase 1's `duration-validate` then confirms the result.

These are pure functions over the same serializable inputs the rest of `workingTime/` takes, so they
land there and inherit its tests. **Landed in slice 1.**

## A naming hazard to fix before ALAP

`requiredForwardShiftMs` and `requiredBackwardShiftMs` in `validation/dependency/shift.ts` have
**byte-identical bodies** — the same switch over FS/SS/FF/SF. That is not a bug: both return the same
signed slack, and direction lives in the caller, which does `if (pullBackMs <= 0) continue` and then
`shiftSpan(predSpan, -pullBackMs)`. The test even asserts the two are equal by design
("backward shift mirrors forward shift").

It is a trap for slice 5. Anyone implementing ALAP will reasonably read
`requiredBackwardShiftMs(...)` as already encoding backward semantics, and it does not — the sign
convention is invisible at the call site. Either collapse them into one `requiredShiftMs` and make the
caller's direction explicit, or give each a body that genuinely differs. Doing this *before* ALAP is
cheaper than debugging it after.

## Slices

Ordered so each one is independently testable and the pipeline swap is last (strangler fig, as in the
previous phases). Nothing here changes committed behaviour until slice 6.

### Slice 1 — working-time skew primitives ✅

`nextWorkingInstant(from, layers, calendars)` and
`addWorkingMinutes(start, minutes, layers, calendars)` in `workingTime/skew.ts`. Pure, no pipeline
change, no consumer yet.

**The DST edge case this plan predicted does not exist at this layer.** Working time is entirely
*civil*: `resolveLayeredDayMinutes` paints a `Uint8Array` of minute-of-day per `PlainDate`, and
`getLayeredWorkingTime` emits `YYYY-MM-DDTHH:MM:SS` with no zone. Skew is the same shape, so it walks
days and minute offsets and never converts to an instant — there is no offset to shift under it. DST
enters only where a civil value is resolved against a zone, which is the kernel's job, not this
layer's.

Rather than reuse `getLayeredWorkingTime`, skew walks days directly. That function needs a bounded
range up front, and skew's whole question is "where does this land?" — the range is the unknown. So
both primitives share the day walk and `mergeMinuteRanges` with it, not the range API.

Decisions worth recording:

- **Unbounded search is the real hazard, not precision.** A calendar whose intervals are all
  `isWorking: false` has no working minute ever, so a naive walk never terminates. Both functions are
  bounded by `MAX_WORKING_SKEW_DAYS` (366) and return `null` on exhaustion. `null` is what the solver
  turns into an unsatisfiable conflict, which is the ADR's "cap surfaces a conflict, never a hang"
  applied one layer down.
- **No calendar means wall clock**, matching `workingMinutesBetween` exactly — `nextWorkingInstant`
  passes the instant through and `addWorkingMinutes` adds wall-clock minutes. If these two disagreed,
  a duration computed one way and skewed the other would drift.
- **Zero minutes still snaps.** `addWorkingMinutes(start, 0)` is `nextWorkingInstant(start)`, so a
  milestone dropped on a Saturday reports Monday 09:00 rather than staying in dead time.
- **Forward only.** ALAP needs the mirror, and it lands in slice 5 with the `shift.ts` naming fix
  rather than as unused surface here.

The suite asserts the round trip against Phase 1's measure: for several starts and durations,
`workingMinutesBetween(start, addWorkingMinutes(start, n)) === n`. That is the property that makes the
pair an inverse rather than two functions that merely look related — and it caught an arithmetic error
in a hand-written expectation while the implementation was right.

### Slice 2 — `solve()` with a real fixpoint, forward only ✅

New `src/solver/` with the ADR's signature, minus the two inputs later slices add:
`solve({ events, dependencies, anchors?, timeZone }) → { events, conflicts }`. Build the graph from
the request each call; relax until no position changes. Bounded by an explicit cap that returns an
**unsatisfiable conflict**, never a hang, and by cycle detection that names the cycle rather than
spinning to the cap.

This slice deliberately ships without calendars or constraints. Convergence is the risk worth
isolating: the current `visited` set makes re-propagation impossible, so replacing it with a
relaxation loop is the change most likely to loop or oscillate, and it should be proven against
dependency graphs alone before two more inputs can feed it.

`src/solver` joins `PURE_DIRS` in `validation/tests/purity.test.ts` in this slice, so the boundary is
enforced from the first commit rather than asserted later.

**`anchors` is the request's fixed points, not just the persisted flag.** ADR 0007 says
`manuallyScheduled` events are anchors, but the event the caller is *currently* moving is also a
fixed point for that one call even though it usually isn't `manuallyScheduled` — that is what
`sourceId` meant in today's `propagateToPredecessors`/`propagateToDependents`. `solve()` takes an
optional `anchors: Array<string>` of ids alongside the events, and unions it with every event whose
`manuallyScheduled` is `true` before relaxing. Nothing here wires a caller yet (that is slice 6), so
the field is exercised only by tests until then.

**One relaxation rule replaces the two directional walks.** `propagateToPredecessors` and
`propagateToDependents` both exist today because the source event is a fixed point and everything
around it — predecessors and dependents — has to react. A fixpoint doesn't need two walks: for every
dependency edge, `requiredForwardShiftMs` gives the same signed shortfall either function used, and
there are only three cases —
- successor is free → push it forward (this is `propagateToDependents`'s case),
- successor is fixed and predecessor is free → pull the predecessor backward instead (this is
  `propagateToPredecessors`'s case, reached by the same formula rather than a mirrored one),
- both fixed and still violated → that edge can never resolve, so it is reported as a conflict once
  and excluded from the loop rather than rechecked every pass.

Iterating this rule to a fixpoint (instead of walking outward from one source with a `visited` set)
is what makes a diamond graph converge correctly — two chains pushing the same successor from
different directions need more than one pass over that node, which a single directional walk cannot
give it.

**Cycle detection runs once, up front, structurally — not as a symptom of non-convergence.** A DFS
over the raw `predecessorId → successorId` edges (three-state visited/visiting/done, same shape as
any topological-sort cycle check) finds a genuine graph cycle before relaxation starts, names every
id on it, and its edges are excluded from the loop the same way an unsatisfiable both-anchored edge
is. That leaves the iteration cap to catch a different failure: two edges that are individually
satisfiable but pull the same free node in opposite directions forever (predecessor-edge wants it
later, fixed-successor-edge wants it earlier) — a cycle in the *relaxation* graph that does not exist
in the *dependency* graph, and the only way to see it is to run out of iterations. The cap is
`events.length + 1`, sized to the graph the way the phase's open question asks for rather than a
constant; a 40-node legal chain is the regression test that it does not false-flag.

### Slice 3 — constraints clamp inside the loop ✅

The six `ConstraintType`s move from veto-only to clamping. This is the semantic shift in the phase:
today `constraint-validate` rejects a batch that violates a constraint; inside the solver a
constraint **clamps** a proposed position, and the clamp then invalidates downstream dependencies and
must re-propagate. That interaction — dependency pushes, constraint clamps, clamp invalidates the
dependency — is the exact case ADR 0007 says a single pass cannot converge.

`constraint-validate` stays where it is. A clamp that cannot be satisfied is a conflict, and the
validate stage remains the backstop that proves the solver did not emit an illegal schedule.

`clampToConstraint` (`validation/constraints/clamp.ts`) runs as a second pass inside the same
relaxation loop, after the dependency pass, over every event carrying a `constraint`. If it moves a
position, that sets `changed`, so the next iteration re-checks dependencies against the clamped
position — the same fixpoint slice 2 built, not a second loop. Anchored events are skipped: an anchor
is a fixed point for dependencies and stays fixed for its own constraint too, so a constraint an
anchor violates is left for `constraint-validate` to report rather than the solver moving a fixed
point to satisfy it. No new conflict code was needed — a constraint fighting a dependency forever
already surfaces through the existing iteration-cap `unsatisfiable` conflict, since clamp-driven
`changed` participates in the same stall check as dependency-driven `changed`.

`CONSTRAINT_ANCHOR` and `isDateOnlyConstraint` were exported from `checkConstraint.ts` (previously
unexported `ANCHOR`/`isDateOnly`) so `clamp.ts` can share the anchor-side/date-only logic instead of
duplicating it.

### Slice 4 — calendar skew wired in ✅

Slice 1's primitives enter the loop: propagation moves a successor by working time rather than wall
clock, and duration is resolved in working minutes. After this slice the ADR's motivating scenario
works end to end — a dependency pushes a successor, the successor's calendar skews it across a
weekend, a constraint clamps it, and the graph re-propagates.

`SolveRequest` gained `workingTime?: WorkingTimeConfig`; `SolveEvent` gained `calendarId`, `resources`
and an optional `duration` (working minutes, authoritative when given). Per event, `solve()`
precomputes its working-time layers and its working duration once from the *original* span via
`resolveWorkingLayers`/`workingMinutesBetween` (both exported from `validation/duration` — the
duration module's own `layersOf` became the shared `resolveWorkingLayers` rather than a second
implementation). The successor-push branch of the relax loop replaced its wall-clock `shiftSpan` end
with `nextWorkingInstant` on the desired start and `addWorkingMinutes` from there — the event keeps
the working-minutes duration it started with, relocated to the next working instant. `null` from
`nextWorkingInstant` (a calendar with no working time ever) becomes an `unsatisfiable` conflict,
reported once via a per-event guard rather than once per remaining iteration, and the position is
left unmoved rather than spun against the iteration cap.

**Predecessor-pull stays wall-clock.** The other relax branch — successor anchored, predecessor
pulled backward — is untouched by this slice: it needs the backward mirror of `addWorkingMinutes`,
which slice 1 deliberately deferred ("Forward only. ALAP needs the mirror.") to slice 5. Until then, a
predecessor pulled backward under dependency pressure can land in non-working time; only the
forward-push path the ADR scenario describes is calendar-aware.

Constraint clamping (slice 3) is unaffected — a constraint's date is an explicit civil deadline, not a
value the calendar computes, so it has nothing to skew.

### Slice 5 — ALAP

`direction` on the request, honoured. Preceded by the `shift.ts` cleanup above. ASAP stays the
default; ALAP is the mirror, and the naming fix is what makes the mirror readable.

### Slice 6 — the pipeline swap

`dependencyModule`'s `schedule` contribution is replaced by a call to `solve()`. The existing
delta-cascade behaviour has to survive as the degenerate case — no calendars, no constraints, all
events auto-scheduled — because the whole Phase 1 suite plus `examples/react/timeline` depends on it.
That equivalence is the acceptance test for this slice, and it is the reason `solve()` is built and
proven in isolation first.

## Open questions

- **Does the solver run on every write, or only on writes that touch scheduling inputs?** Running it
  unconditionally makes behaviour uniform but pays fixpoint cost on an unrelated title edit. The
  current stage already gates on "did start or end change", and some gate is likely needed; where it
  goes decides whether `solve` is the stage or something the stage calls.
- **What does `solve()` return when it converges but leaves conflicts?** ADR 0007 says conflicts are
  data and the consumer renders resolution, which implies a partial schedule plus conflicts rather
  than all-or-nothing. That contradicts the kernel's current `committed | rejected` result, where a
  rejected batch mutates nothing. Reconciling the two is a Phase 2 decision, not a Phase 3 one.
- **Candidate fixes** (roadmap: "conflict data + candidate fixes") are only well-defined where a
  resolution is deterministic. Which conflicts qualify is unresolved, and the honest default is to
  ship conflict data first and add candidates per conflict type as each one earns it.
- **Iteration cap value.** A cap that is too low reports unsatisfiable on a legal deep graph; too high
  and a pathological graph stalls the interaction. Likely a function of graph size rather than a
  constant, and it needs a test that a legal long chain does not hit it.

## Definition of done

- [ ] `solve()` is pure, serializable in and out, and `src/solver` is inside `PURE_DIRS`.
- [ ] Dependencies, constraints, calendars and effort/duration interact through one fixpoint that
      converges, with cycles and the iteration cap reported as conflict data.
- [ ] ASAP and ALAP both honoured from the request, not from the event.
- [ ] The `schedule` stage calls the solver, and the pre-existing delta-cascade behaviour is
      unchanged for the degenerate case the current suite covers.
- [ ] No stage outside `schedule` changes, and all four validate stages still pass on solver output —
      the solver proposes, the validate stages remain the contract.
