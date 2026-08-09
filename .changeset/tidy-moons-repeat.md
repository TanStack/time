---
"@tanstack/time": major
"@tanstack/react-time": major
"@tanstack/solid-time": major
"@tanstack/time-devtools": major
---

Remove the built-in resize feature. Bring your own resize interaction and commit through `editEvent` / `editRecurringEvent`.

Removed from `@tanstack/time`: `resizeModule`, `resizeIntent`, the `resize-materialize` write stage, `eventResizeFeature`, `ResizeController`, `calculateResizedEvent`, `calculateDeltaMinutesFromPixels`, `calculateDeltaMinutesFromPixelsHorizontal`, `getResizeHandleStyle`, `calculateSegmentResizePreview`, `calculateGhostPreviewStyle`, `calculateTimelineResizePreview`, `getEventDisplayTimeRange`, `ValidateResizeOptions`, `ValidateResizeResult`, and the `time:event:resized` devtools event.

Removed from the adapters: the `resize` option, `resizeState`, `getResizeHandleProps` and `getDayColumnProps` on `useCalendar` (React) and `createCalendar` (Solid).

Renamed: `ResizeError` is now `EventError`, `ResizeValidationResult` is now `EventValidationResult`. `UnavailableTimeRange` is replaced by the existing `MinuteRange`.

`getSegmentInfo`, `isMultiDayEvent` and `formatEventTimeRange` are unchanged and still exported.
