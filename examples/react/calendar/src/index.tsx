import {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  formatEventTimeRange,
  useCalendar,
} from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'
import { useInfiniteScroll } from './lib/useInfiniteScroll'
import type {
  Day,
  Event,
  RecurrenceFrequency,
  RecurrenceRule,
  ResizeError,
  Resource,
} from '@tanstack/time'
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import './index.css'

function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function padTimePart(n: number): string {
  return String(n).padStart(2, '0')
}

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

const sampleResources: Array<Resource> = [
  {
    id: 'room-a',
    label: 'Room A',
    capacity: [4],
    availability: [
      {
        weekdays: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '18:00',
      },
    ],
  },
  {
    id: 'room-b',
    label: 'Room B',
    capacity: [2],
    availability: [
      {
        weekdays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '18:00',
      },
    ],
  },
]

/*
  Capacity + consumption demo:
  - Room A has capacity 4, Room B has capacity 2.
  - Overlapping events intentionally consume different amounts.
  - Try resizing one event to overlap others to trigger capacity conflicts.
*/
function getSampleEvents(): Array<Event<Resource>> {
  return [
    {
      id: '1',
      title: 'Team Meeting (A:2)',
      start: dateTimeOnWeekday(2, 12, 0),
      end: dateTimeOnWeekday(2, 13, 0),
      resources: [sampleResources[0]],
      consumption: [2],
    },
    {
      id: '2',
      title: 'Project Review (A:2)',
      start: dateTimeOnWeekday(3, 14, 0),
      end: dateTimeOnWeekday(3, 15, 30),
      resources: [sampleResources[0]],
      consumption: [2],
    },
    {
      id: '3',
      title: 'Workshop (B:1)',
      start: dateTimeOnWeekday(4, 12, 0),
      end: dateTimeOnWeekday(4, 16, 30),
      resources: [sampleResources[1]],
      consumption: [1],
    },
    {
      id: '4',
      title: 'Capacity Probe (A:1)',
      start: dateTimeOnWeekday(5, 12, 0),
      end: dateTimeOnWeekday(5, 13, 0),
      resources: [sampleResources[0]],
      consumption: [1],
    },
    {
      id: '5',
      title: 'Focus Block (A:2)',
      start: dateTimeOnWeekday(5, 12, 30),
      end: dateTimeOnWeekday(5, 14, 30),
      resources: [sampleResources[0]],
      consumption: [2],
    },
    {
      id: '6',
      title: 'Interview (B:1)',
      start: dateTimeOnWeekday(2, 12, 30),
      end: dateTimeOnWeekday(2, 14, 0),
      resources: [sampleResources[1]],
      consumption: [1],
    },
    {
      id: 'r-standup',
      title: '☀ Daily Stand-up (A:1)',
      start: dateTimeOnWeekday(1, 9, 0),
      end: dateTimeOnWeekday(1, 9, 15),
      resources: [sampleResources[0]],
      consumption: [1],
      recurrence: {
        frequency: 'daily',
        interval: 1,
        byWeekday: undefined,
      },
    },
    {
      id: 'r-sync',
      title: '🔄 Weekly Sync (B:1)',
      start: dateTimeOnWeekday(1, 10, 0),
      end: dateTimeOnWeekday(1, 10, 30),
      resources: [sampleResources[1]],
      consumption: [1],
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        byWeekday: [1],
      },
    },
    {
      id: 'r-report',
      title: '📊 Monthly Report (A:1)',
      start: dateTimeOnWeekday(1, 14, 0),
      end: dateTimeOnWeekday(1, 15, 0),
      resources: [sampleResources[0]],
      consumption: [1],
      recurrence: {
        frequency: 'monthly',
        interval: 1,
      },
    },
  ]
}

const MOCK_DB = getSampleEvents()

interface EventFormData {
  title: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  resourceId: string
  consumption: number
  recurrenceFrequency: RecurrenceFrequency | 'none'
  recurrenceUntil: string
}

