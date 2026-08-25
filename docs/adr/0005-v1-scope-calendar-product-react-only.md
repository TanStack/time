# v1 scope: Calendar product, React-supported, some deferred

## Status

accepted

## Context

The designed surface is large: Date Primitives + a feature-agnostic kernel + ~6 modules +
3 products (Calendar/Scheduler/Timeline) + several views + a server package + five framework
adapters (the `package.json`/README advertise React, Solid, Vue, Svelte, Angular). Shipping
all of it as v1 would take ~a year and leave every part shallow.

However, the current `CalendarCore` already implements more than the original "Calendar only"
plan. Dependencies (FS/SS/FF/SF), undo/redo, and timeline layout are all present and working.
Removing them from the public API would be additional work with no user benefit, and they
will naturally become modules once the kernel is extracted (ADR 0001). Keeping them in v1
acknowledges the code we have.

## Decision

**In v1:**

- **Date Primitives** (the date-fns alternative layer).
- **The feature-agnostic kernel** (event collection + viewport + projection + plain CRUD +
  `getRequiredRange`/rollback).
- **The Calendar product** with modules: **recurrence** (UI-builder subset), **drag-resize**,
  **advisory availability**.
- **Dependencies / FS-SS-FF-SF** — already implemented; ships as part of the Calendar product
  and becomes a proper module during modularization.
- **undo/redo** — already implemented; ships in v1 and becomes a module during
  modularization.
- **Timeline/Gantt view** — already implemented; ships in v1 as a view, not a separate product.
  The product split (Calendar vs Scheduler vs Timeline) remains architectural intent; the view
  is what ships now.
- **Isomorphic validation core + `@tanstack/time` server package** (`loadEvents` adapter).
- **React adapter** as the supported target; **Solid** kept as the proof the core is
  framework-agnostic, not a QA'd v1 target.
- **Timezone- and calendar-system-correct internally**, but **QA'd/supported on Gregorian +
  ISO-week + arbitrary IANA timezones/DST** for v1.

**Deferred (explicit no for v1):**

- **Scheduler** product — a preset over the same kernel/modules (ADR 0001), so it is a
  fast-follow once Calendar proves the architecture.
- **Vue / Svelte / Angular** adapters.
- **`.ics` / full RFC 5545 RRULE interop.**
- **Non-Gregorian calendar QA** (must keep *working* via Temporal; not a v1 support promise).

## Considered Options

- **Ship all three products + five adapters** — rejected: a year of shallow surface.
- **Scheduler in v1** (Calendly was in the original pitch) — deferred: it is a preset over the
  same kernel/modules (ADR 0001), so it is a fast-follow once Calendar proves the architecture.
- **Cut dependencies/undo/timeline from v1** — rejected: they are already implemented and
  removing them from the public API is wasted work. They become proper modules during
  modularization instead.

## Consequences

- The `package.json`/README five-framework claim is aspirational, not v1 — update messaging to
  avoid implying Vue/Svelte/Angular are ready.
- Dependencies, undo/redo, and timeline view stay in the v1 public API but are treated as
  "modularization targets" — they will be extracted into proper modules once the kernel is
  established (ADR 0001).
