# Phase 1 — Feature composition plan

Implements ADR 0009. Turns the fixed module set and the flat 49-key `useCalendar` return into
**consumer-composed features**: `features` becomes a required option built by
`calendarFeatures({ ... })`, modules contribute their own methods, and the instance surface is
the intersection of what was composed.

Slices 1-3 built the seam, moved every gatable method into a feature, and made `features` an
option. Slices 4-5 gate the *type* and delete the delegates. Slices 6-8 empty core of domain algorithms:
availability, recurrence reads, the dependency graph walks and `validateResize`. Slice 9 moves
availability enforcement into the kernel's write pipeline.

Lands **first** in Phase 1. ADR 0008 (working-time hierarchy) and ADR 0007 (solver fields)
attach as features (`workingTimeFeature`, `schedulingFeature`), so doing this after them means
writing them twice.

**Method:** same strangler-fig as Phase 0. The test suite stays green after every slice (1,007 at
the start of Phase 1, 1,047 now).
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

`validateMove` is deliberately absent: it consults dependency *and* availability rules, so it stays
on core and asks whichever of them is composed. Slice 8 made that literal — it calls the two
features' apis and treats an absent feature as "nothing blocked". The kernel veto would be the
tidier mechanism and is still open; a composite validator is not itself a feature either way.

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

### Slice 4 — gate the type, thread it through the adapters ✅

`CalendarApi<TFeatures, TResource, TEvent>` is now
`CalendarActions & CalendarState & ComposedApi<...>`, and the fifteen feature-owned signatures
left `CalendarActions`. `useCalendar` returns `UseCalendarResult<TFeatures, TResource, TEvent>`
instead of a fixed 49-key object, so `calendar.undo()` fails to typecheck without
`historyFeature`. Runtime gating (a `guardApi` proxy naming the feature to compose) was already
there; this makes it a compile error.

Shared domain types (`Event`, `Day`, `Resource`) stay non-generic per ADR 0009.

The hook's own resize surface is gated the same way: `resizeState` / `getResizeHandleProps` /
`getDayColumnProps` appear only when `"resize" extends FeatureName<TFeatures[number]>`. The hook
cannot call hooks conditionally, so when resize is absent it wires an inert controller
(`inertResizeController`) rather than skipping `useSyncExternalStore` — the methods exist at
runtime and do nothing, and the type hides them.

**The registry was leaking kernel types into the public surface.** `history` and `recurrence`
pulled in `UndoHistory<TEvent & KernelEvent>` and `RecurrenceApi<TEvent & KernelEvent>` straight
from their modules, so `getMasterEvent` demanded a `TEvent & KernelEvent` and rejected the
consumer's own event type. Registry entries now declare the public shape
(`getMasterEvent: (event: TEvent) => TEvent`), and `undoStack` / `redoStack` / `clearHistory` are
not exposed at all — they are kernel history introspection, not part of `historyFeature`'s
documented surface.

Both examples narrowed to the features they use: the calendar example composes four (history,
recurrence, resize, dayLayout — no dependency, no timeline), the timeline example five (no
dayLayout). Narrowing is what caught the leak.

`src/calendar/tests/composedApi.test-d.ts` pins the guarantee with `expectTypeOf` — composed
features contribute, uncomposed ones do not, core methods survive an empty list, and a custom
event type flows into `getMasterEvent`. `vitest.config.ts` enables `typecheck` for `*.test-d.ts`,
so the gate is enforced by `vitest run` (1,035 tests) rather than only by a manual `tsc`.

Not done here: `requires` is still runtime-only. The timeline example composes
`eventRecurrenceFeature` solely because `eventResizeFeature` requires it — nothing in the type
system says so, and the constructor throw is what would tell you.

### Slice 5 — remove the preset ✅

The implicit preset is gone, and with it the fifteen delegating shims. `TFeatures` has no default
on `CalendarCoreOptions`, `CalendarCore` or `UseCalendarOptions`, so there is no way to get a
module set you did not ask for.

`stockFeatures` replaces `allCalendarFeatures` as an *explicit* opt-in — `features: stockFeatures`
composes all six in one identifier, the way Table v8 shipped everything, and pays the bundle for
it. The difference from the old preset is that it is never a default: nothing pulls it in unless
the app names it. `composedApi.test-d.ts` asserts
`ComposedApi<StockFeatures, ...>` equals `FullFeatureApi<...>`, so a feature added to the registry
but forgotten in `stockFeatures` fails the suite.

