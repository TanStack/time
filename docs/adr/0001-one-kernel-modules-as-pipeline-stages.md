# One kernel; modules are declared pipeline stages, not a hook bus

## Status

accepted

## Context

TanStack Time bundles several time products (Calendar, Scheduler, Timeline/Gantt). The
current `CalendarCore` is a ~3,800-line god class that fuses viewport, projection,
recurrence, availability, dependencies, drag-resize, undo/redo, and timeline layout. We
want to decompose it into a modular system (in the style of TanStack Table v9 / AG Grid
modules) so unused features tree-shake away.

## Decision

There is exactly **one feature-agnostic kernel** (event collection + viewport + date-range
projection + plain create/edit/remove). Calendar, Scheduler, and Timeline are **products** =
kernel + a preset of modules + a view — not separate cores. This mirrors TanStack Table's
single core; there is no `SortableTableCore`.

Modules attach via **two ordered pipelines with kernel-defined stages and per-module
priority within a stage** — not a `beforeWrite`/`afterWrite` hook bus run in registration
order:

- **Projection (read):** `recurrence-expand → clip-to-viewport → layout`. Scheduling adds an
  inverse tail (`availability − busy → free slots`).
- **Write (mutate):** `recurrence-materialize → dependency-transform → availability-validate
  → commit → undo-snapshot/emit`.

Rules: a user action produces **one atomic write batch** (original + cascaded writes) so
undo/redo wraps the batch; **validation is veto-only and kept separate from transformation**;
modules never call each other directly; stage order is kernel-defined and not
module-overridable.

## Considered Options

- **Middleware / event-bus** (modules subscribe to lifecycle hooks, run in registration
  order). Rejected: ordering becomes implicit and non-deterministic — the perennial
  ESLint/Babel plugin-ordering problem — and the room-at-capacity-recurring-occurrence-with-
  a-dependent scenario has exactly one correct order that registration order can't guarantee.

## Consequences

- The kernel must enumerate pipeline stages up front, which bounds what a third-party module
  can do. Acceptable for a domain this constrained.
- The kernel must stay strictly feature-agnostic so future non-calendar features reuse it.
