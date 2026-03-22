import {
  calculateTimelineResizePreview,
  useCalendar,
} from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'
import {
  toPlainDateString,
  toPlainDateTimeString,
  toPlainTimeString,
} from '@tanstack/time'
import type {
  Day,
  Event,
  ResizeError,
  Resource,
  TimelineResourceRow,
} from '@tanstack/time'

import './index.css'

const EVENT_COLORS = [
  {
    bg: 'bg-indigo-500/80',
    border: 'border-indigo-400',
    text: 'text-indigo-50',
  },
  {
    bg: 'bg-emerald-500/80',
    border: 'border-emerald-400',
    text: 'text-emerald-50',
  },
  { bg: 'bg-amber-500/80', border: 'border-amber-400', text: 'text-amber-50' },
  { bg: 'bg-rose-500/80', border: 'border-rose-400', text: 'text-rose-50' },
  { bg: 'bg-cyan-500/80', border: 'border-cyan-400', text: 'text-cyan-50' },
  {
    bg: 'bg-violet-500/80',
    border: 'border-violet-400',
    text: 'text-violet-50',
  },
  {
    bg: 'bg-orange-500/80',
    border: 'border-orange-400',
    text: 'text-orange-50',
  },
  { bg: 'bg-teal-500/80', border: 'border-teal-400', text: 'text-teal-50' },
]

const RESOURCE_ZONE_COLORS = [
  '#6366f155',
  '#10b98155',
  '#f59e0b55',
  '#f43f5e55',
  '#06b6d455',
]

const resourceDesign: Resource = {
  id: 'design',
  label: 'Design',
  availability: [
    { weekdays: [1, 2, 3, 4], startTime: '09:00', endTime: '17:00' },
    { weekdays: [5], startTime: '09:00', endTime: '13:00' },
  ],
}
const resourceFrontend: Resource = {
  id: 'frontend',
  label: 'Frontend',
  availability: [
    { weekdays: [1, 2, 3, 4], startTime: '08:00', endTime: '24:00' },
    { weekdays: [5], startTime: '08:00', endTime: '24:00' },
  ],
}
const resourceBackend: Resource = {
  id: 'backend',
  label: 'Backend',
  availability: [
    { weekdays: [1, 2, 3], startTime: '10:00', endTime: '19:00' },
    { weekdays: [4, 5], startTime: '00:00', endTime: '24:00' },
  ],
}
const resourceQA: Resource = {
  id: 'qa',
  label: 'QA',
  availability: [
    { weekdays: [1, 2, 3], startTime: '09:00', endTime: '17:00' },
    { weekdays: [4, 5], startTime: '10:00', endTime: '15:00' },
  ],
}
const resourceDevOps: Resource = {
  id: 'devops',
  label: 'DevOps',
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: '07:00', endTime: '16:00' },
    { weekdays: [6, 7], startTime: '10:00', endTime: '14:00' },
  ],
}

const sampleResources: Array<Resource> = [
  resourceDesign,
  resourceFrontend,
  resourceBackend,
  resourceQA,
  resourceDevOps,
]

// Monday of the visible work week: Mon–Fri use the ISO week that contains today;
// Sat–Sun use the upcoming Monday so sample data is not entirely in the past.
function workWeekMonday(): Date {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)

  if (day === 0 || day === 6) {
    monday.setDate(today.getDate() + (day === 0 ? 1 : 2))
  } else {
    monday.setDate(today.getDate() + (1 - day))
  }
  monday.setHours(0, 0, 0, 0)
  return monday
}

// isoWeekday: 1=Mon … 5=Fri (relative to workWeekMonday()).
function weekdayAt(
  isoWeekday: 1 | 2 | 3 | 4 | 5,
  hour: number,
  minute = 0,
): Date {
  const monday = workWeekMonday()
  const date = new Date(monday)
  date.setDate(monday.getDate() + isoWeekday - 1)
  date.setHours(hour, minute, 0, 0)
  return date
}

