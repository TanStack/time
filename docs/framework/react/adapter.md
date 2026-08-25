---
title: React Adapter
id: react-adapter
---

# React Adapter

`@tanstack/react-time` is a thin wrapper around `@tanstack/time` that turns a calendar core into a React hook.

## `useCalendar`

The `useCalendar` hook creates a calendar instance and subscribes its store to your component.

```tsx
import { useCalendar } from '@tanstack/react-time'
import { calendarFeatures, stockFeatures } from '@tanstack/time'

function MyCalendar() {
  const calendar = useCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures(stockFeatures),
    events: [
      {
        id: '1',
        title: 'Team Standup',
        start: '2024-03-18T09:00:00',
        end: '2024-03-18T10:00:00',
      },
    ],
  })

  return (
    <div>
      <button onClick={calendar.goToPreviousPeriod}>Previous</button>
      <button onClick={calendar.goToNextPeriod}>Next</button>
      <ul>
        {calendar.getEvents().map((event) => (
          <li key={event.id}>
            {event.title} — {event.start} to {event.end}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Move & Resize Controllers

When the `move` and `resize` options are provided, the hook exposes controller helpers for dragging events.

```tsx
import { useCalendar } from '@tanstack/react-time'
import { calendarFeatures, eventMoveFeature, eventResizeFeature } from '@tanstack/time'

function DraggableCalendar() {
  const calendar = useCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures([eventMoveFeature, eventResizeFeature]),
    move: { granularity: { value: 15, unit: 'minute' } },
    resize: { step: { value: 15, unit: 'minute' } },
    events: [
      {
        id: '1',
        title: 'Team Standup',
        start: '2024-03-18T09:00:00',
        end: '2024-03-18T10:00:00',
      },
    ],
  })

  return (
    <div>
      {calendar.getEvents().map((event) => (
        <div
          key={event.id}
          onMouseDown={() => calendar.startEventMove({ eventId: event.id })}
        >
          {event.title}
        </div>
      ))}
    </div>
  )
}
```

## Devtools

If you have TanStack Devtools installed, register the time plugin to inspect calendar state and operations.

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

## API Reference

See the [React API Reference](./reference/index) for the full list of hooks, types, and helpers.
