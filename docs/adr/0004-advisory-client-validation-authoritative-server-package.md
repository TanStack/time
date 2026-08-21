# Advisory client validation; authoritative server validation via a shared pure core

## Status

accepted

## Context

Fetching is TanStack Query's job (the kernel is sync over a supplied event collection). But
conflict/availability validation needs a complete view of the affected range, and the client
may hold only a partial cache and cannot see other users' concurrent writes. So client
validation cannot be authoritative.

## Decision

- **Client validation is advisory** — instant UX feedback only. The kernel exposes
  `getRequiredRange(write)`; the orchestration layer ensures that range is loaded (via Query)
  before running sync validation; writes are applied optimistically and rolled back if the
  server rejects.
- **The server is authoritative.** A `@tanstack/time` package provides the same validation as
  a **pure, isomorphic rule core** (`validate(write, events, config) → conflicts`) — no store,
  no viewport, no DOM. This forces availability/dependency/recurrence validation to be
  extracted from `CalendarCore` into pure functions both sides import. This extraction is
  mandatory, not optional.
- **Server package shape = rules + orchestration via an adapter.** The consumer implements
  `loadEvents(range, ctx) → Event[]` against their own DB; `validateOnServer(write,
  { loadEvents }, ctx)` computes the required range, loads, and runs the pure rules. The
  library never opens a DB connection.
- **Transactional isolation is the consumer's responsibility.** Read-validate-write is only
  race-free inside one transaction with a consistent/locked view; the package provides rules,
  not isolation. **Recommended backstop:** a DB exclusion constraint for raw time-overlap
  (e.g. Postgres `EXCLUDE USING gist (resource_id WITH =, tstzrange(start,end) WITH &&)`); the
  library rules cover what a constraint can't (availability windows, capacity, buffers,
  dependencies).

## Considered Options

- **Authoritative client validation** — rejected: impossible under partial caches / multi-user.
- **Batteries-included backend** (storage, transactions, route handlers, DB adapters) —
  rejected: that's a backend framework, not a time library; ties us to specific databases.

## Consequences

- Validation logic must be pure and isomorphic — a real refactor of the current god class.
- "Authoritative" is honest only when the consumer runs `loadEvents` + validate + write in one
  isolated transaction. This must be documented prominently, not implied.
