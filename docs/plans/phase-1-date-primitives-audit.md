# Phase 1 — Date Primitives: ADR 0002 return-type audit

Roadmap item: **Date Primitives (already present — audit for ADR 0002 return-type contract).**

ADR 0002 decided that instant-bearing results return a native `Date`, civil values return ISO
strings, timezone and calendar are inputs only, and there is **no `{ value, options }` tuple**. The
ADR's own Context section names the code that contradicts it. Phase 0 fixed the calendar side
(`Day.date`, `currentPeriod`, `activeDate` are ISO strings now). The Date Primitives were left, and
they are the half the ADR argued hardest about.

## The finding

Twelve primitives return the rejected tuple. `createDateOperationResult` builds it:

```ts
{ value: string, options: ResolvedDateOperationOptions, returnFormat, asDate(), asEpoch(),
  asZonedDateTime(), timeZone: string, calendar: string }
```

That object violates three of the four decisions at once. `value`/`options` **is** the rejected
tuple. `timeZone`/`calendar`/`options` put the zone and calendar in a return value, which the ADR
says never happens. `asZonedDateTime()` hands the consumer a `Temporal.ZonedDateTime` — the rejected
"Temporal objects in the public API" option, reached through a method instead of a field. And
`returnFormat: "long"` emits `2024-03-16T14:42:12.789Z[UTC][u-ca=iso8601]`, which is the rejected
`TimeValue` canonical string under another name.

Affected: `add`, `subtract`, `startOf`, `endOf`, `round`, `ceil`, `clamp`, `set`, `min`, `max`,
`fromUnixTime`, and `range` (an array of them).

Already compliant, no change: the predicates (`isBefore`, `isAfter`, `equals`, `isSameOrBefore`,
`isSameOrAfter`, `isBetween`, `intersects`, `isPast`, `isFuture`, `isWeekend`, `isLeapYear`,
`isValidDate`) return `boolean`; `since`, `until`, `count`, `getWeek`, `getDayOfYear`, `getUnixTime`
return `number`; `format` returns `string`; `parse` returns `Date | undefined`;
`toPlainDateString` / `toPlainDateTimeString` / `toPlainTimeString` return ISO strings.

## Why it is worth fixing rather than re-deciding

The tuple is not merely off-spec, it breaks composition. The result object is not a `DateInput`, so
today every chained call has to unwrap:

```ts
format(add(d, { duration: { days: 1 } }).asZonedDateTime(), { type: "date" })
```

Return a `Date` and the same line composes, because `Date` is already a `DateInput`:

```ts
format(add(d, { duration: { days: 1 } }), { type: "date" })
```

That is the date-fns drop-in the ADR was buying, and it is unreachable while the wrapper exists.

## Slices

### Slice 1 — instants return `Date` ✅

`createDateOperationResult` becomes `toInstantDate(zdt): Date` and the twelve primitives return it.
`ReturnFormat`, the `returnFormat` option and the `"long"` extended-ISO string are deleted;
`DateOperationOptions` collapses to `DateOptions` and `ResolvedDateOperationOptions` to
`{ timeZone, calendar }`.

The conversion uses `zdt.epochMilliseconds` instead of `Number(zdt.epochNanoseconds / 1_000_000n)`.
BigInt division truncates toward zero, so the old expression rounded pre-1970 sub-millisecond
instants the wrong way; `epochMilliseconds` floors, which is what a `Date` means. `format` routes
through the same helper so there is one instant→`Date` conversion in the package.

### Slice 1b — the units a `Date` cannot express are removed ✅

Sub-millisecond precision is lost on the way out. Calling that "the ADR's accepted cost" was too
glib, because two options in the API were *only* meaningful below the millisecond: `RoundUnit` and
`CeilUnit` both offered `"microsecond"` and `"nanosecond"`. Rounding to a microsecond and then
returning a `Date` is not a precision trade-off, it is a signature that cannot express its own
result — the change it makes is always invisible in the value handed back. The old tests only
observed it by reaching through `asZonedDateTime()`, which is the accessor this audit removes.

So both unions now stop at `"millisecond"`, which is the finest unit a `Date` can actually
represent. Nothing in the repo passed either value; they were reachable only from consumer code, and
only ever as a no-op.

The remaining loss is inputs that *carry* micro/nanoseconds, and it is genuinely small: every
unit-truncating primitive (`startOf`, `endOf`, `round`, `ceil`, `set`) already zeroes below the
millisecond, so only `add`/`subtract`/`clamp`/`min`/`max` can propagate sub-millisecond input, and
they now floor it.

If sub-millisecond arithmetic is ever actually wanted, the escape hatch is a **nanosecond-precision
ISO instant string**, not a return-value wrapper: a string keeps the digits, composes as a
`DateInput` on the way back in, and puts no `Temporal` type in the published API. Deliberately not
built here — there is no caller, and speculative surface is what produced the wrapper in the first
place.

### Slice 2 — the internal callers stop unwrapping ✅

Five call sites read `.asZonedDateTime()`. Removing the accessor is only safe if none of them needed
the *zone*, and none did — they all needed an instant to compare:

