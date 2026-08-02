import { Temporal } from "@js-temporal/polyfill";
import { toPlainDateTimeString } from "~/date/parse";

const MINUTES_IN_DAY = 24 * 60;

export interface LayoutInputEvent {
  id: string;
  start: string | Date | number;
  end: string | Date | number;
}

export interface OverlapInfo {
  id: string;
  /** Position in the array passed in, so results can be zipped back to inputs. */
  index: number;
  startFraction: number;
  endFraction: number;
  durationFraction: number;
  /** Ids of the events that overlap this one in time. */
  overlapping: Array<string>;
  /** How many events share this event's time, counting itself. */
  concurrency: number;
  /** How many overlapping events start before this one. 0 means nothing is to its left. */
  depth: number;
  /** Index of the connected overlap group this event belongs to. */
  cluster: number;
  /** Number of events in that group. */
  clusterSize: number;
  /** Highest `depth` in that group. */
  clusterDepth: number;
  /** Highest `concurrency` in that group. */
  clusterConcurrency: number;
  /** Slot this event was packed into by greedy interval coloring. */
  column: number;
  /** Slots the group needs — the minimum number of side-by-side tracks. */
  columnCount: number;
  /** Free slots directly after `column`, counting itself. */
  columnSpan: number;
}

export interface CrossPlacement {
  /** Offset on the cross axis as a fraction of the track (0-1). */
  crossStart: number;
  /** Size on the cross axis as a fraction of the track (0-1). */
  crossSize: number;
  /**
   * Paint order; higher sits on top. Omit to leave stacking to CSS — a strategy that overlays
   * events must return it for every event, including the bottom one, or CSS decides the order.
   */
  zIndex?: number;
}

export type EventLayout = OverlapInfo & CrossPlacement;

export type LayoutStrategyFn = (info: OverlapInfo) => CrossPlacement;

export type OverlapStrategy = "columns" | "expand" | "cascade";

export interface LayoutOptions {
  /**
   * How concurrent events share the cross axis. Pass a name for a built-in, or your own
   * function of the overlap facts.
   * - `columns`: equal side-by-side slices (default)
   * - `expand`: like `columns`, but each event absorbs the free slices next to it
   * - `cascade`: each concurrent event is inset and narrower, stacked on top
   */
  strategy?: OverlapStrategy | LayoutStrategyFn;
  /** `cascade` only: inset per depth level as a fraction of the track. */
  cascadeOffset?: number;
  /** `cascade` only: smallest cross-axis size an event may shrink to. */
  minCrossSize?: number;
}

export type LayoutOrientation = "vertical" | "horizontal";

export interface LayoutStyle {
  top: string;
  height: string;
  left: string;
  width: string;
  /** Only set when the layout stacks events, so flat layouts leave CSS in charge. */
  zIndex?: number;
}

const DEFAULT_CASCADE_OFFSET = 0.2;
const DEFAULT_MIN_CROSS_SIZE = 0.3;

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

