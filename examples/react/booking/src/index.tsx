import { useState } from 'react'
import { formatEventTimeRange, useCalendar } from '@tanstack/react-time'
import {
  between,
  bookingFeature,
  calendarFeatures,
  compileSchedule,
  dates,
  dayEventLayoutFeature,
  merge,
  resourceAvailabilityFeature,
  weekday,
  workingTimeFeature,
} from '@tanstack/time'
import ReactDOM from 'react-dom/client'
import type { BookingSlot, Event, Resource, SlotRule } from '@tanstack/time'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import './index.css'

const features = calendarFeatures([
  workingTimeFeature,
  resourceAvailabilityFeature,
  bookingFeature,
  dayEventLayoutFeature,
])

interface DemoEvent extends Event<Resource> {
  categoryId?: string
  expiresAt?: string | Date
}

const HOLD_MINUTES = 10

const eventCategories = [
  { id: 'booking', eventClass: 'bg-rose-900/80 border-rose-700/60 hover:bg-rose-800/90' },
]

const FALLBACK_EVENT_CLASS = 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'

function eventClassOf(event: DemoEvent): string {
  const category = eventCategories.find(({ id }) => id === (event.categoryId ?? 'booking'))
  return `${category?.eventClass ?? FALLBACK_EVENT_CLASS} ${event.expiresAt ? 'border-dashed opacity-70' : ''}`
}

const closedFriday = new Date(Date.now() + (5 - new Date().getUTCDay()) * 86_400_000)
  .toISOString()
  .slice(0, 10)

const hours = (days: Array<number>, from: string, to: string) =>
  merge(weekday(...days), between(from, to))

const calendars = [
  compileSchedule({ id: 'building-hours', on: [hours([1, 2, 3, 4, 5], '08:00', '18:00')] }),
  compileSchedule({
    id: 'tours-window',
    on: [hours([1, 3, 5], '09:00', '11:00')],
    except: dates([closedFriday]),
  }),
  compileSchedule({ id: 'workshops-window', on: [hours([2, 4], '14:00', '17:00')] }),
]

const resources: Array<Resource> = [
  { id: 'room-a', label: 'Room A', calendarId: 'building-hours', capacity: [1] },
  { id: 'room-b', label: 'Room B', calendarId: 'building-hours', capacity: [1] },
]

const slotRules: Array<SlotRule> = [
  {
    id: 'room-tour',
    calendarId: 'tours-window',
    duration: 30,
    step: 15,
    bufferAfter: 10,
    resourceIds: ['room-a'],
    minNotice: 60,
    maxHorizon: 60,
  },
  {
    id: 'workshop',
    calendarId: 'workshops-window',
    duration: 90,
    resourceIds: ['room-a', 'room-b'],
    minNotice: 120,
    minNoticeIsWorkingTime: true,
    maxHorizon: 90,
  },
]

const ruleBlurbs: Record<string, string> = {
  'room-tour': `30 min every 15 · Mon/Wed/Fri 09:00–11:00 · Room A · 10 min turnaround · closed ${closedFriday}`,
  workshop: '90 min · Tue/Thu 14:00–17:00 · either room · 2 working-hours notice',
}

