import {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  formatEventTimeRange,
  getSegmentInfo,
  useCalendar,
} from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'
import type { Day, Event, ResizeError, Resource } from '@tanstack/time'

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

const sampleResources: Array<Resource> = [
  {
    id: '1',
    label: 'Resource 1',
    capacity: 1,
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
    capacity: 1,
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

function getSampleEvents(): Array<Event<Resource>> {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)

  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)

  const fourDaysLater = new Date(today)
  fourDaysLater.setDate(today.getDate() + 4)

  return [
    {
      id: '1',
      title: 'Team Meeting',
      start: `${formatDateToISO(tomorrow)}T10:00:00`,
      end: `${formatDateToISO(tomorrow)}T11:00:00`,
      resources: sampleResources,
    },
    {
      id: '2',
      title: 'Project Review',
      start: `${formatDateToISO(dayAfterTomorrow)}T14:00:00`,
      end: `${formatDateToISO(dayAfterTomorrow)}T15:30:00`,
      resources: sampleResources,
    },
    {
      id: '3',
      title: 'Multi-day Conference',
      start: `${formatDateToISO(threeDaysLater)}T09:00:00`,
      end: `${formatDateToISO(fourDaysLater)}T17:00:00`,
      resources: sampleResources,
    },
    {
      id: '4',
      title: 'Lunch Break',
      start: `${formatDateToISO(threeDaysLater)}T12:00:00`,
      end: `${formatDateToISO(threeDaysLater)}T13:00:00`,
      resources: sampleResources,
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
}

const emptyFormData: EventFormData = {
  title: '',
  startDate: formatDateToISO(new Date()),
  startTime: '09:00',
  endDate: formatDateToISO(new Date()),
  endTime: '10:00',
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
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600"
              required
            />
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
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600"
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
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600"
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
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600"
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
                className="px-4 py-2 border border-neutral-700 rounded-md text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
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
        <div className="flex-1 overflow-x-auto">
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

                        const segmentInfo = getSegmentInfo(event)
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
          <button
            onClick={onDismiss}
            className="text-red-400/60 hover:text-red-200 transition-colors"
          >
            ✕
          </button>
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
  const groupedDays = calendar.groupDaysBy({
    days: calendar.days,
    unit: 'week',
    fillMissingDays: true,
  })

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

  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      initialData: emptyFormData,
    })
  }

  const openEditModal = (event: Event<Resource>) => {
    const eventProps = calendar.getEventProps(event)
    const startDate = new Date(eventProps.start)
    const endDate = new Date(eventProps.end)

    setModalState({
      isOpen: true,
      mode: 'edit',
      eventId: event.id,
      initialData: {
        title: event.title,
        startDate: formatDateToISO(startDate),
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: formatDateToISO(endDate),
        endTime: endDate.toTimeString().slice(0, 5),
      },
    })
  }

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleSave = (data: EventFormData) => {
    const eventData = {
      title: data.title,
      start: `${data.startDate}T${data.startTime}:00`,
      end: `${data.endDate}T${data.endTime}:00`,
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
          <button
            onClick={calendar.goToPreviousPeriod}
            disabled={!calendar.canGoPreviousPeriod() || calendar.isPending}
            className={`px-4 py-2 border rounded-md ${
              calendar.canGoPreviousPeriod() && !calendar.isPending
                ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-500'
                : 'border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={calendar.goToCurrentPeriod}
            disabled={calendar.isPending}
            className={`px-4 py-2 border border-neutral-600 rounded-md text-neutral-200 hover:bg-neutral-800 hover:border-neutral-500 ${
              calendar.isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Today
          </button>

          <button
            onClick={calendar.goToNextPeriod}
            disabled={!calendar.canGoNextPeriod() || calendar.isPending}
            className={`px-4 py-2 border rounded-md ${
              calendar.canGoNextPeriod() && !calendar.isPending
                ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-500'
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
            <button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'month' })
              }
              className={`px-3 py-1.5 rounded-md border ${
                calendar.viewMode.unit === 'month'
                  ? 'border-neutral-500 bg-neutral-800 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'week' })
              }
              className={`px-3 py-1.5 rounded-md border ${
                calendar.viewMode.unit === 'week'
                  ? 'border-neutral-500 bg-neutral-800 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => calendar.changeViewMode({ value: 1, unit: 'day' })}
              className={`px-3 py-1.5 rounded-md border ${
                calendar.viewMode.unit === 'day'
                  ? 'border-neutral-500 bg-neutral-800 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
              }`}
            >
              Day
            </button>
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
          <div
            className="grid border-b border-neutral-800 bg-neutral-950"
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

          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${dayNames.length}, 1fr)` }}
          >
            {groupedDays.map(
              (
                week: Array<Day<Resource, Event<Resource>> | null>,
                weekIndex: number,
              ) =>
                week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className={`min-h-[120px] bg-neutral-950/50 ${
                          dayIndex < dayNames.length - 1
                            ? 'border-r border-neutral-800'
                            : ''
                        } ${
                          weekIndex < groupedDays.length - 1
                            ? 'border-b border-neutral-800'
                            : ''
                        }`}
                      />
                    )
                  }

                  const isToday = day.isToday
                  const isInCurrentPeriod = day.isInCurrentPeriod

                  return (
                    <div
                      key={day.date.toString()}
                      className={`min-h-[120px] p-2 relative ${
                        dayIndex < dayNames.length - 1
                          ? 'border-r border-neutral-800'
                          : ''
                      } ${
                        weekIndex < groupedDays.length - 1
                          ? 'border-b border-neutral-800'
                          : ''
                      } ${
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
                          <div
                            key={event.id}
                            className="px-1.5 py-1 bg-neutral-800 text-neutral-200 rounded text-xs font-medium cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:bg-neutral-700 border border-neutral-700 transition-colors"
                            title={event.title}
                            onClick={() => openEditModal(event)}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }),
            )}
          </div>
        </div>
      )}

      {calendar.isPending && (
        <div className="fixed top-5 right-5 px-5 py-3 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md text-sm font-medium">
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
