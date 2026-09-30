---
name: react
description: >
  React bindings for TanStack Time. Load when writing React components with
  useCalendar from @tanstack/react-time, wiring drag-to-move with
  startEventMove, resize handles with getResizeHandleProps, move/resize
  granularity options, or the React time devtools plugin.
metadata:
  type: framework
  library: '@tanstack/react-time'
  framework: react
  library_version: '0.0.0'
requires:
  - '@tanstack/time#core'
sources:
  - 'TanStack/time:docs/framework/react/adapter.md'
  - 'TanStack/time:docs/quick-start.md'
---

# TanStack Time — React

`useCalendar` creates a calendar instance and subscribes the component to its
store. It accepts the same options as core `createCalendar`. Features and
date helpers still import from `@tanstack/time`.

```tsx
import { useCalendar } from '@tanstack/react-time'
import { calendarFeatures, stockFeatures } from '@tanstack/time'

function MyCalendar() {
  const calendar = useCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures(stockFeatures),
    events: [],
  })

  return (
    <ul>
      {calendar.getEvents().map((event) => (
        <li key={event.id}>{event.title}</li>
      ))}
    </ul>
  )
}
```

## Move and resize

Register `eventMoveFeature` / `eventResizeFeature` and pass `move` / `resize`
options. The hook then exposes controller helpers.

```tsx
import { useCalendar } from '@tanstack/react-time'
import { calendarFeatures, eventMoveFeature, eventResizeFeature } from '@tanstack/time'

function DraggableCalendar({ events }) {
  const calendar = useCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures([eventMoveFeature, eventResizeFeature]),
    move: { granularity: { value: 15, unit: 'minute' } },
    resize: { step: { value: 15, unit: 'minute' } },
    events,
  })

  return calendar.getEvents().map((event) => (
    <div key={event.id} onMouseDown={() => calendar.startEventMove({ eventId: event.id })}>
      {event.title}
    </div>
  ))
}
```

## Devtools

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'

function App() {
  return (
    <>
      <MyCalendar />
      <TanStackDevtools plugins={[timeDevtoolsPlugin()]} />
    </>
  )
}
```

Install `@tanstack/react-time-devtools` as a dev dependency.

## Common mistakes

- Calling core `createCalendar` inside a component. It creates a new instance
  every render and never re-renders on change. Use `useCalendar`.
- Copying `calendar.getEvents()` into `useState`. Read from the calendar; it
  is already reactive.
- Expecting `startEventMove` without `eventMoveFeature` registered.
