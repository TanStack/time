import {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  formatEventTimeRange,
  useCalendar,
} from '@tanstack/react-time'
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventMoveFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
} from '@tanstack/time'
import { DragDropProvider, PointerSensor, useDraggable, useDroppable } from '@dnd-kit/react'
import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import type { Day, Event, ResizeError, Resource } from '@tanstack/time'
import { Button } from '@/components/ui/button'

import './index.css'

const features = calendarFeatures([
  eventRecurrenceFeature,
  dayEventLayoutFeature,
  eventMoveFeature,
  eventResizeFeature,
])

interface DemoEvent extends Event<Resource> {
  categoryId: string
}

type DragCalendar = ReturnType<typeof useCalendar<typeof features, Resource, DemoEvent>>

type EventDragData = {
  event: DemoEvent
  dayDate: string
  originalStart: string
  originalEnd: string
}

type DayDropData = { isoDate: string }

type ErrorToast = { title: string; error: ResizeError }

const eventClassByCategory: Record<string, string> = {
  work: 'bg-blue-900/80 border-blue-700/60 hover:bg-blue-800/90',
  team: 'bg-emerald-900/80 border-emerald-700/60 hover:bg-emerald-800/90',
  personal: 'bg-purple-900/80 border-purple-700/60 hover:bg-purple-800/90',
}

function thisWeekAt(weekday: number, hour: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - date.getUTCDay() + weekday)
  date.setUTCHours(0, hour * 60, 0, 0)
  return date.toISOString().slice(0, 19)
}

function thisWeekSpan(weekday: number, startHour: number, endHour: number) {
  return { start: thisWeekAt(weekday, startHour), end: thisWeekAt(weekday, endHour) }
}

const events: Array<DemoEvent> = [
  { id: '1', title: 'Team standup', categoryId: 'team', ...thisWeekSpan(1, 9, 9.5) },
  { id: '2', title: 'Design review', categoryId: 'work', ...thisWeekSpan(2, 11, 12.5) },
  { id: '3', title: 'Lunch with Sam', categoryId: 'personal', ...thisWeekSpan(2, 12, 13) },
  { id: '4', title: 'Planning', categoryId: 'work', ...thisWeekSpan(3, 14, 16) },
  { id: '5', title: 'Retro', categoryId: 'team', ...thisWeekSpan(5, 15, 16) },
]

const DRAG_GROUP_ATTRIBUTE = 'data-drag-group'

function dragGroupSiblings(eventId: string): Array<HTMLElement> {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      `[${DRAG_GROUP_ATTRIBUTE}="${eventId}"]:not([data-dnd-dragging]):not([data-dnd-placeholder])`,
    ),
  )
}

function translateDragGroup(eventId: string, translate: string | null) {
  for (const element of dragGroupSiblings(eventId)) {
    element.style.translate = translate ?? ''
    element.style.zIndex = translate ? '40' : ''
  }
}

const eventDragSensors = [
  PointerSensor.configure({
    preventActivation: (event) =>
      event.target instanceof Element && event.target.closest('[data-resize-handle]') !== null,
  }),
]

function EventDragSource({
  data,
  disabled,
  children,
}: {
  data: EventDragData
  disabled: boolean
  children: (drag: {
    ref: (element: Element | null) => void
    isDragging: boolean
  }) => React.ReactNode
}) {
  const { ref, isDragging } = useDraggable<EventDragData>({
    id: `event-${data.event.id}-${data.dayDate}`,
    data,
    disabled,
    feedback: 'clone',
    sensors: eventDragSensors,
  })
  return <>{children({ ref, isDragging })}</>
}

