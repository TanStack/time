# Phase 0 — CalendarCore decomposition plan

Gates the alpha (ROADMAP Phase 0). Turns the 3,872-line `CalendarCore` god class into **one
feature-agnostic kernel + modules attached as pipeline stages** (ADR 0001), extracting a
**pure isomorphic validation core** on the way (ADR 0004) and preparing the solver seam
(ADR 0007).

**Method:** strangler-fig. The 239 existing tests (`calendar/tests/calendar.test.ts`,
5,596 lines) are the safety net — they must stay green after every step. No behaviour change
in Phase 0; only structure. Feature additions (lag/lead, solver, calendar hierarchy) come
**after** the kernel exists.

---

## Target architecture

```
DateCore (exists)        viewport + formatting + navigation + getCalendarDays
   │
Kernel (new, feature-agnostic)
   │  event collection (_eventMap) + indices + sourcing (fetch/loadedRanges)
   │  + getRequiredRange + rollback + two ordered pipelines + commit
   │
   ├── Projection pipeline (read):   recurrence-expand → clip-to-viewport → layout
   │                                 (+ inverse tail: availability − busy → free slots)
   └── Write pipeline (mutate):      recurrence-materialize → schedule
                                     → availability-validate → commit → emit

Modules (attach into stages, never call each other):
   recurrence · availability · dependency(+solver seam) · drag-resize · undo

Views (own the layout stage, % output — ADR 0003):
   day/week/workWeek · timeline/gantt
```

### Pipeline stage contracts (kernel-defined, not module-overridable)

```ts
// read
type ProjectionStage<E> = (ctx: {
  events: E[]; viewport: { start: string; end: string }; config: KernelConfig;
}) => E[];

// write — transform stages return a new batch; validate stages are VETO-ONLY (ADR 0001)
type TransformStage<E> = (batch: WriteBatch<E>, ctx: WriteCtx<E>) => WriteBatch<E>;
type ValidateStage<E> = (batch: WriteBatch<E>, ctx: WriteCtx<E>) => Conflict[];
```

### Intent ops: how feature-shaped writes stay out of the kernel

Some user actions are not a plain `add`/`update`/`remove` — a recurring edit carries
`{ scope, occurrenceStart, updates }` and expands into *several* concrete ops (master update
+ split add). Putting `edit-occurrence` into the kernel's op union would bake recurrence into
the feature-agnostic kernel, breaking ADR 0001.

Instead the kernel has one extra **opaque** op kind:

```ts
type WriteOp<E> = ConcreteWriteOp<E> | { kind: "intent"; intent: string; payload: unknown }
```

The kernel knows only that an intent exists and that **a module must expand it**. Modules
claim intents by namespaced name (`recurrence/edit-occurrence`) in an early transform stage
and replace them with concrete ops. The kernel enforces the invariant: **if any intent
survives the transform stages, `write()` throws** — an unclaimed intent is a wiring error, not
a domain conflict, so it fails loudly rather than silently committing nothing.

Consequences: `commit`/`rollback` only ever see concrete ops; a materialized multi-op
expansion is still **one atomic batch** (so undo wraps the whole split); and
`getRequiredRange` returns `Viewport | null`, since an intent's range can only be supplied by
the module that understands its payload.

Rules (ADR 0001): a user action → **one atomic write batch** (original + cascaded) so undo
wraps the batch; validation is **veto-only, separate from transform**; modules never call each
other directly; stage order is kernel-defined; per-module priority within a stage.

### What is the kernel vs a module vs a view

| Concern | Home | Current source |
|---|---|---|
| Event collection, `_eventMap`, `_dateIndex` | **kernel** | `_index*`, `getEventMap` |
| Sourcing / lazy fetch / `_loadedRanges` | **kernel** | `ensureRangeLoaded`, `fetchEventsForRange` |
| `getRequiredRange`, rollback, `commit` | **kernel** | scattered in `addEvent`/`editEvent` |
| Viewport, navigation, day building | **DateCore** (exists) | `getCalendarDays`, `goTo*` |
| Recurrence expand + materialize/edit | **module** | `expandRecurringEvent.ts`, `_commitRecurringUpdate` |
| Availability / capacity / buffer rules | **module** (pure core) | `_getResourceDayAvail`, `checkEventAvailability` |
| Dependency cascade (+ solver seam) | **module** (pure core) | `propagate*`, `getAffectedByDelta` |
| Drag-resize validation | **module** | `resizeController.ts`, `validateResize` |
| Undo/redo | **module** | `_undoStack`, `undo/redo` |
| `%` layout, overlap-coloring | **view** | `getEventProps`, `getTimelineLayout` |

