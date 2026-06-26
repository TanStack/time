# Testing Spec

## Test Framework

- Vitest for all unit and integration tests.
- Co-located tests: `*.test.ts` in same directory as source.
- React tests use `@testing-library/react` + `@testing-library/jest-dom` matchers.
- Faker via `@faker-js/faker` for test data generation.

## Test Commands

- `pnpm test:lib` — run Vitest tests
- `pnpm test:lib:dev` — watch mode
- `pnpm test:types` — TypeScript type checking via `tsc --noEmit`
- `pnpm test:lint` — linting
- `pnpm test:ci` — full CI suite (oxlint, sherif, knip, docs, lib, types, build)

## Coverage Expectations

- Date primitives: edge cases around leap years, timezone transitions, calendar variants
- Calendar engine: event overlap, multi-day splitting, recurrence, resize, availability
- React hooks: render cycles, state updates, unmount cleanup

## Test Patterns

- Use explicit timezones in calendar tests. Avoid relying on local system time.
- Create helper functions for common calendar setup to reduce boilerplate.
- Mock Temporal API polyfill behavior when testing edge cases.
- For resize/drag tests, simulate pointer events and verify state transitions.

## CI Requirements

- `pnpm test:pr` must pass before merge.
- `pnpm test:sherif` ensures dependency consistency across packages.
- `pnpm test:knip` detects unused exports and dependencies.
- `pnpm test:docs` verifies all markdown links are valid.
