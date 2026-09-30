import { formatEventTimeRange, useCalendar } from '@tanstack/react-time'
import { calendarFeatures, dayEventLayoutFeature } from '@tanstack/time'
import ReactDOM from 'react-dom/client'
import type { Day, Event, Resource } from '@tanstack/time'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import './index.css'

const features = calendarFeatures([dayEventLayoutFeature])

interface DemoEvent extends Event<Resource> {
  categoryId: string
}

type BasicCalendar = ReturnType<typeof useCalendar<typeof features, Resource, DemoEvent>>

const eventCategories = [
  { id: 'work', eventClass: 'bg-blue-900/80 border-blue-700/60 hover:bg-blue-800/90' },
  { id: 'team', eventClass: 'bg-emerald-900/80 border-emerald-700/60 hover:bg-emerald-800/90' },
  { id: 'personal', eventClass: 'bg-purple-900/80 border-purple-700/60 hover:bg-purple-800/90' },
  { id: 'holiday', eventClass: 'bg-amber-800/80 border-amber-600/60 hover:bg-amber-700/90' },
]

const categoryById = new Map(eventCategories.map((category) => [category.id, category]))

const FALLBACK_EVENT_CLASS = 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'

function eventClassOf(event: DemoEvent): string {
  return categoryById.get(event.categoryId)?.eventClass ?? FALLBACK_EVENT_CLASS
}

function thisWeekAt(weekday: number, hour: number, minute = 0): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - date.getUTCDay() + weekday)
  date.setUTCHours(hour, minute, 0, 0)
  return date.toISOString().slice(0, 19)
}

const events: Array<DemoEvent> = [
  {
    id: '1',
    title: 'Team standup',
    start: thisWeekAt(1, 9),
    end: thisWeekAt(1, 9, 30),
    categoryId: 'team',
  },
  {
    id: '2',
    title: 'Design review',
    start: thisWeekAt(1, 11),
    end: thisWeekAt(1, 12, 30),
    categoryId: 'work',
  },
  {
    id: '3',
    title: 'Lunch with Sam',
    start: thisWeekAt(1, 12),
    end: thisWeekAt(1, 13),
    categoryId: 'personal',
  },
  {
    id: '4',
    title: 'Planning',
    start: thisWeekAt(3, 14),
    end: thisWeekAt(3, 16),
    categoryId: 'work',
  },
  {
    id: '5',
    title: 'Offsite',
    start: thisWeekAt(4, 0),
    end: thisWeekAt(5, 23, 59),
    allDay: true,
    categoryId: 'holiday',
  },
  { id: '6', title: 'Retro', start: thisWeekAt(5, 15), end: thisWeekAt(5, 16), categoryId: 'team' },
]

const viewModes = [
  { label: 'Month', unit: 'month' },
  { label: 'Week', unit: 'week' },
  { label: 'Day', unit: 'day' },
] as const

function CalendarView() {
  const calendar = useCalendar<typeof features, Resource, DemoEvent>({
    features,
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    locale: 'en-US',
    events,
  })

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

          <div className="ml-auto flex gap-2">
            {viewModes.map(({ label, unit }) => (
              <Button
                key={unit}
                onClick={() => calendar.changeViewMode({ value: 1, unit })}
                variant={calendar.viewMode.unit === unit ? 'secondary' : 'outline'}
                size="sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-lg font-medium text-neutral-400">{calendar.formatPeriodLabel()}</div>
      </div>

      {calendar.viewMode.unit === 'month' ? (
        <MonthView calendar={calendar} />
      ) : (
        <ScheduleView calendar={calendar} days={calendar.days} />
      )}
    </div>
  )
}

function MonthView({ calendar }: { calendar: BasicCalendar }) {
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
                {[...day.allDayEvents, ...day.events].map((event) => (
                  <Badge
                    key={event.id}
                    className={`text-white border w-full ${eventClassOf(event)}`}
                  >
                    <span className="truncate">{event.title}</span>
                  </Badge>
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

function ScheduleView({
  calendar,
  days,
}: {
  calendar: BasicCalendar
  days: Array<Day<Resource, DemoEvent>>
}) {
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
      <div className="flex">
        <div className="w-20 border-r border-neutral-800 bg-neutral-950">
          <div className="h-12 border-b border-neutral-800" />
          <div className="h-7 border-b border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-500 flex items-center">
            all-day
          </div>
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
                <div className="h-7 border-b border-neutral-800 bg-neutral-950/60 px-1 py-1 flex flex-col gap-1 overflow-hidden">
                  {day.allDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-white rounded px-2 text-[11px] font-medium border truncate ${eventClassOf(event)}`}
                      style={{ height: 20, lineHeight: '20px' }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
                <div className="relative h-360 bg-neutral-950/30">
                  {day.events.map((event) => {
                    const { style, start, end } = calendar.getEventProps(event)
                    return (
                      <div
                        key={event.id}
                        className={`absolute z-10 text-white rounded text-xs font-medium border overflow-hidden px-2 py-1 ${eventClassOf(event)}`}
                        style={style}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-90 truncate">
                          {formatEventTimeRange(start, end).rangeFormatted}
                        </div>
                      </div>
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

ReactDOM.createRoot(document.getElementById('root')!).render(<CalendarView />)