---

## Extraction order

Leaf-first, each step gated on green tests. Steps 1–2 unlock everything; 3–8 are independent
enough to parallelize once the kernel skeleton lands.

### Step 1 — Kernel skeleton (strangler shell)
Move event collection, indices (`_eventMap`, `_dateIndex`, `_dependentsMap`), sourcing
(`_loadedRanges`, `fetch*`), and projection memo (`_mapVersion`, `_eventMapCache`) into a
`Kernel`. Define the two empty pipelines + `commit` + `rollback` + `getRequiredRange`. Leave
every other method on `CalendarCore` as a temporary delegating method. **Tests green.**

### Step 2 — Pure validation core (ADR 0004) — biggest leverage
Extract as pure functions with serializable I/O (no store/viewport/DOM), the shape the server
and solver reuse:
- **2a. Availability** — `getWorkingTime` / `checkAvailability(event, resources, config) →
  Conflict[]`. Most self-contained (already cache + minute math). Do first.
- **2b. Dependency rules** — `validateDependencies(event, deps, events) → Conflict[]` and the
  pure cascade `computeCascade(anchor, graph) → WriteBatch`.
- **2c. Recurrence rules** — `expandOccurrences(rule, range)` (already near-pure in
  `expandRecurringEvent.ts`) + occurrence resolution.
The class methods become thin wrappers over these. **This is the ADR 0004 refactor; do it
once, both sides import it.**

### Step 3 — Recurrence module ✅
`recurrence-expand` projection stage + `recurrence-materialize` transform stage, over 2c.
Materialize claims the `recurrence/edit-occurrence` and `recurrence/remove-occurrence`
intents (see above) and expands them via the pure `materializeRecurringEdit` /
`materializeRecurringRemove`. Still to move onto the module: `getMasterEvent`,
`goTo*Occurrence`, and the god class's `editRecurringEvent`/`removeRecurringEvent` entry
points (they delegate to the pure core today but still own fetch/validate/commit/emit).

### Step 4 — Availability module ✅
`availability-validate` **veto** stage over 2a (`availabilityModule`, calling the pure
`checkAvailability`).

The read side is pure functions, not module methods: the kernel has no read/query seam yet, so
a module cannot expose one without inventing API the cutover would replace. What matters for
ADR 0004 is that the rules are importable with plain args and zero kernel construction:

- `mergeUnavailableMinuteRanges(resources, date, resourceIds?)` (`validation/availability`) —
  merged unavailable minutes for a day. Union semantics: a minute is unavailable only when
  every selected resource is unavailable. Returns `null` when availability is unknowable (no
  resources, or none matching `resourceIds`) so callers can tell "no constraint" from
  "blocked all day".
- `toUnavailableRanges(ranges)` (`projection`) — the ADR 0003 view mapping: minutes →
  `startFraction`/`endFraction` + `%` strings + `HH:mm` labels. Owns the `UnavailableRange`
  type; `calendar/types.ts` re-exports it.
- `getUnavailabilityDetails(resources, date, startMinutes, endMinutes)` — per-resource reasons,
  already pure since Step 2.
- `mergeMinuteRanges` / `invertMinuteRanges` extracted from `resourceDayAvail`, which had the
  same merge-then-invert inline.

`CalendarCore.getUnavailableRanges` / `getUnavailabilityDetails` are now wrappers; the class
keeps only its per-day memo cache. `containerHeight` was already dropped in Step 8.

Still inline in the god class: `getResizeConflicts` re-derives which resources block a span —
Step 6 consumes these functions instead.

### Step 5 — Dependency module (+ solver seam) ✅
`schedule` transform stage over 2b (`dependencyModule`), shaped to host the ADR 0007 fixpoint
solver later: the stage hands a graph snapshot to a pure resolver and turns the returned shifts
into extra write ops, so swapping delta-cascade for a fixpoint pass touches one call.

Pure rules added to `validation/dependency`:

- `propagateToDependents` / `propagateToPredecessors` — the constraint walkers, extracted from
  the god class's `propagateEndDelta` / `propagateStartDeltaBackward`. They return
  `Array<CascadeShift>` and thread each hop's new position, so a chain settles in one pass. The
  optional `visited` set is shared across calls to stop the two directions from fighting over an
  event.
- `shiftToSatisfyLink` — the single-hop version, for `createDependency`.
- `hasDependencyPath` — cycle check, extracted from `createDependency`'s inline DFS.

