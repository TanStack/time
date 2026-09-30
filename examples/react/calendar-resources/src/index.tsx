import { formatEventTimeRange, useCalendar } from '@tanstack/react-time'
import {
  between,
  calendarFeatures,
  compileSchedule,
  dayEventLayoutFeature,
  merge,
  resourceAvailabilityFeature,
  weekday,
  workingTimeFeature,
} from '@tanstack/time'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import type { Event, Resource, ResizeError, WorkingCalendar } from '@tanstack/time'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import './index.css'

const features = calendarFeatures([
  workingTimeFeature,
  resourceAvailabilityFeature,
  dayEventLayoutFeature,
])

type ResourcesCalendar = ReturnType<typeof useCalendar<typeof features, Resource, Event<Resource>>>

type ViewProps = { calendar: ResourcesCalendar; resources: Array<Resource> }

const workdays = weekday('monday', 'tuesday', 'wednesday', 'thursday', 'friday')

const workingCalendars: Array<WorkingCalendar> = [
  compileSchedule({ id: 'office-hours', on: [merge(workdays, between('09:00', '17:00'))] }),
  compileSchedule({
    id: 'late-shift',
    on: [merge(weekday('tuesday', 'thursday', 'saturday'), between('13:00', '21:00'))],
  }),
]

const initialResources: Array<Resource> = [
  { id: 'room-a', label: 'Room A', calendarId: 'office-hours', capacity: [2] },
  { id: 'room-b', label: 'Room B', calendarId: 'late-shift', capacity: [1] },
]

const resourceStyles: Record<string, { color: string; eventClass: string }> = {
  'room-a': { color: '#0049af75', eventClass: 'bg-blue-900/80 border-blue-700/60' },
  'room-b': { color: '#00af3475', eventClass: 'bg-emerald-900/80 border-emerald-700/60' },
}

function hatchOf(resourceId: string): string {
  const color = resourceStyles[resourceId].color
  return `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`
}

function resourceIdOf(event: Event<Resource>): string {
  const first = event.resources?.[0]
  return typeof first === 'string' ? first : (first?.id ?? '')
}

function addHours(isoDateTime: string, hours: number): string {
  const date = new Date(`${isoDateTime}Z`)
  date.setUTCHours(date.getUTCHours() + hours)
  return date.toISOString().slice(0, 19)
}

function thisWeekAt(weekday: number, hour: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - date.getUTCDay() + weekday)
  date.setUTCHours(hour, 0, 0, 0)
  return date.toISOString().slice(0, 19)
}

function atLeastOne(value: string): number {
  return Math.max(1, Number(value) || 1)
}

function booking(id: string, title: string, room: Resource, start: string, hours: number) {
  return { id, title, start, end: addHours(start, hours), resources: [room], consumption: [1] }
}

const events: Array<Event<Resource>> = [
  booking('1', 'Workshop', initialResources[0], thisWeekAt(1, 10), 2),
  booking('2', 'Interview', initialResources[0], thisWeekAt(1, 11), 1),
  booking('3', 'Evening class', initialResources[1], thisWeekAt(2, 18), 2),
]

const initialDraft = { resourceId: 'room-a', start: thisWeekAt(1, 11), hours: 1 }

