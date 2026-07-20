# Working-time calendars as id-referenced shared entities with a resolution hierarchy

## Status

accepted

## Context

The current model expresses availability as a flat `Resource.availability: Availability[]` —
per-resource weekday + `HH:mm` windows. This cannot express real organisational scheduling,
which is layered: a **project/organisation** calendar (company holidays, default working
week), a **resource** calendar (a person's shift, PTO, part-time pattern), and an **event**
calendar (an override on one meeting). Bryntum's entire scheduling engine rests on this
calendar hierarchy, and ADR 0007's solver needs it: propagation must skew dates across
non-working time using the correct effective calendar for each event.

Flat per-resource availability also duplicates data — every resource re-declares the company
holidays — and has no way to say "this project is closed Dec 24–31" once.

## Decision

- **Calendar is a first-class, id-referenced shared entity**, not an inline per-resource
  array. `Calendar { id, label, intervals, parentId? }`. Events and resources reference a
  calendar by id; a project-level default calendar is referenced when none is set.
- **Intervals are the primitive.** A calendar is a set of recurring and one-off intervals,
  each `{ recurrent?, startDate?, endDate?, isWorking, ... }` — a recurring interval covers
  the normal working week; one-off intervals cover holidays/PTO/exceptions. This subsumes the
  current `Availability` (weekday + start/end time) as a recurring working interval and is
  strictly more expressive.
- **Resolution hierarchy, most-specific-wins:** `event calendar → resource calendar → project
  calendar`. The **effective calendar** for a given event on a given resource is the child
  calendar layered over its `parentId` chain; a child interval overrides the parent for the
  span it covers, otherwise the parent applies. The solver and availability-validation both
  consume the resolved effective calendar, never the raw layers.
- **Resolution is a pure function** `getWorkingTime(calendarId, range, calendars) →
  intervals` with serializable I/O (ADR 0004/0006), so it runs identically client and server
  and can be a delegatable stage.
- **Multi-resource events** resolve against the **intersection** of their assigned resources'
  effective calendars by default (an event is workable only when all required resources are);
  the intersection policy is configurable but intersection is the default.

## Considered Options

- **Keep flat per-resource `availability`.** Rejected: cannot express project-level or
  event-level layers, duplicates shared non-working time across resources, and gives the
  ADR 0007 solver no correct calendar to skew against.
- **Inline calendar per resource (no shared entity, no ids).** Rejected: "the project is
  closed this week" cannot be stated once; every resource would re-declare it and drift.
- **Two-level only (resource + project), no event calendar.** Rejected: per-event overrides
  are a real need (one meeting scheduled into off-hours by choice) and cost little once the
  hierarchy exists.

## Consequences

- `Resource.availability` is replaced by `Resource.calendarId` plus a `calendars` collection
  on the kernel. This is a **breaking change** to the public event/resource model —
  acceptable pre-1.0, and it should land **before the alpha** so the alpha ships the target
  data shape rather than migrating consumers twice.
- `Availability` remains as the shape of a single recurring working interval, reused inside
  calendar intervals — the concept is not lost, it is nested one level down.
- Capacity and buffers stay on the resource; the calendar governs *when* time is working, not
  *how much* can be booked.
- Non-continuous time-axis rendering (skip nights/weekends) can derive its skipped ranges from
  the same resolved working-time intervals, so the axis and the solver never disagree.
