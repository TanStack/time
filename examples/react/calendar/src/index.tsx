import {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  formatEventTimeRange,
  useCalendar,
} from "@tanstack/react-time";
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventDependencyFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
  historyFeature,
  timelineFeature,
} from "@tanstack/time";
import ReactDOM from "react-dom/client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { timeDevtoolsPlugin } from "@tanstack/react-time-devtools";
import { useInfiniteScroll } from "./lib/useInfiniteScroll";
import type {
  Day,
  Event,
  EventDateTimeInput,
  LayoutStrategyFn,
  OverlapStrategy,
  RecurrenceEditScope,
  RecurrenceFrequency,
  RecurrenceRule,
  ResizeError,
  Resource,
} from "@tanstack/time";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import "./index.css";

const features = calendarFeatures({
  historyFeature,
  eventRecurrenceFeature,
  eventDependencyFeature,
  eventResizeFeature,
  dayEventLayoutFeature,
  timelineFeature,
});

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function padTimePart(n: number): string {
  return String(n).padStart(2, "0");
}

function workWeekMonday(): Date {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);

  if (dow === 0 || dow === 6) {
    monday.setDate(today.getDate() + (dow === 0 ? 1 : 2));
  } else {
    monday.setDate(today.getDate() + (1 - dow));
  }
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function weekdayAt(isoWeekday: 1 | 2 | 3 | 4 | 5): Date {
  const monday = workWeekMonday();
  const d = new Date(monday);
  d.setDate(monday.getDate() + isoWeekday - 1);
  return d;
}

function dateTimeOnWeekday(
  isoWeekday: 1 | 2 | 3 | 4 | 5,
  hour: number,
  minute: number,
): string {
  const d = weekdayAt(isoWeekday);
  d.setHours(hour, minute, 0, 0);
  return `${formatDateToISO(d)}T${padTimePart(hour)}:${padTimePart(minute)}:00`;
}

function getResourceId(resource: Resource | string): string {
  return typeof resource === "string" ? resource : resource.id;
}

const LEAD_SHARE = 0.6;

const focusStrategy: LayoutStrategyFn = (info) => {
  if (info.concurrency === 1) return { crossStart: 0, crossSize: 1 };
  if (info.depth === 0) {
    return { crossStart: 0, crossSize: LEAD_SHARE, zIndex: 0 };
  }

  const slice = (1 - LEAD_SHARE) / (info.concurrency - 1);
  return {
    crossStart: LEAD_SHARE + (info.depth - 1) * slice,
    crossSize: slice,
    zIndex: info.depth,
  };
};

const overlapModes = {
  columns: "columns",
  expand: "expand",
  cascade: "cascade",
  focus: focusStrategy,
} satisfies Record<string, OverlapStrategy | LayoutStrategyFn>;

type OverlapMode = keyof typeof overlapModes;

const overlapModeLabels: Record<OverlapMode, string> = {
  columns: "Side by side",
  expand: "Expand",
  cascade: "Cascade",
  focus: "Focus first",
};

const sampleResources: Array<Resource> = [
  {
    id: "room-a",
    label: "Room A",
    capacity: [4],
    availability: [
      {
        weekdays: [1, 2, 3, 4, 5],
        startTime: "00:00",
        endTime: "24:00",
      },
    ],
  },
  {
    id: "room-b",
    label: "Room B",
    capacity: [2],
    availability: [
      {
        weekdays: [1, 2, 3, 4, 5],
        startTime: "00:00",
        endTime: "24:00",
      },
    ],
  },
];

function getSampleEvents(): Array<Event<Resource>> {
  return [
    {
      id: "1",
      title: "Team Meeting (A:2)",
      start: dateTimeOnWeekday(2, 12, 0),
      end: dateTimeOnWeekday(2, 13, 0),
      resources: [sampleResources[0]],
      consumption: [2],
    },
    {
      id: "2",
      title: "Project Review (A:2)",
      start: dateTimeOnWeekday(3, 14, 0),
      end: dateTimeOnWeekday(3, 15, 30),
      resources: [sampleResources[0]],
      consumption: [2],
    },
    {
      id: "3",
      title: "Workshop (B:1)",
      start: dateTimeOnWeekday(4, 12, 0),
      end: dateTimeOnWeekday(4, 16, 30),
      resources: [sampleResources[1]],
      consumption: [1],
    },
    {
      id: "4",
      title: "Capacity Probe (A:1)",
      start: dateTimeOnWeekday(5, 12, 0),
      end: dateTimeOnWeekday(5, 13, 0),
      resources: [sampleResources[0]],
      consumption: [1],
    },
    {
      id: "5",
      title: "Focus Block (A:2)",
      start: dateTimeOnWeekday(5, 12, 30),
      end: dateTimeOnWeekday(5, 14, 30),
      resources: [sampleResources[0]],
      consumption: [2],
    },
    {
      id: "6",
      title: "Interview (B:1)",
      start: dateTimeOnWeekday(2, 12, 30),
      end: dateTimeOnWeekday(2, 14, 0),
      resources: [sampleResources[1]],
      consumption: [1],
    },
    {
      id: "r-standup",
      title: "☀ Daily Stand-up (A:1)",
      start: dateTimeOnWeekday(1, 9, 0),
      end: dateTimeOnWeekday(1, 9, 15),
      resources: [sampleResources[0]],
      consumption: [1],
      recurrence: {
        frequency: "daily",
        interval: 1,
        byWeekday: undefined,
        exDates: [dateTimeOnWeekday(3, 9, 0)],
        overrides: [
          {
            originalStart: dateTimeOnWeekday(2, 9, 0),
            start: dateTimeOnWeekday(2, 15, 0),
            end: dateTimeOnWeekday(2, 15, 15),
            title: "☀ Daily Stand-up moved (A:1)",
          },
        ],
      },
    },
    {
      id: "r-sync",
      title: "🔄 Weekly Sync (B:1)",
      start: dateTimeOnWeekday(1, 10, 0),
      end: dateTimeOnWeekday(1, 10, 30),
      resources: [sampleResources[1]],
      consumption: [1],
      recurrence: {
        frequency: "weekly",
        interval: 1,
        byWeekday: [1],
        count: 6,
      },
    },
    {
      id: "r-report",
      title: "📊 Monthly Report (A:1)",
      start: dateTimeOnWeekday(1, 14, 0),
      end: dateTimeOnWeekday(1, 15, 0),
      resources: [sampleResources[0]],
      consumption: [1],
      recurrence: {
        frequency: "monthly",
        interval: 1,
      },
    },
    {
      id: "ad-holiday",
      title: "🎉 Company Holiday",
      start: `${formatDateToISO(weekdayAt(3))}T00:00:00`,
      end: `${formatDateToISO(weekdayAt(3))}T23:59:59`,
      allDay: true,
    },
    {
      id: "ad-conf",
      title: "🏢 Offsite Conference",
      start: `${formatDateToISO(weekdayAt(4))}T00:00:00`,
      end: `${formatDateToISO(weekdayAt(5))}T23:59:59`,
      allDay: true,
    },
  ];
}