/*
  Sample times are chosen so every event stays inside availability on that weekday,
  and (where it matters) inside the intersection across weekdays:
  - Design: Mon–Thu 09–17, Fri 09–13 → use only 09:00–13:00 so any Mon–Fri slot is safe.
  - Frontend: Mon–Fri 08–24.
  - Backend: Mon–Wed 10–19, Thu–Fri 00–24 → single-day uses 10–19; Thu→Fri span uses full-day Thu/Fri.
  - QA: Mon–Wed 09–17, Thu–Fri 10–15 → use 10:00–15:00 everywhere.
  - DevOps: Mon–Fri 07–16.
*/
function getSampleEvents(): Array<Event<Resource>> {
  return [
    {
      id: '1',
      title: 'UI Mockups',
      start: weekdayAt(1, 10, 0),
      end: weekdayAt(1, 12, 30),
      resources: [resourceDesign],
    },
    {
      id: '2',
      title: 'Component Library',
      start: weekdayAt(2, 9, 0),
      end: weekdayAt(2, 17, 0),
      resources: [resourceFrontend],
    },
    {
      id: '3',
      title: 'API Development',
      start: weekdayAt(2, 11, 0),
      end: weekdayAt(2, 18, 0),
      resources: [resourceBackend],
    },
    {
      id: '4',
      title: 'Database Schema',
      start: weekdayAt(1, 11, 0),
      end: weekdayAt(1, 16, 0),
      resources: [resourceBackend],
    },
    {
      id: '5',
      title: 'Integration Tests',
      start: weekdayAt(3, 10, 0),
      end: weekdayAt(3, 15, 0),
      resources: [resourceQA],
    },
    {
      id: '6',
      title: 'CI/CD Pipeline',
      start: weekdayAt(1, 8, 0),
      end: weekdayAt(1, 14, 0),
      resources: [resourceDevOps],
    },
    {
      id: '7',
      title: 'Design Review',
      start: weekdayAt(3, 10, 0),
      end: weekdayAt(3, 12, 30),
      resources: [resourceDesign],
    },
    {
      id: '8',
      title: 'Auth Module',
      start: weekdayAt(4, 0, 0),
      end: weekdayAt(5, 10, 0),
      resources: [resourceBackend],
    },
    {
      id: '9',
      title: 'Load Testing',
      start: weekdayAt(4, 10, 30),
      end: weekdayAt(4, 14, 30),
      resources: [resourceQA],
    },
    {
      id: '10',
      title: 'Deployment',
      start: weekdayAt(5, 7, 30),
      end: weekdayAt(5, 13, 0),
      resources: [resourceDevOps],
    },
  ]
}

const sampleEvents = getSampleEvents()

interface EventFormData {
  title: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  resourceId: string
}

