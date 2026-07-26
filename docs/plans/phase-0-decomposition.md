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

### Step 4 — Availability module
`availability-validate` **veto** stage over 2a. Owns `getUnavailableRanges` (drop
`containerHeight` per ADR 0003 → return minute ranges/fractions), `getUnavailabilityDetails`.

### Step 5 — Dependency module (+ solver seam)
`schedule` transform stage over 2b — delta-cascade **now**; the stage is shaped to host the
ADR 0007 fixpoint solver **later** without re-plumbing. Owns `createDependency`,
`validateMove`, `propagate*`.

### Step 6 — Drag-resize module
`createResizeController`, `validateResize`, `getResizeProps` — reuse Steps 4 & 5 modules,
stop re-implementing availability/dependency checks inline.

### Step 7 — Undo module
`emit` stage. Convert full-snapshot stacks → **command diffs** (ROADMAP Phase 0 item). Wraps
one write batch = one undo entry.

### Step 8 — Views + `%` layout (ADR 0003)
Move `getEventProps` / `getTimelineLayout` into a view owning the `layout` stage. Convert px
outputs → **fractions/%** (`startFraction`, `endFraction`, `column`, `columnCount`, `lane`).
Kernel stays pixel- and dimension-free.

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
