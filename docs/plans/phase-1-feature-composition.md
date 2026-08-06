# Phase 1 — Feature composition plan

Implements ADR 0009. Turns the fixed module set and the flat 49-key `useCalendar` return into
**consumer-composed features**: `features` becomes a required option built by
`calendarFeatures({ ... })`, modules contribute their own methods, and the instance surface is
the intersection of what was composed.

Slices 1-3 are done: the seam exists, every gatable method lives in a feature, and `features` is
accepted (defaulting to the full preset). Slices 4-5 gate the *type* and delete the delegates.

Lands **first** in Phase 1. ADR 0008 (working-time hierarchy) and ADR 0007 (solver fields)
attach as features (`workingTimeFeature`, `schedulingFeature`), so doing this after them means
writing them twice.

**Method:** same strangler-fig as Phase 0. The test suite stays green after every slice (1,007 at
the start of Phase 1, 1,029 now).
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
| `dayEventLayoutFeature` | `getEventProps` |
| `timelineFeature` | `getTimelineLayout` · `getEventsByResource` |

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

### Slice 2 — move the methods onto module apis ✅

Per feature: recurrence → dependency → availability → resize → models. Each step moves the
method bodies from `CalendarCore` into the module's `api` and leaves a one-line delegate behind.
Public surface unchanged, so `calendar.test.ts` is the characterization net.

**Landed:** `validateEventDependencies` → `dependencyModule.api` (18 characterization tests
cover it), `getMasterEvent` → `recurrenceModule.api`, `goToNextOccurrence` /
`goToPreviousOccurrence` / `editRecurringEvent` / `removeRecurringEvent` →
`eventRecurrenceFeature`, `createDependency` → `eventDependencyFeature`,
`createResizeController` / `getEventSegmentInfo` → `eventResizeFeature`, `getEventProps` →
`dayEventLayoutFeature`, `getTimelineLayout` / `getEventsByResource` → `timelineFeature`.
`CalendarCore` is down to 2,128 lines from 2,755; every gatable method is a delegate.

**What the first two moves revealed.** `ModuleApiCtx` is enough for reads and validators, and
not enough for anything else. Sorting the remaining methods by what they actually touch:

| Needs | Methods |
|-------|---------|
| availability internals — blocked | `validateEventPlacement` · `getUnavailableRanges` · `getUnavailabilityDetails` · `validateResize` |
| moved | the recurrence writes · `createDependency` · the navigation pair · `createResizeController` · `getEventSegmentInfo` · `getEventProps` · `getTimelineLayout` · `getEventsByResource` |

The host-dependent group was the orchestrating writes and the navigation pair.
`editRecurringEvent` calls `editEvent`, the two validators, `fetchEventsForRange` and the kernel
write path; `createDependency` calls `validateMove` and `commitUpdate`; `goToNextOccurrence` needs
`goToSpecificPeriod` and `store.state.activeDate`; `createResizeController` passed `this` to the
controller. None of that is reachable from a kernel ctx, and none of it belongs *in* the kernel.

`validateResize` moved from "movable now" to "blocked": it reads `getUnavailableMinuteRanges`,
`getUnavailabilityDetails` and `_getEventResourceIds`, so it lands wherever availability lands.
`getEventSegmentInfo` went to `eventResizeFeature` because it needs neither.

**Resolved: a feature is a kernel module plus a host-aware api.** `CalendarFeature` in
`calendar/features/types.ts` carries an optional `module` (kernel stages, kernel ctx — unchanged)
and an optional `api` that receives a narrow `CalendarHost`. `ComposedFeatureApi` intersects both
per feature, so the composed instance type covers module apis and feature apis alike. Features
see the host, not each other; a feature that needs a peer declares `requires`.

`CalendarHost` grows only under pressure from real conversions — it is the allowlist of what
features may touch, not a projection of the core surface. The navigation pair took `getEvent`,
`getEvents`, `getActiveDate` and `goToSpecificPeriod`; `createDependency` added `commitUpdate`
and `validateMove`; the recurrence writes added `write`, `fetchEventsForRange`, `editEvent`,
`removeEvent`, `validateEventDependencies` and `validateEventPlacement`; `createResizeController`
added `getDaysWithEvents`, `validateResize` and `editRecurringEvent`. Fifteen members for eight
methods, and `validateMove` staying on the host is the concrete case for keeping composite
validators out of features. Two of those members are temporary: `validateResize` leaves the host
when availability unblocks and it becomes a resize method, and `editRecurringEvent` leaves when
features can reach a declared peer directly.

