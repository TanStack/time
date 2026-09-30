---
name: scheduling
description: >
  Event dependencies and cascading reschedules in TanStack Time. Load when
  working with eventDependencyFeature, dependsOn links (FS, SS, FF, SF, lag),
  manuallyScheduled anchors, calendar.createDependency, getAnchorConflicts,
  findViolatedDependency, validateEventDependencies, getDependentShifts,
  getPredecessorShifts, getAffectedByDelta, or the write pipeline's schedule stage.
metadata:
  type: sub-skill
  library: '@tanstack/time'
  library_version: '0.0.0'
requires:
  - '@tanstack/time#core'
sources:
  - 'TanStack/time:docs/scheduling.md'
---

# TanStack Time — Scheduling

## Setup

```ts
import { calendarFeatures, createCalendar, eventDependencyFeature, historyFeature } from '@tanstack/time'
import type { Event } from '@tanstack/time'

const events: Array<Event> = [
  { id: 'design', title: 'Design', start: '2026-10-05T09:00:00', end: '2026-10-05T12:00:00' },
  {
    id: 'build',
    title: 'Build',
    start: '2026-10-05T13:00:00',
    end: '2026-10-05T17:00:00',
    dependsOn: [{ id: 'design', type: 'FS', lag: 60 }],
  },
]

const calendar = createCalendar({
  features: calendarFeatures([eventDependencyFeature, historyFeature]),
  timeZone: 'Europe/Warsaw',
  viewMode: { value: 1, unit: 'week' },
  events,
})
```

`eventDependencyFeature` has no required peers and is part of `stockFeatures`.

## Links

A link lives on the **successor**; `dependsOn[].id` is the predecessor.
`lag` is minutes (default `0`); negative lag is a lead.

| Type | Rule                                      |
| ---- | ----------------------------------------- |
| `FS` | successor start ≥ predecessor end + lag   |
| `SS` | successor start ≥ predecessor start + lag |
| `FF` | successor end ≥ predecessor end + lag     |
| `SF` | successor end ≥ predecessor start + lag   |

Every rule is a lower bound. Moving a predecessor earlier never pulls
successors along; slack is never compacted.

## Cascades on write

Any write that changes start or end runs the `schedule` stage:

- Moved events and `manuallyScheduled: true` events are fixed.
- A broken link pushes a free successor forward, or pulls the predecessor back
  when the successor is fixed. Durations are kept; the chain runs to a fixpoint.
- Shifted events join the same batch and are validated (availability,
  constraint, duration). One failure rejects the whole write. One `undo()`
  reverts the whole cascade.
- Shifts are wall-clock only: no working-time skew, no constraint clamping.
  A cascade into a closed hour is rejected, not snapped forward.

## Move with editEvent

```ts
const result = await calendar.editEvent('design', {
  start: '2026-10-05T12:00:00',
  end: '2026-10-05T15:00:00',
})

if (!result.success) {
  console.log(result.error.reason, result.error.message)
}
```

`editEvent` runs `validateMove` (anchors, own constraint and duration, pulled
and pushed neighbours in unavailable time) and returns a `SaveEventResult`.
`commitUpdate` returns `void`, so a vetoed write vanishes silently.

## Create links

```ts
const link = calendar.createDependency('design', 'build', 'SS', 30)

if (link.blocked) {
  console.log(link.error?.message)
}
```

`createDependency(sourceId, targetId, type = 'FS', lag?)` makes `sourceId` a
predecessor of `targetId` and moves the target forward in the same write if
needed. `blocked: true` for self-links, cycles, a manually scheduled target
that would have to move, or a target move that fails `validateMove`.

## Preview before committing

Inputs are plain date-time strings in the calendar `timeZone`.

```ts
const conflicts = calendar.getAnchorConflicts('design', '2026-10-05T12:00:00', '2026-10-05T15:00:00')
const pushed = calendar.getDependentShifts('design', '2026-10-05T12:00:00', '2026-10-05T15:00:00')
```

- `getAnchorConflicts` simulates the pull and push and returns broken links
  touching an anchor (`eventId`, `predecessorId`, `type`, `message`, `anchorId`, ...).
- `getDependentShifts`, `getPredecessorShifts`, `getAffectedByDelta(eventId, deltaMs)`
  return `Array<DependencyShift>` (`{ event, newStart, newEnd }`). Geometry
  only: they skip anchors and ignore availability, constraints and duration.
- `findViolatedDependency(event, startMs, endMs)` checks the event's own links
  against epoch milliseconds; returns `{ dependency, predecessor }` or `null`.
- `validateEventDependencies(event, dependsOn)` returns `{ valid, error? }` for
  the first broken link; skips unknown ids, no cycle check.

## Common mistakes

- Using `commitUpdate` for user moves. Use `editEvent` and handle `success: false`.
- Passing `options.dependsOn` to `addEvent`/`editEvent` to create links. It is
  validated, never stored. Put links on the event's own `dependsOn` or call
  `createDependency`.
- Trusting `{ blocked: false }` from `createDependency`. With an unknown id it
  does nothing and still returns `{ blocked: false }`. Check the ids exist.
- Expecting a duplicate call to change a link. Same pair, type and lag is a
  no-op; same pair with a different type adds a second link.
- Loading cyclic `dependsOn` data. Only `createDependency` rejects cycles; the
  solver silently skips links in a cycle and reports nothing.
- Expecting ASAP/ALAP, working-time skew or constraint clamping. The `solve`
  core is not exported and the calendar stage does not use those options.
  Solver conflicts are discarded; only validate-stage vetoes reach you.
- Treating previews as the final answer. Use `validateMove` or `editEvent`.
