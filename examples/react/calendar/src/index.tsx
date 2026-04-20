import {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  formatEventTimeRange,
  getSegmentInfo,
  useCalendar,
  useInfiniteScroll,
} from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'
import { toPlainDateTimeString } from '@tanstack/time'
import type { Day, Event, RecurrenceFrequency, RecurrenceRule, ResizeError, Resource } from '@tanstack/time'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import './index.css'

function formatPeriodDate(dateString: string): string {
  const datePart = dateString.split('[')[0]
  if (!datePart) return dateString

  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return formatter.format(date)
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function padTimePart(n: number): string {
  return String(n).padStart(2, '0')
}

// Monday of the work week containing today, or upcoming Monday on Sat–Sun.
function workWeekMonday(): Date {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)

  if (dow === 0 || dow === 6) {
    monday.setDate(today.getDate() + (dow === 0 ? 1 : 2))
  } else {
    monday.setDate(today.getDate() + (1 - dow))
  }
  monday.setHours(0, 0, 0, 0)
  return monday
}

function weekdayAt(isoWeekday: 1 | 2 | 3 | 4 | 5): Date {
  const monday = workWeekMonday()
  const d = new Date(monday)
  d.setDate(monday.getDate() + isoWeekday - 1)
  return d
}

function dateTimeOnWeekday(
  isoWeekday: 1 | 2 | 3 | 4 | 5,
  hour: number,
  minute: number,
): string {
  const d = weekdayAt(isoWeekday)
  d.setHours(hour, minute, 0, 0)
  return `${formatDateToISO(d)}T${padTimePart(hour)}:${padTimePart(minute)}:00`
}

function eventToSegmentInfoInput(
  event: Event<Resource>,
): Parameters<typeof getSegmentInfo>[0] {
  const e = event as Event<Resource> & {
    _originalStart?: string | Date | number
    _originalEnd?: string | Date | number
  }
  return {
    start: toPlainDateTimeString(e.start),
    end: toPlainDateTimeString(e.end),
    ...(e._originalStart != null
      ? { _originalStart: toPlainDateTimeString(e._originalStart) }
      : {}),
    ...(e._originalEnd != null
      ? { _originalEnd: toPlainDateTimeString(e._originalEnd) }
      : {}),
  }
}

const sampleResources: Array<Resource> = [
  {
    id: '1',
    label: 'Resource 1',
    capacity: [1],
    availability: [
      {
        weekdays: [1, 2, 3],
        startTime: '08:00',
        endTime: '17:00',
      },
      {
        weekdays: [4, 5],
        startTime: '00:00',
        endTime: '24:00',
      },
      {
        weekdays: [6, 7],
        startTime: '10:00',
        endTime: '15:00',
      },
    ],
  },
  {
    id: '2',
    label: 'Resource 2',
    capacity: [1],
    availability: [
      {
        weekdays: [1, 2, 3, 4, 5],
        startTime: '12:00',
        endTime: '18:00',
      },
      {
        weekdays: [6, 7],
        startTime: '00:00',
        endTime: '24:00',
      },
    ],
  },
]

