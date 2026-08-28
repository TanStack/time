# Phase 3 — Slot rules and booking

Implements ADR 0011. Adds a pure `src/slots/` core that turns Slot Rules plus Working Calendars
plus the event collection into free Slots, and a `bookingFeature` that exposes generation and
`book()`. Depends on ADR 0008's calendar hierarchy (landed) and ADR 0010's block compiler
(`docs/plans/phase-3-schedule-rules.md`, Slice 1) for the window half.

**Method:** same strangler-fig discipline as the working-time and schedule-rule plans. Every slice
leaves the suite green and ships something callable; no slice both introduces an algorithm and
changes a public shape.

---

## What exists today, and why none of it is this

| Thing | Answers | Why it isn't slot generation |
|-------|---------|------------------------------|
| `getTimeSlots` | locale-formatted hour labels for a day column | display grid; knows nothing about events, resources or capacity |
| `resolveLayeredDayMinutes` | which minutes of a date are workable | continuous predicate; no discretisation, and it *merges* adjacent windows |
| `checkAvailability` | does this one proposal fit | the veto; generation is the enumerating inverse |
| `Resource.buffer` | nothing | declared in `src/calendar/types.ts:70`, read nowhere |

The gap is the fold between them: window minutes → discrete units → minus events, holds and
buffers → minus now-relative limits → Slots.

## The surface

```ts
interface SlotRule {
  id: string
  calendarId: string
  duration: number
  step?: number
  bufferBefore?: number
  bufferAfter?: number
  minNotice?: number
  minNoticeIsWorkingTime?: boolean
  maxHorizon?: number
  resourceIds?: Array<string>
  capacity?: number
}

interface Slot {
  ruleId: string
  start: string
  end: string
  availableResourceIds: Array<string>
  remainingCapacity: number
}

interface GenerateSlotsResult {
  slots: Array<Slot>
  requiredRange: WorkingTimeRange
  truncated: boolean
}

generateSlots(input: {
  rules: Array<SlotRule>
  range: WorkingTimeRange
  now: string
  calendars: Array<WorkingCalendar> | null | undefined
  resources: Array<AvailabilityResourceInput>
  events: Array<SlotOccupyingEvent>
}): GenerateSlotsResult
```

Strings throughout the core, matching every other pure module; `bookingFeature` converts to `Date`
per ADR 0002 on the way out.

The motivating case end to end — two calendars because
`resolveLayeredDayMinutes` merges adjacent windows:

```ts
const calendars = [
  compileSchedule({
    id: 'clinic-mornings',
    timeZone: 'Europe/Warsaw',
    on: [merge(weekday('monday', 'wednesday'), between('08:00', '10:00'))],
    except: dates(['2026-12-25', '2027-01-01']),
  }),
  compileSchedule({
    id: 'clinic-afternoons',
    timeZone: 'Europe/Warsaw',
    on: [merge(weekday('monday', 'wednesday'), between('12:00', '16:00'))],
    except: dates(['2026-12-25', '2027-01-01']),
  }),
]

const slotRules = [
  { id: 'consult', calendarId: 'clinic-mornings', duration: 60, resourceIds: ['dr-a'] },
  { id: 'checkup', calendarId: 'clinic-afternoons', duration: 30, resourceIds: ['dr-a', 'dr-b'] },
]
```

## Slices

### Slice 1 — `src/slots/` grid, no occupancy

`generateSlots` over rules + calendars + `range` only: resolve each rule's window per day via
`resolveLayeredDayMinutes`, lay the grid from the window start at `step` (defaulting to
`duration`), drop overflowing tails. No events, no resources, no `now`. Add `src/slots` to
`PURE_DIRS` in `src/validation/tests/purity.test.ts` — the moment the directory exists.

Done when the motivating two-rule example yields exactly the hand-written slot list for a week,
including the two holidays producing nothing, and when a rule whose window doesn't divide evenly
drops its tail rather than overflowing.

### Slice 2 — timezone on `WorkingCalendar`

Optional `timeZone` on `WorkingCalendar`, inherited along the `parentId` chain in
`resolveCalendarChain`, defaulting to the instance zone. Civil minutes are converted to instants at
the slot boundary, not inside the resolver. DST is the whole point of this slice: gap-start slots
are dropped, fall-back repeats yield two slots at two instants.

Pin the reconciliation rule for mixed zones across unioned layers before writing the code — ADR
0011 names it as the one genuinely new hard case and does not decide it. Recommendation to argue
about: the *rule's own* calendar zone governs, and a layered calendar in a different zone
contributes minutes but not the zone.