const MOCK_DB = getSampleEvents();

interface EventFormData {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  resourceId: string;
  consumption: number;
  recurrenceFrequency: RecurrenceFrequency | "none";
  recurrenceUntil: string;
  recurrenceEditScope: RecurrenceEditScope;
  allDay: boolean;
}

const emptyFormData: EventFormData = {
  title: "",
  startDate: formatDateToISO(new Date()),
  startTime: "09:00",
  endDate: formatDateToISO(new Date()),
  endTime: "10:00",
  resourceId: sampleResources[0]?.id ?? "",
  consumption: 1,
  recurrenceFrequency: "none",
  recurrenceUntil: "",
  recurrenceEditScope: "this",
  allDay: false,
};

function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isRecurring,
  mode,
  isSaving,
  resources,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  onDelete?: (data: EventFormData) => void;
  initialData: EventFormData;
  mode: "add" | "edit";
  isRecurring?: boolean;
  isSaving?: boolean;
  resources: Array<Resource>;
}) {
  const [formData, setFormData] = useState<EventFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch {
      return;
    }
    onClose();
  };

  const recurrencyOptions: Array<{
    value: RecurrenceFrequency | "none";
    label: string;
  }> = [
    { value: "none", label: "Does not repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const recurrenceEditScopeOptions: Array<{
    value: RecurrenceEditScope;
    label: string;
  }> = [
    { value: "this", label: "This event only" },
    { value: "thisAndFollowing", label: "This and following events" },
    { value: "all", label: "All events in series" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Event" : "Edit Event"}
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
          <div className="flex items-center gap-2">
            <input
              id="allDay"
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) =>
                setFormData({ ...formData, allDay: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="allDay" className="cursor-pointer">
              All-day
            </Label>
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
                disabled={formData.allDay}
                required={!formData.allDay}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resourceId">Resource</Label>
              <select
                id="resourceId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
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
                disabled={formData.allDay}
                required={!formData.allDay}
              />
            </div>
          </div>

          {mode === "edit" && isRecurring && (
            <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
              <Label htmlFor="recurrenceEditScope">Apply changes to</Label>
              <select
                id="recurrenceEditScope"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.recurrenceEditScope}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrenceEditScope: e.target.value as RecurrenceEditScope,
                  })
                }
              >
                {recurrenceEditScopeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                Save or Delete uses selected recurring-event scope.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="recurrenceFrequency">Repeat</Label>
            <select
              id="recurrenceFrequency"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.recurrenceFrequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurrenceFrequency: e.target.value as
                    | RecurrenceFrequency
                    | "none",
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

          {formData.recurrenceFrequency !== "none" && (
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
              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onDelete(formData);
                    onClose();
                  }}
                >
                  Delete
                  {isRecurring
                    ? ` ${
                        formData.recurrenceEditScope === "this"
                          ? "this event"
                          : formData.recurrenceEditScope === "thisAndFollowing"
                            ? "this and following"
                            : "series"
                      }`
                    : ""}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : mode === "add" ? "Add" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ResizeHandleProps {
  edge: "top" | "bottom";
  onMouseDown: (e: React.MouseEvent) => void;
}

function ResizeHandle({ edge, onMouseDown }: ResizeHandleProps) {
  return (
    <div
      data-resize-handle
      className={`absolute left-0 right-0 h-3 cursor-ns-resize z-30 bg-transparent hover:bg-neutral-500/30 pointer-events-auto ${
        edge === "top"
          ? "top-0 [@container_event_(height<24px)]:-top-3"
          : "bottom-0 [@container_event_(height<24px)]:-bottom-3"
      }`}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{ touchAction: "none" }}
    >
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-neutral-400 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
          edge === "top" ? "top-1" : "bottom-1"
        }`}
      />
    </div>
  );
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
  overlapMode,
}: {
  calendar: ReturnType<typeof useCalendar<typeof features, Resource, Event<Resource>>>;
  days: Array<Day<Resource, Event<Resource>>>;
  resources: Array<Resource>;
  onEventClick: (event: Event<Resource>, scope?: RecurrenceEditScope) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  leftSentinelRef: React.RefObject<HTMLDivElement | null>;
  rightSentinelRef: React.RefObject<HTMLDivElement | null>;
  periodDayCount: number;
  overlapMode: OverlapMode;
}) {
  const timeSlots = calendar.getTimeSlots();
  const {
    resizeState,
    getResizeHandleProps,
    getDayColumnProps,
    getUnavailableRanges,
  } = calendar;

  const maxAllDay = days.reduce(
    (m, d) => Math.max(m, d.allDayEvents.length),
    0,
  );
  const allDayRowHeight = maxAllDay > 0 ? maxAllDay * 24 + 8 : 28;

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="flex gap-6 flex-wrap">
          {resources.map((resource, idx) => {
            const colors = ["#0049af75", "#00af3475"];
            const color = colors[idx % colors.length];
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
            );
          })}
        </div>
      </div>
      <div className="flex border-t border-neutral-800">
        <div className="w-20 border-r border-neutral-800 bg-neutral-950">
          <div className="h-12 border-b border-neutral-800"></div>
          <div
            className="border-b border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-500 flex items-center"
            style={{ height: allDayRowHeight }}
          >
            all-day
          </div>
          {timeSlots.map((slot) => (
            <div
              key={`${slot.hour}-${slot.minute}`}
              className="h-[60px] border-b border-neutral-800/50 px-2 py-1 text-xs text-neutral-500"
            >
              {slot.label}
            </div>
          ))}
        </div>

        <ScrollArea viewportRef={scrollRef} className="flex-1">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `1px repeat(${days.length}, minmax(0, 1fr)) 1px`,
              minWidth: `${(days.length / periodDayCount) * 100}%`,
            }}
          >
            <div ref={leftSentinelRef} style={{ width: 1 }} aria-hidden />
            <div className="contents">
              {days.map((day) => {
                const dayDate = day.isoDate;
                const dayName = new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                }).format(new Date(`${day.isoDate}T00:00:00`));
                return (
                  <div
                    key={day.isoDate}
                    className="border-r border-neutral-800 last:border-r-0"
                    {...getDayColumnProps(dayDate)}
                  >
                    <div className="h-12 border-b border-neutral-800 bg-neutral-950 px-3 py-2 text-center">
                      <div className="text-sm font-semibold text-neutral-200">
                        {dayName}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {Number(day.isoDate.slice(8, 10))}
                      </div>
                    </div>
                    <div
                      className="border-b border-neutral-800 bg-neutral-950/60 px-1 py-1 flex flex-col gap-1 overflow-hidden"
                      style={{ height: allDayRowHeight }}
                    >
                      {day.allDayEvents.map((event) => (
                        <div
                          key={`ad-${event.id}`}
                          className="cursor-pointer bg-amber-700/70 hover:bg-amber-600/80 text-amber-50 rounded px-2 text-[11px] font-medium truncate border border-amber-600/40"
                          style={{ height: 20, lineHeight: "20px" }}
                          title={event.title}
                          onClick={() => onEventClick(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                    <div className="relative h-[1440px] bg-neutral-950/30">
                      {resources.map((resource, resourceIdx) => {
                        const resourceRanges = getUnavailableRanges(dayDate, {
                          resourceIds: [resource.id],
                        });
                        const colors = ["#0049af75", "#00af3475"];
                        const color = colors[resourceIdx % colors.length];

                        return resourceRanges.map((range, rangeIdx) => (
                          <div
                            key={`${resource.id}-${rangeIdx}`}
                            className="absolute left-0 right-0 pointer-events-none z-0 bg-size-[10px_10px] bg-fixed"
                            style={{
                              top: range.top,
                              height: range.height,
                              backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
                            }}
                            title={`Unavailable - ${resource.label}`}
                          />
                        ));
                      })}
                      {day.events.map((event, eventIndex) => {
                        const eventProps = calendar.getEventProps(event, {
                          strategy: overlapModes[overlapMode],
                        });
                        const { style, isSplitEvent, layout } = eventProps;
                        const concurrency = layout?.concurrency ?? 1;

                        const segmentInfo = calendar.getEventSegmentInfo(event);
                        const {
                          isFirstSegment,
                          isLastSegment,
                          originalStart,
                          originalEnd,
                        } = segmentInfo;

                        const isBeingResized =
                          resizeState.isResizing &&
                          resizeState.eventId === event.id;

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
                            : null;

                        if (resizePreview?.shouldHide) {
                          return null;
                        }

                        const displayStyle = resizePreview?.previewStyle
                          ? { ...style, ...resizePreview.previewStyle }
                          : style;

                        const showTopHandle = !isSplitEvent || isFirstSegment;
                        const showBottomHandle = !isSplitEvent || isLastSegment;
                        const isActivelyResized =
                          isBeingResized &&
                          resizePreview?.previewStyle !== null;

                        const stackedStyle =
                          displayStyle?.zIndex === undefined
                            ? displayStyle
                            : {
                                ...displayStyle,
                                zIndex:
                                  (isActivelyResized ? 20 : 10) +
                                  displayStyle.zIndex,
                              };

                        const timeRange = formatEventTimeRange(
                          isBeingResized && resizeState.previewStart
                            ? resizeState.previewStart
                            : originalStart,
                          isBeingResized && resizeState.previewEnd
                            ? resizeState.previewEnd
                            : originalEnd,
                        );

                        return (
                          <ContextMenu key={`${event.id}-${eventIndex}`}>
                            <ContextMenuTrigger
                              className={`@container/event [container-type:size] group absolute z-10 bg-neutral-800 text-white rounded text-xs font-medium transition-colors border border-neutral-700 ${
                                isActivelyResized
                                  ? "bg-neutral-700 ring-2 ring-neutral-500 z-20"
                                  : "cursor-pointer hover:bg-neutral-700"
                              }`}
                              style={stackedStyle as React.CSSProperties}
                              onClick={(e: React.MouseEvent) => {
                                if (
                                  !resizeState.isResizing &&
                                  !(e.target as HTMLElement).closest(
                                    "[data-resize-handle]",
                                  )
                                ) {
                                  onEventClick(event);
                                }
                              }}
                            >
                              {showTopHandle && (
                                <ResizeHandle
                                  edge="top"
                                  {...getResizeHandleProps(
                                    event.id,
                                    "top",
                                    originalStart,
                                    originalEnd,
                                    {
                                      occurrenceStart:
                                        event._occurrenceOriginalStart,
                                    },
                                  )}
                                />
                              )}
                              <div className="absolute inset-0 overflow-hidden rounded-[inherit] px-2 py-3 [@container_event_(24px<=height<40px)]:py-1 [@container_event_(height<24px)]:py-0">
                                <div className="font-semibold flex items-center gap-1.5 leading-tight">
                                  <span className="flex items-center gap-1 min-w-0">
                                    {event.recurrence && (
                                      <span
                                        className="opacity-60 shrink-0"
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
                                        className="text-[10px] leading-none rounded bg-black/40 px-1 py-0.5 font-semibold shrink-0"
                                        title="Consumption"
                                      >
                                        {event.consumption.reduce(
                                          (a, b) => a + b,
                                          0,
                                        )}
                                      </span>
                                    )}
                                  {concurrency > 1 && (
                                    <span
                                      className="text-[10px] leading-none rounded bg-amber-500/20 text-amber-200 px-1 py-0.5 font-semibold shrink-0"
                                      title={`Overlaps ${concurrency - 1} other event(s)`}
                                    >
                                      ⇄{concurrency}
                                    </span>
                                  )}
                                </div>
                                <div className="hidden [@container_event_(height>=56px)]:block text-xs opacity-90 mt-0.5 leading-tight truncate">
                                  {timeRange.rangeFormatted}
                                </div>
                              </div>
                              {showBottomHandle && (
                                <ResizeHandle
                                  edge="bottom"
                                  {...getResizeHandleProps(
                                    event.id,
                                    "bottom",
                                    originalStart,
                                    originalEnd,
                                    {
                                      occurrenceStart:
                                        event._occurrenceOriginalStart,
                                    },
                                  )}
                                />
                              )}
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem
                                onClick={() => onEventClick(event)}
                              >
                                {event.recurrence
                                  ? "Edit this occurrence"
                                  : "Edit event"}
                              </ContextMenuItem>
                              {event.recurrence && (
                                <>
                                  <ContextMenuItem
                                    onClick={() =>
                                      onEventClick(event, "thisAndFollowing")
                                    }
                                  >
                                    Edit this and following
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    onClick={() => onEventClick(event, "all")}
                                  >
                                    Edit series
                                  </ContextMenuItem>
                                </>
                              )}
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
                        );
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
                          });

                          if (!ghostStyle) return null;

                          const timeRange = formatEventTimeRange(
                            resizeState.previewStart,
                            resizeState.previewEnd,
                          );

                          return (
                            <div
                              className="absolute bg-neutral-700/60 text-neutral-200 rounded px-2 py-1 text-xs font-medium overflow-hidden border border-neutral-600 border-dashed z-20"
                              style={ghostStyle}
                            >
                              <div className="font-semibold pt-1 opacity-80">
                                {timeRange.rangeFormatted}
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={rightSentinelRef} style={{ width: 1 }} aria-hidden />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function ResizeErrorToast({
  error,
  onDismiss,
}: {
  error: ResizeError;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

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
                      {conflict.conflictRange.start} -{" "}
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
  );
}

function ScopeChoiceModal({
  event,
  isOpen,
  title = "Edit recurring event",
  onSelect,
  onClose,
}: {
  event: Event<Resource> | null;
  isOpen: boolean;
  title?: string;
  onSelect: (scope: RecurrenceEditScope) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs bg-card border-border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 text-sm text-neutral-400">
          {event?.title ?? "Choose how to apply this recurring-event change."}
        </div>
        <div className="space-y-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelect("this")}
          >
            This occurrence
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelect("thisAndFollowing")}
          >
            This and following
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelect("all")}
          >
            All events
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalendarView() {
  const [resources, setResources] = useState<Array<Resource>>(sampleResources);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    eventId?: string;
    occurrenceStart?: string;
    isRecurring?: boolean;
    initialData: EventFormData;
  }>({
    isOpen: false,
    mode: "add",
    initialData: emptyFormData,
  });

  const [scopeChoiceEvent, setScopeChoiceEvent] =
    useState<Event<Resource> | null>(null);
  const [resizeScopeChoice, setResizeScopeChoice] = useState<{
    eventId: string;
    occurrenceStart: EventDateTimeInput;
    newStart: string;
    newEnd: string;
  } | null>(null);

  const [resizeError, setResizeError] = useState<ResizeError | null>(null);
  const [overlapMode, setOverlapMode] = useState<OverlapMode>("columns");

  const calendar = useCalendar({
    features,
    viewMode: { value: 1, unit: "month" },
    events: [],
    resources,
    timeZone: "UTC",
    fetchEvents: async ({ start, end }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const startDate = new Date(start);
      const endDate = new Date(end);
      const resourceById = new Map(
        resources.map((resource) => [resource.id, resource]),
      );

      return MOCK_DB.filter((e) => {
        if (e.recurrence) return true;
        const eStart = new Date(e.start as string);
        const eEnd = new Date(e.end as string);
        return eStart <= endDate && eEnd >= startDate;
      }).map((event) => ({
        ...event,
        resources:
          event.resources
            ?.map((resource) => resourceById.get(getResourceId(resource)))
            .filter((resource): resource is Resource => resource != null) ?? [],
      }));
    },
    resize: {
      enabled: true,
      containerHeight: 1440,
      constraints: {
        minDurationMinutes: 15,
        snapToMinutes: 15,
      },
      onResizeError: (error) => {
        setResizeError(error);
      },
      onRecurringResizeEnd: (resize) => {
        setResizeScopeChoice({
          eventId: resize.eventId,
          occurrenceStart: resize.occurrenceStart,
          newStart: resize.newStart,
          newEnd: resize.newEnd,
        });
      },
    },
  });

  const dayNames = calendar.getDaysNames("short");

  const isScheduleView =
    calendar.viewMode.unit === "week" || calendar.viewMode.unit === "day";
  const scheduleDays: Array<Day<Resource, Event<Resource>>> = isScheduleView
    ? calendar.viewMode.unit === "day"
      ? calendar.days.filter((day) => {
          const currentDateStr = calendar.currentPeriod;
          return day.isoDate === currentDateStr;
        })
      : calendar.days
    : [];

  const monthScrollRef = useRef<HTMLDivElement>(null);
  const monthBufferRef = useRef<{ start: string; end: string } | null>(null);
  if (monthBufferRef.current === null && calendar.days.length > 0) {
    monthBufferRef.current = {
      start: calendar.days[0].isoDate,
      end: calendar.days[calendar.days.length - 1].isoDate,
    };
  }

  const navDirectionRef = useRef<"none" | "forward" | "backward">("none");
  const prevPeriodRef = useRef(calendar.currentPeriod);
  const prevScrollHeightRef = useRef(0);
  const needsScrollAdjRef = useRef(false);
  const needsScrollResetRef = useRef(false);
  const [bufferVersion, setBufferVersion] = useState(0);

  const scheduleScrollRef = useRef<HTMLDivElement>(null);
  const scheduleBufferRef = useRef<{ start: string; end: string } | null>(null);
  const scheduleNavDirectionRef = useRef<"none" | "forward" | "backward">(
    "none",
  );
  const prevSchedulePeriodRef = useRef(calendar.currentPeriod);
  const prevScheduleScrollWidthRef = useRef(0);
  const needsScheduleScrollAdjRef = useRef(false);
  const needsScheduleScrollResetRef = useRef(false);
  const [scheduleBufferVersion, setScheduleBufferVersion] = useState(0);
  const prevViewModeUnitRef = useRef(calendar.viewMode.unit);

  const [visibleMonth, setVisibleMonth] = useState(() =>
    calendar.formatCurrentPeriod(),
  );
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setVisibleMonth(calendar.formatCurrentPeriod());
  }, [calendar.currentPeriod]);

  useEffect(() => {
    const el = monthScrollRef.current;
    if (!el) return;

    const compute = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const viewportRect = el.getBoundingClientRect();
        const cells = el.querySelectorAll<HTMLElement>("[data-day-date]");
        for (const cell of cells) {
          const cellRect = cell.getBoundingClientRect();
          if (cellRect.bottom > viewportRect.top) {
            const iso = cell.getAttribute("data-day-date");
            if (iso) {
              const d = new Date(`${iso}T00:00:00`);
              setVisibleMonth(
                d.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                }),
              );
            }
            break;
          }
        }
      });
    };

    el.addEventListener("scroll", compute, { passive: true });
    compute();
    return () => el.removeEventListener("scroll", compute);
  }, [bufferVersion]);

  useEffect(() => {
    if (isScheduleView) return;
    if (calendar.currentPeriod === prevPeriodRef.current) return;
    prevPeriodRef.current = calendar.currentPeriod;

    const direction = navDirectionRef.current;
    navDirectionRef.current = "none";

    if (calendar.days.length === 0) return;
    const newStart = calendar.days[0].isoDate;
    const newEnd = calendar.days[calendar.days.length - 1].isoDate;

    if (direction === "none" || !monthBufferRef.current) {
      monthBufferRef.current = { start: newStart, end: newEnd };
      needsScrollResetRef.current = true;
    } else {
      monthBufferRef.current = {
        start:
          newStart < monthBufferRef.current.start
            ? newStart
            : monthBufferRef.current.start,
        end:
          newEnd > monthBufferRef.current.end
            ? newEnd
            : monthBufferRef.current.end,
      };

      if (direction === "backward") {
        prevScrollHeightRef.current = monthScrollRef.current?.scrollHeight ?? 0;
        needsScrollAdjRef.current = true;
      }
    }

    setBufferVersion((v) => v + 1);
  }, [calendar.currentPeriod, calendar.days, isScheduleView]);

  useLayoutEffect(() => {
    const el = monthScrollRef.current;
    if (!el) return;

    if (needsScrollResetRef.current) {
      needsScrollResetRef.current = false;
      el.scrollTop = 0;
      return;
    }

    if (!needsScrollAdjRef.current) return;
    needsScrollAdjRef.current = false;
    el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
  });

  if (prevViewModeUnitRef.current !== calendar.viewMode.unit) {
    prevViewModeUnitRef.current = calendar.viewMode.unit;
    prevPeriodRef.current = calendar.currentPeriod;
    prevSchedulePeriodRef.current = calendar.currentPeriod;
    scheduleBufferRef.current = null;
    monthBufferRef.current =
      calendar.days.length > 0
        ? {
            start: calendar.days[0].isoDate,
            end: calendar.days[calendar.days.length - 1].isoDate,
          }
        : null;
  }

  const bufferedWeekGroups = useMemo(() => {
    void bufferVersion;
    void calendar.days;
    if (!monthBufferRef.current) return [];
    const days = calendar.getDaysInRange(
      monthBufferRef.current.start,
      monthBufferRef.current.end,
    );
    return calendar.groupDaysBy({
      days,
      unit: "week",
      fillMissingDays: true,
    });
  }, [
    bufferVersion,
    calendar.days,
    calendar.getDaysInRange,
    calendar.groupDaysBy,
  ]);

  const { startSentinelRef: monthTopRef, endSentinelRef: monthBottomRef } =
    useInfiniteScroll({
      root: monthScrollRef,
      rootMargin: "120px 0px",
      cooldownMs: 1000,
      onReachStart: () => {
        const el = monthScrollRef.current;
        if (!el || el.scrollHeight <= el.clientHeight) return;
        if (!calendar.canGoPreviousPeriod() || calendar.isPending) return;
        navDirectionRef.current = "backward";
        calendar.goToPreviousPeriod();
      },
      onReachEnd: () => {
        const el = monthScrollRef.current;
        if (!el || el.clientHeight === 0) return;
        if (!calendar.canGoNextPeriod() || calendar.isPending) return;
        navDirectionRef.current = "forward";
        calendar.goToNextPeriod();
      },
      disabled: isScheduleView,
    });

  if (
    isScheduleView &&
    scheduleBufferRef.current === null &&
    scheduleDays.length > 0
  ) {
    scheduleBufferRef.current = {
      start: scheduleDays[0].isoDate,
      end: scheduleDays[scheduleDays.length - 1].isoDate,
    };
  }

  useEffect(() => {
    if (!isScheduleView) return;
    if (calendar.currentPeriod === prevSchedulePeriodRef.current) return;
    prevSchedulePeriodRef.current = calendar.currentPeriod;

    let currentDays: typeof calendar.days;
    if (calendar.viewMode.unit === "day") {
      const currentDateStr = calendar.currentPeriod;
      currentDays = calendar.days.filter(
        (day) => day.isoDate === currentDateStr,
      );
    } else {
      currentDays = calendar.days;
    }

    if (currentDays.length === 0) return;
    const newStart = currentDays[0].isoDate;
    const newEnd = currentDays[currentDays.length - 1].isoDate;

    if (scheduleNavDirectionRef.current === "none") {
      scheduleBufferRef.current = { start: newStart, end: newEnd };
      needsScheduleScrollResetRef.current = true;
    } else {
      const direction = scheduleNavDirectionRef.current;
      scheduleNavDirectionRef.current = "none";
      const prev = scheduleBufferRef.current ?? {
        start: newStart,
        end: newEnd,
      };
      scheduleBufferRef.current = {
        start: newStart < prev.start ? newStart : prev.start,
        end: newEnd > prev.end ? newEnd : prev.end,
      };
      if (direction === "backward") {
        prevScheduleScrollWidthRef.current =
          scheduleScrollRef.current?.scrollWidth ?? 0;
        needsScheduleScrollAdjRef.current = true;
      }
    }

    setScheduleBufferVersion((v) => v + 1);
  }, [
    calendar.currentPeriod,
    isScheduleView,
    calendar.viewMode.unit,
    calendar.days,
  ]);

  useLayoutEffect(() => {
    const el = scheduleScrollRef.current;
    if (!el) return;

    if (needsScheduleScrollResetRef.current) {
      needsScheduleScrollResetRef.current = false;
      el.scrollLeft = 0;
      return;
    }

    if (!needsScheduleScrollAdjRef.current) return;
    needsScheduleScrollAdjRef.current = false;
    el.scrollLeft += el.scrollWidth - prevScheduleScrollWidthRef.current;
  });

  const bufferedScheduleDays = useMemo(() => {
    void scheduleBufferVersion;
    void calendar.days;
    if (!scheduleBufferRef.current) return scheduleDays;
    return calendar.getDaysInRange(
      scheduleBufferRef.current.start,
      scheduleBufferRef.current.end,
    );
  }, [
    scheduleBufferVersion,
    scheduleDays,
    calendar.days,
    calendar.getDaysInRange,
  ]);

  const periodDayCount =
    calendar.viewMode.unit === "day" ? 1 : scheduleDays.length || 7;

  const {
    startSentinelRef: scheduleLeftRef,
    endSentinelRef: scheduleRightRef,
  } = useInfiniteScroll({
    root: scheduleScrollRef,
    rootMargin: "0px 50%",
    cooldownMs: 300,
    onReachStart: () => {
      const el = scheduleScrollRef.current;
      if (!el || el.scrollWidth <= el.clientWidth) return;
      if (!calendar.canGoPreviousPeriod() || calendar.isPending) return;
      scheduleNavDirectionRef.current = "backward";
      calendar.goToPreviousPeriod();
    },
    onReachEnd: () => {
      const el = scheduleScrollRef.current;
      if (!el || el.clientWidth === 0) return;
      if (!calendar.canGoNextPeriod() || calendar.isPending) return;
      scheduleNavDirectionRef.current = "forward";
      calendar.goToNextPeriod();
    },
    disabled: !isScheduleView,
  });

  const goToToday = () => {
    navDirectionRef.current = "none";
    scheduleNavDirectionRef.current = "none";
    calendar.goToCurrentPeriod();

    monthBufferRef.current = null;
    scheduleBufferRef.current = null;
    needsScrollResetRef.current = true;
    needsScheduleScrollResetRef.current = true;
    setBufferVersion((v) => v + 1);
    setScheduleBufferVersion((v) => v + 1);
  };

  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      initialData: {
        ...emptyFormData,
        resourceId: resources[0]?.id ?? "",
      },
    });
  };

  const handleEventClick = (
    event: Event<Resource>,
    scope?: RecurrenceEditScope,
  ) => {
    if (event.recurrence && !scope) {
      setScopeChoiceEvent(event);
      return;
    }
    openEditModal(event, scope);
  };

  const openEditModal = (
    event: Event<Resource>,
    scope: RecurrenceEditScope = event.recurrence ? "this" : "all",
  ) => {
    const masterEvent = calendar.getMasterEvent(event);
    const segmentInfo = calendar.getEventSegmentInfo(event);
    const startDate = new Date(segmentInfo.originalStart);
    const endDate = new Date(segmentInfo.originalEnd);
    const rule = masterEvent.recurrence;
    const isRecurring = !!rule;
    const eventResource = event.resources?.[0] ?? masterEvent.resources?.[0];
    const eventResourceId = eventResource ? getResourceId(eventResource) : "";

    setModalState({
      isOpen: true,
      mode: "edit",
      eventId: isRecurring ? event.id : masterEvent.id,
      occurrenceStart: isRecurring
        ? (event._occurrenceOriginalStart ?? segmentInfo.originalStart)
        : undefined,
      isRecurring,
      initialData: {
        title: event.title,
        startDate: formatDateToISO(startDate),
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: formatDateToISO(endDate),
        endTime: endDate.toTimeString().slice(0, 5),
        resourceId: eventResourceId || resources[0]?.id || "",
        consumption:
          event.consumption?.[0] ?? masterEvent.consumption?.[0] ?? 1,
        recurrenceFrequency: rule?.frequency ?? "none",
        recurrenceUntil: rule?.until ?? "",
        recurrenceEditScope: scope,
        allDay: !!event.allDay,
      },
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: EventFormData) => {
    setIsSaving(true);
    try {
      const recurrence: RecurrenceRule | undefined =
        data.recurrenceFrequency !== "none"
          ? {
              frequency: data.recurrenceFrequency,
              ...(data.recurrenceUntil ? { until: data.recurrenceUntil } : {}),
            }
          : undefined;

      const start = data.allDay
        ? `${data.startDate}T00:00:00`
        : `${data.startDate}T${data.startTime}:00`;
      const end = data.allDay
        ? `${data.endDate}T23:59:59`
        : `${data.endDate}T${data.endTime}:00`;
      const selectedResource = resources.find((r) => r.id === data.resourceId);
      const eventResources =
        data.allDay || !selectedResource ? [] : [selectedResource];
      const eventConsumption = data.allDay ? [] : [data.consumption];

      const updates: Partial<Omit<Event<Resource>, "id">> = {
        title: data.title,
        start,
        end,
        ...(modalState.isRecurring && data.recurrenceEditScope === "this"
          ? {}
          : { recurrence }),
        resources: eventResources,
        consumption: eventConsumption,
        allDay: data.allDay,
      };

      const result =
        modalState.mode === "edit" && modalState.eventId
          ? modalState.isRecurring
            ? await calendar.editRecurringEvent(modalState.eventId, updates, {
                scope: data.recurrenceEditScope,
                occurrenceStart: modalState.occurrenceStart,
              })
            : await calendar.editEvent(modalState.eventId, updates)
          : await calendar.addEvent({
              id: String(Date.now()),
              title: data.title,
              start,
              end,
              recurrence,
              resources: eventResources,
              consumption: eventConsumption,
              allDay: data.allDay,
            });
      if (!result.success) {
        setResizeError(result.error);
        throw new Error("Validation failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (data: EventFormData) => {
    if (!modalState.eventId) return;

    if (modalState.isRecurring) {
      calendar.removeRecurringEvent(modalState.eventId, {
        scope: data.recurrenceEditScope,
        occurrenceStart: modalState.occurrenceStart,
      });
      return;
    }

    calendar.removeEvent(modalState.eventId);
  };

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
            onClick={goToToday}
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
                calendar.changeViewMode({ value: 1, unit: "month" })
              }
              variant={
                calendar.viewMode.unit === "month" ? "secondary" : "outline"
              }
              size="sm"
            >
              Month
            </Button>
            <Button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: "week" })
              }
              variant={
                calendar.viewMode.unit === "week" ? "secondary" : "outline"
              }
              size="sm"
            >
              Week
            </Button>
            <Button
              onClick={() => calendar.changeViewMode({ value: 1, unit: "day" })}
              variant={
                calendar.viewMode.unit === "day" ? "secondary" : "outline"
              }
              size="sm"
            >
              Day
            </Button>
          </div>
        </div>

        {isScheduleView && (
          <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
              Overlap Layout
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(overlapModes) as Array<OverlapMode>).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setOverlapMode(mode)}
                  variant={overlapMode === mode ? "secondary" : "outline"}
                  size="sm"
                >
                  {overlapModeLabels[mode]}
                </Button>
              ))}
              <span className="ml-2 text-xs text-neutral-500">
                {overlapMode === "focus"
                  ? "Custom strategy: reads layout.concurrency / layout.depth"
                  : `Built-in "${overlapModes[overlapMode] as string}" strategy`}
              </span>
            </div>
          </div>
        )}

        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            Capacity Controls
          </div>
          <div className="flex flex-wrap gap-3">
            {resources.map((resource) => {
              const currentCapacity = resource.capacity?.[0] ?? 1;
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
                      );
                      setResources((prev) =>
                        prev.map((r) =>
                          r.id === resource.id
                            ? { ...r, capacity: [nextCapacity] }
                            : r,
                        ),
                      );
                    }}
                    className="h-8 w-24"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-lg font-medium text-neutral-400">
          {visibleMonth}
        </div>
      </div>

      {isScheduleView ? (
        <ScheduleView
          calendar={calendar}
          days={bufferedScheduleDays}
          resources={resources}
          onEventClick={handleEventClick}
          scrollRef={scheduleScrollRef}
          leftSentinelRef={scheduleLeftRef}
          rightSentinelRef={scheduleRightRef}
          periodDayCount={periodDayCount}
          overlapMode={overlapMode}
        />
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
          <div
            className="grid border-b border-neutral-800 bg-neutral-950 sticky top-0 z-10"
            style={{
              gridTemplateColumns: `repeat(${dayNames.length}, minmax(0, 1fr))`,
            }}
          >
            {dayNames.map((dayName: string, index: number) => (
              <div
                key={index}
                className={`py-3 text-center font-semibold text-sm text-neutral-500 ${
                  index < dayNames.length - 1
                    ? "border-r border-neutral-800"
                    : ""
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          <ScrollArea
            viewportRef={monthScrollRef}
            className="h-[calc(100vh-260px)]"
          >
            <div ref={monthTopRef} style={{ height: 1 }} aria-hidden />

            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${dayNames.length}, minmax(0, 1fr))`,
              }}
            >
              {bufferedWeekGroups.map(
                (
                  week: Array<Day<Resource, Event<Resource>> | null>,
                  weekIndex: number,
                ) => {
                  const weekKey =
                    week.find((d) => d !== null)?.isoDate ?? `w-${weekIndex}`;
                  return week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${weekKey}-${dayIndex}`}
                          className={`min-h-[120px] bg-neutral-950/50 ${
                            dayIndex < dayNames.length - 1
                              ? "border-r border-neutral-800"
                              : ""
                          } border-b border-neutral-800`}
                        />
                      );
                    }

                    const isToday = day.isToday;
                    const isInCurrentPeriod = day.isInCurrentPeriod;

                    return (
                      <div
                        key={day.isoDate}
                        data-day-date={day.isoDate}
                        className={`min-h-[120px] p-2 relative flex flex-col ${
                          dayIndex < dayNames.length - 1
                            ? "border-r border-neutral-800"
                            : ""
                        } border-b border-neutral-800 ${
                          isToday
                            ? "bg-neutral-900"
                            : isInCurrentPeriod
                              ? "bg-black"
                              : "bg-neutral-950/50"
                        }`}
                      >
                        <div
                          className={`text-sm mb-1 shrink-0 ${
                            isToday
                              ? "font-bold text-white"
                              : isInCurrentPeriod
                                ? "font-medium text-neutral-200"
                                : "font-medium text-neutral-500"
                          }`}
                        >
                          {Number(day.isoDate.slice(8, 10))}
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-h-0">
                          {day.allDayEvents.map((event) => (
                            <Badge
                              key={`ad-${event.id}`}
                              className="cursor-pointer bg-amber-700/70 hover:bg-amber-600/80 text-amber-50 border border-amber-600/40 flex items-center gap-1.5 max-w-full shrink-0 w-full"
                              title={event.title}
                              onClick={() => handleEventClick(event)}
                            >
                              <span className="truncate">{event.title}</span>
                            </Badge>
                          ))}
                          {day.events.map((event) => (
                            <ContextMenu key={event.id}>
                              <ContextMenuTrigger className="contents">
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-muted flex items-center gap-1.5 max-w-full shrink-0 w-full"
                                  title={event.title}
                                  onClick={() => handleEventClick(event)}
                                >
                                  <span className="flex items-center gap-1 min-w-0">
                                    {event.recurrence && (
                                      <span
                                        className="opacity-60 shrink-0"
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
                                        className="text-[10px] leading-none rounded bg-black/40 px-1 py-0.5 font-semibold shrink-0"
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
                                  {event.recurrence
                                    ? "Edit this occurrence"
                                    : "Edit event"}
                                </ContextMenuItem>
                                {event.recurrence && (
                                  <>
                                    <ContextMenuItem
                                      onClick={() =>
                                        openEditModal(event, "thisAndFollowing")
                                      }
                                    >
                                      Edit this and following
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      onClick={() =>
                                        openEditModal(event, "all")
                                      }
                                    >
                                      Edit series
                                    </ContextMenuItem>
                                  </>
                                )}
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
                        </div>
                      </div>
                    );
                  });
                },
              )}
            </div>

            <div ref={monthBottomRef} style={{ height: 1 }} aria-hidden />
          </ScrollArea>
        </div>
      )}

      {calendar.isPending && (
        <div className="fixed top-5 right-5 px-5 py-3 bg-card border border-border text-foreground rounded-md text-sm font-medium">
          Loading...
        </div>
      )}

      <ScopeChoiceModal
        event={scopeChoiceEvent}
        isOpen={!!scopeChoiceEvent}
        onSelect={(scope) => {
          if (scopeChoiceEvent) {
            openEditModal(scopeChoiceEvent, scope);
          }
          setScopeChoiceEvent(null);
        }}
        onClose={() => setScopeChoiceEvent(null)}
      />

      <ScopeChoiceModal
        event={null}
        title="Resize recurring event"
        isOpen={!!resizeScopeChoice}
        onSelect={(scope) => {
          const pending = resizeScopeChoice;
          setResizeScopeChoice(null);
          if (!pending) return;
          void calendar
            .editRecurringEvent(
              pending.eventId,
              { start: pending.newStart, end: pending.newEnd },
              { scope, occurrenceStart: pending.occurrenceStart },
            )
            .then((result) => {
              if (!result.success) setResizeError(result.error);
            });
        }}
        onClose={() => setResizeScopeChoice(null)}
      />

      <EventModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={modalState.mode === "edit" ? handleDelete : undefined}
        initialData={modalState.initialData}
        mode={modalState.mode}
        isRecurring={modalState.isRecurring}
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
  );
}

function App() {
  return (
    <>
      <TanStackDevtools plugins={[timeDevtoolsPlugin()]} />
      <CalendarView />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
