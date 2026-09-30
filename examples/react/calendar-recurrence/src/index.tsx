import { useCalendar } from '@tanstack/react-time'
import { calendarFeatures, eventRecurrenceFeature, toPlainDateTimeString } from '@tanstack/time'
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import type { Event, RecurrenceEditScope, Resource } from '@tanstack/time'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import './index.css'

const features = calendarFeatures([eventRecurrenceFeature])

interface DemoEvent extends Event<Resource> {
  categoryId: string
}

interface Editing {
  event: DemoEvent
  scope: RecurrenceEditScope | null
}

type RecurrenceCalendar = ReturnType<typeof useCalendar<typeof features, Resource, DemoEvent>>

const eventCategories = [
  { id: 'work', eventClass: 'bg-blue-900/80 border-blue-700/60 hover:bg-blue-800/90' },
  { id: 'team', eventClass: 'bg-emerald-900/80 border-emerald-700/60 hover:bg-emerald-800/90' },
  { id: 'personal', eventClass: 'bg-purple-900/80 border-purple-700/60 hover:bg-purple-800/90' },
]

const FALLBACK_EVENT_CLASS = 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'

const categoryById = new Map(eventCategories.map((category) => [category.id, category]))

function eventClassOf(event: DemoEvent): string {
  return categoryById.get(event.categoryId)?.eventClass ?? FALLBACK_EVENT_CLASS
}

function weekdayAt(weeksFromNow: number, weekday: number, hour: number, minute = 0): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - date.getUTCDay() + weeksFromNow * 7 + weekday)
  date.setUTCHours(hour, minute, 0, 0)
  return date.toISOString().slice(0, 19)
}

function shiftHours(isoDateTime: string, hours: number): string {
  const date = new Date(`${isoDateTime}Z`)
  date.setUTCHours(date.getUTCHours() + hours)
  return date.toISOString().slice(0, 19)
}

const events: Array<DemoEvent> = [
  {
    id: 'standup',
    title: 'Standup',
    start: weekdayAt(-3, 1, 9),
    end: weekdayAt(-3, 1, 9, 15),
    categoryId: 'team',
    recurrence: {
      frequency: 'weekly',
      byWeekday: [1, 2, 3, 4, 5],
      exDates: [weekdayAt(0, 3, 9)],
      overrides: [
        {
          originalStart: weekdayAt(0, 2, 9),
          start: weekdayAt(0, 2, 11),
          end: weekdayAt(0, 2, 11, 15),
          title: 'Standup (moved)',
        },
      ],
    },
  },
  {
    id: 'one-on-one',
    title: '1:1',
    start: weekdayAt(-3, 4, 14),
    end: weekdayAt(-3, 4, 14, 30),
    categoryId: 'personal',
    recurrence: { frequency: 'weekly', interval: 2, count: 6 },
  },
  {
    id: 'report',
    title: 'Monthly report',
    start: weekdayAt(-3, 5, 16),
    end: weekdayAt(-3, 5, 17),
    categoryId: 'work',
    recurrence: { frequency: 'monthly' },
  },
]

const scopes: Array<{ scope: RecurrenceEditScope; label: string; menuLabel: string }> = [
  { scope: 'this', label: 'This occurrence', menuLabel: 'Edit this occurrence' },
  { scope: 'thisAndFollowing', label: 'This and following', menuLabel: 'Edit this and following' },
  { scope: 'all', label: 'All events', menuLabel: 'Edit series' },
]