Done when a `09:00-17:00` half-hour rule yields sixteen slots on the spring-forward date, sixteen on
the fall-back date, and the fall-back pair have distinct instants and identical wall-clock labels.

### Slice 3 — occupancy: events, holds, buffers, capacity

Subtract from the Slice 1 grid: existing events (padded by `max(rule buffer, resource buffer)`),
holds whose expiry is after `now`, and capacity per resource — `availableResourceIds` is the
resources still free, `remainingCapacity` the budget left. A rule with no `resourceIds` uses its own
`capacity`, defaulting to 1, which closes the "no resources means always free" hole
`checkAvailability` has by design.

Done when a slot with capacity 3 survives two bookings and disappears on the third, and when a
15-minute `bufferAfter` on a 09:00-10:00 booking removes the 10:00 slot but not the 10:30 one.

### Slice 4 — now-relative limits and bounds

`minNotice` (wall minutes, or working minutes via `addWorkingMinutes` when
`minNoticeIsWorkingTime`), `maxHorizon` clamping the range's far end, and a hard slot cap that sets
`truncated: true` rather than returning a silent prefix. `requiredRange` is populated here: the
event range generation actually read.

Independent of Slice 2; can land in parallel with it.

Done when a four-working-hour notice on a Friday 16:00 `now` first offers Monday, not Saturday —
and is not equal to the four-wall-hour answer.

### Slice 5 — `bookingFeature`

`src/calendar/features/booking.ts` plus three entries in `features/registry.ts`, following ADR 0009.
`requires: ['workingTime', 'availability']`, api-only (`module?` is optional on `CalendarFeature`).
Api: `getSlots(range, options)`, `book(slot, payload)`, `hold(slot, payload)`. Adds `slotRules` to
`CalendarHost.getOptions()`. Converts to `Date` per ADR 0002.

`getSlots` compares `requiredRange` against what is loaded and returns `unbackedRanges`; it does not
fetch. `book()` builds an event and pushes it through `host.write`, so availability, constraint and
duration validate stages run, and returns
`{ success: true; event } | { success: false; conflicts }`.

Done when `linking.test.ts` shows a `dayEventLayoutFeature`-only entry reaches no `slots/` code and
a `bookingFeature` entry does; and when a `book()` racing a conflicting write comes back
`success: false` with a capacity conflict rather than throwing.

### Slice 6 — `getTimeSlots` → `getTimeAxisLabels`

Rename, alias the old name for one minor with a deprecation note, update the framework adapters and
docs. Separate slice deliberately: nothing else in this plan depends on it, so it can land or be
dropped without touching the rest.

### Slice 7 — docs and an example

Reference docs for `SlotRule`, `generateSlots` and `bookingFeature`. A worked booking example
including the two-calendar split, because that is the part a reader gets wrong on first contact, and
the server-side re-validation snippet, because client `book()` is Advisory and the docs must say so
where someone will read it.

## Open questions

- **Mixed-zone layer reconciliation** (Slice 2). Named but not decided in ADR 0011.
- **Where the hard slot cap sits.** `MAX_WORKING_SKEW_DAYS` is the precedent for a documented
  ceiling; the right number here depends on whether pickers query a month or a year at a time.
- **Reaping expired holds.** Generation ignores them correctly, but nothing removes them from the
  event collection, so a busy calendar accumulates dead events. Probably the consumer's job — but
  say so, rather than leaving it unsaid.
- **`workingTimeFeature` returning strings** where ADR 0002 wants `Date`. Predates this work;
  fixing it is a breaking change worth its own slice.

## Definition of done

- The motivating example — 08:00-10:00 at one hour, 12:00-16:00 at half an hour, Mondays and
  Wednesdays, two holidays excepted — produces the hand-written slot list for a month.
- A slot offered by `getSlots` is one `book()` accepts, for every slot in a generated set: the
  generator and the validator agree, proven by a property test rather than asserted.
- DST: sixteen slots on both transition dates, gap slots absent, fall-back repeats distinct.
- Buffers change the offered set, and `Resource.buffer` is read by something.
- `src/slots/` is in `PURE_DIRS` and passes the purity test with no new forbidden import, and
  contains no clock read — `now` is always an argument.
- A range the client hasn't loaded events for comes back with `unbackedRanges` populated, not with
  silently-free slots.
