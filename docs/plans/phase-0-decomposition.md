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

### Step 6 — Drag-resize module ✅
`resizeModule` claims the `resize/apply` intent in a new **`resize-materialize`** transform
stage, the first stage in `WRITE_TRANSFORM_ORDER`. It turns `{eventId, edge, deltaMinutes}` into
one concrete update op via the pure `calculateResizedEvent`, so everything downstream — the
dependency `schedule` cascade, the availability veto — applies to a resize for free, in one
atomic batch. Resource availability is looked up through `mergeUnavailableMinuteRanges` (Step 4)
unless the payload passes explicit ranges.

Stage order matters: resize expands **before** `recurrence-materialize`, leaving room for a
resize of a recurring occurrence to expand into a recurrence intent later. Today the module only
handles plain events; resizing an occurrence stays in the god class until cutover.

Pure rules added to `validation/availability`:

- `checkDaySpan` — the god class's `getResizeConflicts`: which resources block a minute span on
  one day, plus the capacity check against the other events sharing that day. Collects **all**
  conflicts, unlike `checkAvailability`, which bails at the first one and prefixes messages with
  the event title.
- `toUnavailabilityConflict` / `describeUnavailability` — the conflict-shaping and
  `"Label (reason)"` text that `validateResize` had open-coded **five** times.

Deleting `getResizeConflicts`'s body also killed `_getWeekday`, `_getResourceDayAvail` and their
two caches — the last availability logic living on the class.

Coverage note: neutering `checkDaySpan` only broke 2 of 253 calendar tests, so the capacity
branch was untested. Added a characterization test that pins the "conflicts with … (capacity)"
message, verified against the pre-extraction implementation.

### Step 7 — Undo module ✅
`undoModule` records **command diffs**, not snapshots: its `emit` contribution stores one entry
per committed batch (`{reason, ops}`), so a resize plus the dependency cascade it triggered undo
together. Recording in `emit` means a vetoed write leaves no entry.

Undo and redo are intents (`history/undo`, `history/redo`) claimed in a new
**`history-materialize`** stage, first in `WRITE_TRANSFORM_ORDER`. Undo pushes
`invertWriteOps(entry.ops)`, redo replays the entry as-is, and both go through the normal write
path — so an undo is validated and cascaded like any other write instead of force-writing state.
An intent with an empty stack expands to nothing and commits nothing.

`invertWriteOp` / `invertWriteOps` / `concreteWriteOps` live in `kernel/history.ts`;
`Kernel.rollback` uses the same inversion now rather than its own copy. Note `rollback` still
bypasses the stages, so it does not touch the module's stacks — it is the kernel's own escape
hatch, not user-facing undo.

The module exposes `canUndo` / `canRedo` / `undoStack` / `redoStack` / `clearHistory` alongside
its contributions, and takes a `limit` that drops the oldest entries.

`CalendarCore` still snapshots the whole event array per write; converting it needs the batch
abstraction it only gets at cutover, so its stacks stay as they are for now.

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

### Step 9 — Boundary types (ADR 0002) ✅
`CalendarStore.currentPeriod` / `activeDate` are ISO `YYYY-MM-DD` strings. `DateCore` keeps the
Temporal arithmetic internally behind `currentPeriodPlain` / `activeDatePlain`, which re-attach
`options.calendar` when parsing, so month arithmetic in a non-ISO calendar behaves as before
while the stored value stays plain ISO.

`Day.date` is **removed** rather than restringified — `Day.isoDate` was already the documented
"use instead of manually formatting `date`" field, so keeping both would have been a duplicate.
`groupDaysBy` parses `isoDate` where it needs weekday arithmetic.

`ConvertTemporalToString` is gone: it existed to launder `Temporal.PlainDate` out of
`CalendarState` for `CalendarApi`, and now `CalendarApi extends CalendarActions, CalendarState`
directly. `useCalendar` returns the store values as-is instead of calling `.toString()`, so the
adapter no longer hides a leak — and the examples' `currentPeriod.split("[")[0]` hack for the
`[u-ca=…]` annotation is deleted.