function BookingView() {
  const calendar = useCalendar<typeof features, Resource, DemoEvent>({
    features,
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    locale: 'en-US',
    calendars,
    resources,
    slotRules,
    events: [],
  })
  const [ruleFilter, setRuleFilter] = useState<string | null>(null)
  const [attendee, setAttendee] = useState('')
  const [rejection, setRejection] = useState<string | null>(null)

  const days = calendar.days
  const { slots, truncated, unbackedRanges } = calendar.getSlots({
    start: `${days[0].isoDate}T00:00:00`,
    end: `${days[days.length - 1].isoDate}T23:59:59`,
    ruleIds: ruleFilter ? [ruleFilter] : undefined,
  })

  const byDay = new Map<string, Array<BookingSlot>>()
  for (const slot of slots) {
    const key = slot.start.toUTCString().slice(0, 11)
    byDay.set(key, [...(byDay.get(key) ?? []), slot])
  }

  const write = (slot: BookingSlot, mode: 'book' | 'hold') => {
    const payload = {
      id: `${mode}-${slot.ruleId}-${slot.start.getTime()}`,
      title: `${slot.ruleId === 'workshop' ? 'Workshop' : 'Room tour'}${attendee ? ` — ${attendee}` : ''}`,
      resourceId: slot.availableResourceIds[0],
    }
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000)
    const result =
      mode === 'book'
        ? calendar.book(slot, payload)
        : calendar.hold(slot, { ...payload, expiresAt })
    setRejection(result.success ? null : (result.conflicts[0]?.message ?? 'Rejected on write.'))
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
        <div className="text-lg font-medium text-neutral-400">{calendar.formatPeriodLabel()}</div>
      </div>

      <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Booking</span>
          <span className="text-xs text-neutral-500">
            {slots.length} free slots — booking writes an event straight into the grid
          </span>
          <span className="text-xs text-neutral-600">
            Book 09:00 and the turnaround takes 09:15 and 09:30. Click an event to cancel.
          </span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {calendar.getSlotRules().map((rule) => (
            <button
              key={rule.id}
              aria-pressed={ruleFilter === rule.id}
              onClick={() => setRuleFilter(ruleFilter === rule.id ? null : rule.id)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                ruleFilter === rule.id || ruleFilter === null
                  ? 'border-neutral-700 bg-black text-neutral-200'
                  : 'border-neutral-900 bg-neutral-950 text-neutral-600'
              }`}
            >
              <div className="font-medium">{rule.id}</div>
              <div className="text-xs text-neutral-500">{ruleBlurbs[rule.id]}</div>
            </button>
          ))}
          <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-black px-3 py-2">
            <span className="text-xs text-neutral-500">Attendee</span>
            <Input
              value={attendee}
              onChange={(event) => setAttendee(event.target.value)}
              placeholder="optional"
              className="h-8 w-32"
            />
          </div>
        </div>

        {truncated && <p className="mb-2 text-xs text-amber-400">Truncated at the slot cap.</p>}
        {unbackedRanges.length > 0 && (
          <p className="mb-2 text-xs text-rose-400">{unbackedRanges.length} unbacked range(s).</p>
        )}
        {rejection && <p className="mb-2 text-xs text-rose-400">{rejection}</p>}

        {slots.length === 0 ? (
          <p className="text-xs text-neutral-500">
            No free slots: outside the rule calendars, inside notice, past horizon, or taken.
          </p>
        ) : (
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
            {[...byDay.entries()].map(([day, daySlots]) => (
              <div key={day} className="flex flex-wrap items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-neutral-500">{day}</span>
                {daySlots.map((slot) => (
                  <div
                    key={`${slot.ruleId}-${slot.start.getTime()}`}
                    className="flex items-center gap-1 rounded-md border border-neutral-800 bg-black px-2 py-1"
                  >
                    <button
                      onClick={() => write(slot, 'book')}
                      className="text-sm text-neutral-200 hover:text-white"
                      title={`${slot.ruleId} · ${slot.remainingCapacity} left`}
                    >
                      {slot.start.toISOString().slice(11, 16)}
                    </button>
                    <span className="text-[10px] text-neutral-600">
                      {`${slot.availableResourceIds[0]?.slice(-1).toUpperCase()}·${slot.remainingCapacity}`}
                    </span>
                    <button
                      onClick={() => write(slot, 'hold')}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300"
                      title={`Hold for ${HOLD_MINUTES} minutes`}
                    >
                      hold
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 text-[11px] text-neutral-600">
          Advisory only — a server must re-run the same core inside its write transaction.
        </p>
      </div>

      <div className="flex border border-neutral-800 rounded-lg overflow-hidden bg-black">
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
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        >
          {days.map((day) => {
            const { weekdayShort, dayOfMonth, monthShort } = calendar.getDateParts(day.isoDate)
            return (
              <div key={day.isoDate} className="border-r border-neutral-800 last:border-r-0">
                <div
                  className={`h-12 border-b border-neutral-800 bg-neutral-950 px-3 py-1 text-center text-sm font-semibold ${day.isToday ? 'text-white' : 'text-neutral-400'}`}
                >
                  {weekdayShort} - {dayOfMonth} {monthShort}
                </div>
                <div className="relative h-360 bg-neutral-950/30">
                  {day.events.map((event) => {
                    const { style, start, end } = calendar.getEventProps(event)
                    return (
                      <button
                        key={event.id}
                        title="Click to cancel"
                        onClick={() => calendar.removeEvent(event.id)}
                        className={`absolute z-10 text-left text-white rounded text-xs font-medium border overflow-hidden px-2 py-1 ${eventClassOf(event)}`}
                        style={style}
                      >
                        <div className="font-semibold truncate">
                          {event.expiresAt ? `Held · ${event.title}` : event.title}
                        </div>
                        <div className="opacity-90 truncate">
                          {formatEventTimeRange(start, end).rangeFormatted}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<BookingView />)
