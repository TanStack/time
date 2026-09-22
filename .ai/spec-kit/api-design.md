# API Design Spec

## Design Philosophy

TanStack Time is designed after TanStack Query and TanStack Table: headless, framework-agnostic core with thin framework adapters. See `Methodology.md` for detailed rationale.

## Input Contracts

- Dates accepted as RFC 3339 string, epoch milliseconds (number), or Date object.
- Timezone and calendar are explicit parameters. If omitted, defaults from `Intl.DateTimeFormat`.
- Never mutate input Date objects. Always clone or create new Temporal instances.

## Output Contracts

- Public methods return either Date objects or strings.
- Never return Temporal objects directly to consumers.
- Methods return `{ value, options }` tuple where `options` carries timezone/calendar used.
- Formatting methods return string parts via Intl.DateTimeFormat.

## Method Signature Pattern

```ts
function operationName({
  date,
  unit,
  returnFormat,
  options,
}: {
  date: Date | string | number
  unit: DateUnit
  returnFormat?: 'standard' | 'long' | 'epoch' | 'Date' | 'ZonedDateTime'
  options?: { timeZone?: string; calendar?: string }
}): { value: ReturnType; options: { timeZone: string; calendar: string } }
```

## Chaining vs Standalone

- Prefer standalone functions over fluent/chaining APIs.
- Chaining creates object overhead and hinders treeshaking.
- Each function is idempotent and composable.

## TypeScript Requirements

- All public APIs must be fully typed.
- Generic parameters for calendar resources and events.
- No `any` in public surface.

## Framework Adapter Pattern

- Core is pure TS/JS. No framework dependencies.
- React adapter: `useCalendar` hook that creates `CalendarCore` instance and exposes reactive selectors.
- Solid adapter: equivalent `useCalendar` using Solid's reactive primitives.
- Devtools are separate packages that inject into core store.