function DayDropZone({ day, calendar }: { day: Day<Resource, DemoEvent>; calendar: DragCalendar }) {
  const { ref, isDropTarget } = useDroppable<DayDropData>({
    id: `day-${day.isoDate}`,
    data: { isoDate: day.isoDate },
  })
  const { ref: columnRef } = calendar.getDayColumnProps(day.isoDate)
  const dayParts = calendar.getDateParts(day.isoDate)
  const { resizeState } = calendar
  const isResizingElsewhere =
    resizeState.isResizing && !day.events.some((event) => event.id === resizeState.eventId)
  const ghost =
    isResizingElsewhere && resizeState.previewStart && resizeState.previewEnd
      ? {
          style: calculateGhostPreviewStyle({
            dayDate: day.isoDate,
            previewStart: resizeState.previewStart,
            previewEnd: resizeState.previewEnd,
          }),
          timeRange: formatEventTimeRange(resizeState.previewStart, resizeState.previewEnd),
        }
      : null

  return (
    <div
      ref={(element) => {
        ref(element)
        columnRef(element)
      }}
      className={`border-r border-neutral-800 last:border-r-0 ${isDropTarget ? 'ring-1 ring-inset ring-neutral-500' : ''}`}
    >
      <div className="h-12 border-b border-neutral-800 bg-neutral-950 px-3 py-1 text-center">
        <div className={`text-sm font-semibold ${day.isToday ? 'text-white' : 'text-neutral-400'}`}>
          {dayParts.weekdayShort} - {dayParts.dayOfMonth} {dayParts.monthShort}
        </div>
      </div>
      <div className="relative h-360 bg-neutral-950/30">
        {day.events.map((event) => (
          <ScheduleEvent key={event.id} calendar={calendar} event={event} dayDate={day.isoDate} />
        ))}
        {ghost?.style && (
          <div
            className="absolute bg-neutral-700/60 text-neutral-200 rounded px-2 py-1 text-xs font-medium overflow-hidden border border-neutral-600 border-dashed z-20"
            style={ghost.style}
          >
            <div className="font-semibold pt-1 opacity-80">{ghost.timeRange.rangeFormatted}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarView() {
  const [errorToast, setErrorToast] = useState<ErrorToast | null>(null)

  const calendar = useCalendar<typeof features, Resource, DemoEvent>({
    features,
    viewMode: { value: 1, unit: 'week' },
    timeZone: 'UTC',
    locale: 'en-US',
    events,
    resize: {
      containerHeight: 1440,
      constraints: { minDurationMinutes: 15, snapToMinutes: 15 },
      onResizeError: (error) => setErrorToast({ title: 'Cannot Resize Event', error }),
    },
    move: {
      containerHeight: 1440,
      constraints: { snapToMinutes: 15 },
      onMoveError: (error) => setErrorToast({ title: 'Cannot Move Event', error }),
    },
  })

  return (
    <DragDropProvider
      onDragStart={(e) => {
        const source = e.operation.source?.data as EventDragData | undefined
        if (!source) return
        const { event, ...segment } = source
        calendar.startEventMove({ eventId: event.id, ...segment })
      }}
      onDragMove={(e) => {
        const source = e.operation.source?.data as EventDragData | undefined
        if (!source) return
        const { x, y } = e.operation.transform
        translateDragGroup(source.event.id, `${x}px ${y}px`)
        calendar.updateEventMove({
          dayDate: (e.operation.target?.data as DayDropData | undefined)?.isoDate,
          deltaPixels: y,
        })
      }}
      onDragEnd={(e) => {
        const source = e.operation.source?.data as EventDragData | undefined
        if (source) translateDragGroup(source.event.id, null)
        if (e.canceled) calendar.cancelEventMove()
        else calendar.endEventMove()
      }}
    >
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
            <span className="ml-auto text-sm text-neutral-500">
              Drag an event to move it, drag its top or bottom edge to resize, Esc cancels a move.
            </span>
          </div>
          <div className="text-lg font-medium text-neutral-400">{calendar.formatPeriodLabel()}</div>
        </div>

        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black select-none">
          <div className="flex">
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
              style={{ gridTemplateColumns: `repeat(${calendar.days.length}, minmax(0, 1fr))` }}
            >
              {calendar.days.map((day) => (
                <DayDropZone key={day.isoDate} day={day} calendar={calendar} />
              ))}
            </div>
          </div>
        </div>

        {errorToast && <ResizeErrorToast {...errorToast} onDismiss={() => setErrorToast(null)} />}
      </div>
    </DragDropProvider>
  )
}

function ResizeHandle({
  edge,
  onMouseDown,
}: {
  edge: 'top' | 'bottom'
  onMouseDown: (e: React.MouseEvent) => void
}) {
  return (
    <div
      data-resize-handle
      className={`absolute left-0 right-0 h-3 cursor-ns-resize z-30 bg-transparent hover:bg-neutral-500/30 pointer-events-auto ${
        edge === 'top'
          ? 'top-0 [@container_event_(height<24px)]:-top-3'
          : 'bottom-0 [@container_event_(height<24px)]:-bottom-3'
      }`}
      onMouseDown={onMouseDown}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-neutral-400 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
          edge === 'top' ? 'top-1' : 'bottom-1'
        }`}
      />
    </div>
  )
}

function ScheduleEvent({
  calendar,
  event,
  dayDate,
}: {
  calendar: DragCalendar
  event: DemoEvent
  dayDate: string
}) {
  const { moveState, resizeState, getResizeHandleProps } = calendar
  const { style } = calendar.getEventProps(event)
  const { originalStart, originalEnd } = calendar.getEventSegmentInfo(event)
  const isBeingMoved = moveState.isMoving && moveState.eventId === event.id
  const isBeingResized = resizeState.isResizing && resizeState.eventId === event.id
  const resizePreview =
    isBeingResized && resizeState.previewStart && resizeState.previewEnd
      ? calculateSegmentResizePreview({
          dayDate,
          originalStart,
          originalEnd,
          previewStart: resizeState.previewStart,
          previewEnd: resizeState.previewEnd,
        })
      : null

  if (resizePreview?.shouldHide) return null

  const isActivelyResized = isBeingResized && resizePreview?.previewStyle !== null
  const liveState = isBeingMoved ? moveState : isBeingResized ? resizeState : null
  const timeRange = formatEventTimeRange(
    liveState?.previewStart ?? originalStart,
    liveState?.previewEnd ?? originalEnd,
  )

  return (
    <EventDragSource
      data={{ event, dayDate, originalStart, originalEnd }}
      disabled={resizeState.isResizing}
    >
      {(drag) => (
        <div
          ref={drag.ref}
          data-drag-group={event.id}
          className={`@container/event @container-size group absolute z-10 text-white rounded text-xs font-medium transition-colors border ${
            eventClassByCategory[event.categoryId]
          } ${isActivelyResized ? 'ring-2 ring-neutral-500 z-20' : 'cursor-grab active:cursor-grabbing'} ${
            drag.isDragging ? 'shadow-xl ring-1 ring-neutral-400' : ''
          }`}
          style={{ ...style, ...resizePreview?.previewStyle } as React.CSSProperties}
        >
          <ResizeHandle
            edge="top"
            {...getResizeHandleProps(event.id, 'top', originalStart, originalEnd)}
          />
          <div className="absolute inset-0 overflow-hidden rounded-[inherit] px-2 py-3 [@container_event_(24px<=height<40px)]:py-1 [@container_event_(height<24px)]:py-0">
            <div className="font-semibold leading-tight truncate">{event.title}</div>
            <div
              className={`text-xs opacity-90 mt-0.5 leading-tight truncate ${
                isBeingMoved ? 'block' : 'hidden [@container_event_(height>=56px)]:block'
              }`}
            >
              {timeRange.rangeFormatted}
            </div>
          </div>
          <ResizeHandle
            edge="bottom"
            {...getResizeHandleProps(event.id, 'bottom', originalStart, originalEnd)}
          />
        </div>
      )}
    </EventDragSource>
  )
}

function ResizeErrorToast({ error, title, onDismiss }: ErrorToast & { onDismiss: () => void }) {
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
            <div className="font-semibold text-red-100 mb-1">{title}</div>
            <div className="text-sm text-red-200/80 mb-2">{error.message}</div>
            <div className="text-xs text-red-300/60 mt-2">{error.eventTitle}</div>
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

ReactDOM.createRoot(document.getElementById('root')!).render(<CalendarView />)
