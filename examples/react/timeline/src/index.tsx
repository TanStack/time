import { useCalendar } from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import { useMemo, useRef, useState } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'
import type { Day, Event, Resource } from '@tanstack/time'

import './index.css'

function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseISODate(iso: string): Date {
  const datePart = iso.split('T')[0] ?? ''
  const parts = datePart.split('-').map(Number)
  return new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1)
}

const EVENT_COLORS = [
  { bg: 'bg-indigo-500/80', border: 'border-indigo-400', text: 'text-indigo-50' },
  { bg: 'bg-emerald-500/80', border: 'border-emerald-400', text: 'text-emerald-50' },
  { bg: 'bg-amber-500/80', border: 'border-amber-400', text: 'text-amber-50' },
  { bg: 'bg-rose-500/80', border: 'border-rose-400', text: 'text-rose-50' },
  { bg: 'bg-cyan-500/80', border: 'border-cyan-400', text: 'text-cyan-50' },
  { bg: 'bg-violet-500/80', border: 'border-violet-400', text: 'text-violet-50' },
  { bg: 'bg-orange-500/80', border: 'border-orange-400', text: 'text-orange-50' },
  { bg: 'bg-teal-500/80', border: 'border-teal-400', text: 'text-teal-50' },
]

const resourceDesign: Resource = { id: 'design', label: 'Design' }
const resourceFrontend: Resource = { id: 'frontend', label: 'Frontend' }
const resourceBackend: Resource = { id: 'backend', label: 'Backend' }
const resourceQA: Resource = { id: 'qa', label: 'QA' }
const resourceDevOps: Resource = { id: 'devops', label: 'DevOps' }

const sampleResources: Array<Resource> = [
  resourceDesign,
  resourceFrontend,
  resourceBackend,
  resourceQA,
  resourceDevOps,
]

function getSampleEvents(): Array<Event<Resource>> {
  const today = new Date()
  const d = (offset: number) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    return formatDateToISO(date)
  }

  return [
    {
      id: '1',
      title: 'UI Mockups',
      start: `${d(0)}T09:00:00`,
      end: `${d(2)}T17:00:00`,
      resources: [resourceDesign],
    },
    {
      id: '2',
      title: 'Component Library',
      start: `${d(1)}T09:00:00`,
      end: `${d(4)}T17:00:00`,
      resources: [resourceFrontend],
    },
    {
      id: '3',
      title: 'API Development',
      start: `${d(0)}T09:00:00`,
      end: `${d(5)}T17:00:00`,
      resources: [resourceBackend],
    },
    {
      id: '4',
      title: 'Database Schema',
      start: `${d(-1)}T09:00:00`,
      end: `${d(1)}T17:00:00`,
      resources: [resourceBackend],
    },
    {
      id: '5',
      title: 'Integration Tests',
      start: `${d(3)}T09:00:00`,
      end: `${d(6)}T17:00:00`,
      resources: [resourceQA],
    },
    {
      id: '6',
      title: 'CI/CD Pipeline',
      start: `${d(2)}T09:00:00`,
      end: `${d(3)}T17:00:00`,
      resources: [resourceDevOps],
    },
    {
      id: '7',
      title: 'Design Review',
      start: `${d(3)}T10:00:00`,
      end: `${d(3)}T16:00:00`,
      resources: [resourceDesign],
    },
    {
      id: '8',
      title: 'Auth Module',
      start: `${d(2)}T09:00:00`,
      end: `${d(5)}T17:00:00`,
      resources: [resourceFrontend],
    },
    {
      id: '9',
      title: 'Load Testing',
      start: `${d(5)}T09:00:00`,
      end: `${d(6)}T17:00:00`,
      resources: [resourceQA],
    },
    {
      id: '10',
      title: 'Deployment',
      start: `${d(5)}T09:00:00`,
      end: `${d(6)}T17:00:00`,
      resources: [resourceDevOps],
    },
  ]
}

const sampleEvents = getSampleEvents()

