# Client / server Data Strategy (computation push-down)

## Status

accepted

## Context

The calendar should run in two modes, like AG Grid's Client-Side vs Server-Side Row Model:
everything in the browser, or backed by a server for large datasets / long recurrences /
org-wide availability. The defining trait of the server mode is not "it fetches" — it is that
*computation is delegated*.

## Decision

A pluggable **Data Strategy** (`client | server`) chosen at kernel construction decides *where
each pipeline stage executes* (refines ADR 0001 and ADR 0004). The consumer's calendar API is
identical in both modes.

- **Delegatable stages** (run server-side in `server` mode): sourcing, recurrence-expansion,
  availability/conflict, slot-generation. They run the **same pure Validation Core** as the
  client (ADR 0004) — the logic is never written twice; "mode" is only *where it executes*.
- **Always client-side:** clip-to-viewport and layout (% positioning is render-time).
- **Transport:** the kernel calls `strategy.run(operation, request)`. The library defines the
  serializable **operation contracts** (`expandRange`, `getConflicts`, `generateSlots`,
  `validateWrite`) and ships the **server-side handlers**; the **consumer owns the transport**
  (their endpoint, fetch/RPC, auth) — same philosophy as the `loadEvents` adapter. The request
  descriptor doubles as the TanStack Query key, so `server` mode = Query + server-side core
  with no new fetching machinery.
- **Serializability is free:** ADR 0002 already restricts the boundary to native `Date` + ISO
  strings + plain objects (no Temporal/class instances), which is exactly what lets a stage
  cross the network.
- **Validation authority by mode:** `client` mode — the client is the only validator, so
  advisory and authoritative collapse (local-first / single-user). `server` mode — exactly
  ADR 0004 (client advisory, server authoritative).

## Considered Options

- **Sourcing-only push-down** (server returns raw events, client computes) — rejected as a
  "mode": it is essentially what Query + `getRequiredRange` already provide and does not scale
  the compute.
- **Library ships a concrete HTTP transport + routes** — rejected: re-opens the backend-
  framework scope closed in ADR 0004.

## Consequences

- Each ADR 0001 pipeline stage must be implemented as a pure function with serializable
  I/O so it can run in-process or be marshalled to the server.
- The server package grows handlers per delegatable operation, not just `validateOnServer`.