Composed api is mounted on the instance instead of forwarded through hand-written methods:
`_seedKernel` merges the feature apis with `Object.assign`, and every key in the owner table that
was *not* composed gets a getter that throws the "compose `historyFeature`" message. One
mechanism replaces fifteen delegates plus the `guardApi` proxy, which is deleted. Reading an
absent method now throws synchronously — `editRecurringEvent` used to return a rejected promise,
because the throw happened inside an `async` delegate.

The core-shadow check lands as promised: a feature contributing a key that already exists on
`CalendarCore.prototype` is rejected at construction, alongside the existing feature-vs-feature
collision check.

`createCalendar()` is what makes the gate usable without a cast. `new CalendarCore(...)` is typed
core-only — a class cannot type members that depend on its own type argument's contents — so the
factory returns `Calendar<TFeatures, TResource, TEvent>` = the class intersected with
`ComposedApi<...>`. Tests and `useCalendar` both construct through it.

Three api methods moved off the kernel module api and onto their feature: `canUndo` / `canRedo`
(history), `getMasterEvent` (recurrence), `validateEventDependencies` (dependency). Before this,
`CalendarCore` reached into `this._kernel.api` for them, which meant the public surface was
assembled from two places and the mounted object would have carried `undoStack` / `clearHistory`
too. Features now contribute every public method themselves, and `_kernel.api` is internal.

`FEATURE_API_OWNERS` is a hand-written `key → feature name` table, not derived by instantiating
every feature. Deriving it was what made the old build step import all six features, which defeats
the whole point — a `dayEventLayoutFeature`-only app would still pull in resize and timeline code.
It is a string map, so it shakes to nothing. `composedApi.test-d.ts` pins
`keyof typeof FEATURE_API_OWNERS` against `keyof FullFeatureApi<...>` so the table cannot drift
from the registry.

`useCalendar` dropped fifteen `useCallback` wrappers and spreads `calendarCore.featureApi`
instead. The wrappers existed to re-expose class methods; feature api functions are created once
per instance, so their identity is already stable.

Bundle check (rolldown, minified, `packages/time/dist`): composing `dayEventLayoutFeature` alone
gives 253.7 kB (65.5 kB gzip) against 277.0 kB (71.9 kB gzip) for all six. `undoModule`,
`ResizeController`, `validateDependencies` and the timeline layout code are absent from the
day-only bundle; the only mention of the other features is the owner table's strings. The bulk of
both numbers is the Temporal polyfill.

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

- ✅ `features` is required; no implicit module set anywhere in the packages or examples.
- ✅ Every method in the table above is reachable only when its feature is composed, and fails to
  typecheck otherwise — through `createCalendar()` / `useCalendar()`. A directly constructed
  `CalendarCore` is typed core-only, so the composed methods are present at runtime but invisible
  to the type checker.
- ✅ A read-only day view composes `dayEventLayoutFeature` alone and pulls in no recurrence,
  dependency, resize or timeline code — verified against the built bundle, not by inspection.
  232.5 kB minified against 277.6 kB for `stockFeatures`; slice 8 has the greps.

### Slice 6 — resourceAvailabilityFeature ✅

All availability computation left `CalendarCore`. The feature owns six methods: the three from the
table (`getUnavailableRanges`, `getUnavailabilityDetails`, `validateEventPlacement`) plus three
that were private and are what the composite validators actually call —
`checkEventAvailability`, `getUnavailableMinuteRanges` and `getDaySpanConflicts` (was
`getResizeConflicts`). Exposing the private three is the price of gating the public three: leave
them behind and `checkAvailability` / `checkDaySpan` / `mergeUnavailableMinuteRanges` stay in the
core bundle, which is the whole thing this was for.

**The veto route was rejected for now.** ADR 0001's answer would be to mount `availabilityModule`
so the kernel's validate pipeline enforces availability, and that is still the destination — but
mounting it today changes semantics: `commitAdd` / `commitUpdate` and every resize commit go
straight to `_write`, which returns `[]` on rejection, so writes that violate availability would
silently no-op instead of applying. That needs `_write` to surface conflicts as `SaveEventResult`
errors and a kernel dry-run (`validate()` without commit) for the pre-flight callers, which is its
own slice. This one moves the code without moving the enforcement point.