const emptyFormData: EventFormData = {
  title: '',
  startDate: toPlainDateString(new Date()),
  startTime: '09:00',
  endDate: toPlainDateString(new Date()),
  endTime: '10:00',
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
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
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
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
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

interface HorizontalResizeHandleProps {
  edge: 'left' | 'right'
  onMouseDown: (e: React.MouseEvent) => void
}

function HorizontalResizeHandle({
  edge,
  onMouseDown,
}: HorizontalResizeHandleProps) {
  return (
    <div
      data-resize-handle
      className={`absolute top-0 bottom-0 w-3 cursor-ew-resize z-30 bg-transparent hover:bg-neutral-500/30 pointer-events-auto ${
        edge === 'left' ? 'left-0' : 'right-0'
      }`}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation()
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-8 w-1 bg-neutral-400 rounded opacity-50 group-hover:opacity-100 transition-opacity ${
          edge === 'left' ? 'left-1' : 'right-1'
        }`}
      />
    </div>
  )
}

function ResizeErrorToast({
  error,
  onDismiss,
}: {
  error: ResizeError
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="bg-red-950/90 border border-red-700/50 text-red-200 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-lg">!</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-red-100 mb-1">
              Cannot Resize Event
            </div>
            <div className="text-sm text-red-200/80 mb-2">{error.message}</div>
            {error.conflicts && error.conflicts.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-xs text-red-300/70 font-medium uppercase tracking-wide">
                  Conflicts:
                </div>
                {error.conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-red-200/70 bg-red-950/50 rounded px-2 py-1.5 border border-red-800/30"
                  >
                    <div className="font-medium text-red-200/90">
                      {conflict.date}
                    </div>
                    <div className="text-red-300/60">
                      {conflict.conflictRange.start} -{' '}
                      {conflict.conflictRange.end}
                    </div>
                    <div className="text-red-300/50 mt-0.5">
                      {conflict.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-red-300/60 mt-2">
              {error.eventTitle}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400/60 hover:text-red-200 transition-colors"
          >
            x
          </button>
        </div>
      </div>
    </div>
  )
}

const EVENT_GAP_PX = 3

function timeStringToFraction(time: string): number {
  const parts = time.split(':')
  const totalHours = Number(parts[0]) + Number(parts[1]) / 60
  return Math.min(totalHours, 24) / 24
}

const HorizontalTimelineRow = React.memo(function HorizontalTimelineRow({
  row,
  days,
  colorMap,
  resourceColorIndex,
  onEventClick,
  getResizeHandleProps,
  getDayColumnProps,
  getUnavailableRanges,
  eventBarRefs,
}: {
  row: TimelineResourceRow<Resource, Event<Resource>>
  days: Array<Day<Resource, Event<Resource>>>
  colorMap: Map<string, number>
  resourceColorIndex: number
  onEventClick: (event: Event<Resource>) => void
  getResizeHandleProps: ReturnType<
    typeof useCalendar<Resource, Event<Resource>>
  >['getResizeHandleProps']
  getDayColumnProps: ReturnType<
    typeof useCalendar<Resource, Event<Resource>>
  >['getDayColumnProps']
  getUnavailableRanges: ReturnType<
    typeof useCalendar<Resource, Event<Resource>>
  >['getUnavailableRanges']
  eventBarRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
}) {
  const dayPercentage = 100 / days.length
  const zoneColor =
    RESOURCE_ZONE_COLORS[resourceColorIndex % RESOURCE_ZONE_COLORS.length] ??
    RESOURCE_ZONE_COLORS[0]

  const registerEventBar = useCallback(
    (eventId: string) => (el: HTMLDivElement | null) => {
      if (el) {
        eventBarRefs.current.set(eventId, el)
      } else {
        eventBarRefs.current.delete(eventId)
      }
    },
    [eventBarRefs],
  )

  return (
    <div
      className="relative border-b border-neutral-800/50"
      style={{ minHeight: '56px' }}
    >
      {days.map((day, i) => {
        const unavailableRanges = getUnavailableRanges(day.isoDate, {
          resourceIds: [row.resource.id],
        })

        return (
          <div
            key={day.isoDate}
            className={`absolute top-0 bottom-0 border-r border-neutral-800/30 ${
              day.isToday ? 'bg-neutral-800/20' : ''
            }`}
            style={{
              left: `${i * dayPercentage}%`,
              width: `${dayPercentage}%`,
            }}
            {...getDayColumnProps(day.isoDate)}
          >
            {Array.from({ length: 23 }, (_, h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-r border-neutral-800/10"
                style={{ left: `${((h + 1) / 24) * 100}%` }}
              />
            ))}
            {unavailableRanges.map((range, rangeIdx) => {
              const startFraction = timeStringToFraction(range.startTime)
              const endFraction = timeStringToFraction(range.endTime)
              return (
                <div
                  key={rangeIdx}
                  className="absolute top-0 bottom-0 pointer-events-none z-0 bg-[length:8px_8px]"
                  style={{
                    left: `${startFraction * 100}%`,
                    width: `${(endFraction - startFraction) * 100}%`,
                    backgroundImage: `repeating-linear-gradient(315deg, ${zoneColor} 0, ${zoneColor} 1px, transparent 0, transparent 50%)`,
                  }}
                  title={`Unavailable — ${row.resource.label}: ${range.startTime}–${range.endTime}`}
                />
              )
            })}
          </div>
        )
      })}
      {row.events.map(
        ({ event, left, width, lane, isStartClipped, isEndClipped }) => {
          const colorIdx = colorMap.get(event.id) ?? 0
          const color =
            EVENT_COLORS[colorIdx % EVENT_COLORS.length] ?? EVENT_COLORS[0]
          const laneHeightPct = 100 / row.laneCount
          const topPct = lane * laneHeightPct

          return (
            <div
              key={event.id}
              ref={registerEventBar(event.id)}
              data-event-id={event.id}
              data-left={left}
              data-width={width}
              className={`group absolute border ${color.bg} ${color.border} ${color.text} px-2.5 flex items-center text-xs font-medium overflow-hidden shadow-sm z-10 cursor-pointer hover:brightness-110 transition-[filter] ${
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
                top: `calc(${topPct}% + ${EVENT_GAP_PX}px)`,
                height: `calc(${laneHeightPct}% - ${EVENT_GAP_PX * 2}px)`,
              }}
              title={`${event.title} (${toPlainDateString(event.start)}T${toPlainTimeString(event.start)} → ${toPlainDateString(event.end)}T${toPlainTimeString(event.end)})`}
              onClick={(e) => {
                if (
                  !(e.target as HTMLElement).closest('[data-resize-handle]')
                ) {
                  onEventClick(event)
                }
              }}
            >
              {!isStartClipped && (
                <HorizontalResizeHandle
                  edge="left"
                  {...getResizeHandleProps(
                    event.id,
                    'left',
                    toPlainDateTimeString(event.start),
                    toPlainDateTimeString(event.end),
                  )}
                />
              )}
              <span className="truncate">{event.title}</span>
              {!isEndClipped && (
                <HorizontalResizeHandle
                  edge="right"
                  {...getResizeHandleProps(
                    event.id,
                    'right',
                    toPlainDateTimeString(event.start),
                    toPlainDateTimeString(event.end),
                  )}
                />
              )}
            </div>
          )
        },
      )}
    </div>
  )
})

