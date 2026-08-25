# Scheduling solver: a fixpoint stage inside the write pipeline, client-authoritative

## Status

accepted

## Context

ADR 0001 models writes as a single **linear** pass:
`recurrence-materialize → dependency-transform → availability-validate → commit`. That is
sufficient for the current delta-cascade behaviour (a predecessor moves, its dependents shift
by the same delta) but it is not a scheduler. A real scheduling solver — auto-scheduling with
ASAP/ALAP direction, scheduling constraints (start-no-earlier-than, must-start-on,
finish-no-later-than, …), working-time calendars (ADR 0008), effort/duration, and FS/SS/FF/SF
dependencies with lag/lead — is **not** a single pass. It is **fixpoint propagation**: a
dependency pushes a successor, the successor's calendar skews its dates across non-working
time, a constraint clamps it, the clamp invalidates a downstream dependency, and the graph
must re-propagate until it stabilises (or reports an unsatisfiable conflict).

Bryntum solves this with ChronoGraph, a reactive computation graph with identity and
in-place mutation. That directly conflicts with ADR 0006's requirement that every pipeline
stage be a **pure function with serializable I/O** so it can be marshalled to the server.

## Decision

- **The solver is one stage of the ADR 0001 write pipeline, not a replacement for it.** The
  linear pipeline survives unchanged; `dependency-transform` is generalised into a
  **`schedule` stage that runs its own fixpoint loop internally**. From the pipeline's point
  of view it is still one ordered stage that takes a write batch and returns a resolved write
  batch; the iteration is an implementation detail hidden behind a pure boundary.
- **Solver signature is pure and serializable:**
  `solve(request: { anchors, events, dependencies, constraints, calendars, direction }) →
  { events, conflicts }`. No store, no viewport, no DOM, no object identity across calls —
  the same shape ADR 0004's validation core already demands. Fixpoint state lives in local
  arrays/maps built from the request and discarded on return; nothing reactive escapes.
- **Iterate-to-fixpoint, not a reactive graph.** We build the dependency graph from the
  serializable request each call and run bounded fixpoint iteration (topological relaxation
  with cycle detection and an iteration cap that surfaces an unsatisfiable-conflict result
  rather than looping). We do **not** vendor or build a persistent reactive graph engine;
  its identity/mutation model is what breaks serialization.
- **The solver is client-authoritative; the server re-validates, it does not re-solve.**
  Auto-scheduling runs on the client where the interaction is. In `server` mode (ADR 0006)
  the server runs the **same pure solver as `validateWrite`** to confirm the proposed
  schedule is still legal against the authoritative event set — it re-checks, it does not
  independently recompute a schedule. This keeps the round-trip cheap and avoids two solvers
  disagreeing.
- **Auto-scheduling is opt-in per event.** Events carry a `manuallyScheduled` flag (Bryntum
  parity). Manually-scheduled events are anchors the solver honours as fixed; only
  auto-scheduled events are moved by propagation.
- **Conflicts are data, not exceptions.** An unsatisfiable set of constraints returns a
  structured `conflicts` list (the offending constraint, the events, the reason) so the
  consumer can render a resolution flow. The library does not ship the resolution dialog
  (headless), only the conflict data and, where a resolution is deterministic, the candidate
  fixes.

## Considered Options

- **Reactive computation graph (ChronoGraph-style).** Rejected: persistent identity and
  in-place mutation cannot cross ADR 0006's serialization boundary, and it would force a
  second, non-pure code path the server cannot share.
- **Keep the linear single-pass `dependency-transform` and call it a scheduler.** Rejected:
  cannot converge the deps × constraints × calendars interaction; the ADR 0001
  room-at-capacity-recurring-occurrence-with-a-dependent scenario generalises to exactly the
  case a single pass gets wrong.
- **Server re-solves independently.** Rejected: two solvers, two chances to disagree; the
  server's job is authority over data, not recomputation of UX intent.

## Consequences

- A new pure `@tanstack/time` solver module must be extracted alongside the validation core
  (ADR 0004) — it is the same purity discipline, so the extractions share a boundary.
- Dependencies gain **lag/lead**; events gain **constraints**, **manuallyScheduled**,
  **effort/duration**. These are type additions on the kernel event model and are breaking
  vs the current `dependsOn` shape — acceptable pre-1.0.
- The solver's cost is bounded by an explicit iteration cap; hitting the cap is reported as
  an unsatisfiable conflict, never a hang.
- This ADR supersedes the "dependency-transform" naming in ADR 0001's write pipeline; the
  stage is now "schedule".