`eventRecurrenceFeature` wraps `recurrenceModule` and owns the navigation pair plus
`editRecurringEvent` / `removeRecurringEvent`; `eventDependencyFeature` wraps `dependencyModule`
and owns `createDependency`, which is the case the seam was chosen for — it calls `commitUpdate`
*and* `validateMove`, and its cycle guard and commit path are pinned by 1 and 10 tests
respectively. `CalendarCore` builds the features, mounts `feature.module`, merges the apis, and
delegates.

`eventResizeFeature` owns `createResizeController` and `getEventSegmentInfo`, and contributes no
kernel module — `resizeModule` exists but `CalendarCore` has never mounted it, and mounting it
now would change write behaviour. `ResizeController` no longer takes a `CalendarCore`: it takes a
`CalendarHost`, which is what let the constructor call move into the feature at all.

**`requires` has a real user.** `ResizeController` calls `editRecurringEvent` when a scoped
occurrence resize commits, so `eventResizeFeature` declares `requires: ["recurrence"]` — the
first non-speculative peer requirement, which settles the open question below. Nothing enforces
`CalendarFeature.requires` yet; the check lands in slice 3 alongside `calendarFeatures()`.

The resize move exposed the worst coverage hole in the package: `ResizeController` had **no
tests at all**, so every host call could be broken without failing the suite. Slice 2 added
`src/calendar/tests/resizeController.test.ts` (7 tests) driving the controller against a fake
host — validate-per-move, blocked-preview retention, the day-count scaling of a horizontal drag,
the plain commit path, the scoped-occurrence commit path — plus the feature api against a real
calendar. Total is 1,019.

The two projection readers need no writes at all, so they take `getState`, `getOptions` and
`getEventMap` and contribute no kernel module. `getActiveDate` left the host in the same step —
`getState()` already carries `activeDate`, so the narrower member was redundant. `getEventProps`
kept its private `_getDaySegments` helper as a local, and `getTimelineLayout` /
`getEventsByResource` took `getMergedEventsByResource` with them, which is why the merge-by-id
logic now lives once in `timelineFeature` instead of behind a private method two public readers
shared.

Two timeline branches were unpinned despite 13 existing timeline tests — the `* 100` that turns
`currentTimeFraction` into a percentage, and resources referenced by id string rather than
object. Two more characterization tests, 1,021 total.

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

### Slice 3 — `calendarFeatures()` and the `features` option ✅

`calendarFeatures([historyFeature, eventRecurrenceFeature])` — a list of bare factory values. A
record would force a key per feature that nothing reads: the feature already carries its own
`name`, which is what the kernel mounts it under and what the registry keys api types by. `CalendarCore` composes `createKernel` from `options.features` instead of
the hardcoded `{ history, recurrence, dependency }` record, and `features` is **required**.

Because features are passed uninstantiated, `ReturnType` would resolve their generics at the
constraint (`Resource`, `Event<Resource>`) and silently drop the consumer's `TEvent` from every
api signature. So api types come from `FeatureApiRegistry`, keyed by feature name:
`CalendarFeature` gained a `TName` parameter, each factory declares its name as a literal, and
`ComposedApi<TFeatures, TResource, TEvent>` intersects registry entries over `TFeatures[number]`,
using the calendar's own
`TResource`/`TEvent`. A name does not depend on R/E, so reading it under default instantiation is
safe. The registry is closed — a third-party feature composes and runs but contributes no types
until the interface is augmented, the same trade as v9's declaration merging.

Type parameters are ordered `<TFeatures, TResource, TEvent>` on both `CalendarCore` and
`useCalendar`, with `TResource` inferred from `resources` and `TEvent` defaulting to
`Event<TResource>` (`events` and `fetchEvents` are `NoInfer`, so a mapped `fetchEvents` return or
an empty `events: []` cannot collapse `TEvent` to a literal or `never`). Both examples now call
`useCalendar({ features, ... })` with no type arguments at all; a custom event type still needs
all three.

