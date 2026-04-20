import {
  calculateTimelineResizePreview,
  useCalendar,
} from '@tanstack/react-time'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { timeDevtoolsPlugin } from '@tanstack/react-time-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  getTimeClient,
  toPlainDateString,
  toPlainDateTimeString,
  toPlainTimeString,
} from '@tanstack/time'
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/react'
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ReactDOM from 'react-dom/client'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { X } from 'lucide-react'

import type {
  Day,
  Event,
  ResizeError,
  Resource,
  TimelineLayout,
  TimelineResourceRow,
} from '@tanstack/time'
import type { Connection, Edge, Node, NodeProps } from '@xyflow/react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
  capacity: [2, 3, 5],
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
      consumption: [3],
    },
    {
      id: '4',
      title: 'Database Schema',
      start: weekdayAt(1, 11, 0),
      end: weekdayAt(1, 16, 0),
      resources: [resourceBackend],
      consumption: [5],
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
      start: weekdayAt(5, 6, 0),
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

const MOCK_DB = getSampleEvents()

function getEventColor(eventId: string) {
  const hash = String(eventId)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorIdx = hash % EVENT_COLORS.length
  return EVENT_COLORS[colorIdx] ?? EVENT_COLORS[0]
}

interface EventFormData {
  title: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  resourceId: string
  dependsOn: Array<string>
}

const emptyFormData: EventFormData = {
  title: '',
  startDate: toPlainDateString(new Date()),
  startTime: '09:00',
  endDate: toPlainDateString(new Date()),
  endTime: '10:00',
  resourceId: resourceDesign.id,
  dependsOn: [],
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

  useEffect(() => {
    setFormData(initialData)
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a new event on the timeline.'
              : 'Make changes to your event here.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="resource">Resource</Label>
            <Select
              value={formData.resourceId}
              onValueChange={(value) =>
                setFormData({ ...formData, resourceId: value })
              }
            >
              <SelectTrigger id="resource">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {sampleResources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <DialogFooter className="flex justify-between pt-4">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
      <Card className="max-w-md border-destructive/50 bg-destructive/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-destructive text-lg">!</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-destructive-foreground mb-1">
                Cannot Resize{' '}
                <span className="italic">&ldquo;{error.eventTitle}&rdquo;</span>
              </div>
              <div className="text-sm text-destructive-foreground/80 mb-2">
                {error.message}
              </div>
              {error.conflicts && error.conflicts.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-destructive-foreground/70 font-medium uppercase tracking-wide">
                    Dependency conflicts:
                  </div>
                  {error.conflicts.map((conflict, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-destructive-foreground/70 bg-destructive/20 rounded px-2 py-1.5 border border-destructive/30"
                    >
                      <div className="font-medium text-destructive-foreground/90">
                        {conflict.date}{' '}
                        <span className="text-destructive">
                          {conflict.conflictRange.start}–
                          {conflict.conflictRange.end}
                        </span>
                      </div>
                      <div className="text-destructive-foreground/50 mt-0.5">
                        {conflict.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6 text-destructive/60 hover:text-destructive hover:bg-destructive/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const EVENT_GAP_PX = 3
const DEP_HANDLE_STYLE: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#f59e0b',
  border: '2px solid #78350f',
  borderRadius: '50%',
  pointerEvents: 'all',
  cursor: 'crosshair',
  opacity: 0.85,
  zIndex: 40,
}

interface HandlePosition {
  eventId: string
  x: number
  y: number
  width: number
  height: number
}

function DepCanvasNode({ data }: NodeProps) {
  const { handlePositions } = data as { handlePositions: Array<HandlePosition> }
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {handlePositions.map(({ eventId, x, y, width, height }) => (
        <React.Fragment key={eventId}>
          <Handle
            type="target"
            position={Position.Left}
            id={`${eventId}-target`}
            style={{
              ...DEP_HANDLE_STYLE,
              position: 'absolute',
              left: x,
              right: 'auto',
              top: y + height / 2,
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${eventId}-source`}
            style={{
              ...DEP_HANDLE_STYLE,
              position: 'absolute',
              left: x + width,
              right: 'auto',
              top: y + height / 2,
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

const DEP_CANVAS_NODE_TYPES = { depCanvas: DepCanvasNode }
const CANVAS_NODE_ID = '__dep_canvas__'

function buildTimelineEdges(events: Array<Event<Resource>>): Array<Edge> {
  const visibleEventIds = new Set(events.map((e) => e.id))

  return events.flatMap((event) => {
    const deps = (event.dependsOn ?? []).filter((sourceId) =>
      visibleEventIds.has(sourceId),
    )

    return deps.map((sourceId) => ({
      id: `dep-${sourceId}-${event.id}`,
      source: CANVAS_NODE_ID,
      sourceHandle: `${sourceId}-source`,
      target: CANVAS_NODE_ID,
      targetHandle: `${event.id}-target`,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      style: { stroke: '#f59e0b', strokeWidth: 2 },
    }))
  })
}

interface TimelineDependencyOverlayProps {
  timelineLayout: TimelineLayout<Resource, Event<Resource>>
  eventBarRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  rowsContainerRef: React.RefObject<HTMLDivElement | null>
  resizeState: {
    isResizing: boolean
    eventId: string | null
    previewStart: string | null
    previewEnd: string | null
  }
  activeDragEvent: any
  onDependencyCreate: (sourceId: string, targetId: string) => void
}

function TimelineDependencyOverlay({
  timelineLayout,
  rowsContainerRef,
  resizeState,
  activeDragEvent,
  onDependencyCreate,
  eventBarRefs,
}: TimelineDependencyOverlayProps) {
  const [rfNodes, setRfNodes, onNodesChangeBase] = useNodesState<Node>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([])
  const isConnectingRef = useRef(false)

  const lockScroll = useCallback(() => {
    isConnectingRef.current = true
  }, [])

  const unlockScroll = useCallback(() => {
    isConnectingRef.current = false
  }, [])

  const onNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChangeBase>[0]) => {
      const filtered = changes.filter(
        (c) => !('id' in c && c.id === CANVAS_NODE_ID),
      )
      if (filtered.length > 0) onNodesChangeBase(filtered)
    },
    [onNodesChangeBase],
  )

  const updatePositions = useCallback(() => {
    const container = rowsContainerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const positions: Array<HandlePosition> = []

    // Use actual event-bar DOM rects so handles follow resize previews
    // (resize updates styles on the event bar element, while timelineLayout
    // may remain based on the committed start/end).
    timelineLayout.rows.forEach((row: TimelineResourceRow) => {
      row.events.forEach((e: any) => {
        const el = eventBarRefs.current.get(e.event.id)
        if (!el) return

        const rect = el.getBoundingClientRect()
        positions.push({
          eventId: e.event.id,
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        })
      })
    })

    setRfNodes([
      {
        id: CANVAS_NODE_ID,
        type: 'depCanvas',
        position: { x: 0, y: 0 },
        width: containerRect.width,
        height: containerRect.height,
        style: { width: containerRect.width, height: containerRect.height },
        data: { handlePositions: positions },
        selectable: false,
        draggable: false,
      },
    ])
    const allEvents = Array.from(
      new Map(
        timelineLayout.rows
          .flatMap((r: any) => r.events.map((e: any) => e.event))
          .map((e: any) => [e.id, e]),
      ).values(),
    )
    setRfEdges(buildTimelineEdges(allEvents))
  }, [timelineLayout, rowsContainerRef, eventBarRefs, setRfNodes, setRfEdges])

  useLayoutEffect(() => {
    updatePositions()
  }, [updatePositions, resizeState, activeDragEvent])

  useEffect(() => {
    const container = rowsContainerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => updatePositions())
    observer.observe(container)
    return () => observer.disconnect()
  }, [rowsContainerRef, updatePositions])

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceEventId = connection.sourceHandle?.replace(/-source$/, '')
      const targetEventId = connection.targetHandle?.replace(/-target$/, '')
      if (!sourceEventId || !targetEventId) return
      if (sourceEventId === targetEventId) return
      onDependencyCreate(sourceEventId, targetEventId)
    },
    [onDependencyCreate],
  )

  return (
    <>
      <ReactFlow
        className="timeline-dep-flow"
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={lockScroll}
        onConnectEnd={unlockScroll}
        nodeTypes={DEP_CANVAS_NODE_TYPES}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        panOnDrag={false}
        zoomOnScroll={false}
        panOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={true}
        elementsSelectable={false}
        preventScrolling={false}
        autoPanOnConnect={false}
        style={{
          background: 'transparent',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
        proOptions={{ hideAttribution: true }}
        autoPanOnNodeDrag={false}
      />
    </>
  )
}

function timeStringToFraction(time: string): number {
  const parts = time.split(':')
  const totalHours = Number(parts[0]) + Number(parts[1]) / 60
  return Math.min(totalHours, 24) / 24
}

const DraggableTimelineEvent = React.memo(function DraggableTimelineEvent({
  event,
  left,
  width,
  lane,
  laneCount,
  isStartClipped,
  isEndClipped,
  color,
  registerEventBar,
  onEventClick,
  getResizeHandleProps,
}: {
  event: Event<Resource>
  left: number
  width: number
  lane: number
  laneCount: number
  isStartClipped: boolean
  isEndClipped: boolean
  color: any
  registerEventBar: (eventId: string) => (el: HTMLDivElement | null) => void
  onEventClick: (event: Event<Resource>) => void
  getResizeHandleProps: ReturnType<typeof useCalendar>['getResizeHandleProps']
}) {
  const laneHeightPct = 100 / laneCount
  const topPct = lane * laneHeightPct

  const {
    ref: setDraggableRef,
    handleRef: setDragHandleRef,
    isDragging,
  } = useDraggable({
    id: `event-${event.id}`,
    data: { event, left, width, laneHeightPct, topPct, lane, color },
  })

  return (
    <div
      ref={(el) => {
        registerEventBar(event.id)(el)
        setDraggableRef(el)
      }}
      data-event-id={event.id}
      data-left={left}
      data-width={width}
      className={`group absolute border ${color.bg} ${color.border} ${color.text} flex items-center text-xs font-medium overflow-hidden shadow-sm z-30 cursor-pointer hover:brightness-110 transition-[filter] pointer-events-auto ${
        isDragging ? 'opacity-40 shadow-xl z-50' : ''
      } ${
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
      title={`${event.title} (${toPlainDateString(event.start)}T${toPlainTimeString(event.start)} \u2192 ${toPlainDateString(event.end)}T${toPlainTimeString(event.end)})`}
      onClick={(e) => {
        if (
          !(e.target as HTMLElement).closest('[data-drag-handle]') &&
          !(e.target as HTMLElement).closest('[data-resize-handle]')
        ) {
          e.stopPropagation()
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
      <div
        ref={setDragHandleRef}
        data-drag-handle
        className="relative ml-3 w-4 h-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity z-40"
        title="Drag to move"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="6" cy="2" r="1.5" />
          <circle cx="10" cy="2" r="1.5" />
          <circle cx="2" cy="6" r="1.5" />
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="10" cy="6" r="1.5" />
          <circle cx="2" cy="10" r="1.5" />
          <circle cx="6" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
        </svg>
      </div>
      <div className="flex-1 h-full min-w-0 flex items-center px-2.5 cursor-pointer">
        <span className="truncate">{event.title}</span>
      </div>
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
})

const HorizontalTimelineRow = React.memo(function HorizontalTimelineRow({
  row,
  days,
  resourceColorIndex,
  onEventClick,
  getResizeHandleProps,
  getDayColumnProps,
  getUnavailableRanges,
  eventBarRefs,
}: {
  row: TimelineResourceRow<Resource, Event<Resource>>
  days: Array<Day<Resource, Event<Resource>>>
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
  const { ref: setDroppableRef } = useDroppable({
    id: `resource-${row.resource.id}`,
    data: { resource: row.resource },
  })

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
      ref={setDroppableRef}
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
          const color = getEventColor(event.id)

          return (
            <DraggableTimelineEvent
              key={event.id}
              event={event}
              left={left}
              width={width}
              lane={lane}
              laneCount={row.laneCount}
              isStartClipped={isStartClipped}
              isEndClipped={isEndClipped}
              color={color}
              registerEventBar={registerEventBar}
              onEventClick={onEventClick}
              getResizeHandleProps={getResizeHandleProps}
            />
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
    events: [],
    resources: sampleResources,
    timeZone: 'UTC',
    fetchEvents: async ({ start, end }) => {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 800))

      const startDate = new Date(start)
      const endDate = new Date(end)

      return MOCK_DB.filter((e) => {
        const eStart = new Date(e.start as string)
        const eEnd = new Date(e.end as string)
        return eStart <= endDate && eEnd >= startDate
      })
    },
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

  // ── Horizontal infinite scroll ────────────────────────────────────────────
  // When the user scrolls within 8 px of the right edge → go to next period
  // and snap scroll back to the left so they can keep scrolling.
  // When within 8 px of the left edge (and the container is scrollable) →
  // go to previous period and snap to the right edge.
  // A cooldown ref prevents re-triggering while the new period is rendering.
  const horizNavCooldownRef = useRef(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const onScroll = () => {
      if (horizNavCooldownRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = container

      if (scrollLeft + clientWidth >= scrollWidth - 8 && calendar.canGoNextPeriod()) {
        horizNavCooldownRef.current = true
        calendar.goToNextPeriod()
        requestAnimationFrame(() => {
          container.scrollLeft = 0
          setTimeout(() => { horizNavCooldownRef.current = false }, 1000)
        })
      } else if (
        scrollLeft <= 8 &&
        scrollWidth > clientWidth &&
        calendar.canGoPreviousPeriod()
      ) {
        horizNavCooldownRef.current = true
        calendar.goToPreviousPeriod()
        requestAnimationFrame(() => {
          container.scrollLeft = container.scrollWidth - container.clientWidth
          setTimeout(() => { horizNavCooldownRef.current = false }, 1000)
        })
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [calendar])

  const timelineLayout = useMemo(
    () => calendar.getTimelineLayout(),
    [calendar.days],
  )

  const eventBarRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())
  const rowsContainerRef = useRef<HTMLDivElement>(null)

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

  const handleDependencyCreate = useCallback(
    (sourceId: string, targetId: string) => {
      const result = calendar.createDependency(sourceId, targetId)
      if (result.blocked && result.error) {
        setResizeError(result.error)
      }
    },
    [calendar],
  )

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
        dependsOn: event.dependsOn ?? [],
      },
    })
  }, [])

  const handleSave = (data: EventFormData) => {
    const eventBaseData = {
      title: data.title,
      start: `${data.startDate}T${data.startTime}:00`,
      end: `${data.endDate}T${data.endTime}:00`,
    }

    const validation = calendar.validateEventDependencies(
      { id: modalState.eventId, ...eventBaseData },
      data.dependsOn,
    )

    if (!validation.valid && validation.error) {
      setResizeError(validation.error)
      return
    }

    const resource = sampleResources.find((r) => r.id === data.resourceId)
    const eventData = {
      ...eventBaseData,
      resources: resource ? [resource] : [],
      dependsOn: data.dependsOn,
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

  const [activeDragEvent, setActiveDragEvent] = useState<any>(null)

  const handleDragStart = (e: any) => {
    setActiveDragEvent(e.operation?.source?.data)
  }

  const handleDragEnd = (e: any) => {
    setActiveDragEvent(null)
    const sourceData = e.operation?.source?.data
    const targetData = e.operation?.target?.data

    if (!sourceData || !sourceData.event) return

    const draggedEvent = sourceData.event
    const newResource = targetData?.resource || draggedEvent.resources?.[0]

    const deltaX =
      e.operation?.transform?.x ??
      e.operation?.position?.delta?.x ??
      e.delta?.x ??
      0

    if (deltaX !== 0 || targetData?.resource) {
      const containerW = containerWidthRef.current || 1
      const totalDays = calendar.days.length
      const totalHours = totalDays * 24
      const hoursShift = (deltaX / containerW) * totalHours

      const snapShift = Math.round(hoursShift / 0.25) * 0.25
      const msShift = snapShift * 3600 * 1000

      const resourceChanged =
        targetData?.resource &&
        targetData.resource.id !== draggedEvent.resources?.[0]?.id

      if (snapShift === 0 && !resourceChanged) return

      const newStart = new Date(
        new Date(draggedEvent.start).getTime() + msShift,
      )
      const newEnd = new Date(new Date(draggedEvent.end).getTime() + msShift)

      const nextStart = `${toPlainDateString(newStart)}T${toPlainTimeString(newStart)}:00`
      const nextEnd = `${toPlainDateString(newEnd)}T${toPlainTimeString(newEnd)}:00`

      const validation = calendar.validateMove(
        draggedEvent.id,
        nextStart,
        nextEnd,
        newResource ? [newResource] : [],
      )

      if (validation.blocked) {
        getTimeClient().emit('event:update:error', {
          eventId: draggedEvent.id,
          eventTitle: draggedEvent.title,
          reason: 'unavailable-time',
          message:
            validation.message ?? 'This move is blocked by availability.',
          originalStart: draggedEvent.start,
          originalEnd: draggedEvent.end,
          attemptedStart: nextStart,
          attemptedEnd: nextEnd,
        })

        setResizeError({
          eventId: draggedEvent.id,
          eventTitle: draggedEvent.title,
          reason: 'unavailable-time',
          message:
            validation.message ?? 'This move is blocked by availability.',
          originalStart: draggedEvent.start,
          originalEnd: draggedEvent.end,
        })
        return
      }

      calendar.updateEvent(draggedEvent.id, {
        start: nextStart,
        end: nextEnd,
        resources: newResource ? [newResource] : [],
      })
    }
  }

  const viewModeOptions = [
    { label: 'Day', value: 1, unit: 'day' as const },
    { label: 'Week', value: 1, unit: 'week' as const },
    { label: '2 Weeks', value: 2, unit: 'week' as const },
  ]

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-5 max-w-[1400px] mx-auto min-h-screen">
        <div className="mb-6">
          <h1 className="m-0 mb-4 text-[28px] font-semibold text-white">
            TanStack Time — Timeline
          </h1>

          <div className="flex gap-3 items-center mb-4 flex-wrap">
            <Button
              variant="outline"
              onClick={calendar.goToPreviousPeriod}
              disabled={!calendar.canGoPreviousPeriod() || calendar.isPending}
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              onClick={calendar.goToCurrentPeriod}
              disabled={calendar.isPending}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={calendar.goToNextPeriod}
              disabled={!calendar.canGoNextPeriod() || calendar.isPending}
            >
              Next →
            </Button>
            <Button onClick={openAddModal}>+ Add Event</Button>

            <div className="ml-auto flex gap-2">
              {viewModeOptions.map((opt) => {
                const isActive =
                  calendar.viewMode.value === opt.value &&
                  calendar.viewMode.unit === opt.unit
                return (
                  <Button
                    key={opt.label}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      calendar.changeViewMode({
                        value: opt.value,
                        unit: opt.unit,
                      })
                    }
                  >
                    {opt.label}
                  </Button>
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
                      const monthName = localDate.toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                        },
                      )

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

                <div ref={rowsContainerRef} className="relative">
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
                      resourceColorIndex={rowIdx}
                      onEventClick={openEditModal}
                      getResizeHandleProps={calendar.getResizeHandleProps}
                      getDayColumnProps={calendar.getDayColumnProps}
                      getUnavailableRanges={calendar.getUnavailableRanges}
                      eventBarRefs={eventBarRefsMap}
                    />
                  ))}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{ overflow: 'hidden' }}
                  >
                    <TimelineDependencyOverlay
                      timelineLayout={timelineLayout}
                      eventBarRefs={eventBarRefsMap}
                      rowsContainerRef={rowsContainerRef}
                      resizeState={resizeState}
                      activeDragEvent={activeDragEvent}
                      onDependencyCreate={handleDependencyCreate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex flex-wrap gap-2">
            {calendar.getEvents().map((event) => {
              const color = getEventColor(event.id)
              return (
                <Badge
                  key={event.id}
                  variant="outline"
                  className="gap-1.5 font-normal"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-sm ${color.bg} ${color.border} border`}
                  />
                  <span className="text-muted-foreground">{event.title}</span>
                </Badge>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2 border-l border-border pl-6">
            {sampleResources.map((resource, idx) => {
              const zoneColor =
                RESOURCE_ZONE_COLORS[idx % RESOURCE_ZONE_COLORS.length] ??
                RESOURCE_ZONE_COLORS[0]
              return (
                <Badge
                  key={resource.id}
                  variant="secondary"
                  className="gap-1.5 font-normal"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm bg-[length:6px_6px]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(315deg, ${zoneColor} 0, ${zoneColor} 1px, transparent 0, transparent 50%)`,
                      backgroundColor: zoneColor,
                    }}
                  />
                  <span className="text-muted-foreground">
                    {resource.label} — unavailable
                  </span>
                </Badge>
              )
            })}
          </div>
        </div>

        {calendar.isPending && (
          <div className="fixed top-5 right-5">
            <Badge
              variant="secondary"
              className="px-5 py-3 text-sm font-medium"
            >
              Loading...
            </Badge>
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

        {activeDragEvent && (
          <DragOverlay dropAnimation={null}>
            <div
              className={`group absolute border ${activeDragEvent.color.bg} ${activeDragEvent.color.border} ${activeDragEvent.color.text} px-2.5 flex items-center text-xs font-medium overflow-hidden shadow-sm z-[9999] rounded-md`}
              style={{
                width: `${containerWidthRef.current * (activeDragEvent.width / 100)}px`,
                height: `${(activeDragEvent.laneHeightPct / 100) * 56 - EVENT_GAP_PX * 2}px`,
              }}
            >
              <span className="truncate">{activeDragEvent.event.title}</span>
            </div>
          </DragOverlay>
        )}
      </div>
    </DragDropProvider>
  )
}

function App() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <TanStackDevtools
        plugins={[
          timeDevtoolsPlugin(),
          {
            name: 'TanStack Query',
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
      <TimelineDemo />
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
