import { Temporal } from "@js-temporal/polyfill";
import { getLayeredWorkingTime, hasAnyWorkingCalendar } from "~/workingTime";
import { effectiveCalendarId, type WorkingTimeConfig } from "../availability";
import type { WorkingCalendar } from "~/workingTime";

export interface DurationEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
  calendarId?: string;
  duration?: number;
  effort?: number;
}

export interface DurationResourceInput {
  id: string;
  calendarId?: string;
}

export interface CheckDurationInput {
  event: DurationEvent;
  resources?: Array<DurationResourceInput>;
  workingTime: WorkingTimeConfig;
}

export interface DurationConflict {
  eventId: string;
  eventTitle: string;
  reason: "duration-mismatch" | "effort-exceeds-duration";
  declared: number;
  actual: number;
  message: string;
}

function wallClockMinutes(start: string, end: string): number {
  return Temporal.PlainDateTime.from(start)
    .until(Temporal.PlainDateTime.from(end))
    .total({ unit: "minute" });
}

function layersOf(
  resources: Array<DurationResourceInput>,
  workingTime: WorkingTimeConfig,
  eventCalendarId?: string,
): Array<Array<string | undefined>> {
  const bases =
    resources.length > 0
      ? resources.map((resource) => effectiveCalendarId(resource, workingTime))
      : [workingTime.defaultCalendarId];

  return bases.map((base) => [base, eventCalendarId]);
}

export function workingMinutesBetween(
  range: { start: string; end: string },
  resources: Array<DurationResourceInput>,
  workingTime: WorkingTimeConfig,
  eventCalendarId?: string,
): number {
  if (range.end <= range.start) return 0;

  const layers = layersOf(resources, workingTime, eventCalendarId);
  const calendars: Array<WorkingCalendar> | null | undefined =
    workingTime.calendars;
  if (!hasAnyWorkingCalendar(layers.flat(), calendars)) {
    return wallClockMinutes(range.start, range.end);
  }

  return getLayeredWorkingTime(layers, range, calendars).reduce(
    (total, span) => total + wallClockMinutes(span.start, span.end),
    0,
  );
}

export function checkDuration(
  input: CheckDurationInput,
): Array<DurationConflict> {
  const { event } = input;
  if (event.duration === undefined && event.effort === undefined) return [];

  const actual = workingMinutesBetween(
    { start: event.start, end: event.end },
    input.resources ?? [],
    input.workingTime,
    event.calendarId,
  );

  const conflicts: Array<DurationConflict> = [];
  const conflict = (
    reason: DurationConflict["reason"],
    declared: number,
    against: number,
    message: string,
  ) => {
    conflicts.push({
      eventId: event.id ?? "",
      eventTitle: event.title,
      reason,
      declared,
      actual: against,
      message,
    });
  };

  if (event.duration !== undefined && event.duration !== actual) {
    conflict(
      "duration-mismatch",
      event.duration,
      actual,
      `"${event.title}" declares ${event.duration}m of duration but spans ${actual}m of working time`,
    );
  }

  const available = event.duration ?? actual;
  if (event.effort !== undefined && event.effort > available) {
    conflict(
      "effort-exceeds-duration",
      event.effort,
      available,
      `"${event.title}" declares ${event.effort}m of effort but only ${available}m of duration`,
    );
  }

  return conflicts;
}
