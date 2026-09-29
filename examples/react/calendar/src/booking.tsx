import { useState } from 'react'
import { between, compileSchedule, dates, merge, weekday } from '@tanstack/time'
import type {
  BookingApi,
  BookingSlot,
  Event,
  Resource,
  SlotRule,
  WorkingCalendar,
} from '@tanstack/time'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const BOOKING_CATEGORY_ID = 'booking'
const HOLD_MINUTES = 10

const closures = ['2026-12-24', '2026-12-25', '2027-01-01']

export const bookingCalendars: Array<WorkingCalendar> = [
  compileSchedule({
    id: 'tours-window',
    label: 'Room tours',
    on: [merge(weekday('monday', 'wednesday', 'friday'), between('09:00', '11:00'))],
    except: dates(closures),
  }),
  compileSchedule({
    id: 'workshops-window',
    label: 'Workshops',
    on: [merge(weekday('tuesday', 'thursday'), between('14:00', '17:00'))],
    except: dates(closures),
  }),
]

export const bookingSlotRules: Array<SlotRule> = [
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
  'room-tour':
    '30 min every 15 · Mon/Wed/Fri 09:00–11:00 · Room A · 10 min turnaround · 1h notice · concurrency is the room capacity',
  workshop: '90 min · Tue/Thu 14:00–17:00 · either room · 2 working-hours notice',
}

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
})

interface BookingPanelProps<TEvent extends Event<Resource>> {
  calendar: BookingApi<Resource, TEvent>
  days: Array<{ isoDate: string }>
  resources: Array<Resource>
}

export function BookingPanel<TEvent extends Event<Resource>>({
  calendar,
  days,
  resources,
}: BookingPanelProps<TEvent>) {
  const [ruleFilter, setRuleFilter] = useState<string | null>(null)
  const [attendee, setAttendee] = useState('')
  const [rejection, setRejection] = useState<string | null>(null)

  const first = days[0]?.isoDate
  const last = days[days.length - 1]?.isoDate
  if (!first || !last) return null

  const { slots, truncated, unbackedRanges } = calendar.getSlots({
    start: `${first}T00:00:00`,
    end: `${last}T23:59:59`,
    ruleIds: ruleFilter ? [ruleFilter] : undefined,
  })

  const byDay = new Map<string, Array<BookingSlot>>()
  for (const slot of slots) {
    const key = dayFormatter.format(slot.start)
    const bucket = byDay.get(key)
    if (bucket) bucket.push(slot)
    else byDay.set(key, [slot])
  }

  const write = (slot: BookingSlot, mode: 'book' | 'hold') => {
    const resourceId = slot.availableResourceIds[0]
    const payload = {
      id: `${mode}-${slot.ruleId}-${slot.start.getTime()}`,
      title: `${slot.ruleId === 'workshop' ? 'Workshop' : 'Room tour'}${attendee ? ` — ${attendee}` : ''}`,
      resourceId,
      categoryId: BOOKING_CATEGORY_ID,
    }

    const result =
      mode === 'book'
        ? calendar.book(slot, payload)
        : calendar.hold(slot, {
            ...payload,
            expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
          })

    setRejection(result.success ? null : (result.conflicts[0]?.message ?? 'Rejected on write.'))
  }

  return (
    <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-neutral-500">Booking</span>
        <span className="text-xs text-neutral-500">
          {slots.length} free slots in this period — booking writes an event straight into the grid
        </span>
        <span className="text-xs text-neutral-600">
          Set Room A capacity to 1 below, then book 09:00: the 10-minute turnaround takes 09:30 with
          it.
        </span>
        {ruleFilter && (
          <Button variant="ghost" size="sm" onClick={() => setRuleFilter(null)}>
            Clear filter
          </Button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {calendar.getSlotRules().map((rule) => (
          <button
            key={rule.id}
            type="button"
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

      {truncated && (
        <p className="mb-2 text-xs text-amber-400">
          Truncated at the slot cap — this list is a prefix, not the whole answer.
        </p>
      )}

      {unbackedRanges.length > 0 && (
        <p className="mb-2 text-xs text-rose-400">
          {unbackedRanges.length} range(s) had no events loaded, so those slots are optimistic —
          getSlots reports the range it needed rather than staying silent about it.
        </p>
      )}

      {rejection && <p className="mb-2 text-xs text-rose-400">{rejection}</p>}

      {slots.length === 0 ? (
        <p className="text-xs text-neutral-500">
          No free slots here. Every candidate was outside a rule&apos;s calendar, inside its notice
          period, past its horizon, or already taken.
        </p>
      ) : (
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
          {[...byDay.entries()].map(([day, daySlots]) => (
            <div key={day} className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-neutral-500">{day}</span>
              {daySlots.map((slot) => {
                const resource = resources.find((r) => r.id === slot.availableResourceIds[0])
                return (
                  <div
                    key={`${slot.ruleId}-${slot.start.getTime()}`}
                    className="flex items-center gap-1 rounded-md border border-neutral-800 bg-black px-2 py-1"
                  >
                    <button
                      type="button"
                      onClick={() => write(slot, 'book')}
                      className="text-sm text-neutral-200 hover:text-white"
                      title={`${slot.ruleId} · ${resource?.label ?? ''} · ${slot.remainingCapacity} left`}
                    >
                      {timeFormatter.format(slot.start)}
                    </button>
                    <span className="text-[10px] text-neutral-600">
                      {resource?.label?.replace('Room ', '') ?? ''}·{slot.remainingCapacity}
                    </span>
                    <button
                      type="button"
                      onClick={() => write(slot, 'hold')}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300"
                      title={`Hold for ${HOLD_MINUTES} minutes`}
                    >
                      hold
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-neutral-600">
        Advisory only — the client holds a partial dataset and cannot see other bookers. A server
        must re-run the same pure core inside its write transaction.
      </p>
    </div>
  )
}