interface EventFormData {
  title: string
  startDate: string
  endDate: string
  resourceId: string
}

const emptyFormData: EventFormData = {
  title: '',
  startDate: formatDateToISO(new Date()),
  endDate: formatDateToISO(new Date()),
  resourceId: resourceDesign.id,
}

function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  mode,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: EventFormData) => void
  onDelete?: () => void
  initialData: EventFormData
  mode: 'add' | 'edit'
}) {
  const [formData, setFormData] = useState<EventFormData>(initialData)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {mode === 'add' ? 'Add Event' : 'Edit Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Resource
            </label>
            <select
              value={formData.resourceId}
              onChange={(e) =>
                setFormData({ ...formData, resourceId: e.target.value })
              }
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600"
            >
              {sampleResources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600"
                required
              />
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <div>
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete()
                    onClose()
                  }}
                  className="px-4 py-2 text-red-400 hover:text-red-300 rounded-md"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-700 rounded-md text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-neutral-200"
              >
                {mode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function TodayMarker({
  days,
  dayWidth,
}: {
  days: Array<Day<Resource, Event<Resource>>>
  dayWidth: number
}) {
  const now = new Date()
  const todayStr = formatDateToISO(now)
  const todayIndex = days.findIndex(
    (d) => d.date.toString({ calendarName: 'never' }) === todayStr,
  )
  if (todayIndex === -1) return null

  const hourFraction = (now.getHours() + now.getMinutes() / 60) / 24
  const left = todayIndex * dayWidth + hourFraction * dayWidth

  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
      style={{ left: `${left}px` }}
    >
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full" />
    </div>
  )
}

function TimelineRow({
  events,
  days,
  dayWidth,
  colorMap,
  onEventClick,
}: {
  events: Array<Event<Resource>>
  days: Array<Day<Resource, Event<Resource>>>
  dayWidth: number
  colorMap: Map<string, number>
  onEventClick: (event: Event<Resource>) => void
}) {
  const dayDates = useMemo(
    () => days.map((d) => d.date.toString({ calendarName: 'never' })),
    [days],
  )

  const firstDayDate = dayDates[0]
  if (!firstDayDate) return null
  const firstDay = parseISODate(firstDayDate)
  const totalWidth = days.length * dayWidth

  const positionedEvents = useMemo(() => {
    return events.map((event) => {
      const eventStart = parseISODate(event.start)
      const eventEnd = parseISODate(event.end)

      const startOffset = Math.max(
        0,
        (eventStart.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24),
      )
      const endOffset =
        (eventEnd.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24) + 1

      const left = Math.max(0, startOffset * dayWidth)
      const right = Math.min(totalWidth, endOffset * dayWidth)
      const width = Math.max(right - left, dayWidth * 0.3)

      return { event, left, width }
    })
  }, [events, firstDay, dayWidth, totalWidth])

  return (
    <div className="relative h-14 border-b border-neutral-800/50">
      {days.map((day, i) => (
        <div
          key={day.date.toString()}
          className={`absolute top-0 bottom-0 border-r border-neutral-800/30 ${
            day.isToday ? 'bg-neutral-800/20' : ''
          }`}
          style={{ left: `${i * dayWidth}px`, width: `${dayWidth}px` }}
        />
      ))}
      {positionedEvents.map(({ event, left, width }) => {
        const colorIdx = colorMap.get(event.id) ?? 0
        const color = EVENT_COLORS[colorIdx % EVENT_COLORS.length] ?? EVENT_COLORS[0]
        return (
          <div
            key={event.id}
            className={`absolute top-2 h-10 rounded-md border ${color.bg} ${color.border} ${color.text} px-2.5 flex items-center text-xs font-medium cursor-pointer hover:brightness-110 transition-all overflow-hidden shadow-sm`}
            style={{ left: `${left}px`, width: `${width}px` }}
            title={`${event.title} (${event.start.split('T')[0]} → ${event.end.split('T')[0]})`}
            onClick={() => onEventClick(event)}
          >
            <span className="truncate">{event.title}</span>
          </div>
        )
      })}
    </div>
  )
}

function TimelineView() {
  const DAY_WIDTH = 140

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: 'add' | 'edit'
    eventId?: string
    initialData: EventFormData
  }>({ isOpen: false, mode: 'add', initialData: emptyFormData })

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const calendar = useCalendar<Resource, Event<Resource>>({
    viewMode: { value: 2, unit: 'week' },
    events: sampleEvents,
    resources: sampleResources,
    timeZone: 'UTC',
  })

  const colorMap = useMemo(() => {
    const map = new Map<string, number>()
    sampleEvents.forEach((event, i) => map.set(event.id, i))
    return map
  }, [])

  const eventsByResource = useMemo(() => {
    const map = new Map<string, Array<Event<Resource>>>()
    sampleResources.forEach((r) => map.set(r.id, []))

    const allEvents = calendar.days.flatMap((d) => d.events)
    const seen = new Set<string>()
    for (const event of allEvents) {
      if (seen.has(event.id)) continue
      seen.add(event.id)

      const resourceIds =
        event.resources?.map((r) => r.id) ?? []
      if (resourceIds.length === 0) {
        map.get(resourceDesign.id)?.push(event)
      } else {
        for (const rid of resourceIds) {
          map.get(rid)?.push(event)
        }
      }
    }
    return map
  }, [calendar.days])

  const totalWidth = calendar.days.length * DAY_WIDTH

  const formatPeriodRange = () => {
    const days = calendar.days
    if (days.length === 0) return ''
    const first = days[0]
    const last = days[days.length - 1]
    const fmt = (d: typeof first.date) =>
      new Date(d.year, d.month - 1, d.day).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    return `${fmt(first.date)} — ${fmt(last.date)}`
  }

  const openAddModal = () =>
    setModalState({ isOpen: true, mode: 'add', initialData: emptyFormData })

  const openEditModal = (event: Event<Resource>) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      eventId: event.id,
      initialData: {
        title: event.title,
        startDate: event.start.split('T')[0] ?? '',
        endDate: event.end.split('T')[0] ?? '',
        resourceId: event.resources?.[0]?.id ?? resourceDesign.id,
      },
    })
  }

  const handleSave = (data: EventFormData) => {
    const resource = sampleResources.find((r) => r.id === data.resourceId)
    const eventData = {
      title: data.title,
      start: `${data.startDate}T09:00:00`,
      end: `${data.endDate}T17:00:00`,
      resources: resource ? [resource] : [],
    }

    if (modalState.mode === 'add') {
      calendar.addEvent({ id: String(Date.now()), ...eventData })
    } else if (modalState.eventId) {
      calendar.updateEvent(modalState.eventId, eventData)
    }
  }

  const handleDelete = () => {
    if (modalState.eventId) calendar.removeEvent(modalState.eventId)
  }

  return (
    <div className="p-5 max-w-[1400px] mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="m-0 mb-4 text-[28px] font-semibold text-white">
          TanStack Time — Timeline
        </h1>

        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <button
            onClick={calendar.goToPreviousPeriod}
            disabled={!calendar.canGoPreviousPeriod() || calendar.isPending}
            className={`px-4 py-2 border rounded-md ${
              calendar.canGoPreviousPeriod() && !calendar.isPending
                ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800'
                : 'border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={calendar.goToCurrentPeriod}
            disabled={calendar.isPending}
            className="px-4 py-2 border border-neutral-600 rounded-md text-neutral-200 hover:bg-neutral-800"
          >
            Today
          </button>
          <button
            onClick={calendar.goToNextPeriod}
            disabled={!calendar.canGoNextPeriod() || calendar.isPending}
            className={`px-4 py-2 border rounded-md ${
              calendar.canGoNextPeriod() && !calendar.isPending
                ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800'
                : 'border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            Next →
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-neutral-200"
          >
            + Add Event
          </button>

          <div className="ml-auto flex gap-2">
            {[
              { label: '1 Week', value: 1, unit: 'week' as const },
              { label: '2 Weeks', value: 2, unit: 'week' as const },
              { label: 'Month', value: 1, unit: 'month' as const },
            ].map((opt) => {
              const isActive =
                calendar.viewMode.value === opt.value &&
                calendar.viewMode.unit === opt.unit
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    calendar.changeViewMode({
                      value: opt.value,
                      unit: opt.unit,
                    })
                  }
                  className={`px-3 py-1.5 rounded-md border ${
                    isActive
                      ? 'border-neutral-500 bg-neutral-800 text-white'
                      : 'border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="text-lg font-medium text-neutral-400">
          {formatPeriodRange()}
        </div>
      </div>

      <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
        <div className="flex">
          {/* Resource labels column */}
          <div className="w-36 flex-shrink-0 border-r border-neutral-800 bg-neutral-950 z-10">
            <div className="h-16 border-b border-neutral-800 px-3 flex items-end pb-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Resources
              </span>
            </div>
            {sampleResources.map((resource) => (
              <div
                key={resource.id}
                className="h-14 border-b border-neutral-800/50 px-3 flex items-center"
              >
                <span className="text-sm font-medium text-neutral-300 truncate">
                  {resource.label}
                </span>
              </div>
            ))}
          </div>

          {/* Scrollable timeline area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto"
          >
            <div style={{ width: `${totalWidth}px` }}>
              {/* Day headers */}
              <div className="h-16 border-b border-neutral-800 bg-neutral-950 flex">
                {calendar.days.map((day) => {
                  const date = new Date(
                    day.date.year,
                    day.date.month - 1,
                    day.date.day,
                  )
                  const dayName = date.toLocaleDateString(undefined, {
                    weekday: 'short',
                  })
                  const dayNum = day.date.day
                  const monthName = date.toLocaleDateString(undefined, {
                    month: 'short',
                  })
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6

                  return (
                    <div
                      key={day.date.toString()}
                      className={`flex-shrink-0 border-r border-neutral-800/50 flex flex-col items-center justify-end pb-2 ${
                        day.isToday
                          ? 'bg-neutral-800/30'
                          : isWeekend
                            ? 'bg-neutral-900/40'
                            : ''
                      }`}
                      style={{ width: `${DAY_WIDTH}px` }}
                    >
                      <span className="text-[10px] text-neutral-500 uppercase">
                        {dayName}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          day.isToday ? 'text-white' : 'text-neutral-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        {monthName}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Timeline rows */}
              <div className="relative">
                <TodayMarker days={calendar.days} dayWidth={DAY_WIDTH} />
                {sampleResources.map((resource) => (
                  <TimelineRow
                    key={resource.id}
                    events={eventsByResource.get(resource.id) ?? []}
                    days={calendar.days}
                    dayWidth={DAY_WIDTH}
                    colorMap={colorMap}
                    onEventClick={openEditModal}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {sampleEvents.map((event) => {
          const colorIdx = colorMap.get(event.id) ?? 0
          const color = EVENT_COLORS[colorIdx % EVENT_COLORS.length] ?? EVENT_COLORS[0]
          return (
            <div key={event.id} className="flex items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded-sm ${color.bg} ${color.border} border`}
              />
              <span className="text-xs text-neutral-400">{event.title}</span>
            </div>
          )
        })}
      </div>

      {calendar.isPending && (
        <div className="fixed top-5 right-5 px-5 py-3 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md text-sm font-medium">
          Loading...
        </div>
      )}

      <EventModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSave}
        onDelete={modalState.mode === 'edit' ? handleDelete : undefined}
        initialData={modalState.initialData}
        mode={modalState.mode}
      />
    </div>
  )
}

function App() {
  return (
    <>
      <TanStackDevtools plugins={[timeDevtoolsPlugin()]} />
      <TimelineView />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