**Not** in this step, despite ADR 0002 covering it: the Date Primitives still return
`{ value, options, asDate, asZonedDateTime, … }` — the `{ value, options }` tuple that ADR
explicitly rejected, plus a Temporal escape hatch. ROADMAP Phase 1 schedules that audit
("Date Primitives — audit for ADR 0002 return-type contract"); it is a separate breaking change
across every primitive and its tests, so it does not belong in Phase 0's last step.

### Step 10 — Cutover (in progress)

Slice 1 ✅ — **the god class writes in batches.** `CalendarCore` no longer snapshots the event
array per write. Every mutating path opens a `_writeBatch(reason, …)`, each mutation site records
an `InvertibleOp` (`add` / `update` / `remove`), and the batch lands on the undo stack as one
`{reason, ops}` entry — the same shape `undoModule` records, from the same `kernel/history.ts`
helpers. `undo` / `redo` replay ops instead of restoring a copy of the whole list.

Batches nest: `createDependency` → `commitUpdate` → `_applyDependencyShifts` is one entry, and
the dependency cascade is inside it, so one undo reverses the move and everything it pushed.
This is the batch abstraction the rest of the cutover needs — a `WriteBatch` is now a thing the
god class produces, not something only the kernel understands.

Two intentional behaviour changes, both pinned by tests (verified as the *only* differences by
re-running the new tests against the snapshot implementation):

- `event:undo` / `event:redo` list `updated` in application order, so an undo reports the
  cascaded event before the one that caused it. It used to follow event-array order.
- `setEvents` clears the history. Snapshot undo could resurrect the pre-`setEvents` list wholesale;
  replaying ops against a list that was swapped underneath is meaningless, so the stacks are
  dropped instead.

Slice 2 ✅ — **the god class writes through a `Kernel`.** `CalendarCore` mounts one with
`undoModule` + `dependencyModule`; `commitAdd`, `commitUpdate`, `removeEvent`, the recurrence
commit and `undo` / `redo` all call `_write(ops, reason)`, which writes to the kernel and mirrors
the committed batch onto `options.events` and the indexes. The god class is still the read-side
store, but it no longer *decides* anything about a write.

What that deleted: the private journal (`_writeBatch` / `_record`), both undo stacks,
`_cascadeAfterUpdate` and `_applyDependencyShifts`. `commitUpdate` no longer calls `propagate*`
at all — the dependency module's `schedule` stage produces the cascade ops, and `commitUpdate`
just emits `event:updated` for the extra ops the batch came back with.

Kernel changes this needed:

- `write(ops[], reason?)` — the recurrence commit replaces a master and adds split events in one
  atomic batch, so `write` had to take more than one op.
- `WriteBatch.replay` — a batch a module replays from history skips the remaining transform and
  validate stages. Without it, undoing a cascade re-derived the cascade from the inverse ops and
  double-applied it (the first symptom was an undo reporting `['b','a','a']`). Replay also has to
  bypass validation: a state the kernel committed once must be restorable even if a rule that
  changed since would now veto it.

Fetch paths (`fetchEvents`) push straight into `options.events`, so they re-seed the kernel
(`_syncKernel`) instead of writing — loading data is not a user write and must not enter history.

Slice 3 ✅ — **recurrence writes go through intents.** `recurrenceModule` is mounted on the
kernel, and `editRecurringEvent` / `removeRecurringEvent` write `recurrence/edit-occurrence` and
`recurrence/remove-occurrence` intents instead of calling `materializeRecurringEdit` /
`materializeRecurringRemove` themselves and hand-assembling ops. `_commitRecurringUpdate` is gone;
the god class reads the split event back off the committed batch for its `event:added` emit.