**Two seam changes were needed to make a feature record composable.**

`module` became a factory — `module?: (ctx: FeatureModuleCtx) => Module<...>`. A kernel module
needs construction-time options (`dependencyModule` needs `timeZone`), and a composed feature
record is written before any calendar exists. The ctx carries what modules need from calendar
options, so `eventDependencyFeature()` no longer takes options at all and the consumer never
restates `timeZone`.

`api` gained a second parameter — its own module's api: `api?: (host, module: TModuleApi) => TApi`.
`historyFeature` is why: `undo()` guards on `canUndo()`, which lives on `undoModule`'s api, and
reading it off the host would have meant putting a history method on the host. A feature now owns
both halves of itself.

`historyFeature` is new, and takes `undo` / `redo` (with `_diffOps`) off `CalendarCore`;
`canUndo` / `canRedo` come from its module api as before.

Composition throws on two wiring errors, mirroring the kernel: a feature whose `requires` peer is
not composed, and two features contributing the same api key. **The core-shadow check does not
land yet** — every feature api key is currently also a `CalendarCore` delegate method, so the
check would reject every composition. It arrives with slice 5, which deletes the delegates.

Both examples compose explicitly — they list the full preset, so the composition path is exercised
by real app code and not only by tests. `allCalendarFeatures` is a plain `as const` array of
factories, deprecated on arrival, for consumers who want today's behaviour in one identifier.

**Newly surfaced: recurrence read expansion is not gated.** `CalendarCore.getEventMap` expands
recurring events itself, independent of `recurrenceModule`'s projection stage, so composing
without `eventRecurrenceFeature` still returns occurrences on read — only the occurrence *writes*
are gated. That duplication has to go before the definition-of-done bundle claim can hold.

### Slice 4 — gate the type, thread it through the adapters

`Calendar<TFeatures>` intersects the composed apis; `calendar.undo()` stops typechecking
without `historyFeature`. Runtime gating already works — calling an uncomposed method throws a
`TypeError` — so this slice is about turning that into a compile error.

Ergonomics are the open problem: type args are positional, so `useCalendar<R, E>` pins `TFeatures`
to its default. Either `features` becomes required and `TResource`/`TEvent` are inferred from
`events`/`resources`, or the record itself carries them. Decide here. Shared domain types (`Event`, `Day`, `Resource`) stay non-generic per
ADR 0009.

`useCalendar` returns the composed type rather than a fixed 49-key object. Both examples already
pass explicit feature records (slice 3), so what remains here is narrowing them to the features
they actually use. The Solid adapter is written against this shape rather than porting the
monolith.

### Slice 5 — remove the preset

One release later: delete `allCalendarFeatures` and the delegating shims left by slice 2.

## Open questions

- ~~**Peer requirements.**~~ Settled: `eventResizeFeature` requires `recurrence` for scoped
  occurrence commits, so the mechanism stays. Open sub-question: a feature currently reaches its
  peer through `CalendarHost` (`editRecurringEvent` is a host member), which is not the seam
  ADR 0009 describes. Decide in slice 3 whether `api` receives resolved peer apis alongside the
  host.
- ~~**Projection models vs. modules.**~~ Settled: not a rename, and not a separate construct.
  `layoutModule` is a kernel projection stage that writes a `layout` field onto projected events;
  `getEventProps` is a view-model read over the event map, store state and calendar options. They
  share nothing. Both projection readers ship as ordinary features (`dayEventLayoutFeature`,
  `timelineFeature`) rather than a second `createXModel()` construct, so `calendarFeatures()` has
  one kind of thing to compose.

## Definition of done

- `features` is required; no implicit module set anywhere in the packages or examples.
- Every method in the table above is reachable only when its feature is composed, and fails to
  typecheck otherwise.
- A read-only day view composes `dayEventLayoutFeature` alone and pulls in no recurrence,
  dependency, resize or timeline code — verified against the built bundle, not by inspection.
