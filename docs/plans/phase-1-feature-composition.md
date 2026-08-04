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

Per feature, in this order (cheapest coupling first): recurrence → dependency → availability →
resize → models. Each step moves the method bodies from `CalendarCore` into the module's `api`
and leaves a one-line delegate behind. Public surface unchanged, so `calendar.test.ts` is the
characterization net.

The resize and availability features are where this gets real: `validateResize` and
`getUnavailableRanges` currently read `this.options.resources` and the resource-availability
cache off the class. They need those passed as module options (as `resizeModule` already takes
`resources`), which is what makes them omittable.

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