- `equals`, `isSameOrBefore`, `isSameOrAfter` compared `toInstant().epochNanoseconds` or
  `ZonedDateTime.compare`, which compare instants. They now compare `Date.getTime()`.
- `count` needs `.until({ unit })`, so it re-zones the returned `Date` with the same
  `timeZone`/`calendar` it passed in. Lossless: `startOf` has already zeroed everything below the
  millisecond.
- `projection/splitMultiDay` held a `ZonedDateTime` and only wanted its day boundaries, so it does
  `.with({ hour: 0, ... })` inline. It stops importing `~/date` altogether, which is the better
  shape anyway — `projection` is a `PURE_DIRS` directory and the primitives resolve their defaults
  from `Intl` via `getDateTimeDefaults()`.

`normalizeWeek` existed only because `startOf(x, { unit: "week" })` subtracts days without zeroing
the time of day. The three predicates get that by composing instead — `startOf(startOf(x, "week"),
"day")` — so the helper is deleted rather than left for knip to find.

### What the migration cost in tests

The date suite went from 562 tests to 540. Every one of the 22 removed tests asserted the shape
being deleted, not a behaviour: `expect(result.options.timeZone).toBe("Asia/Tokyo")`,
`expect(result.returnFormat).toBe("standard")`, `expect(result.calendar).toBe("japanese")`, and the
three `asDate` / `asEpoch` / `asZonedDateTime` accessor tests per primitive.

Deleting them would have dropped real coverage — "is the `timeZone` option honoured?" is a fair
question even when the answer is no longer echoed back. So each one was rewritten as an assertion on
the returned instant, which is the only place the option is now observable, and that turned out to be
*stronger* than what it replaced:

- `add`/`subtract` gained a spring-forward case: `add(2024-03-09T12:00:00Z, { days: 1 })` is
  `2024-03-10T11:00:00Z` in `America/New_York` and `2024-03-10T12:00:00Z` in `UTC`. The old tests
  only checked that the string `"America/New_York"` came back in the payload, so nothing in the suite
  had ever proven the zone changed the arithmetic.
- `ceil`/`round` moved to `Asia/Kolkata`, because a whole-hour offset like `America/New_York` rounds
  to the same instant as UTC and could not have failed.
- `set` and the calendar cases moved to `islamic`, because `japanese` shares Gregorian months and
  therefore gives the same answer as `iso8601` for every operation the old tests performed.

Where an option genuinely cannot change the result, the test is gone rather than reworded: `clamp`
returns one of its own inputs, `min`/`max` pick one of theirs, and `fromUnixTime` converts an epoch —
all three are zone-independent, and the option only ever affected the discarded payload. `min`/`max`
and `fromUnixTime` each keep one test asserting exactly that invariance.

## An unrelated defect this surfaced

Running the full suite for a baseline showed `TypeCheckError: 'kernel.api.getWorkingDuration' is of
type 'unknown'` in `kernel/modules/tests/duration.test.ts` — on a clean tree, so it shipped with
Slice 4 of `phase-1-solver-event-model.md`. Vitest reports typecheck failures on a separate `Errors`
line from `Type Errors`, which is how it was missed.

`Kernel.use()` returns `this`, so it cannot accumulate module api types; only `createKernel` threads
`ComposedApi<TModules>` into the second type parameter. A test that reaches for `kernel.api` has to
name the api itself — `new Kernel<CalEvent, DurationModuleApi>()` — which is now what the test does.
The module was always correct at runtime; the test was asserting against `unknown`.

## Trade-offs accepted

- **`returnFormat: "long"` is gone with no replacement.** It was the one way to get a zone back out
  of a result. A consumer who wants the round-trip can build the string themselves; `toZonedDateTime`
  still accepts `...[tz][u-ca=cal]` on the way *in*, so the input side is unchanged.
- **The contract is load-bearing, not a convenience.** A returned `Date` is an instant with no zone.
  Reading it with `.getMonth()` / `.getDate()` is wrong at any offset that is not the machine's, and
  the fix is to go back through `format` or a primitive with an explicit `timeZone`. ADR 0002
  already says this; the audit is what makes it true of the code.

## Open questions

- **`DateInput` still admits `Temporal.ZonedDateTime` and `Temporal.PlainDate`, and `DurationLike`
  is `Temporal.DurationLike`.** The roadmap item scopes this audit to the *return-type* contract, and
  accepting a Temporal value is not the same leak as handing one back — but it does put the polyfill
  in consumer-facing input types. Worth its own decision, not a silent widening of this slice.
- **`startOf(x, { unit: "week" })` does not zero the time of day** while every other unit does. The
  three predicates now compose around it. Whether that is a bug in `startOf` or a documented
  difference is a behaviour change, so it is not in this audit.

## Definition of done

- [x] No public primitive returns an object literal, a `Temporal` value, or a zone/calendar.
- [x] Every instant-bearing primitive returns `Date` and therefore composes as a `DateInput`.
- [x] No option offers a precision the return type cannot express — `RoundUnit` and `CeilUnit` stop
      at `"millisecond"`.
- [x] No `.value` / `.asDate()` / `.asEpoch()` / `.asZonedDateTime()` remains anywhere in the repo.
- [x] The suite stays green, including the `PURE_DIRS` walk.