const emptyFormData: EventFormData = {
  title: '',
  startDate: formatDateToISO(new Date()),
  startTime: '09:00',
  endDate: formatDateToISO(new Date()),
  endTime: '10:00',
  resourceId: sampleResources[0]?.id ?? '',
  consumption: 1,
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
  isSaving,
  resources,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: EventFormData) => Promise<void>
  onDelete?: () => void
  initialData: EventFormData
  mode: 'add' | 'edit'
  isSaving?: boolean
  resources: Array<Resource>
}) {
  const [formData, setFormData] = useState<EventFormData>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSave(formData)
    } catch {
      return
    }
    onClose()
  }

  const recurrencyOptions: Array<{
    value: RecurrenceFrequency | 'none'
    label: string
  }> = [
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
              <Label htmlFor="resourceId">Resource</Label>
              <select
                id="resourceId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.resourceId}
                onChange={(e) =>
                  setFormData({ ...formData, resourceId: e.target.value })
                }
                required
              >
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumption">Consumption</Label>
              <Input
                id="consumption"
                type="number"
                min={1}
                step={1}
                value={formData.consumption}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumption: Math.max(1, Number(e.target.value) || 1),
                  })
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
                  recurrenceFrequency: e.target.value as
                    | RecurrenceFrequency
                    | 'none',
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : mode === 'add' ? 'Add' : 'Save'}
              </Button>
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
  resources,
  onEventClick,
  scrollRef,
  leftSentinelRef,
  rightSentinelRef,
  periodDayCount,
}: {
  calendar: ReturnType<typeof useCalendar<Resource, Event<Resource>>>
  days: Array<Day<Resource, Event<Resource>>>
  resources: Array<Resource>
  onEventClick: (event: Event<Resource>) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
  leftSentinelRef: React.RefObject<HTMLDivElement | null>
  rightSentinelRef: React.RefObject<HTMLDivElement | null>
  periodDayCount: number
}) {
  const timeSlots = calendar.getTimeSlots()
  const {
    resizeState,
    getResizeHandleProps,
    getDayColumnProps,
    getUnavailableRanges,
  } = calendar

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="flex gap-6 flex-wrap">
          {resources.map((resource, idx) => {
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
        <div ref={scrollRef} className="flex-1 overflow-x-auto">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `1px repeat(${days.length}, 1fr) 1px`,
              minWidth: `${(days.length / periodDayCount) * 100}%`,
            }}
          >
            <div ref={leftSentinelRef} style={{ width: 1 }} aria-hidden />
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
                      {resources.map((resource, resourceIdx) => {
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

                        const segmentInfo = calendar.getEventSegmentInfo(event)
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
                          <ContextMenu key={`${event.id}-${eventIndex}`}>
                            <ContextMenuTrigger
                              className={`group absolute z-10 bg-neutral-800 text-white rounded px-2 py-1 text-xs font-medium overflow-hidden transition-colors border border-neutral-700 ${
                                isActivelyResized
                                  ? 'bg-neutral-700 ring-2 ring-neutral-500 z-20'
                                  : 'cursor-pointer hover:bg-neutral-700'
                              }`}
                              style={displayStyle as React.CSSProperties}
                              onClick={(e: React.MouseEvent) => {
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
                              <div className="font-semibold pt-1 flex items-center gap-1.5">
                                <span className="flex items-center gap-1 min-w-0">
                                  {event.recurrence && (
                                    <span
                                      className="opacity-60 flex-shrink-0"
                                      title="Recurring event"
                                    >
                                      ↻
                                    </span>
                                  )}
                                  <span className="truncate">
                                    {event.title}
                                  </span>
                                </span>
                                {event.consumption &&
                                  event.consumption.length > 0 && (
                                    <span
                                      className="text-[10px] leading-none rounded bg-black/40 px-1 py-0.5 font-semibold flex-shrink-0"
                                      title="Consumption"
                                    >
                                      {event.consumption.reduce(
                                        (a, b) => a + b,
                                        0,
                                      )}
                                    </span>
                                  )}
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
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem
                                onClick={() => onEventClick(event)}
                              >
                                Edit event
                              </ContextMenuItem>
                              {event.recurrence && (
                                <>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem
                                    onClick={() =>
                                      calendar.goToPreviousOccurrence(
                                        event.id,
                                        event.start,
                                      )
                                    }
                                  >
                                    ← Previous occurrence
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    onClick={() =>
                                      calendar.goToNextOccurrence(
                                        event.id,
                                        event.start,
                                      )
                                    }
                                  >
                                    Next occurrence →
                                  </ContextMenuItem>
                                </>
                              )}
                            </ContextMenuContent>
                          </ContextMenu>
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
            <div ref={rightSentinelRef} style={{ width: 1 }} aria-hidden />
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
  const [resources, setResources] = useState<Array<Resource>>(sampleResources)

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
    events: [],
    resources,
    timeZone: 'UTC',
    fetchEvents: async ({ start, end }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const startDate = new Date(start)
      const endDate = new Date(end)
      const resourceById = new Map(
        resources.map((resource) => [resource.id, resource]),
      )

      return MOCK_DB.filter((e) => {
        if (e.recurrence) return true
        const eStart = new Date(e.start as string)
        const eEnd = new Date(e.end as string)
        return eStart <= endDate && eEnd >= startDate
      }).map((event) => ({
        ...event,
        resources:
          event.resources
            ?.map((resource) => resourceById.get(resource.id))
            .filter((resource): resource is Resource => resource != null) ?? [],
      }))
    },
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

  const monthScrollRef = useRef<HTMLDivElement>(null)
  const monthBufferRef = useRef<{ start: string; end: string } | null>(null)
  if (monthBufferRef.current === null && calendar.days.length > 0) {
    monthBufferRef.current = {
      start: calendar.days[0].isoDate,
      end: calendar.days[calendar.days.length - 1].isoDate,
    }
  }

  const navDirectionRef = useRef<'none' | 'forward' | 'backward'>('none')
  const prevPeriodRef = useRef(calendar.currentPeriod)
  const prevScrollHeightRef = useRef(0)
  const needsScrollAdjRef = useRef(false)
  const [bufferVersion, setBufferVersion] = useState(0)

  useEffect(() => {
    if (navDirectionRef.current === 'none') return
    if (calendar.currentPeriod === prevPeriodRef.current) return
    prevPeriodRef.current = calendar.currentPeriod

    const direction = navDirectionRef.current
    navDirectionRef.current = 'none'

    if (calendar.days.length === 0 || !monthBufferRef.current) return
    const newStart = calendar.days[0].isoDate
    const newEnd = calendar.days[calendar.days.length - 1].isoDate
    monthBufferRef.current = {
      start:
        newStart < monthBufferRef.current.start
          ? newStart
          : monthBufferRef.current.start,
      end:
        newEnd > monthBufferRef.current.end
          ? newEnd
          : monthBufferRef.current.end,
    }

    if (direction === 'backward') {
      prevScrollHeightRef.current = monthScrollRef.current?.scrollHeight ?? 0
      needsScrollAdjRef.current = true
    }

    setBufferVersion((v) => v + 1)
  }, [calendar.currentPeriod, calendar.days])

  useLayoutEffect(() => {
    if (!needsScrollAdjRef.current) return
    needsScrollAdjRef.current = false
    const el = monthScrollRef.current
    if (el) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current
    }
  })

  const bufferedWeekGroups = useMemo(() => {
    void bufferVersion
    void calendar.days
    if (!monthBufferRef.current) return []
    const days = calendar.getDaysInRange(
      monthBufferRef.current.start,
      monthBufferRef.current.end,
    )
    return calendar.groupDaysBy({
      days,
      unit: 'week',
      fillMissingDays: true,
    })
  }, [
    bufferVersion,
    calendar.days,
    calendar.getDaysInRange,
    calendar.groupDaysBy,
  ])

  const { startSentinelRef: monthTopRef, endSentinelRef: monthBottomRef } =
    useInfiniteScroll({
      root: monthScrollRef,
      rootMargin: '120px 0px',
      cooldownMs: 1000,
      onReachStart: () => {
        const el = monthScrollRef.current
        if (!el || el.scrollHeight <= el.clientHeight) return
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

  const scheduleScrollRef = useRef<HTMLDivElement>(null)
  const scheduleBufferRef = useRef<{ start: string; end: string } | null>(null)
  const scheduleNavDirectionRef = useRef<'none' | 'forward' | 'backward'>(
    'none',
  )
  const prevSchedulePeriodRef = useRef(calendar.currentPeriod)
  const prevScheduleScrollWidthRef = useRef(0)
  const needsScheduleScrollAdjRef = useRef(false)
  const [scheduleBufferVersion, setScheduleBufferVersion] = useState(0)
  const prevViewModeUnitRef = useRef(calendar.viewMode.unit)

  if (prevViewModeUnitRef.current !== calendar.viewMode.unit) {
    prevViewModeUnitRef.current = calendar.viewMode.unit
    scheduleBufferRef.current = null
    prevSchedulePeriodRef.current = calendar.currentPeriod
    monthBufferRef.current =
      calendar.days.length > 0
        ? {
            start: calendar.days[0].isoDate,
            end: calendar.days[calendar.days.length - 1].isoDate,
          }
        : null
  }

  if (
    isScheduleView &&
    scheduleBufferRef.current === null &&
    scheduleDays.length > 0
  ) {
    scheduleBufferRef.current = {
      start: scheduleDays[0].isoDate,
      end: scheduleDays[scheduleDays.length - 1].isoDate,
    }
  }

  useEffect(() => {
    if (!isScheduleView) return
    if (calendar.currentPeriod === prevSchedulePeriodRef.current) return
    prevSchedulePeriodRef.current = calendar.currentPeriod

    let currentDays: typeof calendar.days
    if (calendar.viewMode.unit === 'day') {
      const currentDateStr = calendar.currentPeriod.split('[')[0]
      currentDays = calendar.days.filter(
        (day) =>
          day.date.toString({ calendarName: 'never' }) === currentDateStr,
      )
    } else {
      currentDays = calendar.days
    }

    if (currentDays.length === 0) return
    const newStart = currentDays[0].isoDate
    const newEnd = currentDays[currentDays.length - 1].isoDate

    if (scheduleNavDirectionRef.current === 'none') {
      scheduleBufferRef.current = { start: newStart, end: newEnd }
    } else {
      const direction = scheduleNavDirectionRef.current
      scheduleNavDirectionRef.current = 'none'
      const prev = scheduleBufferRef.current ?? {
        start: newStart,
        end: newEnd,
      }
      scheduleBufferRef.current = {
        start: newStart < prev.start ? newStart : prev.start,
        end: newEnd > prev.end ? newEnd : prev.end,
      }
      if (direction === 'backward') {
        prevScheduleScrollWidthRef.current =
          scheduleScrollRef.current?.scrollWidth ?? 0
        needsScheduleScrollAdjRef.current = true
      }
    }

    setScheduleBufferVersion((v) => v + 1)
  }, [
    calendar.currentPeriod,
    isScheduleView,
    calendar.viewMode.unit,
    calendar.days,
  ])

  useLayoutEffect(() => {
    if (!needsScheduleScrollAdjRef.current) return
    needsScheduleScrollAdjRef.current = false
    const el = scheduleScrollRef.current
    if (el) {
      el.scrollLeft += el.scrollWidth - prevScheduleScrollWidthRef.current
    }
  })

  const bufferedScheduleDays = useMemo(() => {
    void scheduleBufferVersion
    void calendar.days
    if (!scheduleBufferRef.current) return scheduleDays
    return calendar.getDaysInRange(
      scheduleBufferRef.current.start,
      scheduleBufferRef.current.end,
    )
  }, [
    scheduleBufferVersion,
    scheduleDays,
    calendar.days,
    calendar.getDaysInRange,
  ])

  const periodDayCount =
    calendar.viewMode.unit === 'day' ? 1 : scheduleDays.length || 7

  const {
    startSentinelRef: scheduleLeftRef,
    endSentinelRef: scheduleRightRef,
  } = useInfiniteScroll({
    root: scheduleScrollRef,
    rootMargin: '0px 50%',
    cooldownMs: 300,
    onReachStart: () => {
      const el = scheduleScrollRef.current
      if (!el || el.scrollWidth <= el.clientWidth) return
      if (!calendar.canGoPreviousPeriod() || calendar.isPending) return
      scheduleNavDirectionRef.current = 'backward'
      calendar.goToPreviousPeriod()
    },
    onReachEnd: () => {
      if (!calendar.canGoNextPeriod() || calendar.isPending) return
      scheduleNavDirectionRef.current = 'forward'
      calendar.goToNextPeriod()
    },
    disabled: !isScheduleView,
  })

  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      initialData: {
        ...emptyFormData,
        resourceId: resources[0]?.id ?? '',
      },
    })
  }

  const openEditModal = (event: Event<Resource>) => {
    const masterEvent = calendar.getMasterEvent(event)
    const eventProps = calendar.getEventProps(masterEvent)
    const startDate = new Date(eventProps.start)
    const endDate = new Date(eventProps.end)

    const rule = masterEvent.recurrence

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
        resourceId: masterEvent.resources?.[0]?.id ?? (resources[0]?.id || ''),
        consumption: masterEvent.consumption?.[0] ?? 1,
        recurrenceFrequency: rule?.frequency ?? 'none',
        recurrenceUntil: rule?.until ?? '',
      },
    })
  }

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: EventFormData) => {
    setIsSaving(true)
    try {
      const recurrence: RecurrenceRule | undefined =
        data.recurrenceFrequency !== 'none'
          ? {
              frequency: data.recurrenceFrequency,
              ...(data.recurrenceUntil ? { until: data.recurrenceUntil } : {}),
            }
          : undefined

      const start = `${data.startDate}T${data.startTime}:00`
      const end = `${data.endDate}T${data.endTime}:00`
      const selectedResource = resources.find((r) => r.id === data.resourceId)
      const eventResources = selectedResource ? [selectedResource] : []

      const result =
        modalState.mode === 'edit' && modalState.eventId
          ? await calendar.editEvent(modalState.eventId, {
              title: data.title,
              start,
              end,
              recurrence,
              resources: eventResources,
              consumption: [data.consumption],
            })
          : await calendar.addEvent({
              id: String(Date.now()),
              title: data.title,
              start,
              end,
              recurrence,
              resources: eventResources,
              consumption: [data.consumption],
            })

      if (!result.success) {
        setResizeError(result.error)
        throw new Error('Validation failed')
      }
    } finally {
      setIsSaving(false)
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

          <Button
            onClick={calendar.undo}
            disabled={!calendar.canUndo()}
            variant="outline"
            title="Undo"
          >
            ↩ Undo
          </Button>
          <Button
            onClick={calendar.redo}
            disabled={!calendar.canRedo()}
            variant="outline"
            title="Redo"
          >
            ↪ Redo
          </Button>

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

        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            Capacity Controls
          </div>
          <div className="flex flex-wrap gap-3">
            {resources.map((resource) => {
              const currentCapacity = resource.capacity?.[0] ?? 1
              return (
                <div
                  key={resource.id}
                  className="flex items-center gap-2 rounded-md border border-neutral-800 bg-black px-3 py-2"
                >
                  <span className="text-sm text-neutral-300">
                    {resource.label}
                  </span>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={currentCapacity}
                    onChange={(e) => {
                      const nextCapacity = Math.max(
                        1,
                        Number(e.target.value) || 1,
                      )
                      setResources((prev) =>
                        prev.map((r) =>
                          r.id === resource.id
                            ? { ...r, capacity: [nextCapacity] }
                            : r,
                        ),
                      )
                    }}
                    className="h-8 w-24"
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-lg font-medium text-neutral-400">
          {calendar.formatCurrentPeriod()}
        </div>
      </div>

      {isScheduleView ? (
        <ScheduleView
          calendar={calendar}
          days={bufferedScheduleDays}
          resources={resources}
          onEventClick={openEditModal}
          scrollRef={scheduleScrollRef}
          leftSentinelRef={scheduleLeftRef}
          rightSentinelRef={scheduleRightRef}
          periodDayCount={periodDayCount}
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
                (
                  week: Array<Day<Resource, Event<Resource>> | null>,
                  weekIndex: number,
                ) => {
                  const weekKey =
                    week.find((d) => d !== null)?.isoDate ?? `w-${weekIndex}`
                  return week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${weekKey}-${dayIndex}`}
                          className={`h-[120px] bg-neutral-950/50 ${
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
                        className={`h-[120px] p-2 relative flex flex-col overflow-hidden ${
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
                          className={`text-sm mb-1 flex-shrink-0 ${
                            isToday
                              ? 'font-bold text-white'
                              : isInCurrentPeriod
                                ? 'font-medium text-neutral-200'
                                : 'font-medium text-neutral-500'
                          }`}
                        >
                          {day.date.day}
                        </div>
                        <div className="flex flex-col gap-1 overflow-hidden flex-1 min-h-0">
                          {day.events.slice(0, 3).map((event) => (
                            <ContextMenu key={event.id}>
                              <ContextMenuTrigger className="contents">
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-muted flex items-center gap-1.5 max-w-full flex-shrink-0 w-full"
                                  title={event.title}
                                  onClick={() => openEditModal(event)}
                                >
                                  <span className="flex items-center gap-1 min-w-0">
                                    {event.recurrence && (
                                      <span
                                        className="opacity-60 flex-shrink-0"
                                        title="Recurring event"
                                      >
                                        ↻
                                      </span>
                                    )}
                                    <span className="truncate">
                                      {event.title}
                                    </span>
                                  </span>
                                  {event.consumption &&
                                    event.consumption.length > 0 && (
                                      <span
                                        className="text-[10px] leading-none rounded bg-black/40 px-1 py-0.5 font-semibold flex-shrink-0"
                                        title="Consumption"
                                      >
                                        {event.consumption.reduce(
                                          (a, b) => a + b,
                                          0,
                                        )}
                                      </span>
                                    )}
                                </Badge>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem
                                  onClick={() => openEditModal(event)}
                                >
                                  Edit event
                                </ContextMenuItem>
                                {event.recurrence && (
                                  <>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                      onClick={() =>
                                        calendar.goToPreviousOccurrence(
                                          event.id,
                                          event.start,
                                        )
                                      }
                                    >
                                      ← Previous occurrence
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      onClick={() =>
                                        calendar.goToNextOccurrence(
                                          event.id,
                                          event.start,
                                        )
                                      }
                                    >
                                      Next occurrence →
                                    </ContextMenuItem>
                                  </>
                                )}
                              </ContextMenuContent>
                            </ContextMenu>
                          ))}
                          {day.events.length > 3 && (
                            <div className="text-[10px] text-neutral-400 px-1 flex-shrink-0">
                              +{day.events.length - 3} more
                            </div>
                          )}
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
        isSaving={isSaving}
        resources={resources}
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
