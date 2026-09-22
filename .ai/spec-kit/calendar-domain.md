# Calendar Domain Spec

## Temporal API

- Until native browser support, use `@js-temporal/polyfill`.
- Internal computations use `Temporal.ZonedDateTime` and `Temporal.PlainDate`.
- Public API never exposes Temporal objects.

## Timezone and Calendar

- A date/time instance is not a static point; it is relative to timezone and calendar.
- Always track timezone and calendar alongside the instant value.
- RFC 3339 extended format may include timezone and calendar: `2024-03-05T12:34:56.789Z[America/New_York][u-ca=gregory]`.

## Event Model

- `CalendarEvent` has: id, start, end, title, allDay flag, recurrence rule, resources, dependencies, metadata.
- `CalendarResource` has: id, title, availability windows, unavailability rules.
- Events can span multiple days. Split multi-day events into per-day segments for rendering.
- All-day events have no time component. Rendered at top of day view.

## Recurrence

- Supported: daily, weekly, monthly, yearly.
- Recurrence exceptions: EXDATE (skip occurrences), modified single occurrences.
- End conditions: UNTIL date, COUNT number.
- Expand recurring events into individual occurrences before rendering.

## Resizing and Dragging

- `ResizeController` handles pointer events for event resizing.
- `calculateSegmentResizePreview` computes preview state during resize.
- `calculateGhostPreviewStyle` computes CSS for drag ghost.
- `calculateTimelineResizePreview` computes timeline-specific resize preview.
- `getResizeProps` returns styling props for resize handles.

## Availability

- Resources define availability windows (start/end times per day).
- Unavailability rules define blocked ranges.
- `validateEventDependencies` checks if placing an event satisfies dependency constraints.
- `getUnavailableRanges` returns blocked ranges for a date.

## Views

- CalendarCore supports: day, week, month, year, agenda, timeline.
- `groupDaysBy` groups days by unit (week, month) for grid layouts.
- `goToSpecificPeriod` navigates to a specific date with view context.
- `getEventsByDate` retrieves all events for a date (including multi-day segments).
- `getAllDayEventsByDate` retrieves all-day events for a date.
- `getTimeSlots` generates time slots for day/week views.
