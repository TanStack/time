# Architecture Spec

## Monorepo Layout

```
packages/
  time/              — core package
    src/date/        — date manipulation primitives
    src/calendar/    — calendar engine
    src/client/      — client utilities
    src/formatter/   — Intl.DateTimeFormat wrappers
    src/utils/       — shared helpers
    src/index.ts     — public API surface
  react-time/        — React adapter
    src/useCalendar/ — useCalendar hook
    src/index.ts     — re-exports core + React-specific
  time-devtools/     — devtools UI
    src/components/  — UI components (Solid-based via goober)
    src/store/       — devtools state
    src/core.tsx     — devtools core
  solid-time/        — Solid adapter (mirrors react-time)
  solid-time-devtools/ — Solid devtools
```

## Dependency Graph

- `react-time` → `time`
- `time-devtools` → `time`
- `solid-time` → `time`
- `solid-time-devtools` → `time`

## Build System

- `tsdown` bundles each package. Produces `dist/index.js` (ESM) and `dist/index.cjs` (CJS).
- `nx` caches builds and runs tests selectively.
- Root scripts run via `nx run-many` or `nx affected`.

## Public API Surface

Core exports from `@tanstack/time`:

- Date primitives: `add`, `subtract`, `startOf`, `endOf`, `format`, `parse`, `equals`, `isBefore`, `isAfter`, `isBetween`, `range`, `since`, `until`
- Calendar: `CalendarCore`, `DateCore`, event helpers, recurrence logic
- Types: `CalendarEvent`, `CalendarResource`, `ResizeState`, etc.

React exports from `@tanstack/react-time`:

- `useCalendar` hook
- `ResizeState`, `ResizeOptions`, `UseCalendarOptions`
- Re-exports of core event utilities and types

## State Management

- Core uses `@tanstack/store` for reactive state.
- React adapter uses `@tanstack/react-store`.
- CalendarCore maintains event collections, selected dates, current view.

## Key Abstractions

- `DateCore` — abstract base for date operations and navigation
- `CalendarCore<TResource, TEvent>` — concrete calendar with events, resources, availability
- `useCalendar` — React hook that instantiates CalendarCore and provides reactive selectors
