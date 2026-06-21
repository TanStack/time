# v1 scope: Calendar product, React-supported, much deferred

## Status

accepted

## Context

The designed surface is large: Date Primitives + a feature-agnostic kernel + ~6 modules +
3 products (Calendar/Scheduler/Timeline) + several views + a server package + five framework
adapters (the `package.json`/README advertise React, Solid, Vue, Svelte, Angular). Shipping
all of it as v1 would take ~a year and leave every part shallow.

## Decision

**In v1:**

- **Date Primitives** (the date-fns alternative layer).
- **The feature-agnostic kernel** (event collection + viewport + projection + plain CRUD +
  `getRequiredRange`/rollback).
- **The Calendar product** with modules: **recurrence** (UI-builder subset), **drag-resize**,
  **advisory availability**.
- **Isomorphic validation core + `@tanstack/time` server package** (`loadEvents` adapter).
- **React adapter** as the supported target; **Solid** kept as the proof the core is
  framework-agnostic, not a QA'd v1 target.
- **Timezone- and calendar-system-correct internally**, but **QA'd/supported on Gregorian +
  ISO-week + arbitrary IANA timezones/DST** for v1.

**Deferred (explicit no for v1):**

- **Scheduler** and **Timeline/Gantt** products.
- **Dependencies / FS-SS-FF-SF** — Timeline's reason to exist; pulling it out of the Calendar
  product also fixes today's code, where it is wrongly baked into the calendar.
- **undo/redo** and the **scheduling** module.
- **Vue / Svelte / Angular** adapters.
- **`.ics` / full RFC 5545 RRULE interop.**
- **Non-Gregorian calendar QA** (must keep *working* via Temporal; not a v1 support promise).

## Considered Options

- **Ship all three products + five adapters** — rejected: a year of shallow surface.
- **Scheduler in v1** (Calendly was in the original pitch) — deferred: it is a preset over the
  same kernel/modules (ADR 0001), so it is a fast-follow once Calendar proves the architecture.

## Consequences

- The `package.json`/README five-framework claim is aspirational, not v1 — update messaging to
  avoid implying Vue/Svelte/Angular are ready.
- Deferring dependencies/Gantt requires extracting it from `CalendarCore` rather than
  extending it.