Both sides ran the same pure core before, so the ops are identical — the point is that the
duplicate call sites are gone. The branches that were never `_commitRecurringUpdate`
(`scope: "all"`, and `thisAndFollowing` at the master's own start) still route through
`editEvent` / `removeEvent`, which carry the validation the module's equivalent branches do not.

Occurrence navigation moved to pure `~/recurrence` helpers rather than a module, since navigation
belongs to `DateCore`: `masterIdOf` (the `_12` suffix rule, previously an inline regex),
`nextOccurrenceDate` and `previousOccurrenceDate` (horizon-bounded window expansion). Each is
callable with plain args and covered directly.

Slice 4 ✅ — **the kernel owns the events.** `options.events` is a lazily cached view over
`kernel.getEvents()`, rebuilt only when a write lands; assigning to it routes to `setEvents`.
Nothing in `CalendarCore` touches an event array any more (`this.options.events` appears zero
times), and `_write` no longer mirrors ops into one — it just maintains the derived indexes and
drops the cached view.

`Kernel.load(events, {replace})` is the seam for data that is **not** a user write: `fetchEvents`
merges pages through it, so lazy loading stays out of undo history without rebuilding the kernel
(the previous `_syncKernel` threw the kernel away on every fetch). `setEvents` seeds a fresh
kernel, which is also what clears history.

Reads that used to scan the array (`options.events.find(...)` in `validateResize`) now use
`_eventMap`, which was already maintained beside it.

Not done, and deliberately: **the resize controller keeps committing through `commitUpdate`**
rather than a `resize/apply` intent. It resolves the span itself during the drag from pixel
geometry and day rects, so it holds a start/end, not an `{edge, deltaMinutes}` — feeding a delta
back through the module would re-snap and re-clamp what the preview already decided. The intent is
the right entry point for non-DOM callers (server, keyboard, tests); the controller is not one.

Also not done: mounting `availabilityModule` on the god class's kernel. `commitAdd` / `commitUpdate`
are *commit* APIs — validation happens earlier in `editEvent` / `validateResize`, which return
structured results. A veto stage would turn those into silent no-ops. The veto belongs on the
assembly that replaces `CalendarCore`, where the write entry point validates and reports.

Remaining for the cutover: `_eventMap` / `_dateIndex` / `_dependentsMap` still live on the class as
projection-side indexes, and `_loadedRanges` still tracks fetch coverage there. Those move when the
kernel grows a projection cache and a sourcing module (ADR 0006), which is Phase 1 work, not
Phase 0.

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

### Where it landed

| Criterion | State |
|---|---|
| Kernel alone does CRUD + projection | ✅ `new Kernel()` with no modules, covered in `kernel.test.ts` |
| Modules exist per rule cluster | ✅ recurrence, availability, dependency, resize, undo, layout |
| Calendar product = kernel + modules | ⚠️ `CalendarCore` mounts recurrence + dependency + undo. `availabilityModule` is deliberately not mounted (its `commit*` methods are post-validation APIs; a veto would make them silent no-ops) and the resize controller commits a resolved span rather than a `resize/apply` intent |
| Unused modules tree-shake | ✅ `sideEffects: false`, one output file per module |
| Validation core runs with no store | ✅ enforced by `validation/tests/purity.test.ts`, which fails if a pure core imports the store, client, kernel or `CalendarCore`, or touches the DOM |
| Tests green | ✅ 1000 (was 239 at the start of Phase 0), 264 of them the `CalendarCore` characterization suite |

`CalendarCore`: 3,872 → 2,755 lines. What remains there is orchestration (validate-then-commit
entry points, user-facing messages, emits) and read-side indexes (`_eventMap`, `_dateIndex`,
`_dependentsMap`, `_loadedRanges`) — no scheduling, availability, recurrence or layout rules.

Deferred out of Phase 0 with a home already assigned:

- Date Primitives still return `{ value, options, asDate, asZonedDateTime }`, contradicting
  ADR 0002 → Phase 1 audit item.
- Read-side indexes and `_loadedRanges` move when the kernel grows a projection cache and a
  sourcing module (ADR 0006) → Phase 1.
- `overlappingEvents` (whole-map, time-overlap) vs `layout.overlapping` (day + track scoped) still
  read as the same thing and are not; renaming is breaking, so it needs a call.
