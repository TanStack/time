import { useCalendar } from '@tanstack/react-time'
import {
  calendarFeatures,
  eventDependencyFeature,
  getDateParts,
  timelineFeature,
} from '@tanstack/time'
import { DragDropProvider, DragOverlay, useDraggable } from '@dnd-kit/react'
import { ConnectionMode, Handle, MarkerType, Position, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import type { DependencyType, Event, Resource, TimelineResourceRow } from '@tanstack/time'
import type { Connection, Edge, Node, NodeProps } from '@xyflow/react'
import { Button } from '@/components/ui/button'

import './index.css'

const features = calendarFeatures([eventDependencyFeature, timelineFeature])

const DEP_TYPE_STYLES: Record<
  DependencyType,
  { description: string; color: string; strokeDasharray?: string; badgeBg: string }
> = {
  FS: { description: 'Finish → Start', color: '#f59e0b', badgeBg: 'bg-amber-500' },
  SS: {
    description: 'Start → Start',
    color: '#3b82f6',
    strokeDasharray: '6 4',
    badgeBg: 'bg-blue-500',
  },
  FF: {
    description: 'Finish → Finish',
    color: '#10b981',
    strokeDasharray: '6 4',
    badgeBg: 'bg-emerald-500',
  },
  SF: {
    description: 'Start → Finish',
    color: '#a855f7',
    strokeDasharray: '2 3',
    badgeBg: 'bg-purple-500',
  },
}

const ALL_DEP_TYPES: Array<DependencyType> = ['FS', 'SS', 'FF', 'SF']

const EVENT_COLOR = 'bg-indigo-500/80 border-indigo-400 text-indigo-50'
const ROW_HEIGHT_PX = 56
const DAY_WIDTH_PX = 160
const EVENT_GAP_PX = 3
const DAY_LAG = 24 * 60

const DEP_HANDLE_STYLE: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#f59e0b',
  border: '2px solid #78350f',
  borderRadius: '50%',
  pointerEvents: 'all',
  cursor: 'crosshair',
}

const sampleResources: Array<Resource> = [
  { id: 'design', label: 'Design' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'qa', label: 'QA' },
]

function dayAt(weekday: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - date.getUTCDay() + weekday)
  return `${date.toISOString().slice(0, 10)}T00:00:00`
}

