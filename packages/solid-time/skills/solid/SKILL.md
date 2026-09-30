---
name: solid
description: >
  Solid bindings for TanStack Time. Load when writing Solid components with
  createCalendar from @tanstack/solid-time, reading the state() and days()
  accessors, wiring resize handles with getResizeHandleProps, or the Solid
  time devtools plugin.
metadata:
  type: framework
  library: '@tanstack/solid-time'
  framework: solid
  library_version: '0.0.0'
requires:
  - '@tanstack/time#core'
sources:
  - 'TanStack/time:docs/framework/solid/adapter.md'
  - 'TanStack/time:docs/quick-start.md'
---

# TanStack Time — Solid

`createCalendar` from `@tanstack/solid-time` wraps the core instance in Solid
primitives. It returns `{ calendar, state, days, ... }`: `calendar` holds
methods, `state` and `days` are accessors. Features and date helpers still
import from `@tanstack/time`.

```tsx
import { For } from 'solid-js'
import { createCalendar } from '@tanstack/solid-time'
import { calendarFeatures, stockFeatures } from '@tanstack/time'

function MyCalendar() {
  const { calendar, state, days } = createCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures(stockFeatures),
    events: [],
  })

  return (
    <>
      <button onClick={calendar.goToNextPeriod}>Next</button>
      <For each={days()}>{(day) => <div>{day.date}</div>}</For>
      <For each={state().events}>{(event) => <div>{event.title}</div>}</For>
    </>
  )
}
```

## Resize

Register `eventResizeFeature` and pass `resize`. The primitive returns
`getResizeHandleProps(eventId, edge, start, end)`.

```tsx
import { For } from 'solid-js'
import { createCalendar } from '@tanstack/solid-time'
import { calendarFeatures, eventResizeFeature } from '@tanstack/time'

function ResizableCalendar(props) {
  const { state, getResizeHandleProps } = createCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures([eventResizeFeature]),
    resize: { step: { value: 15, unit: 'minute' } },
    events: props.events,
  })

  return (
    <For each={state().events}>
      {(event) => (
        <div>
          {event.title}
          <span
            onMouseDown={getResizeHandleProps(event.id, 'end', event.start, event.end).onMouseDown}
          />
        </div>
      )}
    </For>
  )
}
```

## Devtools

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { timeDevtoolsPlugin } from '@tanstack/solid-time-devtools'

function App() {
  return (
    <>
      <MyCalendar />
      <TanStackDevtools plugins={[timeDevtoolsPlugin()]} />
    </>
  )
}
```

## Common mistakes

- Importing `createCalendar` from `@tanstack/time` in Solid components. That is
  the non-reactive core. Import it from `@tanstack/solid-time`.
- Destructuring `state()` outside a tracking scope. Call the accessor where the
  value is read so Solid tracks it.
- Using React idioms (`useCalendar`, `calendar.getEvents()` in JSX) in Solid.
