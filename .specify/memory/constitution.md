# TanStack Time Constitution

## Purpose

TanStack Time is a headless, framework-agnostic date/time and calendar utility library. It provides the core logic for building time and calendar UI components across React, Solid, Vue, Svelte, and Angular. It is designed after TanStack Query and TanStack Table: a powerful, treeshakable core with thin framework adapters.

## Core Principles

1. **Headless First**: All UI logic lives in the core. Framework adapters are thin reactive wrappers.
2. **Temporal Accuracy**: Date/time instances are relative to timezone and calendar. Never treat them as static points.
3. **Zero Comments**: Source code contains no comments. Prefer names, types, structure, and tests.
4. **Treeshakable**: Prefer standalone functions over fluent APIs. Each function is idempotent and composable.
5. **No Temporal Leakage**: Public API returns Date or string. Never expose Temporal objects to consumers.
6. **Immutable Inputs**: Never mutate Date objects passed into the API. Always clone or create new Temporal instances.
7. **Standards-Based**: Use RFC 3339 for serialization, Intl.DateTimeFormat for display, and the Temporal polyfill for computation.

## Quality Standards

- **Testing**: Every public function must have co-located unit tests using Vitest. React hooks tested with `@testing-library/react`.
- **Type Safety**: All public APIs fully typed. No `any` in the public surface. Generics for calendar resources and events.
- **Performance**: Date primitives should be fast enough for frequent re-renders. Avoid creating unnecessary Temporal objects.
- **Edge Cases**: Handle leap years, timezone transitions, and calendar variants correctly.
- **CI Gate**: `pnpm test:pr` (oxlint, sherif, knip, docs, lib, types, build) must pass before merge.

## Technical Decisions

- **Monorepo**: pnpm workspaces + nx for task orchestration and caching.
- **Build**: `tsdown` produces ESM + CJS for each package.
- **State**: `@tanstack/store` in core. `@tanstack/react-store` in React adapter.
- **Temporal**: `@js-temporal/polyfill` until native browser support.
- **Formatting**: Intl.DateTimeFormat parts, not string tokens.
- **Date Input**: Accept RFC 3339 string, epoch milliseconds, or Date object.

## Process Rules

1. **No comments in source code**. If a constraint is non-obvious, encode it in the type system or test.
2. **Small focused functions over classes**. Only use classes where state management is necessary (CalendarCore, DateCore).
3. **When changing core, check all adapters**. react-time, solid-time, and devtools must remain compatible.
4. **Run tests before declaring done**. `pnpm test:lib` and `pnpm test:types`.
5. **All new date logic must handle timezone and calendar correctly**.
6. **Prefer improving names, types, APIs, structure, and tests over adding comments**.
