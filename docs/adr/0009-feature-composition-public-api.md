# Features are composed by the consumer; the instance surface is what they composed

## Status

accepted

## Context

Phase 0 split `CalendarCore` into a feature-agnostic kernel plus modules (ADR 0001): recurrence,
availability, dependency, resize, undo, layout. The kernel tree-shakes — `sideEffects: false`, one
output file per module — but nothing reaches that seam. `CalendarCore` mounts a fixed module set,
and `useCalendar` returns a single 49-key object, so a consumer rendering a read-only day view
still ships recurrence expansion, dependency cascade, resize geometry and timeline lane packing.

The kernel also has no way for a module to contribute public API. Modules declare pipeline stages
only, so every user-facing method — `editRecurringEvent`, `undo`, `getTimelineLayout` — lives on
the god class regardless of which modules are mounted. Step 4 of the decomposition hit this and
deferred it: a read seam invented then would have been replaced at cutover. The cutover is done.

## Decision

- **`features` is a required option**, built by `calendarFeatures({ ... })`. The kernel mounts
  exactly what it is given; there is no implicit module set.
- **Three kinds of entry go in the features object**, mirroring v9:
  - **features** — kernel modules (write stages + api): `eventRecurrenceFeature`,
    `eventDependencyFeature`, `resourceAvailabilityFeature`, `eventResizeFeature`,
    `historyFeature`.
  - **models** — projection stages, opt-in and memoized, the `getSortedRowModel` analogue:
    `createDayEventModel()`, `createTimelineModel()`. A model not passed does not run and its
    accessors are absent.
  - **fns** — pluggable strategy functions: `overlapFns` (`columns` / `expand` / `cascade`, already
    plain functions per ADR 0003), conflict-message fns.
- **`Module` gains an `api` contribution.** A feature returns the methods it owns; the kernel merges
  them onto the instance. This is the read/query seam Step 4 deferred.
- **There are two api seams, because there are two hosts.** A kernel module's `api` receives
  `ModuleApiCtx` (write / project / getEvents / config) and owns whatever the module's own state
  can answer. A *feature's* `api` receives the composed calendar instance and owns the public
  methods that compose core mutations or navigation — `editRecurringEvent` calls `commitUpdate`
  and `validateMove`, `goToNextOccurrence` calls `goToSpecificPeriod`. Widening `ModuleApiCtx` to
  cover those would put calendar-shaped concerns into the feature-agnostic kernel, which is what
  ADR 0001 exists to prevent, so a feature is a kernel module *plus* a host-aware api rather than
  only the former. Features see a narrow `CalendarHost` interface, not each other.
- **The instance type is the intersection of the composed features' apis.** `calendar.undo()` does
  not typecheck without `historyFeature`. Shared domain types (`Event`, `Day`, `Resource`) stay
  non-generic — feature gating applies to the instance surface, not to every type in the library.
- **Adapters stay thin.** `calendarFeatures` and instance construction live in `@tanstack/time`;
  `useCalendar` wraps construction plus store subscription, as `useReactTable` wraps
  `constructTable`.
- **`allCalendarFeatures` ships for one release.** Today's surface keeps working via
  `useCalendar({ features: allCalendarFeatures, ... })`, deprecated on arrival, removed the release
  after. Consumers migrate once, incrementally.

## Considered Options

- **Feature hooks** (`useResize(calendar)`, `useRecurrence(calendar)`) — splits the surface by
  convention. Rejected: the core still mounts everything, so nothing tree-shakes, and each adapter
  reimplements the split. Composition at construction gets both for free.
- **Full v9-style generic threading** (`TFeatures` through `Event`, `Day`, options, props) —
  rejected for now: maximum safety at v9-level generic weight, slower `tsc`, worse errors. Gating
  the instance surface covers the mistake that actually happens (calling a method whose feature
  is not installed) and leaves the door open.
- **Runtime composition with a flat optional type** (`calendar.undo?.()`) — rejected: cheapest to
  build and the composition would be real, but every call site becomes optional-chained and the
  compiler stops helping.
- **Keep the fixed module set, tree-shake by entrypoint** (`@tanstack/time/recurrence`) — rejected:
  moves the choice to import paths, still cannot gate the instance surface, and forks the docs.

## Consequences

- Breaking: `features` becomes required. Sequenced **before** ADR 0008 (working-time hierarchy) and
  ADR 0007 (solver fields) so those land as features (`workingTimeFeature`, `schedulingFeature`)
  rather than being retrofitted twice.
- `Module` grows a second contribution kind; the kernel gains api merging and per-model
  memoization. Stage ordering and veto-only validation (ADR 0001) are unchanged.
- Docs and both examples move to the composed form; the Solid adapter is written against the split
  from the start rather than porting a monolith.
- A feature can be omitted that another expects (resize wanting availability clamping). Features
  declare required peers and construction throws naming the missing one — a wiring error, loud,
  the same rule the kernel already applies to unclaimed intents.
