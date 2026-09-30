---
id: interaction
title: Move, Resize & Layout
---

Three features cover direct manipulation of a time grid. `eventMoveFeature` drags an event to a new
slot, `eventResizeFeature` drags one of its edges, and `dayEventLayoutFeature` positions events that
overlap. Each one is framework-agnostic. The [React](./framework/react/adapter) and
[Solid](./framework/solid/adapter) adapters wrap the same controllers. This page documents the
core API.

## Composing the features

Move and resize both declare `requires: ['recurrence']`. If you compose them without
`eventRecurrenceFeature`, `createCalendar` **throws**.

```ts
import {
  calendarFeatures,
  createCalendar,
  dayEventLayoutFeature,
  eventMoveFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
} from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'week' },
  timeZone: 'UTC',
  features: calendarFeatures([
    eventRecurrenceFeature,
    eventMoveFeature,
    eventResizeFeature,
    dayEventLayoutFeature,
  ]),
  events: [
    { id: 'e1', title: 'Stand-up', start: '2025-06-02T09:00:00', end: '2025-06-02T10:00:00' },
  ],
})
```

## Moving an event

`calendar.createMoveController(options?)` returns a `MoveController`. You own the pointer events.
The controller turns them into a validated preview and commits the preview on drop.

```ts
const move = calendar.createMoveController({
  containerHeight: 1440,
  constraints: { snapToMinutes: 15 },
  onMoveEnd: (eventId, newStart, newEnd) => {},
  onMoveError: (error) => console.warn(error.message),
})

const unsubscribe = move.subscribe(() => render(move.getSnapshot()))

move.start({
  eventId: 'e1',
  originalStart: '2025-06-02T09:00:00',
  originalEnd: '2025-06-02T10:00:00',
  dayDate: '2025-06-02',
})
move.moveTo({ dayDate: '2025-06-03', deltaPixels: 60 })
move.end()
```

| Method                                              | Effect                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `start(args)`                                       | Begins a drag. Returns `false` when `enabled: false`.            |
| `moveTo({ dayDate?, deltaMinutes?, deltaPixels? })` | Validates the position and updates the preview.                  |
| `end()`                                             | Commits the preview through `editEvent`, then calls `onMoveEnd`. |
| `cancel()`                                          | Drops the drag. Nothing is written.                              |
| `destroy()`                                         | Clears the listeners and the state.                              |

`getSnapshot()` returns a `MoveState`: `isMoving`, `eventId`, `previewStart`, `previewEnd`,
`originDayDate`, `targetDayDate` and `blocked`. Render the ghost from `previewStart`/`previewEnd`.
`calculateGhostPreviewStyle({ dayDate, previewStart, previewEnd })` gives you a percentage `top` and
`height` for each day column.

### Pixels and minutes

`deltaMinutes` takes priority over `deltaPixels`. Pixels convert as
`deltaPixels / containerHeight * 1440`, so `containerHeight` is the height of the **full 24-hour**
column, not of the visible part. If `containerHeight` is missing or `0`, pixel deltas resolve to
zero minutes and the event does not move.

### Granularity

Pass `granularity: 'day'` to `start` for all-day or month cells. The minute shift is then pinned to
zero and only `dayDate` changes the result. The default is `'time'`.

## Resizing an event

`calendar.createResizeController(options?)` returns a `ResizeController`. Unlike the move
controller, it attaches its own `mousemove`/`mouseup` listeners to `document` when a resize starts.
It also finds the target day from the day columns you register.

```ts
const resize = calendar.createResizeController({
  containerHeight: 1440,
  constraints: { snapToMinutes: 15, minDurationMinutes: 30 },
  onResizeEnd: (eventId, newStart, newEnd) => {},
  onResizeError: (error) => console.warn(error.message),
})

for (const column of document.querySelectorAll<HTMLElement>('[data-day]')) {
  resize.registerDayColumn(column.dataset.day!, column)
}

handle.addEventListener('mousedown', (e) => {
  resize.start({
    eventId: 'e1',
    edge: 'bottom',
    originalStart: '2025-06-02T09:00:00',
    originalEnd: '2025-06-02T10:00:00',
    clientX: e.clientX,
    clientY: e.clientY,
    target: handle,
  })
})
```

`edge` is `'top' | 'bottom' | 'left' | 'right'`. `left` behaves as `top` and `right` behaves as
`bottom`. `start` returns `false` if `enabled` is false or if no registered column contains the
pointer. Mouse moves are batched to one per animation frame. `handleMouseUp` commits through
`commitUpdate`, and `cancel()` stops the resize without a write.