`validateMove` and `validateResize` stay on core, as the surface table always said for
`validateMove`: both are composite validators that ask what is mounted. They reach the feature
through four private wrappers (`_checkAvailability`, `_unavailableMinutes`,
`_unavailabilityDetails`, `_daySpanConflicts`) that return "nothing blocked" when
`hasFeature("availability")` is false. So an app without the feature composed gets no availability
enforcement anywhere — writes succeed, moves are unblocked — which is the correct reading of "not
composed". `validateResize` did not move into `eventResizeFeature` as the table suggests: it would
then need availability as a peer, and feature-to-peer access is still unresolved.

The merged-minutes cache moved into the feature's closure. Core used to clear it from
`setResources` / `setEvents`; the feature cannot see those calls, so it compares
`host.getOptions().resources` by identity and clears when the array changes — `setResources`
assigns a new array, and events never affected this cache in the first place.

`CalendarHost` gained `getEventsByDate`, which `getDaySpanConflicts` needs.

Bundle check, day-only composition: 246.6 kB minified (63.7 kB gzip), down from 253.7 kB / 65.5 kB.
`checkDaySpan`, `mergeUnavailableMinuteRanges` and every `checkAvailability` internal
(`"outside-hours"`, `"no-availability"`) are gone. `MINUTES_IN_DAY` and the `resourceDetails` reads
remain — a constant and core's message shaping.

### Slice 7 — one recurrence expansion, gated ✅

`CalendarCore.getEventMap` expanded recurring events itself, so a calendar composed without
`eventRecurrenceFeature` still read occurrences back — writes were gated, reads were not. It now
calls `this._kernel.project(viewport)` and lets the mounted projection stages do the work, which is
what `recurrenceModule`'s `recurrence-expand` stage was always for. No feature composed, no
expansion: `getEventsByDate` returns the master on its own start day and nothing on later
occurrences.

Two details made this a one-line-shaped change rather than a refactor. The kernel's viewport
convention is an *inclusive* end timestamp (the stage does `nextDay(viewport.end)` itself), while
core's window end is exclusive, so core subtracts a day when it builds the viewport. And
`project()` clips to the viewport where the old inline loop kept every event — safe here because
every stored event has been through `normalizeEvent`, so both sides of the comparison are full
`YYYY-MM-DDTHH:mm:ss` strings that `new Date` parses the same way. A clipping-vs-not experiment
made no test fail, which is the honest reason the kernel did **not** get a second no-clip
projection method: nothing observable distinguishes them, since every caller looks up day keys
inside the window it asked for.

Bundle: unchanged at 246.7 kB / 63.7 kB gzip, because `expandRecurringEvent` is still reachable —
`validateResize` → `_resolveResizeEvent` → `getRecurringOccurrence` → `expandRecurringEvent`. The
duplication is gone and the read is gated; the code is still linked in.

### Slice 8 — peers, and validateResize leaves core ✅

`api` takes a third argument: `peers`, keyed by feature name. Resolution is lazy — core hands every
feature a Proxy over the record of contributed apis, so a feature reads a peer when its method
*runs*, not when it is built, and composition order stops mattering. No topological sort.

Peers are typed by a type parameter the feature declares, not by looking the names up in
`FeatureApiRegistry`: `CalendarFeature<..., TPeers>` and `ResizePeers` spells out `recurrence`
(required, guaranteed by `requires`) and `availability?` / `dependency?` (optional, `undefined` when
not composed). Typing them through the registry would have made `types.ts` → `registry.ts` → every
feature → `types.ts` a cycle, and it would have hidden the optionality that matters most here.

**`validateResize` moved into `eventResizeFeature`** — 446 lines, the largest single method in the
package. Everything it reached for is now a peer call: availability (four methods), recurrence
(`resolveOccurrence`, which is `_resolveResizeEvent` plus the recurrence primitives it needed), and
dependency. It degrades rather than demanding: without `resourceAvailabilityFeature` nothing blocks
on unavailable time, without `eventDependencyFeature` nothing blocks on a dependency shortfall.

Two features grew to make that possible. `eventDependencyFeature` gained `getPredecessorShifts`,
`getDependentShifts`, `getAffectedByDelta` and `findViolatedDependency` — the graph walks core was
doing inline with `computeCascade` / `propagateTo*` / `requiredForwardShiftMs` — so `validateMove`
now asks the dependency feature the same way it asks availability, and core imports neither
validation module. `eventRecurrenceFeature` gained `resolveOccurrence`.

