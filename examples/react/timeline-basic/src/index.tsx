import { useCalendar } from '@tanstack/react-time'
import {
  calendarFeatures,
  getDateParts,
  timelineFeature,
  toPlainDateString,
  toPlainTimeString,
} from '@tanstack/time'
import ReactDOM from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import type { Day, Event, Resource, TimelineResourceRow } from '@tanstack/time'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import './index.css'

const features = calendarFeatures([timelineFeature])

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

const EVENT_GAP_PX = 3
const ROW_HEIGHT_PX = 56
const MIN_DAY_WIDTH_PX = 240
const HOUR_LABEL_STEP = 6

function getEventColor(eventId: string) {
  const hash = String(eventId)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return EVENT_COLORS[hash % EVENT_COLORS.length] ?? EVENT_COLORS[0]
}

const sampleResources: Array<Resource> = [
  { id: 'design', label: 'Design' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend', capacity: [2, 3, 5] },
  { id: 'qa', label: 'QA' },
  { id: 'devops', label: 'DevOps' },
]

function weekdayAt(weekday: number, hour: number, minute = 0): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - date.getUTCDay() + weekday)
  date.setUTCHours(hour, minute, 0, 0)
  return date.toISOString().slice(0, 19)
}

function task(id: string, title: string, resourceId: string, start: string, end: string): Event {
  return { id, title, start, end, resources: [resourceId] }
}

const sampleEvents: Array<Event> = [
  task('1', 'UI Mockups', 'design', weekdayAt(1, 10), weekdayAt(1, 18)),
  task('2', 'Component Library', 'frontend', weekdayAt(2, 9), weekdayAt(3, 17)),
  task('3', 'API Development', 'backend', weekdayAt(2, 11), weekdayAt(4, 18)),
  task('4', 'Database Schema', 'backend', weekdayAt(1, 11), weekdayAt(2, 16)),
  task('5', 'Integration Tests', 'qa', weekdayAt(4, 10), weekdayAt(5, 15)),
  task('6', 'CI/CD Pipeline', 'devops', weekdayAt(0, 8), weekdayAt(1, 14)),
  task('7', 'Design Review', 'design', weekdayAt(3, 10), weekdayAt(3, 16)),
  task('8', 'Deployment', 'devops', weekdayAt(5, 7), weekdayAt(6, 13)),
]

const viewModeOptions = [
  { label: 'Week', value: 1, unit: 'week' as const },
  { label: '2 Weeks', value: 2, unit: 'week' as const },
]

