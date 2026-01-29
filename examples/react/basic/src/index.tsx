import { useCalendar } from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import type { Day, Event, Resource } from '@tanstack/time'
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
    },
    {
      id: '2',
      title: 'Project Review',
      start: `${formatDateToISO(dayAfterTomorrow)}T14:00:00`,
      end: `${formatDateToISO(dayAfterTomorrow)}T15:30:00`,
    },
    {
      id: '3',
      title: 'Multi-day Conference',
      start: `${formatDateToISO(threeDaysLater)}T09:00:00`,
      end: `${formatDateToISO(fourDaysLater)}T17:00:00`,
    },
    {
      id: '4',
      title: 'Lunch Break',
      start: `${formatDateToISO(threeDaysLater)}T12:00:00`,
      end: `${formatDateToISO(threeDaysLater)}T13:00:00`,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'add' ? 'Add Event' : 'Edit Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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

const MINUTES_IN_DAY = 24 * 60

interface ResizeHandleProps {
  edge: 'top' | 'bottom'
  onMouseDown: (e: React.MouseEvent) => void
}

function ResizeHandle({ edge, onMouseDown }: ResizeHandleProps) {
  return (
    <div
      data-resize-handle
      className={`absolute left-0 right-0 h-3 cursor-ns-resize z-30 bg-transparent hover:bg-blue-300/50 pointer-events-auto ${
        edge === 'top' ? 'top-0' : 'bottom-0'
      }`}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        // Prevent event click from firing when clicking resize handle
        e.stopPropagation()
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-white/70 rounded opacity-50 group-hover:opacity-100 transition-opacity ${
          edge === 'top' ? 'top-1' : 'bottom-1'
        }`}
      />
    </div>
  )
}

function calculatePreviewStyleForSegment(
  previewStart: string,
  previewEnd: string,
  segmentStart: string,
  segmentEnd: string,
  edge: 'top' | 'bottom' | null,
): { top: string; height: string } | null {
  const previewStartDate = new Date(previewStart)
  const previewEndDate = new Date(previewEnd)
  const segmentStartDate = new Date(segmentStart)
  const segmentEndDate = new Date(segmentEnd)

  // Get the date part (YYYY-MM-DD) for comparison
  const segmentDate = segmentStart.split('T')[0]
  const previewStartDateStr = previewStart.split('T')[0]
  const previewEndDateStr = previewEnd.split('T')[0]

  let effectiveStart: Date
  let effectiveEnd: Date

  if (edge === 'top') {
    // For top edge resize, check if preview start is on the same day as segment
    if (previewStartDateStr !== segmentDate) {
      // Preview start is on a different day, use segment start
      effectiveStart = segmentStartDate
    } else {
      effectiveStart = previewStartDate
    }
    effectiveEnd = segmentEndDate
  } else if (edge === 'bottom') {
    // For bottom edge resize, check if preview end is on the same day as segment
    effectiveStart = segmentStartDate
    if (previewEndDateStr !== segmentDate) {
      // Preview end is on a different day, use segment end (end of day)
      effectiveEnd = new Date(segmentDate + 'T23:59:59')
    } else {
      effectiveEnd = previewEndDate
    }
  } else {
    // For both edges or no edge specified, check if preview spans this segment's day
    if (previewStartDateStr === segmentDate && previewEndDateStr === segmentDate) {
      // Both preview times are on the same day as segment
      effectiveStart = previewStartDate
      effectiveEnd = previewEndDate
    } else if (previewStartDateStr === segmentDate) {
      // Only start is on this day
      effectiveStart = previewStartDate
      effectiveEnd = new Date(segmentDate + 'T23:59:59')
    } else if (previewEndDateStr === segmentDate) {
      // Only end is on this day
      effectiveStart = new Date(segmentDate + 'T00:00:00')
      effectiveEnd = previewEndDate
    } else {
      // Preview doesn't span this day at all
      return null
    }
  }

  const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes()
  const endMinutes = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes()
  const durationMinutes = endMinutes - startMinutes

  if (durationMinutes <= 0) return null

  const topPercent = (startMinutes / MINUTES_IN_DAY) * 100
  const heightPercent = (durationMinutes / MINUTES_IN_DAY) * 100

  return {
    top: `${topPercent}%`,
    height: `${Math.max(heightPercent, (30 / MINUTES_IN_DAY) * 100)}%`,
  }
}

// Calculate style for original segment when resizing spans multiple days
function calculateOriginalSegmentStyleForMultiDay(
  originalStart: string,
  originalEnd: string,
  edge: 'top' | 'bottom' | null,
  isSpanningMultipleDays: boolean,
): { top: string; height: string } | null {
  if (!isSpanningMultipleDays) return null

  const startDate = new Date(originalStart)
  const endDate = new Date(originalEnd)

  let startMinutes: number
  let endMinutes: number

  if (edge === 'bottom') {
    // Resizing bottom to next day: original shows from start to end of day
    startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
    endMinutes = MINUTES_IN_DAY // 23:59 (end of day)
  } else if (edge === 'top') {
    // Resizing top to previous day: original shows from start of day to end
    startMinutes = 0 // 00:00 (start of day)
    endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
  } else {
    return null
  }

  const durationMinutes = endMinutes - startMinutes
  if (durationMinutes <= 0) return null

  const topPercent = (startMinutes / MINUTES_IN_DAY) * 100
  const heightPercent = (durationMinutes / MINUTES_IN_DAY) * 100

  return {
    top: `${topPercent}%`,
    height: `${Math.max(heightPercent, (30 / MINUTES_IN_DAY) * 100)}%`,
  }
}

// Calculate style for ghost preview on target day
function calculateGhostPreviewStyle(
  previewStart: string,
  previewEnd: string,
  edge: 'top' | 'bottom' | null,
): { top: string; height: string } | null {
  const previewStartDate = new Date(previewStart)
  const previewEndDate = new Date(previewEnd)

  let startMinutes: number
  let endMinutes: number

  if (edge === 'bottom') {
    // Resizing bottom to next day: ghost starts at 00:00 and ends at preview end time
    startMinutes = 0
    endMinutes = previewEndDate.getHours() * 60 + previewEndDate.getMinutes()
  } else if (edge === 'top') {
    // Resizing top to previous day: ghost starts at preview start time and ends at 23:59
    startMinutes = previewStartDate.getHours() * 60 + previewStartDate.getMinutes()
    endMinutes = MINUTES_IN_DAY
  } else {
    startMinutes = previewStartDate.getHours() * 60 + previewStartDate.getMinutes()
    endMinutes = previewEndDate.getHours() * 60 + previewEndDate.getMinutes()
  }

  const durationMinutes = endMinutes - startMinutes
  if (durationMinutes <= 0) return null

  const topPercent = (startMinutes / MINUTES_IN_DAY) * 100
  const heightPercent = (durationMinutes / MINUTES_IN_DAY) * 100

  return {
    top: `${topPercent}%`,
    height: `${Math.max(heightPercent, (30 / MINUTES_IN_DAY) * 100)}%`,
  }
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
  const { resizeState, getResizeHandleProps } = calendar

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="w-20 border-r border-gray-200 bg-gray-50">
        <div className="h-12 border-b border-gray-200"></div>
        {timeSlots.map((slot) => (
          <div
            key={`${slot.hour}-${slot.minute}`}
            className="h-[60px] border-b border-gray-100 px-2 py-1 text-xs text-gray-500"
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
                  className="border-r border-gray-200 last:border-r-0"
                  data-day-date={dayDate}
                >
                  <div className="h-12 border-b border-gray-200 bg-gray-50 px-3 py-2 text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      {dayName}
                    </div>
                    <div className="text-xs text-gray-500">{day.date.day}</div>
                  </div>
                  <div className="relative h-[1440px]">
                    {day.events.map((event, eventIndex) => {
                      const eventProps = calendar.getEventProps(event)
                      const { style, isSplitEvent } = eventProps

                      const originalStart = event._originalStart ?? event.start
                      const originalEnd = event._originalEnd ?? event.end
                      const originalStartDate = originalStart.split('T')[0]
                      const originalEndDate = originalEnd.split('T')[0]
                      const segmentStartDate = eventProps.start.split('T')[0]
                      const segmentEndDate = eventProps.end.split('T')[0]

                      // First segment: this segment's start date matches the original event's start date
                      const isFirstSegment = originalStartDate === segmentStartDate

                      // Last segment: this segment's date matches the original event's end date
                      const isLastSegment =
                        originalEndDate === segmentEndDate ||
                        originalEndDate === segmentStartDate

                      const isBeingResized =
                        resizeState.isResizing && resizeState.eventId === event.id

                      // Check if this event is being resized
                      const isThisSegmentBeingResized =
                        isBeingResized &&
                        ((resizeState.edge === 'top' && isFirstSegment) ||
                          (resizeState.edge === 'bottom' && isLastSegment))

                      // Check if resize is spanning multiple days
                      const segmentDate = eventProps.start.split('T')[0]
                      const isSpanningMultipleDays =
                        isThisSegmentBeingResized &&
                        resizeState.targetDayDate !== null &&
                        resizeState.targetDayDate !== segmentDate

                      // Calculate display style based on resize state
                      let previewStyle: { top: string; height: string } | null = null
                      let shouldHideSegment = false

                      if (isBeingResized && resizeState.previewStart && resizeState.previewEnd) {
                        const previewStartDateStr = resizeState.previewStart.split('T')[0]
                        const previewEndDateStr = resizeState.previewEnd.split('T')[0]

                        // Check if this segment's day is within the preview range
                        const previewAffectsThisDay =
                          previewStartDateStr === dayDate ||
                          previewEndDateStr === dayDate ||
                          (previewStartDateStr < dayDate && previewEndDateStr > dayDate)

                        // Check if this segment is being shrunk away (not in preview range anymore)
                        const isBeingShrunkAway =
                          isThisSegmentBeingResized && !previewAffectsThisDay

                        if (isBeingShrunkAway) {
                          // This segment is being removed by the resize, hide it
                          shouldHideSegment = true
                        } else if (isThisSegmentBeingResized && isSpanningMultipleDays && previewAffectsThisDay) {
                          // Extending to another day - use multi-day style
                          previewStyle = calculateOriginalSegmentStyleForMultiDay(
                            eventProps.start,
                            eventProps.end,
                            resizeState.edge,
                            true,
                          )
                        } else if (isThisSegmentBeingResized && !isSpanningMultipleDays) {
                          // Normal resize within same day
                          previewStyle = calculatePreviewStyleForSegment(
                            resizeState.previewStart,
                            resizeState.previewEnd,
                            eventProps.start,
                            eventProps.end,
                            resizeState.edge,
                          )
                        } else if (!isThisSegmentBeingResized && previewAffectsThisDay) {
                          // This segment is newly affected by the resize (e.g., shrinking to this day)
                          // Check if this is the new "last segment" for bottom resize
                          const isNewLastSegment =
                            resizeState.edge === 'bottom' && previewEndDateStr === dayDate
                          const isNewFirstSegment =
                            resizeState.edge === 'top' && previewStartDateStr === dayDate

                          if (isNewLastSegment || isNewFirstSegment) {
                            previewStyle = calculatePreviewStyleForSegment(
                              resizeState.previewStart,
                              resizeState.previewEnd,
                              eventProps.start,
                              eventProps.end,
                              resizeState.edge,
                            )
                          }
                        }
                      }

                      // Skip rendering if segment is being shrunk away
                      if (shouldHideSegment) {
                        return null
                      }

                      const displayStyle = previewStyle
                        ? { ...style, ...previewStyle }
                        : style

                      // Calculate display times based on preview
                      let displayStart = eventProps.start
                      let displayEnd = eventProps.end

                      if (isBeingResized && resizeState.previewStart && resizeState.previewEnd) {
                        const previewEndDateStr = resizeState.previewEnd.split('T')[0]
                        const previewStartDateStr = resizeState.previewStart.split('T')[0]

                        if (resizeState.edge === 'top') {
                          // For top edge resize, update start if this is the new first segment
                          if (previewStartDateStr === dayDate) {
                            displayStart = resizeState.previewStart
                          }
                        } else if (resizeState.edge === 'bottom') {
                          // For bottom edge resize, update end if this is the new last segment
                          if (previewEndDateStr === dayDate) {
                            displayEnd = resizeState.previewEnd
                          } else if (isThisSegmentBeingResized && previewEndDateStr !== segmentDate) {
                            // Extending to next day - show end of day for current segment
                            displayEnd = `${segmentDate}T23:59:00`
                          }
                        }
                      }

                      // For multi-day events, show handles on first/last segments
                      // For single-day events, show both handles
                      const showTopHandle = !isSplitEvent || isFirstSegment

                      // Show bottom handle if:
                      // 1. Not a split event (single day), OR
                      // 2. This is the last segment (matches original event's end date)
                      const showBottomHandle = !isSplitEvent || isLastSegment

                      // Check if this segment is being actively resized (original or new target)
                      const isActivelyResized = isBeingResized && previewStyle !== null

                      return (
                        <div
                          key={`${event.id}-${eventIndex}`}
                          className={`group absolute bg-blue-500 text-white rounded px-2 py-1 text-xs font-medium overflow-hidden transition-colors ${
                            isActivelyResized
                              ? 'bg-blue-600 ring-2 ring-blue-300 z-20'
                              : 'cursor-pointer hover:bg-blue-600'
                          }`}
                          title={event.title}
                          style={displayStyle}
                          onClick={(e) => {
                            // Don't trigger event click if clicking on resize handle
                            if (
                              !resizeState.isResizing &&
                              !(e.target as HTMLElement).closest('[data-resize-handle]')
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
                                event._originalStart ?? event.start,
                                event._originalEnd ?? event.end,
                              )}
                            />
                          )}
                          <div className="font-semibold pt-1">{event.title}</div>
                          {displayStyle && parseFloat(displayStyle.height) > 2 && (
                            <div className="text-xs opacity-90 mt-0.5">
                              {new Date(displayStart).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                              {' - '}
                              {new Date(displayEnd).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                          {showBottomHandle && (
                            <ResizeHandle
                              edge="bottom"
                              {...getResizeHandleProps(
                                event.id,
                                'bottom',
                                event._originalStart ?? event.start,
                                event._originalEnd ?? event.end,
                              )}
                            />
                          )}
                        </div>
                      )
                    })}
                    {/* Ghost preview on target day when resizing across days */}
                    {resizeState.isResizing &&
                      resizeState.targetDayDate === dayDate &&
                      resizeState.previewStart &&
                      resizeState.previewEnd &&
                      (() => {
                        const previewStartDate = resizeState.previewStart.split('T')[0]
                        const previewEndDate = resizeState.previewEnd.split('T')[0]

                        const eventOnThisDay = day.events.some(
                          (e) => e.id === resizeState.eventId,
                        )
                        const isDayInPreviewRange =
                          dayDate >= previewStartDate && dayDate <= previewEndDate

                        if (!eventOnThisDay && isDayInPreviewRange) {
                          const ghostStyle = calculateGhostPreviewStyle(
                            resizeState.previewStart,
                            resizeState.previewEnd,
                            resizeState.edge,
                          )

                          if (!ghostStyle) return null

                          // Calculate display times for the ghost
                          const ghostStartTime = resizeState.edge === 'bottom'
                            ? '00:00'
                            : new Date(resizeState.previewStart).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                          const ghostEndTime = resizeState.edge === 'top'
                            ? '11:59 PM'
                            : new Date(resizeState.previewEnd).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })

                          return (
                            <div
                              className="absolute bg-blue-500/70 text-white rounded px-2 py-1 text-xs font-medium overflow-hidden ring-2 ring-blue-300 z-20"
                              style={ghostStyle}
                            >
                              <div className="font-semibold pt-1 opacity-70">
                                {ghostStartTime} - {ghostEndTime}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })()}
                  </div>
                </div>
              )
            })}
          </div>
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

  const calendar = useCalendar<Resource, Event<Resource>>({
    viewMode: { value: 1, unit: 'month' },
    events: sampleEvents,
    timeZone: 'UTC',
    resize: {
      enabled: true,
      containerHeight: 1440,
      constraints: {
        minDurationMinutes: 15,
        snapToMinutes: 15,
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
    <div className="p-5 font-sans max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="m-0 mb-4 text-[28px] font-semibold">
          TanStack Time - Calendar Example
        </h1>

        <div className="flex gap-3 items-center mb-4">
          <button
            onClick={calendar.goToPreviousPeriod}
            disabled={!calendar.canGoPreviousPeriod() || calendar.isPending}
            className={`px-4 py-2 border border-gray-300 rounded-md bg-white ${
              calendar.canGoPreviousPeriod() && !calendar.isPending
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={calendar.goToCurrentPeriod}
            disabled={calendar.isPending}
            className={`px-4 py-2 border border-gray-300 rounded-md bg-white ${
              calendar.isPending
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer opacity-100'
            }`}
          >
            Today
          </button>

          <button
            onClick={calendar.goToNextPeriod}
            disabled={!calendar.canGoNextPeriod() || calendar.isPending}
            className={`px-4 py-2 border border-gray-300 rounded-md bg-white ${
              calendar.canGoNextPeriod() && !calendar.isPending
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            Next →
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
          >
            + Add Event
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'month' })
              }
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                calendar.viewMode.unit === 'month'
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'week' })
              }
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                calendar.viewMode.unit === 'week'
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => calendar.changeViewMode({ value: 1, unit: 'day' })}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                calendar.viewMode.unit === 'day'
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        <div className="text-lg font-medium text-gray-700">
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
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div
            className="grid border-b-2 border-gray-200 bg-gray-50"
            style={{ gridTemplateColumns: `repeat(${dayNames.length}, 1fr)` }}
          >
            {dayNames.map((dayName: string, index: number) => (
              <div
                key={index}
                className={`py-3 text-center font-semibold text-sm text-gray-500 ${
                  index < dayNames.length - 1 ? 'border-r border-gray-200' : ''
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
                        className={`min-h-[120px] bg-gray-50 ${
                          dayIndex < dayNames.length - 1
                            ? 'border-r border-gray-200'
                            : ''
                        } ${
                          weekIndex < groupedDays.length - 1
                            ? 'border-b border-gray-200'
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
                          ? 'border-r border-gray-200'
                          : ''
                      } ${
                        weekIndex < groupedDays.length - 1
                          ? 'border-b border-gray-200'
                          : ''
                      } ${
                        isToday
                          ? 'bg-blue-50'
                          : isInCurrentPeriod
                            ? 'bg-white'
                            : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className={`text-sm mb-1 ${
                          isToday
                            ? 'font-bold text-blue-500'
                            : isInCurrentPeriod
                              ? 'font-medium text-gray-900'
                              : 'font-medium text-gray-400'
                        }`}
                      >
                        {day.date.day}
                      </div>
                      <div className="flex flex-col gap-1">
                        {day.events.map((event) => (
                          <div
                            key={event.id}
                            className="px-1.5 py-1 bg-blue-500 text-white rounded text-xs font-medium cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:bg-blue-600 transition-colors"
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
        <div className="fixed top-5 right-5 px-5 py-3 bg-blue-500 text-white rounded-md text-sm font-medium shadow-lg">
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
    </div>
  )
}

function App() {
  return <CalendarView />
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
