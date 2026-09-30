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

Compose `eventMoveFeature` and `eventResizeFeature` (both require `eventRecurrenceFeature`) and the hook exposes controller helpers. Snapping is set with `constraints.snapToMinutes`; `containerHeight` is the pixel height of one day column.

```tsx
import { useEffect, useRef } from 'react'
import { useCalendar } from '@tanstack/react-time'
import {
  calendarFeatures,
  eventMoveFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
} from '@tanstack/time'
import type { Event } from '@tanstack/time'

const DAY_HEIGHT_PX = 1152

function DraggableCalendar({ events }: { events: Array<Event> }) {
  const calendar = useCalendar({
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    features: calendarFeatures([eventRecurrenceFeature, eventMoveFeature, eventResizeFeature]),
    move: { containerHeight: DAY_HEIGHT_PX, constraints: { snapToMinutes: 15 } },
    resize: { containerHeight: DAY_HEIGHT_PX, constraints: { snapToMinutes: 15 } },
    events,
  })
  const { moveState, updateEventMove, endEventMove, cancelEventMove } = calendar
  const startY = useRef(0)

  useEffect(() => {
    if (!moveState.isMoving) return
    const onPointerMove = (e: PointerEvent) => {
      const column = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>('[data-day]')
      updateEventMove({ dayDate: column?.dataset.day, deltaPixels: e.clientY - startY.current })
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endEventMove)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endEventMove)
    }
  }, [moveState.isMoving, updateEventMove, endEventMove, cancelEventMove])

  return calendar.days.map((day) => (
    <div key={day.isoDate} data-day={day.isoDate} {...calendar.getDayColumnProps(day.isoDate)}>
      {day.events.map((event) => (
        <div
          key={event.id}
          onPointerDown={(e) => {
            const { originalStart, originalEnd } = calendar.getEventSegmentInfo(event)
            startY.current = e.clientY
            calendar.startEventMove({
              eventId: event.id,
              originalStart,
              originalEnd,
              dayDate: day.isoDate,
            })
          }}
        >
          {event.title}
          <span {...calendar.getResizeHandleProps(event.id, 'end', event.start, event.end)} />
        </div>
      ))}
    </div>
  ))
}
```

`startEventMove` only begins a move: drive it with `updateEventMove` and finish with `endEventMove` or `cancelEventMove`. See [Move, Resize & Layout](../../interaction) for the controller model and a full example in `examples/react/calendar-drag-resize`.

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
