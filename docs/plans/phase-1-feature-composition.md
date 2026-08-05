# Phase 1 — Feature composition plan

Implements ADR 0009. Turns the fixed module set and the flat 49-key `useCalendar` return into
**consumer-composed features**: `features` becomes a required option built by
`calendarFeatures({ ... })`, modules contribute their own methods, and the instance surface is
the intersection of what was composed.

Lands **first** in Phase 1. ADR 0008 (working-time hierarchy) and ADR 0007 (solver fields)
attach as features (`workingTimeFeature`, `schedulingFeature`), so doing this after them means
writing them twice.

**Method:** same strangler-fig as Phase 0. The 1,007 tests stay green after every slice.
`CalendarCore`'s surface keeps working until slice 5 deliberately removes it — the methods
become thin delegates to module apis before the composition seam is exposed, so no slice both
moves logic and changes the public shape.

---

## Where the surface splits

`CalendarCore` has 37 public methods. Grouping them is the whole design:

| Owner | Methods |
|-------|---------|
| **core** (always) | `getEvents` · `setEvents` · `setResources` · `addEvent` · `commitAdd` · `commitUpdate` · `removeEvent` · `ensureRangeLoaded` · `getLoadedRanges` · `getDaysInRange` · `getDaysWithEvents` · `groupDaysBy` · `getTimeSlots` · `getEventsByDate` · `getAllDayEventsByDate` · `formatPeriodLabel` · `formatCurrentPeriod` |
| `historyFeature` | `canUndo` · `canRedo` · `undo` · `redo` |
| `eventRecurrenceFeature` | `editRecurringEvent` · `removeRecurringEvent` · `getMasterEvent` · `goToNextOccurrence` · `goToPreviousOccurrence` |
| `eventDependencyFeature` | `createDependency` · `validateEventDependencies` |
| `resourceAvailabilityFeature` | `getUnavailableRanges` · `getUnavailabilityDetails` · `validateEventPlacement` |
| `eventResizeFeature` | `createResizeController` · `getEventSegmentInfo` · `validateResize` |
| `createDayEventModel()` | `getEventProps` |
| `createTimelineModel()` | `getTimelineLayout` · `getEventsByResource` |

`validateMove` is deliberately absent: it consults dependency *and* availability rules, so it
stays on core and asks the kernel's validate pipeline what is mounted. That is what the veto
stage already does — a composite validator is not a feature.

## Slices

### Slice 1 — the `Module.api` seam ✅

`Module<E, TApi>` gained `api?: (ctx: ModuleApiCtx<E>) => TApi` and `requires?: string[]`.
`ModuleApiCtx` exposes `write` / `project` / `getEvents` / `getEvent` / `config`, so an api can
drive the kernel it is mounted on without the kernel importing anything feature-shaped.

`createKernel({ events, modules })` composes and returns `Kernel<E, ComposedApi<TModules>>` —
the merged api is typed as the intersection of what was passed. `E` is inferred from the
modules record (`events` is `NoInfer` so an inline event literal cannot widen it).

Two wiring errors throw at construction rather than going quiet: a module whose `requires` is
not mounted (checked over the full set, so mount order does not matter), and two modules
contributing the same api key.

`undoModule` is the proof: it returned `Module<E> & UndoHistory<E>` — an ad-hoc api bolted to
the module object — and now returns `Module<E, UndoHistory<E>>` with `api`. `CalendarCore`
reads `this._kernel.api.canUndo()`.

### Slice 2 — move the methods onto module apis

Per feature: recurrence → dependency → availability → resize → models. Each step moves the
method bodies from `CalendarCore` into the module's `api` and leaves a one-line delegate behind.
Public surface unchanged, so `calendar.test.ts` is the characterization net.

**Landed:** `validateEventDependencies` → `dependencyModule.api` (18 characterization tests
cover it), `getMasterEvent` → `recurrenceModule.api`, `goToNextOccurrence` /
`goToPreviousOccurrence` / `editRecurringEvent` / `removeRecurringEvent` →
`eventRecurrenceFeature`, `createDependency` → `eventDependencyFeature`. `CalendarCore` is down
to 2,238 lines from 2,755.

**What the first two moves revealed.** `ModuleApiCtx` is enough for reads and validators, and
not enough for anything else. Sorting the remaining methods by what they actually touch:

| Needs | Methods |
|-------|---------|
| kernel ctx + module options — movable now | `validateEventPlacement` · `getUnavailableRanges` · `getUnavailabilityDetails` · `getEventSegmentInfo` · `validateResize` · `getEventProps` · `getTimelineLayout` · `getEventsByResource` |
| the host instance | `createResizeController` (the recurrence writes, `createDependency` and the navigation pair are done) |

