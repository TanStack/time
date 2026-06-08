# AI Agent Instructions

## Project Context

TanStack Time is a headless time/calendar utility library for TS/JS, React, Solid, Vue, Svelte, Angular. Uses Temporal API polyfill. Monorepo under pnpm + nx.

## Core Constraints

- All public API methods return Date or string. Never Temporal objects.
- Input dates: RFC 3339 string, epoch numeric, or Date object.
- Formatting via Intl.DateTimeFormat parts, not string tokens.
- Timezone and calendar are always tracked. Defaults from Intl.DateTimeFormat.
- Date objects are mutable. Never mutate inputs.

## Package Hierarchy

- `@tanstack/time` — core logic (calendar, date ops, formatting)
- `@tanstack/react-time` — React hooks (useCalendar), re-exports from core
- `@tanstack/time-devtools` — devtools UI, depends on core
- `@tanstack/solid-time` — Solid adapter (mirrors react-time)
- `@tanstack/solid-time-devtools` — Solid devtools

## File Organization

- `packages/time/src/date/` — date manipulation (add, subtract, startOf, endOf, format, parse, etc.)
- `packages/time/src/calendar/` — calendar engine (CalendarCore, DateCore, event rendering, recurrence, resizing)
- `packages/time/src/client/` — client-side utilities
- `packages/time/src/formatter/` — Intl.DateTimeFormat wrappers
- `packages/time/src/utils/` — shared helpers

## Testing

- Vitest for unit tests. `*.test.ts` co-located with source.
- React tests use `@testing-library/react`.
- No comment policy: zero comments in source. Prefer naming, types, structure.

## Build

- `tsdown` for bundling. Outputs ESM + CJS.
- `nx` for task orchestration.
- `pnpm` for package management.

## Key Files

- `packages/time/src/calendar/calendar.ts` — CalendarCore class
- `packages/time/src/calendar/date-core.ts` — DateCore abstract class
- `packages/time/src/date/index.ts` — date utility exports
- `packages/time/src/index.ts` — top-level exports
- `Methodology.md` — API design philosophy
- `TODO.md` — roadmap

## Agent Rules

- Do not add comments to source code.
- Follow existing code style. Use explicit types.
- When changing core, check react-time and devtools for breakage.
- Run `pnpm test:lib` and `pnpm test:types` before declaring done.
- Prefer small focused functions over classes.
- All new date logic must handle timezone and calendar correctly.