function TimelineDemo() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: 'add' | 'edit'
    eventId?: string
    initialData: EventFormData
  }>({ isOpen: false, mode: 'add', initialData: emptyFormData })

  const [resizeError, setResizeError] = useState<ResizeError | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const timelineContentRef = useRef<HTMLDivElement>(null)
  const containerWidthRef = useRef(0)

  useEffect(() => {
    const measure = () => {
      const el = timelineContentRef.current ?? scrollContainerRef.current
      if (el) {
        containerWidthRef.current = el.getBoundingClientRect().width
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    const el = timelineContentRef.current ?? scrollContainerRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const calendar = useCalendar<Resource, Event<Resource>>({
    viewMode: { value: 1, unit: 'day' },
    events: sampleEvents,
    resources: sampleResources,
    timeZone: 'UTC',
    resize: {
      enabled: true,
      get containerWidth() {
        return containerWidthRef.current
      },
      orientation: 'horizontal',
      constraints: {
        minDurationMinutes: 15,
        snapToMinutes: 15,
      },
      onResizeError: (error) => {
        setResizeError(error)
      },
    },
  })

  const colorMap = useMemo(() => {
    const map = new Map<string, number>()
    sampleEvents.forEach((event, i) => map.set(event.id, i))
    return map
  }, [])

  const timelineLayout = useMemo(
    () => calendar.getTimelineLayout(),
    [calendar.days],
  )

  const eventBarRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())

  const firstDayIso = useMemo(
    () => calendar.days[0]?.isoDate ?? '',
    [calendar.days],
  )

  const totalDays = calendar.days.length
  const { resizeState } = calendar
  const prevResizedIdRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    const prevId = prevResizedIdRef.current

    if (prevId && (!resizeState.isResizing || resizeState.eventId !== prevId)) {
      const prevEl = eventBarRefsMap.current.get(prevId)
      if (prevEl) {
        prevEl.classList.remove(
          'ring-2',
          'ring-neutral-500',
          'z-20',
          'brightness-110',
        )
      }
      prevResizedIdRef.current = null
    }

    if (
      !resizeState.isResizing ||
      !resizeState.eventId ||
      !resizeState.previewStart ||
      !resizeState.previewEnd ||
      !firstDayIso
    ) {
      return
    }

    const el = eventBarRefsMap.current.get(resizeState.eventId)
    if (!el) return

    const preview = calculateTimelineResizePreview({
      previewStart: resizeState.previewStart,
      previewEnd: resizeState.previewEnd,
      firstDayIso,
      totalDays,
    })

    el.style.left = preview.left
    el.style.width = preview.width
    el.classList.add('ring-2', 'ring-neutral-500', 'z-20', 'brightness-110')
    prevResizedIdRef.current = resizeState.eventId
  }, [resizeState, firstDayIso, totalDays])

  const openAddModal = () =>
    setModalState({ isOpen: true, mode: 'add', initialData: emptyFormData })

  const openEditModal = useCallback((event: Event<Resource>) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      eventId: event.id,
      initialData: {
        title: event.title,
        startDate: toPlainDateString(event.start),
        startTime: toPlainTimeString(event.start),
        endDate: toPlainDateString(event.end),
        endTime: toPlainTimeString(event.end),
        resourceId: event.resources?.[0]?.id ?? resourceDesign.id,
      },
    })
  }, [])

  const handleSave = (data: EventFormData) => {
    const resource = sampleResources.find((r) => r.id === data.resourceId)
    const eventData = {
      title: data.title,
      start: `${data.startDate}T${data.startTime}:00`,
      end: `${data.endDate}T${data.endTime}:00`,
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

  const viewModeOptions = [
    { label: 'Day', value: 1, unit: 'day' as const },
    { label: 'Week', value: 1, unit: 'week' as const },
    { label: '2 Weeks', value: 2, unit: 'week' as const },
  ]

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
            {viewModeOptions.map((opt) => {
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
          {calendar.formatPeriodLabel()}
        </div>
      </div>

      <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
        <div className="flex">
          <div className="w-36 flex-shrink-0 border-r border-neutral-800 bg-neutral-950 z-10">
            <div className="h-10 border-b border-neutral-800/50" />
            <div className="h-8 border-b border-neutral-800 px-3 flex items-end pb-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Resources
              </span>
            </div>
            {sampleResources.map((resource, idx) => {
              const zoneColor =
                RESOURCE_ZONE_COLORS[idx % RESOURCE_ZONE_COLORS.length] ??
                RESOURCE_ZONE_COLORS[0]
              return (
                <div
                  key={resource.id}
                  className="h-14 border-b border-neutral-800/50 px-3 flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 flex-shrink-0 rounded-sm bg-[length:6px_6px]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(315deg, ${zoneColor} 0, ${zoneColor} 1px, transparent 0, transparent 50%)`,
                      backgroundColor: zoneColor,
                    }}
                  />
                  <span className="text-sm font-medium text-neutral-300 truncate">
                    {resource.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-x-auto">
            <div ref={timelineContentRef} className="min-w-[800px] w-full">
              <div>
                <div className="h-10 border-b border-neutral-800/50 bg-neutral-950 flex">
                  {calendar.days.map((day) => {
                    const localDate = new Date(
                      day.date.year,
                      day.date.month - 1,
                      day.date.day,
                    )
                    const dayName = localDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                    })
                    const dayNum = day.date.day
                    const monthName = localDate.toLocaleDateString(undefined, {
                      month: 'short',
                    })

                    return (
                      <div
                        key={day.isoDate}
                        className={`flex-1 border-r border-neutral-800/50 flex items-center justify-center gap-1.5 ${
                          day.isToday ? 'bg-neutral-800/30' : ''
                        }`}
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
                <div className="h-8 border-b border-neutral-800 bg-neutral-950 flex relative">
                  {calendar.days.map((day, i) => {
                    const dayPercentage = 100 / calendar.days.length
                    return (
                      <div
                        key={day.isoDate + '-hours'}
                        className="absolute top-0 bottom-0 border-r border-neutral-800/50 flex"
                        style={{
                          left: `${i * dayPercentage}%`,
                          width: `${dayPercentage}%`,
                        }}
                      >
                        {Array.from({ length: 24 }, (_, h) => (
                          <div
                            key={h}
                            className="absolute top-0 bottom-0 border-r border-neutral-800/20 flex items-end justify-center pb-1"
                            style={{
                              left: `${(h / 24) * 100}%`,
                              width: `${(1 / 24) * 100}%`,
                            }}
                          >
                            <span className="text-[9px] text-neutral-600">
                              {h.toString().padStart(2, '0')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="relative">
                {timelineLayout.currentTimePosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                    style={{
                      left: `${timelineLayout.currentTimePosition}%`,
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </div>
                )}
                {timelineLayout.rows.map((row, rowIdx) => (
                  <HorizontalTimelineRow
                    key={row.resource.id}
                    row={row}
                    days={calendar.days}
                    colorMap={colorMap}
                    resourceColorIndex={rowIdx}
                    onEventClick={openEditModal}
                    getResizeHandleProps={calendar.getResizeHandleProps}
                    getDayColumnProps={calendar.getDayColumnProps}
                    getUnavailableRanges={calendar.getUnavailableRanges}
                    eventBarRefs={eventBarRefsMap}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-3">
          {sampleEvents.map((event) => {
            const colorIdx = colorMap.get(event.id) ?? 0
            const color =
              EVENT_COLORS[colorIdx % EVENT_COLORS.length] ?? EVENT_COLORS[0]
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

        <div className="flex flex-wrap gap-3 border-l border-neutral-800 pl-6">
          {sampleResources.map((resource, idx) => {
            const zoneColor =
              RESOURCE_ZONE_COLORS[idx % RESOURCE_ZONE_COLORS.length] ??
              RESOURCE_ZONE_COLORS[0]
            return (
              <div key={resource.id} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm bg-[length:6px_6px]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(315deg, ${zoneColor} 0, ${zoneColor} 1px, transparent 0, transparent 50%)`,
                    backgroundColor: zoneColor,
                  }}
                />
                <span className="text-xs text-neutral-500">
                  {resource.label} — unavailable
                </span>
              </div>
            )
          })}
        </div>
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

      {resizeError && (
        <ResizeErrorToast
          error={resizeError}
          onDismiss={() => setResizeError(null)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <>
      <TanStackDevtools plugins={[timeDevtoolsPlugin()]} />
      <TimelineDemo />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