/*
  Every event uses both resources. Intersection of availability on Mon–Fri:
  Resource1 Mon–Wed 08–17, Thu–Fri 00–24; Resource2 Mon–Fri 12–18 → 12:00–17:00.
  Multi-day slots cannot cross midnight: Resource2 is off before 12:00 on each weekday,
  so overnight segments would sit in unavailable time.
*/
function getSampleEvents(): Array<Event<Resource>> {
  return [
    {
      id: '1',
      title: 'Team Meeting',
      start: dateTimeOnWeekday(2, 12, 0),
      end: dateTimeOnWeekday(2, 13, 0),
      resources: sampleResources,
    },
    {
      id: '2',
      title: 'Project Review',
      start: dateTimeOnWeekday(3, 14, 0),
      end: dateTimeOnWeekday(3, 15, 30),
      resources: sampleResources,
    },
    {
      id: '3',
      title: 'Workshop',
      start: dateTimeOnWeekday(4, 12, 0),
      end: dateTimeOnWeekday(4, 16, 30),
      resources: sampleResources,
    },
    {
      id: '4',
      title: 'Lunch Break',
      start: dateTimeOnWeekday(5, 12, 0),
      end: dateTimeOnWeekday(5, 13, 0),
      resources: sampleResources,
    },
    // ── Recurring events ────────────────────────────────────────────────────
    {
      id: 'r-standup',
      title: '☀ Daily Stand-up',
      start: dateTimeOnWeekday(1, 9, 0),
      end: dateTimeOnWeekday(1, 9, 15),
      resources: sampleResources,
      recurrence: {
        frequency: 'daily',
        interval: 1,
        // Mon–Fri only
        byWeekday: undefined,
      },
    },
    {
      id: 'r-sync',
      title: '🔄 Weekly Sync',
      start: dateTimeOnWeekday(1, 10, 0),
      end: dateTimeOnWeekday(1, 10, 30),
      resources: sampleResources,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        byWeekday: [1], // every Monday
      },
    },
    {
      id: 'r-report',
      title: '📊 Monthly Report',
      // Use first Monday of the current work week at 14:00
      start: dateTimeOnWeekday(1, 14, 0),
      end: dateTimeOnWeekday(1, 15, 0),
      resources: sampleResources,
      recurrence: {
        frequency: 'monthly',
        interval: 1,
      },
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
  recurrenceFrequency: RecurrenceFrequency | 'none'
  recurrenceUntil: string
}

const emptyFormData: EventFormData = {
  title: '',
  startDate: formatDateToISO(new Date()),
  startTime: '09:00',
  endDate: formatDateToISO(new Date()),
  endTime: '10:00',
  recurrenceFrequency: 'none',
  recurrenceUntil: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const recurrencyOptions: Array<{ value: RecurrenceFrequency | 'none'; label: string }> = [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Event' : 'Edit Event'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Event title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* ── Recurrence ───────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="recurrenceFrequency">Repeat</Label>
            <select
              id="recurrenceFrequency"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.recurrenceFrequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurrenceFrequency: e.target.value as RecurrenceFrequency | 'none',
                })
              }
            >
              {recurrencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {formData.recurrenceFrequency !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="recurrenceUntil">Repeat until (optional)</Label>
              <Input
                id="recurrenceUntil"
                type="date"
                value={formData.recurrenceUntil}
                onChange={(e) =>
                  setFormData({ ...formData, recurrenceUntil: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {mode === 'edit' && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onDelete()
                    onClose()
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{mode === 'add' ? 'Add' : 'Save'}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ResizeHandleProps {
  edge: 'top' | 'bottom'
  onMouseDown: (e: React.MouseEvent) => void
}

function ResizeHandle({ edge, onMouseDown }: ResizeHandleProps) {
  return (
    <div
      data-resize-handle
      className={`absolute left-0 right-0 h-3 cursor-ns-resize z-30 bg-transparent hover:bg-neutral-500/30 pointer-events-auto ${
        edge === 'top' ? 'top-0' : 'bottom-0'
      }`}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation()
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-neutral-400 rounded opacity-50 group-hover:opacity-100 transition-opacity ${
          edge === 'top' ? 'top-1' : 'bottom-1'
        }`}
      />
    </div>
  )
}

function ScheduleView({
  calendar,
  days,
  onEventClick,
}: {
  calendar: ReturnType<typeof useCalendar<Resource, Event<Resource>>>
  days: Array<Day<Resource, Event<Resource>>>
  onEventClick: (event: Event<Resource>) => void
}) {
  const timeSlots = calendar.getTimeSlots()
  const {
    resizeState,
    getResizeHandleProps,
    getDayColumnProps,
    getUnavailableRanges,
  } = calendar

  // ── Horizontal infinite scroll: auto-navigate when the user scrolls to
  // the left or right edge of the schedule (week/day view). We use a plain
  // scroll event listener rather than sentinels because the scroll container
  // here is not a fixed-height viewport.
  const scheduleScrollRef = useRef<HTMLDivElement>(null)
  const horizCooldownRef = useRef(false)

  useEffect(() => {
    const el = scheduleScrollRef.current
    if (!el) return

    const onScroll = () => {
      if (horizCooldownRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = el
      const atRightEdge = scrollLeft + clientWidth >= scrollWidth - 4
      const atLeftEdge = scrollLeft <= 4

      if (atRightEdge && calendar.canGoNextPeriod()) {
        horizCooldownRef.current = true
        calendar.goToNextPeriod()
        // Reset to left edge for the new period
        requestAnimationFrame(() => {
          el.scrollLeft = 0
          setTimeout(() => { horizCooldownRef.current = false }, 900)
        })
      } else if (atLeftEdge && scrollWidth > clientWidth && calendar.canGoPreviousPeriod()) {
        // Only fire when actually scrollable and we’ve deliberately scrolled left
        horizCooldownRef.current = true
        calendar.goToPreviousPeriod()
        // Reset to right edge for the new (previous) period
        requestAnimationFrame(() => {
          el.scrollLeft = el.scrollWidth - el.clientWidth
          setTimeout(() => { horizCooldownRef.current = false }, 900)
        })
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [calendar])

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="flex gap-6 flex-wrap">
          {sampleResources.map((resource, idx) => {
            const colors = ['#0049af75', '#00af3475']
            const color = colors[idx % colors.length]
            return (
              <div key={resource.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor: color,
                    backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
                  }}
                />
                <span className="text-sm text-neutral-300">
                  {resource.label}
                </span>
                {resource.capacity !== undefined && (
                  <span className="text-xs text-neutral-500">
                    (Capacity: {resource.capacity})
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex border-t border-neutral-800">
        <div className="w-20 border-r border-neutral-800 bg-neutral-950">
          <div className="h-12 border-b border-neutral-800"></div>
          {timeSlots.map((slot) => (
            <div
              key={`${slot.hour}-${slot.minute}`}
              className="h-[60px] border-b border-neutral-800/50 px-2 py-1 text-xs text-neutral-500"
            >
              {slot.label}
            </div>
          ))}
        </div>
        {/* Horizontal-scrollable schedule body — sentinels auto-navigate on edge */}
        <div ref={scheduleScrollRef} className="flex-1 overflow-x-auto">
          <div
            className="grid min-w-full"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            <div className="contents">
              {days.map((day) => {
                const dayDate = `${day.date.year}-${String(day.date.month).padStart(2, '0')}-${String(day.date.day).padStart(2, '0')}`
                const dayName = new Intl.DateTimeFormat('en-US', {
                  weekday: 'short',
                }).format(
                  new Date(day.date.year, day.date.month - 1, day.date.day),
                )
                return (
                  <div
                    key={day.date.toString()}
                    className="border-r border-neutral-800 last:border-r-0"
                    {...getDayColumnProps(dayDate)}
                  >
                    <div className="h-12 border-b border-neutral-800 bg-neutral-950 px-3 py-2 text-center">
                      <div className="text-sm font-semibold text-neutral-200">
                        {dayName}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {day.date.day}
                      </div>
                    </div>
                    <div className="relative h-[1440px] bg-neutral-950/30">
                      {sampleResources.map((resource, resourceIdx) => {
                        const resourceRanges = getUnavailableRanges(dayDate, {
                          resourceIds: [resource.id],
                        })
                        const colors = ['#0049af75', '#00af3475']
                        const color = colors[resourceIdx % colors.length]

                        return resourceRanges.map((range, rangeIdx) => (
                          <div
                            key={`${resource.id}-${rangeIdx}`}
                            className="absolute left-0 right-0 pointer-events-none z-0 bg-[length:10px_10px] bg-fixed"
                            style={{
                              top: `${range.top}px`,
                              height: `${range.height}px`,
                              backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
                            }}
                            title={`Unavailable - ${resource.label}`}
                          />
                        ))
                      })}
                      {day.events.map((event, eventIndex) => {
                        const eventProps = calendar.getEventProps(event)
                        const { style, isSplitEvent } = eventProps

                        const segmentInfo = getSegmentInfo(
                          eventToSegmentInfoInput(event),
                        )
                        const {
                          isFirstSegment,
                          isLastSegment,
                          originalStart,
                          originalEnd,
                        } = segmentInfo

                        const isBeingResized =
                          resizeState.isResizing &&
                          resizeState.eventId === event.id

                        const resizePreview =
                          isBeingResized &&
                          resizeState.previewStart &&
                          resizeState.previewEnd
                            ? calculateSegmentResizePreview({
                                dayDate,
                                originalStart,
                                originalEnd,
                                previewStart: resizeState.previewStart,
                                previewEnd: resizeState.previewEnd,
                              })
                            : null

                        if (resizePreview?.shouldHide) {
                          return null
                        }

                        const displayStyle = resizePreview?.previewStyle
                          ? { ...style, ...resizePreview.previewStyle }
                          : style

                        const showTopHandle = !isSplitEvent || isFirstSegment
                        const showBottomHandle = !isSplitEvent || isLastSegment
                        const isActivelyResized =
                          isBeingResized && resizePreview?.previewStyle !== null

                        const timeRange = formatEventTimeRange(
                          isBeingResized && resizeState.previewStart
                            ? resizeState.previewStart
                            : originalStart,
                          isBeingResized && resizeState.previewEnd
                            ? resizeState.previewEnd
                            : originalEnd,
                        )

                        return (
                          <div
                            key={`${event.id}-${eventIndex}`}
                            className={`group absolute z-10 bg-neutral-800 text-white rounded px-2 py-1 text-xs font-medium overflow-hidden transition-colors border border-neutral-700 ${
                              isActivelyResized
                                ? 'bg-neutral-700 ring-2 ring-neutral-500 z-20'
                                : 'cursor-pointer hover:bg-neutral-700'
                            }`}
                            title={event.title}
                            style={displayStyle}
                            onClick={(e) => {
                              if (
                                !resizeState.isResizing &&
                                !(e.target as HTMLElement).closest(
                                  '[data-resize-handle]',
                                )
                              ) {
                                onEventClick(event)
                              }
                            }}
                          >
                            {showTopHandle && (
                              <ResizeHandle
                                edge="top"
                                {...getResizeHandleProps(
                                  event.id,
                                  'top',
                                  originalStart,
                                  originalEnd,
                                )}
                              />
                            )}
                            <div className="font-semibold pt-1">
                              {(event._recurringMasterId || event.recurrence) && (
                                <span className="mr-1 opacity-60" title="Recurring event">↻</span>
                              )}
                              {event.title}
                            </div>
                            {displayStyle &&
                              parseFloat(displayStyle.height) > 2 && (
                                <div className="text-xs opacity-90 mt-0.5">
                                  {timeRange.rangeFormatted}
                                </div>
                              )}
                            {showBottomHandle && (
                              <ResizeHandle
                                edge="bottom"
                                {...getResizeHandleProps(
                                  event.id,
                                  'bottom',
                                  originalStart,
                                  originalEnd,
                                )}
                              />
                            )}
                          </div>
                        )
                      })}
                      {resizeState.isResizing &&
                        resizeState.previewStart &&
                        resizeState.previewEnd &&
                        !day.events.some((e) => e.id === resizeState.eventId) &&
                        (() => {
                          const ghostStyle = calculateGhostPreviewStyle({
                            dayDate,
                            previewStart: resizeState.previewStart,
                            previewEnd: resizeState.previewEnd,
                          })

                          if (!ghostStyle) return null

                          const timeRange = formatEventTimeRange(
                            resizeState.previewStart,
                            resizeState.previewEnd,
                          )

                          return (
                            <div
                              className="absolute bg-neutral-700/60 text-neutral-200 rounded px-2 py-1 text-xs font-medium overflow-hidden border border-neutral-600 border-dashed z-20"
                              style={ghostStyle}
                            >
                              <div className="font-semibold pt-1 opacity-80">
                                {timeRange.rangeFormatted}
                              </div>
                            </div>
                          )
                        })()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
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
          <div className="text-red-400 text-lg">⚠</div>
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

function CalendarView() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: 'add' | 'edit'
    eventId?: string
    initialData: EventFormData
  }>({
    isOpen: false,
    mode: 'add',
    initialData: emptyFormData,
  })

  const [resizeError, setResizeError] = useState<ResizeError | null>(null)

  const calendar = useCalendar<Resource, Event<Resource>>({
    viewMode: { value: 1, unit: 'month' },
    events: sampleEvents,
    resources: sampleResources,
    timeZone: 'UTC',
    resize: {
      enabled: true,
      containerHeight: 1440,
      constraints: {
        minDurationMinutes: 15,
        snapToMinutes: 15,
      },
      onResizeError: (error) => {
        setResizeError(error)
      },
    },
  })

  const dayNames = calendar.getDaysNames('short')

  const isScheduleView =
    calendar.viewMode.unit === 'week' || calendar.viewMode.unit === 'day'
  const scheduleDays: Array<Day<Resource, Event<Resource>>> = isScheduleView
    ? calendar.viewMode.unit === 'day'
      ? calendar.days.filter((day) => {
          const currentDateStr = calendar.currentPeriod.split('[')[0]
          return day.date.toString({ calendarName: 'never' }) === currentDateStr
        })
      : calendar.days
    : []

  // ── Month-view infinite scroll ───────────────────────────────────────────
  // We accumulate days from multiple months in a stable Map<isoDate, Day>.
  // Navigation direction is tracked via a ref so the accumulation effect
  // knows whether to prepend or append.
  const monthScrollRef = useRef<HTMLDivElement>(null)
  const daysAccumRef = useRef<Map<string, Day<Resource, Event<Resource>>>>(null as any)
  if (daysAccumRef.current === null) {
    // Lazy-init: populate from the initial period on first render
    daysAccumRef.current = new Map(
      calendar.days.map((d) => [d.isoDate, d]),
    )
  }

  const navDirectionRef = useRef<'none' | 'forward' | 'backward'>('none')
  const prevPeriodRef = useRef(calendar.currentPeriod)
  const prevScrollHeightRef = useRef(0)
  const needsScrollAdjRef = useRef(false)
  const [accumVersion, setAccumVersion] = useState(0)

  // When the calendar navigates to a new period, fold its days into the map.
  useEffect(() => {
    if (navDirectionRef.current === 'none') return
    if (calendar.currentPeriod === prevPeriodRef.current) return
    prevPeriodRef.current = calendar.currentPeriod

    const direction = navDirectionRef.current
    navDirectionRef.current = 'none'

    for (const day of calendar.days) {
      daysAccumRef.current.set(day.isoDate, day)
    }

    if (direction === 'backward') {
      // Schedule a scrollTop correction after the next DOM paint
      prevScrollHeightRef.current = monthScrollRef.current?.scrollHeight ?? 0
      needsScrollAdjRef.current = true
    }

    // Bump version to trigger re-render with the updated map
    setAccumVersion((v) => v + 1)
  }, [calendar.currentPeriod, calendar.days])

  // Correct scroll position after prepending new weeks (backward nav)
  // so the currently-visible rows don’t jump.
  useLayoutEffect(() => {
    if (!needsScrollAdjRef.current) return
    needsScrollAdjRef.current = false
    const el = monthScrollRef.current
    if (el) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current
    }
  })

  // Sorted unique days from the accumulator map → grouped into weeks for rendering
  const bufferedWeekGroups = useMemo(() => {
    const sorted = Array.from(daysAccumRef.current.values()).sort((a, b) =>
      a.isoDate < b.isoDate ? -1 : 1,
    )
    return calendar.groupDaysBy({ days: sorted, unit: 'week', fillMissingDays: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accumVersion, calendar.groupDaysBy])

  const { startSentinelRef: monthTopRef, endSentinelRef: monthBottomRef } =
    useInfiniteScroll({
      root: monthScrollRef,
      rootMargin: '120px 0px', // prefetch slightly before edge
      cooldownMs: 1000,
      onReachStart: () => {
        if (!calendar.canGoPreviousPeriod() || calendar.isPending) return
        navDirectionRef.current = 'backward'
        calendar.goToPreviousPeriod()
      },
      onReachEnd: () => {
        if (!calendar.canGoNextPeriod() || calendar.isPending) return
        navDirectionRef.current = 'forward'
        calendar.goToNextPeriod()
      },
      disabled: isScheduleView,
    })

  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      initialData: emptyFormData,
    })
  }

  const openEditModal = (event: Event<Resource>) => {
    // For recurring occurrences, always open the master event for editing
    const masterEvent = event._recurringMasterId
      ? calendar.getEvents().find((e) => e.id === event._recurringMasterId) ?? event
      : event
    const eventProps = calendar.getEventProps(masterEvent)
    const startDate = new Date(eventProps.start)
    const endDate = new Date(eventProps.end)

    const rule = (masterEvent as Event<Resource>).recurrence

    setModalState({
      isOpen: true,
      mode: 'edit',
      eventId: masterEvent.id,
      initialData: {
        title: masterEvent.title,
        startDate: formatDateToISO(startDate),
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: formatDateToISO(endDate),
        endTime: endDate.toTimeString().slice(0, 5),
        recurrenceFrequency: rule?.frequency ?? 'none',
        recurrenceUntil: rule?.until ?? '',
      },
    })
  }

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleSave = (data: EventFormData) => {
    const recurrence: RecurrenceRule | undefined =
      data.recurrenceFrequency !== 'none'
        ? {
            frequency: data.recurrenceFrequency,
            ...(data.recurrenceUntil ? { until: data.recurrenceUntil } : {}),
          }
        : undefined

    const eventData = {
      title: data.title,
      start: `${data.startDate}T${data.startTime}:00`,
      end: `${data.endDate}T${data.endTime}:00`,
      recurrence,
    }

    if (modalState.mode === 'add') {
      const newId = String(Date.now())
      calendar.addEvent({ id: newId, ...eventData })
    } else if (modalState.eventId) {
      calendar.updateEvent(modalState.eventId, eventData)
    }
  }

  const handleDelete = () => {
    if (modalState.eventId) {
      calendar.removeEvent(modalState.eventId)
    }
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="m-0 mb-4 text-[28px] font-semibold text-white">
          TanStack Time
        </h1>

        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <Button
            onClick={calendar.goToPreviousPeriod}
            disabled={!calendar.canGoPreviousPeriod() || calendar.isPending}
            variant="outline"
          >
            ← Previous
          </Button>

          <Button
            onClick={calendar.goToCurrentPeriod}
            disabled={calendar.isPending}
            variant="outline"
          >
            Today
          </Button>

          <Button
            onClick={calendar.goToNextPeriod}
            disabled={!calendar.canGoNextPeriod() || calendar.isPending}
            variant="outline"
          >
            Next →
          </Button>

          <Button onClick={openAddModal}>+ Add Event</Button>

          <div className="ml-auto flex gap-2">
            <Button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'month' })
              }
              variant={
                calendar.viewMode.unit === 'month' ? 'secondary' : 'outline'
              }
              size="sm"
            >
              Month
            </Button>
            <Button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'week' })
              }
              variant={
                calendar.viewMode.unit === 'week' ? 'secondary' : 'outline'
              }
              size="sm"
            >
              Week
            </Button>
            <Button
              onClick={() => calendar.changeViewMode({ value: 1, unit: 'day' })}
              variant={
                calendar.viewMode.unit === 'day' ? 'secondary' : 'outline'
              }
              size="sm"
            >
              Day
            </Button>
          </div>
        </div>

        <div className="text-lg font-medium text-neutral-400">
          {formatPeriodDate(calendar.currentPeriod)}
        </div>
      </div>

      {isScheduleView ? (
        <ScheduleView
          calendar={calendar}
          days={scheduleDays}
          onEventClick={openEditModal}
        />
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
          {/* Sticky day-name header */}
          <div
            className="grid border-b border-neutral-800 bg-neutral-950 sticky top-0 z-10"
            style={{ gridTemplateColumns: `repeat(${dayNames.length}, 1fr)` }}
          >
            {dayNames.map((dayName: string, index: number) => (
              <div
                key={index}
                className={`py-3 text-center font-semibold text-sm text-neutral-500 ${
                  index < dayNames.length - 1
                    ? 'border-r border-neutral-800'
                    : ''
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Scrollable month body — sentinels trigger period navigation */}
          <div
            ref={monthScrollRef}
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 260px)' }}
          >
            {/* Top sentinel: triggers goToPreviousPeriod */}
            <div ref={monthTopRef} style={{ height: 1 }} aria-hidden />

            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${dayNames.length}, 1fr)` }}
            >
              {bufferedWeekGroups.map(
                (week: Array<Day<Resource, Event<Resource>> | null>, weekIndex: number) => {
                  const weekKey =
                    week.find((d) => d !== null)?.isoDate ?? `w-${weekIndex}`
                  return week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${weekKey}-${dayIndex}`}
                          className={`min-h-[120px] bg-neutral-950/50 ${
                            dayIndex < dayNames.length - 1
                              ? 'border-r border-neutral-800'
                              : ''
                          } border-b border-neutral-800`}
                        />
                      )
                    }

                    const isToday = day.isToday
                    const isInCurrentPeriod = day.isInCurrentPeriod

                    return (
                      <div
                        key={day.isoDate}
                        className={`min-h-[120px] p-2 relative ${
                          dayIndex < dayNames.length - 1
                            ? 'border-r border-neutral-800'
                            : ''
                        } border-b border-neutral-800 ${
                          isToday
                            ? 'bg-neutral-900'
                            : isInCurrentPeriod
                              ? 'bg-black'
                              : 'bg-neutral-950/50'
                        }`}
                      >
                        <div
                          className={`text-sm mb-1 ${
                            isToday
                              ? 'font-bold text-white'
                              : isInCurrentPeriod
                                ? 'font-medium text-neutral-200'
                                : 'font-medium text-neutral-500'
                          }`}
                        >
                          {day.date.day}
                        </div>
                        <div className="flex flex-col gap-1">
                          {day.events.map((event) => (
                            <Badge
                              key={event.id}
                              variant="secondary"
                              className="cursor-pointer justify-start hover:bg-muted"
                              title={event.title}
                              onClick={() => openEditModal(event)}
                            >
                              {(event._recurringMasterId || event.recurrence) && (
                                <span className="mr-1 opacity-60" title="Recurring event">↻</span>
                              )}
                              {event.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })
                },
              )}
            </div>

            {/* Bottom sentinel: triggers goToNextPeriod */}
            <div ref={monthBottomRef} style={{ height: 1 }} aria-hidden />
          </div>
        </div>
      )}

      {calendar.isPending && (
        <div className="fixed top-5 right-5 px-5 py-3 bg-card border border-border text-foreground rounded-md text-sm font-medium">
          Loading...
        </div>
      )}

      <EventModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
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
      <CalendarView />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
