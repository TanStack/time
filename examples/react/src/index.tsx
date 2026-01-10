import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { Temporal } from '@js-temporal/polyfill'
import { useCalendar } from '@tanstack/react-time'
import type { Event } from '@tanstack/time'
import './index.css'

const sampleEvents: Event[] = [
  {
    id: '1',
    start: '2024-06-10T09:00:00',
    end: '2024-06-10T10:00:00',
    title: 'Team Meeting',
  },
  {
    id: '2',
    start: '2024-06-12T11:00:00',
    end: '2024-06-12T12:00:00',
    title: 'Project Review',
  },
  {
    id: '3',
    start: '2024-06-12T14:00:00',
    end: '2024-06-12T15:30:00',
    title: 'Client Call',
  },
  {
    id: '4',
    start: '2024-06-15T10:00:00',
    end: '2024-06-15T11:00:00',
    title: 'Workshop',
  },
  {
    id: '5',
    start: '2024-06-20T09:00:00',
    end: '2024-06-22T17:00:00',
    title: 'Multi-day Conference',
  },
]

export default function App() {
  const calendar = useCalendar({
    events: sampleEvents,
    viewMode: { value: 1, unit: 'month' },
    locale: 'en-US',
  })

  const daysNames = calendar.getDaysNames('short')

  const groupedWeeks =
    calendar.viewMode.unit === 'month'
      ? calendar.groupDaysBy({
          days: calendar.days,
          unit: 'week',
          fillMissingDays: true,
        })
      : calendar.viewMode.unit === 'week'
        ? calendar.groupDaysBy({
            days: calendar.days,
            unit: 'week',
            fillMissingDays: true,
          })
        : [[...calendar.days]]

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-5">
        TanStack Time Calendar Example
      </h1>

      <div className="mb-5">
        <div className="flex gap-2.5 items-center">
          <button
            onClick={calendar.goToPreviousPeriod}
            disabled={calendar.isPending}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={calendar.goToCurrentPeriod}
            disabled={calendar.isPending}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Today
          </button>
          <button
            onClick={calendar.goToNextPeriod}
            disabled={calendar.isPending}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
          <div className="ml-5 text-lg font-bold">
            {Temporal.PlainDate.from(calendar.currentPeriod).toLocaleString(
              'en-US',
              {
                month: 'long',
                year: 'numeric',
              },
            )}
          </div>
        </div>

        <div className="mt-2.5 flex gap-2.5">
          <button
            onClick={() => calendar.changeViewMode({ value: 1, unit: 'month' })}
            className={`px-3 py-1.5 text-xs rounded border border-gray-300 transition-colors ${
              calendar.viewMode.unit === 'month'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => calendar.changeViewMode({ value: 1, unit: 'week' })}
            className={`px-3 py-1.5 text-xs rounded border border-gray-300 transition-colors ${
              calendar.viewMode.unit === 'week'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => calendar.changeViewMode({ value: 1, unit: 'day' })}
            className={`px-3 py-1.5 text-xs rounded border border-gray-300 transition-colors ${
              calendar.viewMode.unit === 'day'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="grid gap-px bg-gray-300 border border-gray-300">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${daysNames.length}, 1fr)`,
          }}
        >
          {daysNames.map((dayName: string) => (
            <div
              key={dayName}
              className="p-2.5 bg-white text-center font-bold text-xs"
            >
              {dayName}
            </div>
          ))}
        </div>

        {groupedWeeks.map(
          (
            week: Array<(typeof calendar.days)[0] | null>,
            weekIndex: number,
          ) => (
            <div
              key={weekIndex}
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${daysNames.length}, 1fr)`,
              }}
            >
              {week.map((day: (typeof calendar.days)[0] | null) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIndex}`}
                      className="min-h-[100px] p-2 bg-gray-50 border border-gray-200"
                    />
                  )
                }

                const dateStr = day.date.toString()
                const isToday = day.isToday
                const isInCurrentPeriod = day.isInCurrentPeriod

                return (
                  <div
                    key={dateStr}
                    className={`min-h-[100px] p-2 ${
                      isToday
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : isInCurrentPeriod
                          ? 'bg-white border border-gray-200'
                          : 'bg-gray-100 border border-gray-200 opacity-50'
                    }`}
                  >
                    <div
                      className={`text-sm mb-1 ${isToday ? 'font-bold' : 'font-normal'}`}
                    >
                      {day.date.day}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {day.events.map((event: Event) => {
                        const eventProps = calendar.getEventProps(event.id)
                        const hasOverlappingEvents =
                          (eventProps?.overlappingEvents.length ?? 0) > 0
                        return (
                          <div
                            key={event.id}
                            className={`text-[11px] px-1.5 py-1 rounded cursor-pointer text-white ${
                              hasOverlappingEvents
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            } ${eventProps?.isSplitEvent ? 'opacity-70' : 'opacity-100'}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ),
        )}
      </div>

      {calendar.isPending && (
        <div className="mt-2.5 text-gray-600 text-sm">Loading...</div>
      )}
    </div>
  )
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