For a horizontal timeline, set `orientation: 'horizontal'` and `containerWidth`. The drag then
scales across every day in the view.

### Split segments

A multi-day event is rendered as one segment per day. Always give the controllers the **original**
bounds of the event, not the bounds of the segment:

```ts
const { originalStart, originalEnd, isFirstSegment, isLastSegment } =
  calendar.getEventSegmentInfo(event)
```

Use `isFirstSegment` to decide where to show a top handle and `isLastSegment` for a bottom handle.

## Snapping

Both controllers snap to `constraints.snapToMinutes`. The default is **15** for both. Resize also
clamps to `minDurationMinutes`, which defaults to 15. A controller calls the validator only when the
snapped position changes. Thus a 60 → 62 minute drag is one validation, not two.

## How validation vetoes a drop

Every processed position goes through `validateEventMove` or `validateResize`. You can call either
one directly. For example, to check a keyboard move:

```ts
const validation = calendar.validateEventMove({
  eventId: 'e1',
  originalStart: '2025-06-02T09:00:00',
  originalEnd: '2025-06-02T10:00:00',
  originalDayDate: '2025-06-02',
  targetDayDate: '2025-06-02',
  minuteShift: -180,
})

if (validation.blocked) {
  validation.error?.message
  validation.error?.conflicts
}
```

A move is checked against dependency anchors, scheduling constraints, duration rules and
resource availability, when those features are composed (see [Features](./features) and
[Availability](./availability)). A resize is also checked against unavailable time on the days it
crosses, capacity, dependencies and successors that it would push.

A blocked result returns the **original** times in `result` and `originalDayDate` in `targetDayDate`.
The controller then does the following:

- It sets `blocked: true` and keeps the **last valid** preview on screen.
- It calls `onMoveError`/`onResizeError` and emits `event:update:error` on the time client. The same
  message for the same event is throttled to once per 500 ms.
- On drop, it commits the last valid preview. A drag that was never valid commits nothing.

A move is also rejected if `editEvent` refuses the write at commit time. The rejection arrives as
`onMoveError` with `kind: 'move'`, and `onMoveEnd` does not fire.

## Recurring occurrences

Pass `occurrenceStart` to `start` when the user drags an occurrence. Both controllers then commit
through `editRecurringEvent` instead of a plain write:

- With `recurrenceScope` set, the controller commits with that scope.
- With no scope and an `onRecurringMoveEnd`/`onRecurringResizeEnd` callback, the controller
  **does not commit**. It passes you the event id, `occurrenceStart`, and the original and new
  times, so you can ask "this event or all events?" and call `editRecurringEvent` yourself.
- With neither, the scope is `'this'`.

See [Recurrence](./recurrence).

## Overlap layout

`calendar.getEventProps(event, layoutOptions?)` returns `start`, `end`, `isSplitEvent` and
`overlappingEvents`. In `day` and `week` views it also returns `layout` and a `style` that you can
spread directly:

```ts
const { style, layout } = calendar.getEventProps(event)
Object.assign(element.style, style)
```

`style` holds percentages. It needs no container size, so it stays correct when the container
resizes or the page zooms. `top`/`height` map the event onto the 24-hour day. Set a minimum
visible height for short events in your own CSS. In `month` views, `layout` and `style` are
`undefined`.

Overlaps resolve per cluster, not pairwise. A chain A–B–C where only neighbours overlap uses two
columns. All-day events are laid out only against other all-day events.

| `strategy`                                       | Placement                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `'columns'` (default)                            | Equal-width columns.                                                                       |
| `'expand'`                                       | Each event expands right into free columns.                                                |
| `'cascade'`                                      | Offset stack with a `zIndex`. Tune it with `cascadeOffset` (0.2) and `minCrossSize` (0.3). |
| `(info) => ({ crossStart, crossSize, zIndex? })` | Your own placement from the `OverlapInfo`.                                                 |

Set the default with `createCalendar({ layout: { strategy: 'cascade' } })`. You can override it per
call with `getEventProps(event, { strategy: 'columns' })`.

For canvas or virtualized rendering, read `layout` instead of `style`. It contains the raw
`startFraction`, `endFraction`, `column`, `columnCount`, `columnSpan`, `depth` and `concurrency`.
`layoutDaySegments(events, options)` and `toLayoutStyle(layout, orientation)` are exported for use
outside a calendar instance. See
[ADR 0003](https://github.com/TanStack/time/blob/main/docs/adr/0003-logical-layout-with-percentage-prop-getter.md)
for why the core emits fractions and not pixels.
