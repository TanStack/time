import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";

const MINUTES_IN_DAY = 24 * 60;

export interface LayoutInputEvent {
  id: string;
  start: string | Date | number;
  end: string | Date | number;
}

export interface EventLayout {
  id: string;
  startFraction: number;
  endFraction: number;
  durationFraction: number;
  column: number;
  columnCount: number;
}

export type LayoutOrientation = "vertical" | "horizontal";

export interface LayoutStyle {
  top: string;
  height: string;
  left: string;
  width: string;
}

const minutesOfDay = (input: string | Date | number): number => {
  const dt = Temporal.PlainDateTime.from(toPlainDateTimeString(input));
  return dt.hour * 60 + dt.minute + dt.second / 60;
};

const toFraction = (minutes: number): number =>
  Math.min(1, Math.max(0, minutes / MINUTES_IN_DAY));

interface Interval {
  index: number;
  id: string;
  startMinutes: number;
  endMinutes: number;
}

const toInterval = (event: LayoutInputEvent, index: number): Interval => {
  const startMinutes = minutesOfDay(event.start);
  const rawEnd = minutesOfDay(event.end);
  return {
    index,
    id: event.id,
    startMinutes,
    endMinutes: rawEnd < startMinutes ? MINUTES_IN_DAY : rawEnd,
  };
};

const compareIntervals = (a: Interval, b: Interval): number => {
  if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
  if (a.endMinutes !== b.endMinutes) return b.endMinutes - a.endMinutes;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;
  return a.index - b.index;
};

const assignColumns = (
  cluster: Array<Interval>,
): Array<{ interval: Interval; column: number }> => {
  const columnEnds: Array<number> = [];
  return cluster.map((interval) => {
    let column = columnEnds.findIndex((end) => end <= interval.startMinutes);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = interval.endMinutes;
    return { interval, column };
  });
};

export function layoutDaySegments(
  events: Array<LayoutInputEvent>,
): Array<EventLayout> {
  const intervals = events.map(toInterval).sort(compareIntervals);

  const layouts: Array<EventLayout> = Array.from({ length: events.length });
  let cluster: Array<Interval> = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (cluster.length === 0) return;
    const assigned = assignColumns(cluster);
    const columnCount = assigned.reduce(
      (max, item) => Math.max(max, item.column + 1),
      1,
    );
    for (const { interval, column } of assigned) {
      layouts[interval.index] = {
        id: interval.id,
        startFraction: toFraction(interval.startMinutes),
        endFraction: toFraction(interval.endMinutes),
        durationFraction: toFraction(
          Math.max(0, interval.endMinutes - interval.startMinutes),
        ),
        column,
        columnCount,
      };
    }
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const interval of intervals) {
    if (interval.startMinutes >= clusterEnd) flush();
    cluster.push(interval);
    clusterEnd = Math.max(clusterEnd, interval.endMinutes);
  }
  flush();

  return layouts;
}

const percent = (value: number): string => `${value * 100}%`;

export function toLayoutStyle(
  layout: EventLayout,
  orientation: LayoutOrientation = "vertical",
): LayoutStyle {
  const timeStart = percent(layout.startFraction);
  const timeSize = percent(layout.durationFraction);
  const crossStart = percent(layout.column / layout.columnCount);
  const crossSize = percent(1 / layout.columnCount);

  if (orientation === "horizontal") {
    return {
      left: timeStart,
      width: timeSize,
      top: crossStart,
      height: crossSize,
    };
  }

  return {
    top: timeStart,
    height: timeSize,
    left: crossStart,
    width: crossSize,
  };
}