function CalendarView() {
  const calendar = useCalendar<typeof features, Resource, DemoEvent>({
    features,
    viewMode: { value: 1, unit: 'month' },
    timeZone: 'UTC',
    locale: 'en-US',
    events,
  })
  const [editing, setEditing] = useState<Editing | null>(null)

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

      <MonthView calendar={calendar} onEdit={(event, scope) => setEditing({ event, scope })} />

      {editing?.scope === null && (
        <ScopeChoiceModal
          event={editing.event}
          onSelect={(scope) => setEditing({ event: editing.event, scope })}
          onClose={() => setEditing(null)}
        />
      )}

      {editing?.scope && (
        <EditDialog
          calendar={calendar}
          event={editing.event}
          scope={editing.scope}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function MonthView({
  calendar,
  onEdit,
}: {
  calendar: RecurrenceCalendar
  onEdit: (event: DemoEvent, scope: RecurrenceEditScope | null) => void
}) {
  const dayNames = calendar.getDaysNames('short')
  const weeks = calendar.groupDaysBy({ days: calendar.days, unit: 'week', fillMissingDays: true })
  const columns = { gridTemplateColumns: `repeat(${dayNames.length}, minmax(0, 1fr))` }

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
      <div className="grid border-b border-neutral-800 bg-neutral-950" style={columns}>
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="py-3 text-center font-semibold text-sm text-neutral-500 border-r border-neutral-800 last:border-r-0"
          >
            {dayName}
          </div>
        ))}
      </div>
      <div className="grid" style={columns}>
        {weeks.flat().map((day, index) =>
          day ? (
            <div
              key={day.isoDate}
              className={`min-h-[120px] p-2 flex flex-col border-r border-b border-neutral-800 ${
                day.isToday
                  ? 'bg-neutral-900'
                  : day.isInCurrentPeriod
                    ? 'bg-black'
                    : 'bg-neutral-950/50'
              }`}
            >
              <div
                className={`text-sm mb-1 ${
                  day.isToday
                    ? 'font-bold text-white'
                    : day.isInCurrentPeriod
                      ? 'font-medium text-neutral-200'
                      : 'font-medium text-neutral-500'
                }`}
              >
                {day.dayOfMonth}
              </div>
              <div className="flex flex-col gap-1">
                {day.events.map((event) => (
                  <ContextMenu key={`${event.id}-${toPlainDateTimeString(event.start)}`}>
                    <ContextMenuTrigger className="contents">
                      <Badge
                        className={`cursor-pointer text-white border w-full ${eventClassOf(event)}`}
                        title={event.title}
                        onClick={() => onEdit(event, null)}
                      >
                        <span className="flex items-center gap-1 min-w-0">
                          <span className="opacity-60 shrink-0" title="Recurring event">
                            ↻
                          </span>
                          <span className="truncate">
                            {toPlainDateTimeString(event.start).slice(11, 16)} {event.title}
                          </span>
                        </span>
                      </Badge>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {scopes.map(({ scope, menuLabel }) => (
                        <ContextMenuItem key={scope} onClick={() => onEdit(event, scope)}>
                          {menuLabel}
                        </ContextMenuItem>
                      ))}
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => calendar.goToPreviousOccurrence(event.id, event.start)}
                      >
                        ← Previous occurrence
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => calendar.goToNextOccurrence(event.id, event.start)}
                      >
                        Next occurrence →
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </div>
          ) : (
            <div
              key={`empty-${index}`}
              className="min-h-[120px] bg-neutral-950/50 border-r border-b border-neutral-800"
            />
          ),
        )}
      </div>
    </div>
  )
}

function ScopeChoiceModal({
  event,
  onSelect,
  onClose,
}: {
  event: DemoEvent
  onSelect: (scope: RecurrenceEditScope) => void
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit recurring event</DialogTitle>
        </DialogHeader>
        <div className="mt-2 text-sm text-neutral-400">{event.title}</div>
        <div className="space-y-2 mt-4">
          {scopes.map(({ scope, label }) => (
            <Button
              key={scope}
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelect(scope)}
            >
              {label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({
  calendar,
  event,
  scope,
  onClose,
}: {
  calendar: RecurrenceCalendar
  event: DemoEvent
  scope: RecurrenceEditScope
  onClose: () => void
}) {
  const [title, setTitle] = useState(event.title)
  const start = toPlainDateTimeString(event.start)
  const end = toPlainDateTimeString(event.end)
  const target = { scope, occurrenceStart: event._occurrenceOriginalStart ?? event.start }

  const apply = (updates: Partial<Omit<DemoEvent, 'id'>>) => {
    void calendar.editRecurringEvent(event.id, updates, target)
    onClose()
  }

  const remove = () => {
    calendar.removeRecurringEvent(event.id, target)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle>{scopes.find((option) => option.scope === scope)?.label}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-neutral-400">{start.replace('T', ' ')}</div>
        <div className="flex gap-2">
          <Input aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button onClick={() => apply({ title })}>Save</Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => apply({ start: shiftHours(start, 1), end: shiftHours(end, 1) })}
          >
            Move 1h later
          </Button>
          <Button variant="destructive" className="ml-auto" onClick={remove}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<CalendarView />)
