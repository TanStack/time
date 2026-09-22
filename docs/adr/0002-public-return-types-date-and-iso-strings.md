# Public return types: native `Date` for instants, ISO strings for civil values

## Status

accepted

## Context

Computations are done internally with Temporal (`ZonedDateTime`, `PlainDate`). The question
is what types cross the public boundary. `Methodology.md` originally said "never expose
Temporal; return Date or string" and sketched a `{ value, options }` tuple. The current code
contradicts this — `Day.date`, `CalendarStore.currentPeriod`, and `activeDate` are
`Temporal.PlainDate`. We also explored a `TimeValue` wrapper with `.toDate()`/`.toZonedDateTime()`
converters.

## Decision

- **Instant-bearing results return a native `Date`.** This makes the Date Primitives a real
  date-fns drop-in.
- **Civil/plain values return ISO strings** — `YYYY-MM-DD` for dates, and string form for
  periods/all-day boundaries. Never encode a civil date as a `Date`.
- **Timezone and calendar are explicit inputs only** (defaulting from `Intl`), never present
  in a return value. No `{ value, options }` tuple.
- **Contract:** consumers must interpret returned `Date`s through TanStack Time's tz-aware
  functions, never via native local accessors (`.getMonth()`, `.getDate()`, …).

## Considered Options

- **Temporal objects in the public API** — rejected: leaks the polyfill into consumer types
  before Temporal is native.
- **`TimeValue` wrapper** (canonical extended-ISO string + `to*` converters) — elegant and
  removed the polyfill-lock-in concern, but rejected in favour of native `Date` for date-fns
  drop-in compatibility and zero wrapper allocation.
- **Uniform "everything is a `Date`" at UTC midnight for civil values** — rejected: forces
  the all-day off-by-one onto every consumer who reads a civil `Date` with native accessors.

## Consequences

- `Day.date`, `currentPeriod`, `activeDate` must change from `Temporal.PlainDate` to ISO
  strings.
- A returned `Date` is an instant with no zone/calendar; correct rendering *requires* going
  back through the library. This is a documented, load-bearing contract, not a convenience.