function shiftByDays(isoDateTime: string, days: number): string {
  const date = new Date(`${isoDateTime}Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 19)
}

const initialEvents: Array<Event> = [
  { id: 'wireframes', title: 'Wireframes', start: dayAt(1), end: dayAt(3), resources: ['design'] },
  {
    id: 'ui',
    title: 'Build UI',
    start: dayAt(3),
    end: dayAt(6),
    resources: ['frontend'],
    dependsOn: [{ id: 'wireframes', type: 'FS' }],
  },
  {
    id: 'api',
    title: 'Build API',
    start: dayAt(2),
    end: dayAt(5),
    resources: ['backend'],
    dependsOn: [{ id: 'wireframes', type: 'SS', lag: DAY_LAG }],
  },
  {
    id: 'docs',
    title: 'Docs',
    start: dayAt(4),
    end: dayAt(6),
    resources: ['design'],
    dependsOn: [{ id: 'ui', type: 'FF' }],
  },
  {
    id: 'qa',
    title: 'QA pass',
    start: dayAt(6),
    end: dayAt(8),
    resources: ['qa'],
    dependsOn: [{ id: 'api', type: 'FS', lag: DAY_LAG }],
  },
]

type TaskNode = Node<Record<string, never>, 'task'>

function TaskHandles(_: NodeProps<TaskNode>) {
  return (
    <>
      <Handle id="start" type="source" position={Position.Left} style={DEP_HANDLE_STYLE} />
      <Handle id="end" type="source" position={Position.Right} style={DEP_HANDLE_STYLE} />
    </>
  )
}

const TASK_NODE_TYPES = { task: TaskHandles }

function buildTimelineEdges(events: Array<Event>): Array<Edge> {
  return events.flatMap((event) =>
    (event.dependsOn ?? []).map((dep) => {
      const style = DEP_TYPE_STYLES[dep.type]
      return {
        id: `dep-${dep.id}-${event.id}-${dep.type}`,
        source: dep.id,
        sourceHandle: dep.type === 'SS' || dep.type === 'SF' ? 'start' : 'end',
        target: event.id,
        targetHandle: dep.type === 'FF' || dep.type === 'SF' ? 'end' : 'start',
        type: 'smoothstep',
        animated: true,
        label: dep.lag ? `${dep.type} +${dep.lag / DAY_LAG}d` : dep.type,
        labelStyle: { fill: '#fff', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: style.color, opacity: 0.95 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 3,
        markerEnd: { type: MarkerType.ArrowClosed, color: style.color },
        style: { stroke: style.color, strokeWidth: 2, strokeDasharray: style.strokeDasharray },
      }
    }),
  )
}

function buildTaskNodes(rows: Array<TimelineResourceRow>, widthPx: number): Array<TaskNode> {
  return rows.flatMap((row, rowIndex) => {
    const laneHeight = ROW_HEIGHT_PX / Math.max(1, row.laneCount)
    return row.events.map(({ event, left, width, lane }) => {
      const nodeWidth = (width / 100) * widthPx
      const nodeHeight = laneHeight - EVENT_GAP_PX * 2
      return {
        id: event.id,
        type: 'task',
        position: {
          x: (left / 100) * widthPx,
          y: rowIndex * ROW_HEIGHT_PX + lane * laneHeight + EVENT_GAP_PX,
        },
        width: nodeWidth,
        height: nodeHeight,
        style: { width: nodeWidth, height: nodeHeight, pointerEvents: 'none' },
        data: {},
      }
    })
  })
}

function TimelineDependencyOverlay({
  rows,
  events,
  widthPx,
  onConnect,
}: {
  rows: Array<TimelineResourceRow>
  events: Array<Event>
  widthPx: number
  onConnect: (connection: Connection) => void
}) {
  return (
    <ReactFlow
      nodes={buildTaskNodes(rows, widthPx)}
      edges={buildTimelineEdges(events)}
      onConnect={onConnect}
      connectionMode={ConnectionMode.Loose}
      nodeTypes={TASK_NODE_TYPES}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      panOnDrag={false}
      zoomOnScroll={false}
      panOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      nodesDraggable={false}
      elementsSelectable={false}
      preventScrolling={false}
      autoPanOnConnect={false}
      style={{ background: 'transparent', overflow: 'hidden', pointerEvents: 'none' }}
      proOptions={{ hideAttribution: true }}
    />
  )
}

type ActiveDrag = { event: Event; width: number; laneHeightPct: number }

function DraggableTimelineEvent({
  event,
  left,
  width,
  lane,
  laneCount,
}: TimelineResourceRow['events'][number] & { laneCount: number }) {
  const laneHeightPct = 100 / laneCount
  const { ref, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: { event, width, laneHeightPct },
  })
  return (
    <div
      ref={ref}
      data-event-id={event.id}
      className={`absolute border rounded-md flex items-center px-2.5 text-xs font-medium overflow-hidden shadow-xs z-30 cursor-grab ${EVENT_COLOR} ${isDragging ? 'opacity-40 shadow-xl z-50' : ''}`}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        top: `calc(${lane * laneHeightPct}% + ${EVENT_GAP_PX}px)`,
        height: `calc(${laneHeightPct}% - ${EVENT_GAP_PX * 2}px)`,
      }}
    >
      <span className="truncate">{event.title}</span>
    </div>
  )
}

function inferDepType(sourceAnchor: string, targetAnchor: string): DependencyType {
  if (sourceAnchor === 'end') return targetAnchor === 'start' ? 'FS' : 'FF'
  return targetAnchor === 'start' ? 'SS' : 'SF'
}

function TimelineDemo() {
  const calendar = useCalendar({
    features,
    viewMode: { value: 2, unit: 'week' },
    events: initialEvents,
    resources: sampleResources,
    timeZone: 'UTC',
  })
  const [message, setMessage] = useState<string | null>(null)

  const timelineLayout = calendar.getTimelineLayout()
  const events = calendar.getEvents()

  const handleConnect = ({ source, target, sourceHandle, targetHandle }: Connection) => {
    if (source === target || !sourceHandle || !targetHandle) return
    const type = inferDepType(sourceHandle, targetHandle)
    const result = calendar.createDependency(source, target, type)
    setMessage(result.blocked && result.error ? result.error.message : null)
  }

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const timelineWidthPx = calendar.days.length * DAY_WIDTH_PX

  const handleDragEnd = async (
    e: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0],
  ) => {
    setActiveDrag(null)
    const dragged = (e.operation.source?.data as ActiveDrag | undefined)?.event
    const days = Math.round(e.operation.transform.x / DAY_WIDTH_PX)
    if (e.canceled || !dragged || days === 0) return
    const result = await calendar.editEvent(dragged.id, {
      start: shiftByDays(String(dragged.start), days),
      end: shiftByDays(String(dragged.end), days),
    })
    setMessage(result.success ? null : result.error.message)
  }

  return (
    <DragDropProvider
      onDragStart={(e) => setActiveDrag((e.operation.source?.data as ActiveDrag) ?? null)}
      onDragEnd={handleDragEnd}
    >
      <div className="p-5 max-w-[1400px] mx-auto min-h-screen">
        <div className="mb-6">
          <h1 className="m-0 mb-4 text-[28px] font-semibold text-white">
            TanStack Time — Dependencies
          </h1>
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
          </div>
          <div className="text-lg font-medium text-neutral-400">{calendar.formatPeriodLabel()}</div>
          <div className="text-sm text-neutral-500">
            Drag a bar to shift it by days, the solver moves its successors. Drag from a handle to
            another bar to link them.
          </div>
        </div>

        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black flex">
          <div className="w-36 shrink-0 border-r border-neutral-800 bg-neutral-950">
            <div className="h-10 border-b border-neutral-800" />
            {sampleResources.map((resource) => (
              <div
                key={resource.id}
                className="h-14 border-b border-neutral-800/50 px-3 flex items-center text-sm font-medium text-neutral-300"
              >
                {resource.label}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto flex-1">
            <div style={{ width: calendar.days.length * DAY_WIDTH_PX }}>
              <div className="h-10 border-b border-neutral-800 flex bg-neutral-950">
                {calendar.days.map((day) => {
                  const parts = getDateParts(day.isoDate, { timeZone: 'UTC' })
                  return (
                    <div
                      key={day.isoDate}
                      className={`shrink-0 border-r border-neutral-800/50 flex items-center justify-center gap-1.5 ${day.isToday ? 'bg-neutral-800/30' : ''}`}
                      style={{ width: DAY_WIDTH_PX }}
                    >
                      <span className="text-[10px] text-neutral-500 uppercase">
                        {parts.weekdayShort}
                      </span>
                      <span
                        className={`text-sm font-semibold ${day.isToday ? 'text-white' : 'text-neutral-300'}`}
                      >
                        {parts.day}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="relative">
                {timelineLayout.rows.map((row) => (
                  <div
                    key={row.resource.id}
                    className="relative border-b border-neutral-800/50"
                    style={{ height: ROW_HEIGHT_PX }}
                  >
                    {row.events.map((bar) => (
                      <DraggableTimelineEvent
                        key={bar.event.id}
                        {...bar}
                        laneCount={row.laneCount}
                      />
                    ))}
                  </div>
                ))}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <TimelineDependencyOverlay
                    rows={timelineLayout.rows}
                    events={events}
                    widthPx={timelineWidthPx}
                    onConnect={handleConnect}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
            Dependencies:
          </span>
          {ALL_DEP_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <svg width="28" height="10">
                <line
                  x1="0"
                  y1="5"
                  x2="28"
                  y2="5"
                  stroke={DEP_TYPE_STYLES[type].color}
                  strokeWidth="2"
                  strokeDasharray={DEP_TYPE_STYLES[type].strokeDasharray}
                />
              </svg>
              <span
                className={`${DEP_TYPE_STYLES[type].badgeBg} text-white text-[10px] font-bold rounded px-1.5 py-0.5`}
              >
                {type}
              </span>
              <span className="text-xs text-neutral-400">{DEP_TYPE_STYLES[type].description}</span>
            </div>
          ))}
          {message && <span className="ml-auto text-sm text-rose-400">{message}</span>}
        </div>
      </div>
      {activeDrag && (
        <DragOverlay dropAnimation={null}>
          <div
            className={`border rounded-md flex items-center px-2.5 text-xs font-medium overflow-hidden shadow-xl ${EVENT_COLOR}`}
            style={{
              width: (activeDrag.width / 100) * timelineWidthPx,
              height: (activeDrag.laneHeightPct / 100) * ROW_HEIGHT_PX - EVENT_GAP_PX * 2,
            }}
          >
            <span className="truncate">{activeDrag.event.title}</span>
          </div>
        </DragOverlay>
      )}
    </DragDropProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TimelineDemo />)
