# TanStack Time

A comprehensive, Temporal-native library for date/time problems. Two layers: a set of
pure date/time functions, and a stateful core extended by feature modules (calendar,
scheduling, undo/redo, …) in the style of TanStack Table v9 / AG Grid modules.

## Language

**Date Primitive**:
A pure, stateless date/time function (e.g. `add`, `startOf`, `format`). Operates on a
single value, holds no state, belongs to no module. The "alternative to date-fns" layer.
Returns a native `Date` for instant-bearing results.
_Avoid_: helper, util (too vague)

**Instant**:
An exact moment in time (UTC milliseconds). The public boundary represents instants as
native `Date` objects. A `Date` carries no timezone or calendar.
_Avoid_: timestamp, moment (Moment.js baggage)

**Civil Date**:
A calendar-civil value with no instant — a day, month, or all-day boundary (e.g.
`Day.date`, `currentPeriod`). Represented at the public boundary as an ISO string
(`YYYY-MM-DD`), never as a `Date`, to avoid the all-day off-by-one. Temporal `PlainDate` is
the internal-only counterpart.
_Avoid_: plain date (Temporal-internal term), date-only

**Data Strategy**:
The pluggable choice (`client` | `server`) of _where the projection/validation pipeline
executes_, analogous to AG Grid's row model. In `client` mode every stage runs in-process over
a supplied event set; in `server` mode the delegatable stages (sourcing, recurrence-expand,
conflict, slot-generation) run on the server via the shared Validation Core, returning
materialized results. Clip-to-viewport and layout always run client-side. The consumer's
calendar API is the same in both.
_Avoid_: mode (informal), row model (AG Grid's term)

**Kernel**:
The single stateful core every product shares. It owns the **event collection**, the
**viewport** (current period + view mode) with its navigation, the **date-range
projection** (events mapped to the visible range), and plain create/edit/remove. Nothing
domain-specific (no availability, recurrence, dependencies, drag, or undo) lives here.
Analogous to the one TanStack Table core (table instance + row model).
_Avoid_: core, engine (informal synonyms; "kernel" is canonical)

**Module**:
A unit of opt-in feature behavior that extends the kernel (recurrence, availability,
dependencies, undo/redo, scheduling). Modeled on TanStack Table v9 / AG Grid
modules so unused features tree-shake away. A module _adds capability and state_.
_Avoid_: plugin, feature, extension (pick one canonical term — see open question)

**Product**:
A user-facing bundle = the kernel + a preset of modules + a chosen view. _Calendar_,
_Scheduler_ (Calendly-style), and _Timeline/Gantt_ are products, **not** separate kernels.
A product is a convenience preset, not a new core.
_Avoid_: app, preset (informal)

**Master Event** / **Occurrence**:
A Master Event carries the recurrence rule; Occurrences are the individual instances expanded
from it for the current viewport. Occurrences are ephemeral (derived in the projection), not
stored.
_Avoid_: parent/child, series/instance (mix freely — pick master/occurrence)

**Override** / **Exception**:
An Override is a single Occurrence modified in place (moved, retitled), keyed by its original
start (RECURRENCE-ID). An Exception is an Occurrence removed from the series (EXDATE). Both
live on the Master Event's rule.
_Avoid_: edit/delete-this-one (describe the data, not the gesture)

**Recurrence Rule**:
The structured repeat definition on a Master Event, scoped to the UI-builder subset
(frequency, interval, until/count, `byWeekday` with optional ordinal, `byMonthDay`). Full RFC
5545 RRULE is an optional interop adapter, not this model.
_Avoid_: RRULE (that names the iCal string form, not our structured model)

**Viewport**:
The kernel's window onto time: the current period plus the view mode that determines its
span. Navigation moves the viewport; it does not change the event collection.
_Avoid_: window, range (overloaded), current view

**Projection**:
The derived, read-only result the kernel computes from the event collection for the current
viewport (events mapped onto the visible range). Views and modules transform the projection;
they never mutate the event collection through it.
_Avoid_: render, output, derived state

**Advisory Validation**:
Client-side conflict/availability checking run by the kernel over the events currently
loaded. Instant UX feedback only — never authoritative, because the client may hold a partial
dataset and cannot see other users' concurrent writes.
_Avoid_: client validation (describe the role, not the location)

**Authoritative Validation**:
The same validation logic run server-side against the full dataset, ideally inside the write
transaction. The source of truth for whether a write is allowed.
_Avoid_: server check, backend validation

**Required Range**:
The date range the kernel declares it must have loaded to validate a proposed write
(`getRequiredRange`). The orchestration layer ensures that range is loaded (via TanStack
Query) before the sync validation runs. The kernel declares the need; it never fetches.
_Avoid_: fetch range, query range

**Validation Core**:
The pure, isomorphic rule logic (`validate(write, events, config) → conflicts`) shared by the
client (advisory) and server (authoritative). No store, no viewport, no DOM, no DB.
_Avoid_: validator, rules engine (informal)

**`loadEvents` Adapter**:
A consumer-implemented function the server package calls to read events for a Required Range
from the consumer's own database, inside the consumer's transaction. The only DB seam; the
library never opens a connection.
_Avoid_: data source, repository

**Event Layout**:
The logical placement of an event in the projection, independent of pixels: time-axis
position as fractions (`startFraction`/`endFraction`), overlap position as `column` /
`columnCount`, and `lane` for timelines. The view's prop-getter turns this into a
percentage-based `style` object.
_Avoid_: position, geometry, coordinates (imply pixels)

**Lane**:
A horizontal track in a timeline that separates events which would otherwise overlap in
time. Distinct from an overlap `column` (the day/week side-by-side split).
_Avoid_: row, track

**Adapter**:
A thin framework binding that wires the headless core into a framework's reactivity (e.g.
`@tanstack/react-time`'s `useCalendar`). Holds no domain logic. Solid serves as the proof
that the core is framework-agnostic.
_Avoid_: integration, binding, wrapper

**Resource**:
A bookable/assignable entity an event consumes (a room, a person, a piece of equipment),
carrying availability windows, capacity, and buffers. The unit availability and capacity
rules are checked against.
_Avoid_: asset, entity, calendar (overloaded)

**Availability**:
The windows during which a Resource can hold events (weekday + start/end time), plus capacity
and buffer rules. Drives both advisory conflict checks and the Scheduler's free-slot
projection.
_Avoid_: schedule, hours, working hours

**Calendar** / **Scheduler** / **Timeline**:
Products. Calendar = kernel + recurrence/undo over a day/week/month view.
Scheduler = kernel + availability + scheduling (free-slot projection + `book()`) over a
slot-picker view. Timeline/Gantt = kernel + dependencies (events that push each other) over
a timeline view.

**View** (a.k.a. Renderer):
A way of presenting a kernel's projection (day, week, month, agenda, timeline strip). A
view _reads_ the projection; it does not add capability. This is the line that separates a
view from a module.
_Avoid_: layout, display (too vague)
