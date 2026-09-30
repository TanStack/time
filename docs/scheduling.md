---
id: scheduling
title: Dependencies & Scheduling
---

`eventDependencyFeature` links events into a graph. When one event moves, the ones that depend on
it move with it, and a move that cannot be carried through is rejected as a whole. See
[ADR 0007](https://github.com/TanStack/time/blob/main/docs/adr/0007-scheduling-solver-fixpoint-stage.md)
for why the solver is a stage of the write pipeline from
[ADR 0001](https://github.com/TanStack/time/blob/main/docs/adr/0001-one-kernel-modules-as-pipeline-stages.md)
and not a separate reactive engine.

## Setup

```ts
import { calendarFeatures, createCalendar, eventDependencyFeature } from '@tanstack/time'
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
  features: calendarFeatures([eventDependencyFeature]),
  timeZone: 'Europe/Warsaw',
  viewMode: { value: 1, unit: 'week' },
  events,
})
```

`eventDependencyFeature` is also part of `stockFeatures`.

## Links

A link lives on the **successor**. `dependsOn[].id` is the predecessor:

```ts
interface EventDependency {
  id: string
  type: DependencyType
  lag?: number
}
```

| Type | Rule                                         |
| ---- | -------------------------------------------- |
| `FS` | successor start ≥ predecessor end + lag      |
| `SS` | successor start ≥ predecessor start + lag    |
| `FF` | successor end ≥ predecessor end + lag        |
| `SF` | successor end ≥ predecessor start + lag      |

`lag` is in **minutes** and defaults to `0`. A negative lag is a lead: `{ type: 'FS', lag: -30 }`
lets the successor start half an hour before the predecessor ends.

Every rule is a lower bound. Moving a predecessor **earlier** leaves its successors where they are.
The solver closes gaps that break a rule. It never compacts slack.

## Propagation on write

Every write that changes an event's start or end runs the `schedule` stage before validation:

- The events you moved are fixed for this write. So is every event with `manuallyScheduled: true`.
- A broken link with a free successor pushes the successor **forward**.
- A broken link with a fixed successor pulls the predecessor **backward**.
- Shifts keep each event's length and continue through the whole chain, to a fixed point.

```ts
calendar.commitUpdate('design', { end: '2026-10-05T14:00:00' })

calendar.getEvents().find((event) => event.id === 'build')?.start
```

`build` now starts at `15:00`: `design` ends at `14:00`, plus the 60-minute lag.

The shifted events join the same write batch. The availability, constraint and duration validate
stages then check every event in the batch. If one cascaded event lands in unavailable time or
breaks its `constraint`, the **whole** write is rejected, including the event you moved. With `historyFeature`, one
undo reverts the whole cascade.

The calendar's `schedule` stage moves events by wall-clock time. It does not skew a pushed event
across non-working time and it does not clamp to constraints. A cascade into a closed hour is
rejected, not snapped to the next working minute.

## Manually scheduled events

`manuallyScheduled: true` makes an event an **anchor**. Propagation never moves it:

```ts
const result = await calendar.editEvent('design', {
  start: '2026-10-05T12:00:00',
  end: '2026-10-05T15:00:00',
})

if (!result.success) {
  console.log(result.error.message)
}
```

If `build` is manually scheduled, this is rejected with
`"Build" cannot start before "Design" ends +60m (FS) — "Build" is manually scheduled`. Nothing
moves. A move that the anchor still has slack for is allowed.

You can still move an anchor directly. It pushes its free dependents like any other event.

## Use `editEvent`, not `commitUpdate`

`commitUpdate` returns nothing. A vetoed write is dropped **silently**. `editEvent` returns a
`SaveEventResult` and runs `validateMove` first, so the error tells you which event blocked the
move and why:

- a manually scheduled event would have to move,
- the moved event breaks its own constraint or declared duration,
- a pulled predecessor or pushed dependent would land in unavailable time, or break its constraint
  or duration.

## Creating links

```ts
const result = calendar.createDependency('design', 'build', 'SS', 30)

if (result.blocked) {
  console.log(result.error?.message)
}
```

`createDependency(sourceId, targetId, type?, lag?)` adds `sourceId` as a predecessor of
`targetId`. `type` defaults to `'FS'`. If the target breaks the new rule, it moves forward by the
shortfall in the same write. The call returns `{ blocked: true, error }` when:

- `sourceId === targetId`, or the source already depends on the target, directly or indirectly,
- the target is manually scheduled and would have to move,
- the target's new position fails `validateMove`. The `error.reason` is `'unavailable-time'`.

Adding a link that already exists with the same type and lag is a no-op. The same pair with a
different type is a second link.

If either id is **unknown**, the call returns `{ blocked: false }` and does nothing.

## Cycles

`createDependency` refuses cycles. Links you load through `events` or write with `commitUpdate`
are not checked. When the data already has a cycle, the solver skips the links inside the cycle
and propagates the rest. You get no error. The solver has an iteration cap, so a cycle can not
make a write hang.

## Checking before you commit

All of these are read-only. `newStart` and `newEnd` are plain date-time strings in the calendar's
`timeZone`.

```ts
calendar.validateEventDependencies(
  { title: 'Review', start: '2026-10-05T10:00:00', end: '2026-10-05T11:00:00' },
  [{ id: 'design', type: 'FS' }],
)
```

`validateEventDependencies(event, dependsOn)` returns `{ valid, error? }` for the first broken
link. It skips unknown predecessor ids and does not check for cycles. `addEvent` and `editEvent`
call it when you pass `options.dependsOn`, but that option is **only** a check. The links are
stored only when they are also in the event's own `dependsOn`.

`findViolatedDependency(event, proposedStartMs, proposedEndMs)` checks only the event's own links
against a span in epoch milliseconds. It returns `{ dependency, predecessor }` or `null`. The
resize feature uses it.

`getAnchorConflicts(eventId, newStart, newEnd)` runs the same pull and push as a real move. It
returns the links that touch a manually scheduled event and are still broken:

```ts
const [conflict] = calendar.getAnchorConflicts(
  'design',
  '2026-10-05T12:00:00',
  '2026-10-05T15:00:00',
)

conflict?.anchorId
```

Each entry has `eventId`, `eventTitle`, `predecessorId`, `predecessorTitle`, `type`, `message`,
`originalStart`, `originalEnd` and `anchorId`. `validateMove` checks this first.

The preview methods return `Array<DependencyShift<TEvent>>`, where each item is
`{ event, newStart, newEnd }`:

| Method                                            | Previews                                            |
| ------------------------------------------------- | --------------------------------------------------- |
| `getDependentShifts(eventId, newStart, newEnd)`   | successors pushed forward by the new span           |
| `getPredecessorShifts(eventId, newStart, newEnd)` | predecessors pulled back by the new span            |
| `getAffectedByDelta(eventId, deltaMs)`            | successors pushed when the event moves by `deltaMs` |

Previews are geometry only. They skip manually scheduled events and do not check availability,
constraints or duration. Use `validateMove` for the full answer.

## Not covered

The pure `solve` core also supports ASAP/ALAP direction, working-time skew and constraint clamping
(ADR 0007). It is not exported from `@tanstack/time`, and the calendar's `schedule` stage does not
use those options yet. Solver conflicts are not returned to you. You only get the veto from the
validate stages. See [Working time](./working-time) and [Features](./features).
