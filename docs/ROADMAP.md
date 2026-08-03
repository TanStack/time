# TanStack Time — Roadmap

**Goal:** a comprehensive headless library for all calendar / scheduling / date-operations
cases. **Strategy:** ship an alpha, then layer the rest across subsequent releases. **North
star for feature parity:** Bryntum Scheduler Pro — headless (data only; consumers render
geometry, editors, arrows, histograms).

The phase ordering is gated by two rules the team confirmed:

1. **Kernel first.** No new features land on the 3,872-line `CalendarCore` monolith. The
   ADR 0001 decomposition happens **before** the alpha; alpha slips rather than shipping the
   god class (resolves the "alpha now vs freeze features" tension in favour of freeze).
2. **Breaking changes are fine pre-1.0.** Calendar-hierarchy (ADR 0008) and solver-driven
   event-model additions (ADR 0007) land as breaking changes before/at the alpha so
   consumers migrate once.

---

## Phase 0 — Foundation refactor (gates the alpha)

Prerequisite for everything. Nothing user-facing.

- [ ] Decompose `CalendarCore` into **one feature-agnostic kernel + modules as pipeline
      stages** (ADR 0001).
- [ ] Extract **pure, isomorphic validation core** (`validate(write, events, config) →
      conflicts`) — no store/viewport/DOM (ADR 0004).
- [ ] Migrate boundary types: `Day.date`, `currentPeriod`, `activeDate` from
      `Temporal.PlainDate` → ISO strings; instants → native `Date` (ADR 0002).
- [x] Remove pixels from the core: `containerHeight` dropped from `getUnavailableRanges`
      (now `startFraction`/`endFraction` + `%`); logical layout (`startFraction`,
      `endFraction`, `column`, `columnCount`) lives in the `layout` projection stage with
      `toLayoutStyle` for `%` output. `getEventProps` / `getTimelineLayout` delegate to the
      pure cores (`layoutDaySegments`, `layoutTimelineRange`) and expose raw fractions
      (ADR 0003).
- [ ] Undo/redo → **command diffs**, not full-event snapshots (memory). Kernel side done:
      `undoModule` records one entry per committed write batch as inverse ops
      (`invertWriteOps`), and `history/undo` / `history/redo` intents replay them.
      `CalendarCore` keeps its snapshot stacks until the cutover gives it batches.

## Phase 1 — Alpha (Calendar product, React)

Ships once Phase 0 lands. Scope from ADR 0005 plus the pre-alpha breaking model changes.

- [ ] **Date Primitives** (already present — audit for ADR 0002 return-type contract).
- [ ] **Kernel**: event collection + viewport + projection + plain CRUD + `getRequiredRange`
      / rollback.
- [ ] **Calendar product** modules: recurrence (UI-builder subset), drag-resize, advisory
      availability.
- [ ] **Working-time calendar hierarchy** (ADR 0008) — replaces flat `Resource.availability`.
      Breaking; lands here so alpha ships the target shape.
- [ ] **Event-model additions** for the solver (ADR 0007): dependency **lag/lead**,
      `constraints`, `manuallyScheduled`, `effort`/`duration`. Types only + honoured by
      validation; full solver is Phase 2.
- [ ] Dependencies FS/SS/FF/SF (present) become a proper **module**.
- [ ] Undo/redo (present) becomes a **module**.
- [ ] Timeline/Gantt **view** (present) — ships as a view, not a separate product.
- [ ] **React** adapter supported; **Solid** kept as framework-agnostic proof.
- [ ] Update README/package messaging: five-framework claim is aspirational, not alpha.

## Phase 2 — Scheduling engine

The Bryntum moat. Requires Phase 0 purity + Phase 1 calendar hierarchy.

- [ ] **Solver** (ADR 0007): fixpoint `schedule` stage, ASAP/ALAP, client-authoritative.
- [ ] Scheduling **constraints** (SNET / MSO / FNLT / …) honoured by the solver.
- [ ] Solver consumes **effective working-time** (ADR 0008) for date skew.
- [ ] **Conflict data + candidate fixes** (headless; consumer renders resolution).
- [ ] **Server re-validation** of the solved schedule via the shared pure core.

## Phase 3 — Scale & server mode

- [ ] **Data Strategy** `client | server` (ADR 0006): per-stage execution location.
- [ ] Server package **handlers** per delegatable op: `expandRange`, `getConflicts`,
      `generateSlots`, `validateWrite`, plus `solve` re-validation.
- [ ] **Write-sync protocol** (bidirectional; optimistic + server reconcile) beyond read-only
      `fetchEvents`.
- [ ] **Virtualization contract** for large datasets (windowed projection; no px in core).
- [ ] **`generateSlots`** — free/available-slot generation (booking / Calendly use case).

## Phase 4 — Scheduler product & richer scheduling

- [ ] **Scheduler product** as a preset over the kernel/modules (ADR 0001/0005).
- [ ] **Resource assignment** as a first-class M:N entity (per-assignment units/effort).
- [ ] **Resource histogram / utilization** data (bins; consumer renders).
- [ ] Recurrence completeness: **BYMONTHDAY / BYSETPOS / BYYEARDAY**, "2nd Tuesday", multi-rule.
- [ ] **Recurring time ranges** (highlighted zones).
- [ ] Non-continuous **time axis** (skip nights/weekends) + zoom/time presets, derived from
      working-time intervals.
- [ ] Event **layering modes** (pack / stack / mixed) beyond overlap-coloring.
- [ ] **Baselines**, **progress / percent-done**, travel/setup time as first-class.

## Phase 5 — Interop, more frameworks, polish

- [ ] **RRULE / .ics** import-export (RFC 5545).
- [ ] **MS Project** import.
- [ ] Export data contracts for PDF/PNG/Excel/print (headless; consumer renders/serializes).
- [ ] **Vue / Svelte / Angular** adapters.
- [ ] **RTL**, deeper localization.
- [ ] Non-Gregorian calendar QA (must keep *working* via Temporal throughout; supported here).
- [ ] Cross-scheduler drag / partners (data contracts).

---

## Deferred / explicitly out (revisit per phase)

- Rendering: arrows, editors, dialogs, histogram bars — **consumer's job** (headless).
  Example: `examples/react/timeline` renders dependency arrows with `@xyflow`.
- Concrete HTTP transport / routes — consumer owns transport (ADR 0004/0006).
- Batteries-included backend (storage, DB adapters, transactions).

## ADR index

| ADR | Decision |
|-----|----------|
| 0001 | One kernel; modules as pipeline stages |
| 0002 | Public return types: `Date` for instants, ISO strings for civil values |
| 0003 | Logical layout in core; % prop-getter for positioning |
| 0004 | Advisory client validation; authoritative server via shared pure core |
| 0005 | v1 scope: Calendar product, React-only, some deferred |
| 0006 | Client/server Data Strategy (computation push-down) |
| 0007 | Scheduling solver: fixpoint stage in write pipeline, client-authoritative |
| 0008 | Working-time calendars as id-referenced shared entities with resolution hierarchy |
