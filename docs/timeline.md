---
id: timeline
title: Timeline
---

`timelineFeature` turns the visible period into a horizontal, resource-per-row track: the Gantt /
scheduler layout. It adds two methods, `getEventsByResource` and `getTimelineLayout`, and no
options. The output is logical: fractions and percentages, never pixels. See
[ADR 0003](https://github.com/TanStack/time/blob/main/docs/adr/0003-logical-layout-with-percentage-prop-getter.md)
for why the core stays dimension-free.

## Setup

```ts
import { calendarFeatures, createCalendar, timelineFeature } from '@tanstack/time'
import type { Event, Resource } from '@tanstack/time'

const resources: Array<Resource> = [
  { id: 'alice', label: 'Alice - Design' },
  { id: 'bob', label: 'Bob - Frontend' },
]

const events: Array<Event> = [
  { id: '1', title: 'Brand refresh', start: '2025-06-02T09:00:00', end: '2025-06-04T17:00:00',
    resources: ['alice'] },
  { id: '2', title: 'Icon set', start: '2025-06-03T12:00:00', end: '2025-06-05T12:00:00',
    resources: ['alice'] },
  { id: '3', title: 'Checkout page', start: '2025-06-02T08:00:00', end: '2025-06-03T18:00:00',
    resources: ['bob'] },
]

const calendar = createCalendar({
  features: calendarFeatures([timelineFeature]),
  timeZone: 'UTC',
  viewMode: { value: 1, unit: 'week' },
  resources,
  events,
})

calendar.goToSpecificPeriod('2025-06-02')
const layout = calendar.getTimelineLayout()
```

The visible range is whatever the view mode produces: `day`, `week`, `workWeek` or `month`. Switch
it with `changeViewMode`; the timeline follows.

## Rows come from `resources`, not from events

There is exactly one row per entry in the calendar's `resources` option, in that order. A
resource with no events still gets a row. An event reaches a row through its own `resources`
array, by id string or by object:

```ts
calendar.getEventsByResource().get('alice')
```

`getEventsByResource` returns a `Map<TResource['id'], Array<TEvent>>` pre-seeded with every
configured resource, so `.get()` returns `[]` rather than `undefined` for a known id.

Three consequences are easy to miss:

- An event referencing a resource id that is **not** in `resources` is silently dropped.
- An event with no `resources` never appears on the timeline.
- An event assigned to two resources appears in **both** rows. Key rendered bars by
  `row.resource.id` plus `event.id`, not `event.id` alone.

## All-day events are excluded

The timeline reads only the timed events of each day. Events with `allDay: true` do **not**
appear in `getEventsByResource` or `getTimelineLayout`. Give an event real `start`/`end` times
if it belongs on the track.

## Multi-day events are one bar

Internally the calendar splits a multi-day event into per-day segments. The timeline merges
those segments back by `id` and restores the original `start`/`end`, so a Monday-to-Wednesday
task is one bar, and the `event` you receive carries its full span. Recurring occurrences each
have their own generated `id`, so each occurrence is its own bar.

Only events that touch a visible day are included. `getEventsByResource` is a view of the
current period, not of the whole store.

## Layout shape

```ts
interface TimelineLayout<TResource, TEvent> {
  rows: Array<TimelineResourceRow<TResource, TEvent>>
  currentTimePosition: number | null
}

interface TimelineResourceRow<TResource, TEvent> {
  resource: TResource
  events: Array<TimelineEventLayout<TResource, TEvent>>
  laneCount: number
}

interface TimelineEventLayout<TResource, TEvent> {
  event: TEvent
  left: number
  width: number
  lane: number
  startFraction: number
  endFraction: number
  isStartClipped: boolean
  isEndClipped: boolean
}
```

- `left` and `width` are **numbers** in percent of the whole visible range. Append `%`
  yourself. `width` is measured after clipping.
- `startFraction` / `endFraction` are the same positions in `0..1`, for canvas or virtualized
  renderers.
- `isStartClipped` / `isEndClipped` flag a bar that continues past the visible edge. Use them to
  drop the rounded corner or draw an arrow.
- `laneCount` is at least `1`, even for an empty row, so row height never collapses to zero.
- `currentTimePosition` is the now-line in percent, computed in the calendar's `timeZone`, or
  `null` when today is not visible.

```ts
const LANE_HEIGHT_PX = 32

for (const row of layout.rows) {
  const rowHeight = row.laneCount * LANE_HEIGHT_PX
  for (const { event, left, width, lane } of row.events) {
    const style = { left: `${left}%`, width: `${width}%`, top: lane * LANE_HEIGHT_PX }
  }
}
```

## How lanes are computed

Inside one row, overlapping events are stacked into lanes. Each event goes into the first lane
where it overlaps nothing already placed; otherwise a new lane opens. Events that only touch
(one ends exactly when the next starts) share a lane.

Placement is first-fit in **input order**, not sorted by start. Lanes are per row: two resources
never share lane numbers.

## The time axis is wall-clock

The range is `days × 24` hours starting at midnight of the first visible day. Positions are
derived from each event's civil date-time, so a DST-transition day is still exactly 1/N of the
track. Events are not re-projected into another zone for the axis.

## With dependencies

`timelineFeature` does not know about `dependsOn`. Compose it with `eventDependencyFeature` and
draw the arrows yourself from the bar geometry:

```ts
import { calendarFeatures, createCalendar, eventDependencyFeature, timelineFeature } from '@tanstack/time'

const calendar = createCalendar({
  features: calendarFeatures([timelineFeature, eventDependencyFeature]),
  timeZone: 'UTC',
  viewMode: { value: 2, unit: 'week' },
  resources,
  events,
})

const trackWidth = 1200
const bars = new Map<string, { leftPx: number; rightPx: number; lane: number }>()
for (const row of calendar.getTimelineLayout().rows) {
  for (const bar of row.events) {
    bars.set(bar.event.id, {
      leftPx: (bar.left / 100) * trackWidth,
      rightPx: ((bar.left + bar.width) / 100) * trackWidth,
      lane: bar.lane,
    })
  }
}
```

Walk `event.dependsOn` from `calendar.getEvents()` and connect `bars.get(dependency.id)` to the
successor's bar. When an edit moves successors, the next `getTimelineLayout()` reflects the new
positions; there is nothing to invalidate. A predecessor outside the visible range has no entry in
`bars`, so guard the lookup.

## Pure helpers

The feature delegates to two pure functions, exported for custom views (a canvas renderer, a
server-side export, a range that is not the calendar's period):

```ts
import { currentTimeFraction, layoutTimelineRange } from '@tanstack/time'

const { items, laneCount } = layoutTimelineRange({
  events: [
    { id: 'a', start: '2025-06-02T09:00:00', end: '2025-06-02T11:00:00' },
    { id: 'b', start: '2025-06-02T10:00:00', end: '2025-06-02T12:00:00' },
  ],
  firstDay: '2025-06-02',
  totalDays: 5,
})

const now = currentTimeFraction({
  isoDates: ['2025-06-02', '2025-06-03'],
  now: { isoDate: '2025-06-03', hour: 12, minute: 0 },
})
```

`layoutTimelineRange` takes any `TimelineSpanEvent` (`id`, `start`, `end`) and returns a
`TimelineRangeLayout`: `items` of `TimelineSpanLayout` (`index`, `id`, `startFraction`,
`endFraction`, `durationFraction`, `lane`, `isStartClipped`, `isEndClipped`) plus `laneCount`.
Events with no visible width are **dropped**, and `index` still points into your input array, so
map back with `input[item.index]`, not by position. The helper does not split by resource: call it
once per row.

`currentTimeFraction` returns `0..1` across `isoDates`, or `null` when `now.isoDate` is not in the
list.
