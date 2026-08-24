---
title: Quick Start
id: quick-start
---

# Quick Start

TanStack Time exposes a headless core and framework adapters. Pick the section that matches your stack.

## Core Usage

Create a calendar, add events, and read the current state.

```ts
import { createCalendar, calendarFeatures, stockFeatures } from '@tanstack/time'

const calendar = createCalendar({
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

console.log(calendar.getEvents())
console.log(calendar.getDays())
```

## React Usage

Use the `useCalendar` hook to create a reactive calendar inside a component.

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

## Solid Usage

Use the `createCalendar` primitive to build a reactive calendar.

```tsx
import { createCalendar } from '@tanstack/solid-time'
import { calendarFeatures, stockFeatures } from '@tanstack/time'

function MyCalendar() {
  const { calendar, state } = createCalendar({
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
        {state().events.map((event) => (
          <li>{event.title} — {event.start} to {event.end}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Next Steps

- [React Adapter](./framework/react/adapter) — Learn about `useCalendar` and built-in controllers.
- [Solid Adapter](./framework/solid/adapter) — Learn about `createCalendar` and built-in controllers.
- [Core API Reference](./reference/index) — Browse all exported functions, types, and classes.