The host-dependent group is the orchestrating writes and the navigation pair. `editRecurringEvent`
calls `editEvent`, the two validators, `fetchEventsForRange` and the kernel write path;
`createDependency` calls `validateMove` and `commitUpdate`; `goToNextOccurrence` needs
`goToSpecificPeriod` and `store.state.activeDate`; `createResizeController` passes `this` to the
controller. None of that is reachable from a kernel ctx, and none of it belongs *in* the kernel.

**Resolved: a feature is a kernel module plus a host-aware api.** `CalendarFeature` in
`calendar/features/types.ts` carries an optional `module` (kernel stages, kernel ctx — unchanged)
and an optional `api` that receives a narrow `CalendarHost`. `ComposedFeatureApi` intersects both
per feature, so the composed instance type covers module apis and feature apis alike. Features
see the host, not each other; a feature that needs a peer declares `requires`.

`CalendarHost` grows only under pressure from real conversions — it is the allowlist of what
features may touch, not a projection of the core surface. The navigation pair took `getEvent`,
`getEvents`, `getActiveDate` and `goToSpecificPeriod`; `createDependency` added `commitUpdate`
and `validateMove`; the recurrence writes added `write`, `fetchEventsForRange`, `editEvent`,
`removeEvent`, `validateEventDependencies` and `validateEventPlacement`. Twelve members for six
methods, and `validateMove` staying on the host is the concrete case for keeping composite
validators out of features.

`eventRecurrenceFeature` wraps `recurrenceModule` and owns the navigation pair plus
`editRecurringEvent` / `removeRecurringEvent`; `eventDependencyFeature` wraps `dependencyModule`
and owns `createDependency`, which is the case the seam was chosen for — it calls `commitUpdate`
*and* `validateMove`, and its cycle guard and commit path are pinned by 1 and 10 tests
respectively. `CalendarCore` builds the features, mounts `feature.module`, merges the apis, and
delegates.

The recurrence writes brought their private helpers along: `_resolveOccurrenceStart`,
`_durationPreservingEnd`, `_writeOccurrenceEdit`, `_writeOccurrenceRemove`,
`_emitRecurrenceResult` and `_addedFrom` are gone from `CalendarCore`, which now holds no
occurrence-editing code at all. The bodies moved unchanged, but five branches turned out to be
unpinned — placement and dependency rejection, the `thisAndFollowing`-at-master-start shortcut,
the range fetch, and the unknown-occurrence guard — so slice 2 added five characterization tests
(1,012 total) before trusting them.

**Availability is blocked for a second, unrelated reason.** Its read methods are movable, but
`availabilityModule` bundles a veto contribution on `availability-validate`, and mounting it on
`CalendarCore` would make the `commit*` methods — documented as post-validation APIs — silently
no-op on conflict. Taking the api requires either splitting the veto out of the module or
accepting a behaviour change. Not a slice-2 decision.

### Slice 3 — `calendarFeatures()` and the `features` option

`calendarFeatures({ ... })` returns its argument with a `const` type parameter (the v9
`tableFeatures` shape). `CalendarCore` composes `createKernel` from it instead of the hardcoded
`{ history, recurrence, dependency }` record, and spreads `kernel.api` onto itself so the
surface stays flat.

`allCalendarFeatures` ships here, deprecated on arrival: it is exactly today's set, so
`useCalendar({ features: allCalendarFeatures, ... })` reproduces the current instance.

Collision check moves up a level too — an api key may not shadow a core method.

### Slice 4 — gate the type, thread it through the adapters

`Calendar<TFeatures>` intersects the composed apis; `calendar.undo()` stops typechecking
without `historyFeature`. Shared domain types (`Event`, `Day`, `Resource`) stay non-generic per
ADR 0009.

`useCalendar` returns the composed type rather than a fixed 49-key object, and both examples
migrate to explicit feature lists. The Solid adapter is written against this shape rather than
porting the monolith.

### Slice 5 — remove the preset

One release later: delete `allCalendarFeatures` and the delegating shims left by slice 2.

## Open questions

- **Peer requirements.** ADR 0009 says a feature declares required peers and construction
  throws. Slice 1 implements the mechanism but no real module declares `requires` yet — resize
  clamps from its own `resources` option, so it does not actually need
  `resourceAvailabilityFeature`. If a real peer requirement never appears by slice 3, the
  mechanism should be deleted rather than kept speculatively.
- **Projection models vs. modules.** `layoutModule` is already a projection stage, so
  `createDayEventModel()` may be a rename rather than a new construct. Decide in slice 2 once
  `getEventProps` has moved.

## Definition of done

- `features` is required; no implicit module set anywhere in the packages or examples.
- Every method in the table above is reachable only when its feature is composed, and fails to
  typecheck otherwise.
- A read-only day view composes `createDayEventModel()` alone and pulls in no recurrence,
  dependency, resize or timeline code — verified against the built bundle, not by inspection.
