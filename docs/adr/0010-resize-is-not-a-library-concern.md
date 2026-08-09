# Resize is not a library concern

## Status

accepted

## Context

The library shipped a full resize stack: a `resize-materialize` kernel stage with a
`resize/apply` intent, an `eventResizeFeature` with ~570 lines of availability/dependency
pre-validation, a `ResizeController` that attached `mousemove`/`mouseup` listeners to
`document` and cached day-column `getBoundingClientRect()`s, pixel-to-minute helpers, ghost
and segment preview geometry, and `getResizeHandleProps`/`getDayColumnProps` in both the React
and Solid adapters.

That is a pointer-interaction library living inside a headless scheduling library. It owns DOM
listeners, mouse coordinates and container dimensions, which contradicts ADR 0003 (the core
emits logical layout, never pixels) and ADR 0004 (validation is pure and isomorphic). It only
supported mouse — no touch, no keyboard, no pointer capture — and every consumer with an
existing drag toolkit (dnd-kit, re-resizable, interact.js) had to fight it rather than use it.

The validation the resize path performed was not resize-specific. Availability conflicts,
capacity saturation and dependency violations apply to any edit of an event's start or end,
and the write pipeline already checks them on `editEvent`/`commitUpdate`.

## Decision

Remove resize from the library. Consumers bring their own resize interaction and commit the
result through the ordinary write path (`editEvent` / `editRecurringEvent`), which returns
`SaveEventResult` and reports conflicts exactly as it does for any other edit.

Deleted: `resizeModule` + the `resize-materialize` stage, `eventResizeFeature`,
`ResizeController`, `calculateResizedEvent`, `calculateDeltaMinutesFromPixels[Horizontal]`,
`getResizeHandleStyle`, `calculateSegmentResizePreview`, `calculateGhostPreviewStyle`,
`calculateTimelineResizePreview`, `getEventDisplayTimeRange`, the `time:event:resized` client
event, and the adapter surface (`resize` option, `resizeState`, `getResizeHandleProps`,
`getDayColumnProps`).

Kept, because they were never about resize: `getSegmentInfo`, `isMultiDayEvent` and
`formatEventTimeRange` — moved to `calendar/eventTimeProps.ts`.

Renamed, because they outlive resize and back the generic write path: `ResizeError` →
`EventError`, `ResizeValidationResult` → `EventValidationResult`. `UnavailableTimeRange`
collapses into the existing `MinuteRange`.

## Considered Options

- **Keep the pure math, drop only the controller** — rejected: `calculateResizedEvent` snaps,
  clamps and dodges unavailable ranges, which is a policy the consumer's own toolkit already
  owns. Half an API is worse than none.
- **Keep resize behind an opt-in feature** — rejected: it stays a maintenance surface with a
  DOM dependency, and the composition seam (ADR 0009) already lets consumers omit it, which
  did not stop it from being the default assumption in every example.

## Consequences

- Breaking for anyone using `getResizeHandleProps`/`resizeState`. Migration is: render your own
  handles, then call `editEvent(id, { start, end })`.
- The kernel's write-transform pipeline loses a stage; ordering of the remaining stages is
  unchanged.
- Examples demonstrate resize with `re-resizable`, committing through `editEvent` — which is
  also the migration guide.