The god class now computes shifts, then applies them: `_applyDependencyShifts` is the only place
that writes and emits. `validateMove` had two more hand-rolled copies of the same walkers (they
checked availability at each hop instead of collecting shifts) — both are gone, replaced by
"propagate, then check availability per shift". `computeCascade` stays for the delta-preview path
(`getAffectedByDelta`).

Behaviour note: validation and apply now walk with identical visited semantics. They differed
before — the validate copies marked a successor visited only after a positive shift, the apply
copy marked it on sight — so in a diamond graph the two could disagree about which events move.
Apply was authoritative; validation follows it now.

Still god-class orchestration until cutover: `createDependency` / `validateMove` own
fetch/validate/commit/emit and build the user-facing messages.

### Step 6 — Drag-resize module
`createResizeController`, `validateResize`, `getResizeProps` — reuse Steps 4 & 5 modules,
stop re-implementing availability/dependency checks inline.

### Step 7 — Undo module
`emit` stage. Convert full-snapshot stacks → **command diffs** (ROADMAP Phase 0 item). Wraps
one write batch = one undo entry.

### Step 8 — Views + `%` layout (ADR 0003) ✅ (core landed)
`projection/layout.ts` owns the logical layout: `layoutDaySegments(segments) → {startFraction,
endFraction, column, columnCount}` with interval-graph coloring scoped per overlap cluster,
plus `toLayoutStyle(layout, orientation)` mapping fractions → `%` for vertical/horizontal.
`layoutModule` mounts it as the kernel `layout` stage (splits multi-day, lays out per day,
attaches `layout` to each segment). `getUnavailableRanges` dropped `containerHeight` and now
returns `startFraction`/`endFraction` + `%` strings.

`getEventProps` and `getTimelineLayout` now delegate: `getEventProps` lays out the event's own
day bucket via `layoutDaySegments` + `toLayoutStyle` and also returns the raw `layout`;
`getTimelineLayout` uses `layoutTimelineRange` (fraction positions + lane packing across the
visible range) and `currentTimeFraction`, and exposes `startFraction`/`endFraction` next to the
existing `left`/`width` percentages. `computeTimelineEventPosition` is gone.

Behaviour change (intentional, ADR 0003): overlap columns come from cluster coloring, so
chained overlaps no longer over-narrow and events outside a busy cluster keep full width.

The primitive is `analyzeOverlaps(segments) → Array<OverlapInfo>`: per event the time fractions
plus the overlap facts — `overlapping` (ids), `concurrency`, `depth`, `cluster`/`clusterSize`/
`clusterDepth`/`clusterConcurrency`, `column`/`columnCount`/`columnSpan`. No geometry opinion.

A layout strategy is just `(info: OverlapInfo) => { crossStart, crossSize, zIndex? }`.
`LayoutOptions.strategy` takes either a function or the name of a built-in — `columns`
(default), `expand`, `cascade` (tuned by `cascadeOffset` / `minCrossSize`); the built-ins are
exported as `columnsStrategy` / `expandStrategy` / `cascadeStrategy(options)` so they can be
composed or replaced. `toLayoutStyle` maps whatever comes back, so no strategy touches CSS.

Set it on `new CalendarCore({ layout })` or override per `getEventProps(event, layout)` call.
Consumers that want to do their own thing read `getEventProps(event).layout` (an `OverlapInfo`)
or call `analyzeOverlaps` directly and ignore the strategy layer.

### Step 9 — Boundary types (ADR 0002) — last
Swap `Day.date`, `currentPeriod`, `activeDate` from `Temporal.PlainDate` → ISO strings;
instants → native `Date`. Done last so refactor churn doesn't multiply the type migration.

---

## Guardrails

- **Green after every step.** If a step needs a behaviour change to land, it is not a Phase 0
  step — defer it.
- **Add characterization tests before extracting** any cluster thin on coverage (resize
  conflicts, capacity edges, cascade cycles).
- **No cross-module calls.** If Step 6 wants availability, it consumes the Step 4 module's
  stage output, not a private method.
- **Purity check for Steps 2–5:** each extracted rule function must be callable with plain
  serializable args and no `this` — that is the ADR 0004/0006/0007 prerequisite, verified by
  importing it in a test with zero kernel construction.

## Definition of done

Kernel constructs with no modules and does plain CRUD + projection. Calendar product =
kernel + {recurrence, availability, dependency, drag-resize, undo} + day/week/timeline views.
Unused modules tree-shake. Validation core imports and runs with no store. All 239 tests
green; new purity + `%`-layout tests added.
