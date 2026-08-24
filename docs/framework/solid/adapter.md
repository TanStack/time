---
title: Solid Adapter
id: solid-adapter
---

# Solid Adapter

`@tanstack/solid-time` is a thin wrapper around `@tanstack/time` that exposes the calendar core through Solid primitives.

## `createCalendar`

The `createCalendar` primitive creates a calendar instance and returns reactive accessors.

```tsx
import { createCalendar } from '@tanstack/solid-time'
import { calendarFeatures, stockFeatures } from '@tanstack/time'

function MyCalendar() {
  const { calendar, state, days } = createCalendar({
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
        {days().map((day) => (
          <li>{day.date}</li>
        ))}
      </ul>
      <ul>
        {state().events.map((event) => (
          <li>
            {event.title} — {event.start} to {event.end}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Resize Controller

When the `resize` option is provided, the primitive exposes resize helpers.

```tsx
import { createCalendar } from '@tanstack/solid-time'
import { calendarFeatures, eventResizeFeature } from '@tanstack/time'

function ResizableCalendar() {
  const { calendar, state, getResizeHandleProps } = createCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures([eventResizeFeature]),
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
      {state().events.map((event) => (
        <div>
          {event.title}
          <span
            onMouseDown={
              getResizeHandleProps(event.id, 'end', event.start, event.end)
                .onMouseDown
            }
          />
        </div>
      ))}
    </div>
  )
}
```

## Devtools

If you have TanStack Devtools installed, register the time plugin to inspect calendar state and operations.

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

## API Reference

See the [Solid API Reference](./reference/index) for the full list of primitives, types, and helpers.