**`CalendarHost` lost its two temporary members.** `validateResize` and `editRecurringEvent` were
there only so `ResizeController` could reach them; the controller now takes a `ResizeHost` —
`CalendarHost` plus those two — which the resize feature assembles from its own `validateResize` and
`peers.recurrence.editRecurringEvent`. Nothing on the host exists for one feature's benefit now.

**The registry had to split.** Peer plumbing rides the public surface (one contribution channel, not
two), so `resolveOccurrence` and the four graph walks are composed api keys like any other. Proving
third-party features work meant augmenting `FeatureApiRegistry` from a test — which broke the
owner-table drift guard, because `satisfies Record<keyof FullFeatureApi, string>` then demands an
entry for the third-party key. So `BuiltInFeatureApiRegistry` holds the seven shipped features and
`FeatureApiRegistry extends` it as the augmentation point: `ComposedApi` reads the augmentable one,
the drift guard reads the built-in one, and `_describeMissingFeatureApi` falls back to "a feature"
for keys it does not own.

A coverage gap surfaced while mutation-testing the move: blanking the availability peer's
`getUnavailabilityDetails` failed no test, because nothing exercised a cross-day resize onto a day
the resource is closed. The new test's message assertion had to be anchored
(`/^Unavailable: Event at 23:00 /`) — a looser `toContain("23:00")` also passes when the day-span
loop blocks instead, which is a different branch.

**Definition of done reached.** A `dayEventLayoutFeature`-only bundle is 232.5 kB minified
(59.8 kB gzip) against 277.6 kB (72.2 kB) for `stockFeatures`, and greps clean for
`expandRecurringEvent`, `getRecurringOccurrence`, `checkAvailability`, `checkDaySpan`,
`computeCascade`, `requiredForwardShiftMs`, `calculateResizedEvent` and `ResizeController` — the only
match is the owner table's `"createResizeController"` string.

### Slice 9 — availability enforced by the pipeline ✅

`resourceAvailabilityFeature` now mounts `availabilityModule`, so the kernel's validate stage
vetoes any write that violates availability — including `commitAdd`, `commitUpdate` and resize
commits, which previously skipped the check entirely because only `addEvent` / `editEvent` ran a
pre-flight validation.

One algorithm, two callers. The module's stage body moved into a local `evaluate(event, others)`
that the stage and a new `evaluateAvailability` module api both call, and the feature's
`checkEventAvailability` / `validateEventPlacement` delegate to that api instead of calling
`checkAvailability` themselves. The kernel `validate()` dry-run the plan called for turned out to be
unnecessary: sharing the function is what prevents the veto and the pre-flight from drifting, and a
dry-run would only have added a round trip. Its own resources come from `FeatureModuleCtx.getResources`,
called per evaluation, so `setResources` is picked up without remounting.

**Mounting the veto exposed a bug in the stage.** It validated each op against `ctx.getEvents()` —
the state *before* the write — so a batch whose ops move several events tripped over positions the
same batch was replacing. A dependency cascade shifting three events on a capacity-2 resource read
as an overbooking. The stage now folds the batch's own ops over the stored state first and validates
the result, which is what "validate this write" should always have meant.

`_write` splits into `_write` (ops, as before) and `_writeChecked` (ops plus conflicts). `commitAdd`
and `commitUpdate` gained private variants that return conflicts and, crucially, **stop emitting
`event:added` / `event:updated` when nothing was committed** — with no veto mounted that was
unreachable, and with one it would have been a lie. `addEvent` / `editEvent` map a rejection to
`SaveEventResult.error` using only the conflict's `message`, so core still knows nothing about
availability's vocabulary; the pre-flight call stays because it is what produces the good message.

Atomicity is the visible payoff: a `commitUpdate` whose dependency cascade would push a dependent
past a resource's closing time now applies *nothing*, where before the cascade landed and the
availability check was never consulted.

## Remaining work

- The Solid adapter is written against the composed shape, not ported from the monolith.
- `validateMove` and `validateResize` still pre-flight through the availability api rather than a
  kernel dry-run. They share the module's algorithm, so this is a call-path question, not a
  correctness one — revisit if a third caller appears.