interface Placed {
  interval: Interval;
  column: number;
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

const overlaps = (a: Interval, b: Interval): boolean =>
  a.startMinutes < b.endMinutes && a.endMinutes > b.startMinutes;

const assignColumns = (cluster: Array<Interval>): Array<Placed> => {
  const columnEnds: Array<number> = [];
  return cluster.map((interval) => {
    let column = columnEnds.findIndex((end) => end <= interval.startMinutes);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = interval.endMinutes;
    return { interval, column };
  });
};

const columnSpanOf = (
  placed: Placed,
  cluster: Array<Placed>,
  columnCount: number,
): number => {
  let span = 1;
  while (placed.column + span < columnCount) {
    const blocked = cluster.some(
      (other) =>
        other.column === placed.column + span &&
        overlaps(other.interval, placed.interval),
    );
    if (blocked) break;
    span++;
  }
  return span;
};

const toClusters = (intervals: Array<Interval>): Array<Array<Interval>> => {
  const clusters: Array<Array<Interval>> = [];
  let current: Array<Interval> = [];
  let clusterEnd = -Infinity;

  for (const interval of intervals) {
    if (interval.startMinutes >= clusterEnd && current.length > 0) {
      clusters.push(current);
      current = [];
      clusterEnd = -Infinity;
    }
    current.push(interval);
    clusterEnd = Math.max(clusterEnd, interval.endMinutes);
  }
  if (current.length > 0) clusters.push(current);

  return clusters;
};

export function analyzeOverlaps(
  events: Array<LayoutInputEvent>,
): Array<OverlapInfo> {
  const intervals = events.map(toInterval).sort(compareIntervals);
  const infos: Array<OverlapInfo> = Array.from({ length: events.length });

  toClusters(intervals).forEach((cluster, clusterIndex) => {
    const placed = assignColumns(cluster);
    const columnCount = placed.reduce(
      (max, item) => Math.max(max, item.column + 1),
      1,
    );

    const overlapping = cluster.map((interval) =>
      cluster.filter(
        (other) => other !== interval && overlaps(other, interval),
      ),
    );
    const depths = cluster.map((interval, i) =>
      overlapping[i]!.reduce(
        (count, other) =>
          compareIntervals(other, interval) < 0 ? count + 1 : count,
        0,
      ),
    );
    const clusterDepth = depths.reduce((max, d) => Math.max(max, d), 0);
    const clusterConcurrency = overlapping.reduce(
      (max, list) => Math.max(max, list.length + 1),
      1,
    );

    placed.forEach((item, i) => {
      infos[item.interval.index] = {
        id: item.interval.id,
        index: item.interval.index,
        startFraction: toFraction(item.interval.startMinutes),
        endFraction: toFraction(item.interval.endMinutes),
        durationFraction: toFraction(
          Math.max(0, item.interval.endMinutes - item.interval.startMinutes),
        ),
        overlapping: overlapping[i]!.map((other) => other.id),
        concurrency: overlapping[i]!.length + 1,
        depth: depths[i]!,
        cluster: clusterIndex,
        clusterSize: cluster.length,
        clusterDepth,
        clusterConcurrency,
        column: item.column,
        columnCount,
        columnSpan: columnSpanOf(item, placed, columnCount),
      };
    });
  });

  return infos;
}

export const columnsStrategy: LayoutStrategyFn = (info) => ({
  crossStart: info.column / info.columnCount,
  crossSize: 1 / info.columnCount,
});

export const expandStrategy: LayoutStrategyFn = (info) => ({
  crossStart: info.column / info.columnCount,
  crossSize: info.columnSpan / info.columnCount,
});

export const cascadeStrategy = (
  options: Pick<LayoutOptions, "cascadeOffset" | "minCrossSize"> = {},
): LayoutStrategyFn => {
  const offset = options.cascadeOffset ?? DEFAULT_CASCADE_OFFSET;
  const minCrossSize = options.minCrossSize ?? DEFAULT_MIN_CROSS_SIZE;

  return (info) => {
    const step =
      info.clusterDepth === 0
        ? 0
        : Math.min(offset, (1 - minCrossSize) / info.clusterDepth);
    return {
      crossStart: info.depth * step,
      crossSize: 1 - info.depth * step,
      zIndex: info.depth,
    };
  };
};

const resolveStrategy = (options: LayoutOptions): LayoutStrategyFn => {
  if (typeof options.strategy === "function") return options.strategy;
  if (options.strategy === "expand") return expandStrategy;
  if (options.strategy === "cascade") return cascadeStrategy(options);
  return columnsStrategy;
};

export function layoutDaySegments(
  events: Array<LayoutInputEvent>,
  options: LayoutOptions = {},
): Array<EventLayout> {
  const strategy = resolveStrategy(options);

  return analyzeOverlaps(events).map((info) => ({
    ...info,
    ...strategy(info),
  }));
}

const percent = (value: number): string => `${value * 100}%`;

export function toLayoutStyle(
  layout: EventLayout,
  orientation: LayoutOrientation = "vertical",
): LayoutStyle {
  const timeStart = percent(layout.startFraction);
  const timeSize = percent(layout.durationFraction);
  const crossStart = percent(layout.crossStart);
  const crossSize = percent(layout.crossSize);
  const stacking = layout.zIndex === undefined ? {} : { zIndex: layout.zIndex };

  if (orientation === "horizontal") {
    return {
      left: timeStart,
      width: timeSize,
      top: crossStart,
      height: crossSize,
      ...stacking,
    };
  }

  return {
    top: timeStart,
    height: timeSize,
    left: crossStart,
    width: crossSize,
    ...stacking,
  };
}