function CalendarView() {
  const [resources, setResources] = useState(initialResources)
  const [bookingError, setBookingError] = useState<ResizeError | null>(null)
  const [draft, setDraft] = useState(initialDraft)

  const calendar = useCalendar<typeof features, Resource, Event<Resource>>({
    features,
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    locale: 'en-US',
    calendars: workingCalendars,
    resources,
    events,
  })

  const room = resources.find((resource) => resource.id === draft.resourceId)!
  const draftEvent = booking('draft', `Booking (${room.label})`, room, draft.start, draft.hours)
  const placement = calendar.validateEventPlacement(draftEvent)

  const book = async () => {
    const result = await calendar.addEvent({ ...draftEvent, id: `booking-${Date.now()}` })
    setBookingError(result.success ? null : result.error)
  }

  const patchDraft = (patch: Partial<typeof draft>) => setDraft({ ...draft, ...patch })

  const setCapacity = (resourceId: string, capacity: number) => {
    const next = resources.map((r) => (r.id === resourceId ? { ...r, capacity: [capacity] } : r))
    setResources(next)
    calendar.setResources(next)
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="m-0 mb-4 text-[28px] font-semibold text-white">TanStack Time</h1>

        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <Button onClick={calendar.goToPreviousPeriod} variant="outline">
            ← Previous
          </Button>
          <Button onClick={calendar.goToCurrentPeriod} variant="outline">
            Today
          </Button>
          <Button onClick={calendar.goToNextPeriod} variant="outline">
            Next →
          </Button>
        </div>

        <Panel title="Capacity Controls">
          {resources.map((resource) => (
            <Label
              key={resource.id}
              className="rounded-md border border-neutral-800 bg-black px-3 py-2 font-normal text-neutral-300"
            >
              {resource.label}
              <Input
                type="number"
                min={1}
                step={1}
                value={resource.capacity?.[0] ?? 1}
                onChange={(e) => setCapacity(resource.id, atLeastOne(e.target.value))}
                className="h-8 w-24"
              />
            </Label>
          ))}
        </Panel>

        <Panel title="Book a Room">
          {resources.map((resource) => (
            <Button
              key={resource.id}
              onClick={() => patchDraft({ resourceId: resource.id })}
              variant={draft.resourceId === resource.id ? 'secondary' : 'outline'}
            >
              {resource.label}
            </Button>
          ))}
          <Label>
            Start
            <Input
              type="datetime-local"
              step={3600}
              value={draft.start.slice(0, 16)}
              onChange={(e) => e.target.value && patchDraft({ start: `${e.target.value}:00` })}
              className="h-8 w-52"
            />
          </Label>
          <Label>
            Hours
            <Input
              type="number"
              min={1}
              max={8}
              value={draft.hours}
              onChange={(e) => patchDraft({ hours: atLeastOne(e.target.value) })}
              className="h-8 w-20"
            />
          </Label>
          <Button onClick={book}>Book</Button>
          <span className={`text-sm ${placement.blocked ? 'text-red-400' : 'text-emerald-400'}`}>
            {placement.blocked ? placement.message : 'Available'}
          </span>
        </Panel>

        <div className="text-lg font-medium text-neutral-400">{calendar.formatPeriodLabel()}</div>
      </div>

      <ScheduleView calendar={calendar} resources={resources} />

      {bookingError && (
        <BookingErrorToast error={bookingError} onDismiss={() => setBookingError(null)} />
      )}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">{title}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function ScheduleView({ calendar, resources }: ViewProps) {
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-3 flex gap-6 flex-wrap">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor: resourceStyles[resource.id].color,
                backgroundImage: hatchOf(resource.id),
              }}
            />
            <span className="text-sm text-neutral-300">{resource.label}</span>
            <span className="text-xs text-neutral-500">(Capacity: {resource.capacity})</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="w-20 border-r border-neutral-800 bg-neutral-950">
          <div className="h-12 border-b border-neutral-800" />
          {calendar.getTimeSlots().map((slot) => (
            <div
              key={slot.hour}
              className="h-15 border-b border-neutral-800/50 px-2 py-1 text-xs text-neutral-500"
            >
              {slot.label}
            </div>
          ))}
        </div>

        <div
          className="grid flex-1"
          style={{ gridTemplateColumns: `repeat(${calendar.days.length}, minmax(0, 1fr))` }}
        >
          {calendar.days.map((day) => {
            const dayParts = calendar.getDateParts(day.isoDate)
            return (
              <div key={day.isoDate} className="border-r border-neutral-800 last:border-r-0">
                <div className="h-12 border-b border-neutral-800 bg-neutral-950 px-3 py-1 text-center">
                  <div
                    className={`text-sm font-semibold ${day.isToday ? 'text-white' : 'text-neutral-400'}`}
                  >
                    {dayParts.weekdayShort} - {dayParts.dayOfMonth} {dayParts.monthShort}
                  </div>
                </div>
                <div className="relative h-360 bg-neutral-950/30">
                  <UnavailableRanges calendar={calendar} resources={resources} day={day.isoDate} />
                  {day.events.map((event) => (
                    <EventBlock key={event.id} calendar={calendar} event={event} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function UnavailableRanges({ calendar, resources, day }: ViewProps & { day: string }) {
  return resources.map((resource) =>
    calendar
      .getUnavailableRanges(day, { resourceIds: [resource.id] })
      .map((range, index) => (
        <div
          key={`${resource.id}-${index}`}
          className="absolute left-0 right-0 pointer-events-none z-0 bg-size-[10px_10px] bg-fixed"
          style={{ top: range.top, height: range.height, backgroundImage: hatchOf(resource.id) }}
          title={`Unavailable - ${resource.label}`}
        />
      )),
  )
}

function EventBlock({ calendar, event }: { calendar: ResourcesCalendar; event: Event<Resource> }) {
  const { style, start, end } = calendar.getEventProps(event)
  return (
    <div
      className={`absolute z-10 text-white rounded text-xs font-medium border overflow-hidden px-2 py-1 ${resourceStyles[resourceIdOf(event)].eventClass}`}
      style={style}
    >
      <div className="font-semibold flex items-center gap-1.5 leading-tight">
        <span className="truncate">{event.title}</span>
        <span
          className="text-[10px] leading-none rounded bg-black/40 px-1 py-0.5 font-semibold shrink-0"
          title="Consumption"
        >
          {event.consumption?.reduce((a, b) => a + b, 0)}
        </span>
      </div>
      <div className="text-xs opacity-90 truncate">
        {formatEventTimeRange(start, end).rangeFormatted}
      </div>
    </div>
  )
}

function BookingErrorToast({ error, onDismiss }: { error: ResizeError; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="bg-red-950/90 border border-red-700/50 text-red-200 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-lg">⚠</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-red-100 mb-1">Cannot Book Room</div>
            <div className="text-sm text-red-200/80 mb-2">{error.message}</div>
            <div className="text-xs text-red-300/60 mt-2">{error.eventTitle}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-destructive-foreground/60 hover:text-destructive-foreground h-6 w-6"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<CalendarView />)