function TimelineDemo() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    const element = scrollContainerRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setViewportWidth(element.clientWidth))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const calendar = useCalendar({
    features,
    viewMode: { value: 1, unit: 'week' },
    events: sampleEvents,
    resources: sampleResources,
    timeZone: 'UTC',
  })

  const timelineLayout = calendar.getTimelineLayout()
  const dayWidthPx = Math.max(MIN_DAY_WIDTH_PX, viewportWidth / Math.max(1, calendar.days.length))
  const totalContentWidthPx = calendar.days.length * dayWidthPx

  return (
    <div className="p-5 max-w-[1400px] mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="m-0 mb-4 text-[28px] font-semibold text-white">TanStack Time — Timeline</h1>

        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <Button variant="outline" onClick={calendar.goToPreviousPeriod}>
            ← Previous
          </Button>
          <Button variant="outline" onClick={calendar.goToCurrentPeriod}>
            Today
          </Button>
          <Button variant="outline" onClick={calendar.goToNextPeriod}>
            Next →
          </Button>

          <div className="ml-auto flex gap-2">
            {viewModeOptions.map((option) => (
              <Button
                key={option.label}
                variant={calendar.viewMode.value === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => calendar.changeViewMode({ value: option.value, unit: option.unit })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-lg font-medium text-neutral-400">{calendar.formatPeriodLabel()}</div>
      </div>

      <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
        <div className="flex">
          <div className="w-36 shrink-0 border-r border-neutral-800 bg-neutral-950 z-10">
            <div className="h-10 border-b border-neutral-800/50" />
            <div className="h-8 border-b border-neutral-800 px-3 flex items-end pb-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Resources
              </span>
            </div>
            {sampleResources.map((resource) => (
              <div
                key={resource.id}
                className="h-14 border-b border-neutral-800/50 px-3 flex items-center gap-2"
              >
                <span className="text-sm font-medium text-neutral-300 truncate">
                  {resource.label}
                </span>
                {resource.capacity && resource.capacity.length > 0 && (
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5">
                    cap {resource.capacity.reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <ScrollArea viewportRef={scrollContainerRef} className="flex-1 min-w-0">
            <div style={{ width: totalContentWidthPx, position: 'relative' }}>
              <DayHeader days={calendar.days} dayWidthPx={dayWidthPx} />
              <div
                className="relative"
                style={{ height: timelineLayout.rows.length * ROW_HEIGHT_PX }}
              >
                {timelineLayout.currentTimePosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                    style={{ left: `${timelineLayout.currentTimePosition}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </div>
                )}
                {timelineLayout.rows.map((row) => (
                  <HorizontalTimelineRow key={row.resource.id} row={row} days={calendar.days} />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

function DayHeader({ days, dayWidthPx }: { days: Array<Day>; dayWidthPx: number }) {
  return (
    <div className="sticky top-0 z-30 bg-neutral-950">
      <div className="h-10 border-b border-neutral-800/50 flex">
        {days.map((day) => {
          const dayParts = getDateParts(day.isoDate, { timeZone: 'UTC' })
          return (
            <div
              key={day.isoDate}
              className={`shrink-0 border-r border-neutral-800/50 flex items-center justify-center gap-1.5 ${
                day.isToday ? 'bg-neutral-800/30' : ''
              }`}
              style={{ width: dayWidthPx }}
            >
              <span className="text-[10px] text-neutral-500 uppercase">
                {dayParts.weekdayShort}
              </span>
              <span
                className={`text-sm font-semibold ${day.isToday ? 'text-white' : 'text-neutral-300'}`}
              >
                {dayParts.day}
              </span>
              <span className="text-[10px] text-neutral-600">{dayParts.monthShort}</span>
            </div>
          )
        })}
      </div>
      <div className="h-8 border-b border-neutral-800 flex">
        {days.map((day) => (
          <div
            key={day.isoDate}
            className="shrink-0 relative border-r border-neutral-800/50"
            style={{ width: dayWidthPx }}
          >
            {Array.from({ length: 24 / HOUR_LABEL_STEP }, (_, index) => (
              <span
                key={index}
                className="absolute bottom-1 text-[9px] text-neutral-600"
                style={{ left: `calc(${(index * HOUR_LABEL_STEP * 100) / 24}% + 4px)` }}
              >
                {(index * HOUR_LABEL_STEP).toString().padStart(2, '0')}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizontalTimelineRow({ row, days }: { row: TimelineResourceRow; days: Array<Day> }) {
  const dayPercentage = 100 / days.length
  const laneHeightPct = 100 / Math.max(1, row.laneCount)

  return (
    <div className="relative border-b border-neutral-800/50" style={{ height: ROW_HEIGHT_PX }}>
      {days.map((day, index) => (
        <div
          key={day.isoDate}
          className={`absolute top-0 bottom-0 border-r border-neutral-800/30 ${day.isToday ? 'bg-neutral-800/20' : ''}`}
          style={{ left: `${index * dayPercentage}%`, width: `${dayPercentage}%` }}
        />
      ))}
      {row.events.map(({ event, left, width, lane, isStartClipped, isEndClipped }) => {
        const color = getEventColor(event.id)
        return (
          <div
            key={event.id}
            className={`absolute border ${color.bg} ${color.border} ${color.text} flex items-center px-2.5 text-xs font-medium overflow-hidden shadow-xs z-10 ${
              !isStartClipped && !isEndClipped
                ? 'rounded-md'
                : !isStartClipped
                  ? 'rounded-l-md'
                  : !isEndClipped
                    ? 'rounded-r-md'
                    : ''
            }`}
            style={{
              left: `${left}%`,
              width: `${width}%`,
              top: `calc(${lane * laneHeightPct}% + ${EVENT_GAP_PX}px)`,
              height: `calc(${laneHeightPct}% - ${EVENT_GAP_PX * 2}px)`,
            }}
            title={`${event.title} (${toPlainDateString(event.start)}T${toPlainTimeString(event.start)} → ${toPlainDateString(event.end)}T${toPlainTimeString(event.end)})`}
          >
            <span className="truncate">{event.title}</span>
          </div>
        )
      })}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TimelineDemo />)
