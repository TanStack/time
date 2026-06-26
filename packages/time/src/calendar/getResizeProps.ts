import { Temporal } from "@js-temporal/polyfill";

export type ResizeEdge = "top" | "bottom" | "left" | "right";

export interface UnavailableTimeRange {
  /** Start time in minutes from midnight (0-1440) */
  startMinutes: number;
  /** End time in minutes from midnight (0-1440) */
  endMinutes: number;
}

export interface ResizeConstraints {
  minDurationMinutes?: number;
  snapToMinutes?: number;
  /** Unavailable time ranges that the event cannot be resized into */
  unavailableRanges?: Array<UnavailableTimeRange>;
}

const MINUTES_IN_DAY = 24 * 60;

const extractDateFromDateTime = (dateTime: string): string =>
  dateTime.split("T")[0] ?? dateTime;

interface CalculateResizedEventOptions {
  originalStart: string;
  originalEnd: string;
  edge: ResizeEdge;
  deltaMinutes: number;
  timeZone: Temporal.TimeZoneLike;
  constraints?: ResizeConstraints;
}

interface ResizedEventResult {
  start: string;
  end: string;
  durationMinutes: number;
}

const DEFAULT_MIN_DURATION_MINUTES = 15;
const DEFAULT_SNAP_TO_MINUTES = 15;

const roundToNearestInterval = (minutes: number, interval: number): number =>
  Math.round(minutes / interval) * interval;

const getMinutesFromMidnight = (zdt: Temporal.ZonedDateTime): number =>
  zdt.hour * 60 + zdt.minute;

const setMinutesFromMidnight = (
  zdt: Temporal.ZonedDateTime,
  minutes: number,
): Temporal.ZonedDateTime => {
  const clampedMinutes = Math.max(0, Math.min(minutes, MINUTES_IN_DAY - 1));
  const hours = Math.floor(clampedMinutes / 60);
  const mins = clampedMinutes % 60;
  return zdt.with({ hour: hours, minute: mins, second: 0, millisecond: 0 });
};

export function calculateResizedEvent(
  options: CalculateResizedEventOptions,
): ResizedEventResult {
  const {
    originalStart,
    originalEnd,
    edge,
    deltaMinutes,
    timeZone,
    constraints = {},
  } = options;

  const {
    minDurationMinutes = DEFAULT_MIN_DURATION_MINUTES,
    snapToMinutes = DEFAULT_SNAP_TO_MINUTES,
    unavailableRanges = [],
  } = constraints;

  const startZdt =
    Temporal.PlainDateTime.from(originalStart).toZonedDateTime(timeZone);
  const endZdt =
    Temporal.PlainDateTime.from(originalEnd).toZonedDateTime(timeZone);

  const snappedDelta = roundToNearestInterval(deltaMinutes, snapToMinutes);

  let newStartZdt = startZdt;
  let newEndZdt = endZdt;

  const isEntireDayUnavailable = unavailableRanges.some(
    (range) => range.startMinutes === 0 && range.endMinutes >= MINUTES_IN_DAY,
  );

  const effectiveEdge =
    edge === "left" ? "top" : edge === "right" ? "bottom" : edge;

  if (effectiveEdge === "top") {
    newStartZdt = startZdt.add({ minutes: snappedDelta });
    const maxStartZdt = endZdt.subtract({ minutes: minDurationMinutes });
    if (Temporal.ZonedDateTime.compare(newStartZdt, maxStartZdt) > 0) {
      newStartZdt = maxStartZdt;
    }

    if (isEntireDayUnavailable) {
      const originalStartMinutes = getMinutesFromMidnight(startZdt);
      newStartZdt = setMinutesFromMidnight(newStartZdt, originalStartMinutes);
    } else {
      let newStartMinutes = getMinutesFromMidnight(newStartZdt);

      for (const range of unavailableRanges) {
        if (
          newStartMinutes >= range.startMinutes &&
          newStartMinutes < range.endMinutes
        ) {
          if (range.endMinutes < MINUTES_IN_DAY) {
            newStartZdt = setMinutesFromMidnight(newStartZdt, range.endMinutes);
            newStartMinutes = range.endMinutes;
          } else if (range.startMinutes > 0) {
            const validTime = range.startMinutes - snapToMinutes;
            if (validTime >= 0) {
              newStartZdt = setMinutesFromMidnight(newStartZdt, validTime);
              newStartMinutes = validTime;
            }
          }
        }
      }
    }
  } else {
    newEndZdt = endZdt.add({ minutes: snappedDelta });
    const minEndZdt = startZdt.add({ minutes: minDurationMinutes });
    if (Temporal.ZonedDateTime.compare(newEndZdt, minEndZdt) < 0) {
      newEndZdt = minEndZdt;
    }

    if (isEntireDayUnavailable) {
      const originalEndMinutes = getMinutesFromMidnight(endZdt);
      newEndZdt = setMinutesFromMidnight(newEndZdt, originalEndMinutes);
    } else {
      let newEndMinutes = getMinutesFromMidnight(newEndZdt);

      for (const range of unavailableRanges) {
        if (
          newEndMinutes > range.startMinutes &&
          newEndMinutes <= range.endMinutes
        ) {
          if (range.startMinutes > 0) {
            newEndZdt = setMinutesFromMidnight(newEndZdt, range.startMinutes);
            newEndMinutes = range.startMinutes;
          } else if (range.endMinutes < MINUTES_IN_DAY) {
            const validTime = range.endMinutes + snapToMinutes;
            if (validTime <= MINUTES_IN_DAY) {
              newEndZdt = setMinutesFromMidnight(newEndZdt, validTime);
              newEndMinutes = validTime;
            }
          }
        }
      }
    }
  }

  const durationMs =
    newEndZdt.epochMilliseconds - newStartZdt.epochMilliseconds;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  return {
    start: newStartZdt.toPlainDateTime().toString(),
    end: newEndZdt.toPlainDateTime().toString(),
    durationMinutes,
  };
}

export function calculateDeltaMinutesFromPixels(
  deltaPixels: number,
  containerHeight: number,
  minutesInDay: number = 24 * 60,
): number {
  return (deltaPixels / containerHeight) * minutesInDay;
}

export function calculateDeltaMinutesFromPixelsHorizontal(
  deltaPixels: number,
  containerWidth: number,
  totalMinutesInView: number,
): number {
  return (deltaPixels / containerWidth) * totalMinutesInView;
}

export interface ResizeHandleStyle {
  position: "absolute";
  left: number;
  right: number;
  height: string;
  cursor: "ns-resize";
  zIndex: number;
  top?: number;
  bottom?: number;
}

export function getResizeHandleStyle(edge: ResizeEdge): ResizeHandleStyle {
  const baseStyle: ResizeHandleStyle = {
    position: "absolute",
    left: 0,
    right: 0,
    height: "8px",
    cursor: "ns-resize",
    zIndex: 10,
  };

  if (edge === "top") {
    return { ...baseStyle, top: 0 };
  }
  return { ...baseStyle, bottom: 0 };
}

/**
 * Information about a segment's position within a multi-day event
 */
export interface SegmentInfo {
  /** Whether this is the first segment of a multi-day event */
  isFirstSegment: boolean;
  /** Whether this is the last segment of a multi-day event */
  isLastSegment: boolean;
  /** Whether this segment is part of a split multi-day event */
  isSplitEvent: boolean;
  /** The original event start (before splitting) */
  originalStart: string;
  /** The original event end (before splitting) */
  originalEnd: string;
  /** The segment's start time */
  segmentStart: string;
  /** The segment's end time */
  segmentEnd: string;
}

export function getSegmentInfo(event: {
  start: string;
  end: string;
  _originalStart?: string;
  _originalEnd?: string;
}): SegmentInfo {
  const originalStart = event._originalStart ?? event.start;
  const originalEnd = event._originalEnd ?? event.end;
  const originalStartDate = extractDateFromDateTime(originalStart);
  const originalEndDate = extractDateFromDateTime(originalEnd);

  const segmentStart = event.start;
  const segmentEnd = event.end;
  const segmentStartDate = extractDateFromDateTime(segmentStart);
  const segmentEndDate = extractDateFromDateTime(segmentEnd);

  const isSplitEvent =
    event._originalStart !== undefined || event._originalEnd !== undefined;
  const isFirstSegment = originalStartDate === segmentStartDate;
  const isLastSegment =
    originalEndDate === segmentStartDate || originalEndDate === segmentEndDate;

  return {
    isFirstSegment,
    isLastSegment,
    isSplitEvent,
    originalStart,
    originalEnd,
    segmentStart,
    segmentEnd,
  };
}

/**
 * Style for positioned elements (events, ghosts)
 */
export interface PositionStyle {
  top: string;
  height: string;
}

/**
 * Result of resize preview calculation for a segment
 */
export interface SegmentResizePreview {
  /** Whether the segment should be hidden (shrunk away) */
  shouldHide: boolean;
  /** The preview style to apply, if any */
  previewStyle: PositionStyle | null;
  /** Whether the preview has changed from the original */
  hasChanged: boolean;
}

export interface ResizePreviewOptions {
  /** The date string of the day being rendered (YYYY-MM-DD) */
  dayDate: string;
  /** The original start of the event (before resize) */
  originalStart: string;
  /** The original end of the event (before resize) */
  originalEnd: string;
  /** The preview start during resize */
  previewStart: string;
  /** The preview end during resize */
  previewEnd: string;
}

/**
 * Calculates the resize preview state for a segment on a specific day
 */
export function calculateSegmentResizePreview(
  options: ResizePreviewOptions,
): SegmentResizePreview {
  const { dayDate, originalStart, originalEnd, previewStart, previewEnd } =
    options;

  const previewStartDate = extractDateFromDateTime(previewStart);
  const previewEndDate = extractDateFromDateTime(previewEnd);

  const previewAffectsThisDay =
    dayDate >= previewStartDate && dayDate <= previewEndDate;

  const hasChanged =
    previewStart !== originalStart || previewEnd !== originalEnd;

  if (!previewAffectsThisDay) {
    return { shouldHide: true, previewStyle: null, hasChanged };
  }

  if (!hasChanged) {
    return { shouldHide: false, previewStyle: null, hasChanged: false };
  }

  const isPreviewFirstDay = previewStartDate === dayDate;
  const isPreviewLastDay = previewEndDate === dayDate;

  let effectiveStart: string;
  let effectiveEnd: string;

  if (isPreviewFirstDay && isPreviewLastDay) {
    effectiveStart = previewStart;
    effectiveEnd = previewEnd;
  } else if (isPreviewFirstDay) {
    effectiveStart = previewStart;
    effectiveEnd = `${dayDate}T23:59:59`;
  } else if (isPreviewLastDay) {
    effectiveStart = `${dayDate}T00:00:00`;
    effectiveEnd = previewEnd;
  } else {
    effectiveStart = `${dayDate}T00:00:00`;
    effectiveEnd = `${dayDate}T23:59:59`;
  }

  const startDate = new Date(effectiveStart);
  const endDate = new Date(effectiveEnd);
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes =
    endDate.getHours() * 60 + endDate.getMinutes() || MINUTES_IN_DAY;

  const topPercent = (startMinutes / MINUTES_IN_DAY) * 100;
  const heightPercent = ((endMinutes - startMinutes) / MINUTES_IN_DAY) * 100;

  if (heightPercent <= 0) {
    return { shouldHide: true, previewStyle: null, hasChanged };
  }

  // Render the real geometry — never a min-height floor. Flooring pads the box
  // beyond the real edge, so resizing one edge makes the *other* (fixed) edge
  // appear to jump when the true size is revealed. Keeping geometry real means
  // the edge you are not dragging never moves.
  return {
    shouldHide: false,
    previewStyle: {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
    },
    hasChanged,
  };
}

export interface GhostPreviewOptions {
  /** The date string of the day being rendered (YYYY-MM-DD) */
  dayDate: string;
  /** The preview start during resize */
  previewStart: string;
  /** The preview end during resize */
  previewEnd: string;
}

/**
 * Calculates the ghost preview style for a day that doesn't have an existing segment
 */
export function calculateGhostPreviewStyle(
  options: GhostPreviewOptions,
): PositionStyle | null {
  const { dayDate, previewStart, previewEnd } = options;

  const previewStartDate = extractDateFromDateTime(previewStart);
  const previewEndDate = extractDateFromDateTime(previewEnd);

  const isDayInPreviewRange =
    dayDate >= previewStartDate && dayDate <= previewEndDate;

  if (!isDayInPreviewRange) {
    return null;
  }

  const isFirstDay = dayDate === previewStartDate;
  const isLastDay = dayDate === previewEndDate;

  let ghostTop: number;
  let ghostBottom: number;

  if (isFirstDay && isLastDay) {
    const startDate = new Date(previewStart);
    const endDate = new Date(previewEnd);
    ghostTop =
      ((startDate.getHours() * 60 + startDate.getMinutes()) / MINUTES_IN_DAY) *
      100;
    ghostBottom =
      ((endDate.getHours() * 60 + endDate.getMinutes()) / MINUTES_IN_DAY) * 100;
  } else if (isFirstDay) {
    const startDate = new Date(previewStart);
    ghostTop =
      ((startDate.getHours() * 60 + startDate.getMinutes()) / MINUTES_IN_DAY) *
      100;
    ghostBottom = 100;
  } else if (isLastDay) {
    const endDate = new Date(previewEnd);
    ghostTop = 0;
    ghostBottom =
      ((endDate.getHours() * 60 + endDate.getMinutes()) / MINUTES_IN_DAY) * 100;
  } else {
    ghostTop = 0;
    ghostBottom = 100;
  }

  const ghostHeight = ghostBottom - ghostTop;
  if (ghostHeight <= 0) {
    return null;
  }

  return {
    top: `${ghostTop}%`,
    height: `${ghostHeight}%`,
  };
}

export interface TimelineResizePreviewOptions {
  previewStart: string;
  previewEnd: string;
  firstDayIso: string;
  totalDays: number;
}

export interface TimelineResizePreviewStyle {
  left: string;
  width: string;
}

/**
 * Calculates left/width percentages for timeline resize preview
 */
export function calculateTimelineResizePreview(
  options: TimelineResizePreviewOptions,
): TimelineResizePreviewStyle {
  const { previewStart, previewEnd, firstDayIso, totalDays } = options;

  const startStr = previewStart;
  const endStr = previewEnd;
  const startDateStr = startStr.split("T")[0]!;
  const endDateStr = endStr.split("T")[0]!;
  const startTimeStr = startStr.split("T")[1] ?? "00:00:00";
  const endTimeStr = endStr.split("T")[1] ?? "00:00:00";

  const startTimeParts = startTimeStr.split(":").map(Number);
  const endTimeParts = endTimeStr.split(":").map(Number);

  const startDayOffset = Math.round(
    (new Date(startDateStr).getTime() - new Date(firstDayIso).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const endDayOffset = Math.round(
    (new Date(endDateStr).getTime() - new Date(firstDayIso).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const startHours =
    startDayOffset * 24 +
    (startTimeParts[0] ?? 0) +
    (startTimeParts[1] ?? 0) / 60;
  const endHours =
    endDayOffset * 24 + (endTimeParts[0] ?? 0) + (endTimeParts[1] ?? 0) / 60;

  const totalHours = totalDays * 24;

  const left = Math.max(0, (startHours / totalHours) * 100);
  const right = Math.min(100, (endHours / totalHours) * 100);
  const width = Math.max(0, right - left);

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
}

/**
 * Checks if an event spans multiple days
 */
export function isMultiDayEvent(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate.toDateString() !== endDate.toDateString();
}

export interface EventTimeRange {
  start: string;
  end: string;
  isMultiDay: boolean;
}

/**
 * Gets the time range to display for an event, considering resize state
 */
export function getEventDisplayTimeRange(options: {
  originalStart: string;
  originalEnd: string;
  isBeingResized?: boolean;
  previewStart?: string;
  previewEnd?: string;
}): EventTimeRange {
  const {
    originalStart,
    originalEnd,
    isBeingResized,
    previewStart,
    previewEnd,
  } = options;

  const displayStart =
    isBeingResized && previewStart ? previewStart : originalStart;
  const displayEnd = isBeingResized && previewEnd ? previewEnd : originalEnd;

  return {
    start: displayStart,
    end: displayEnd,
    isMultiDay: isMultiDayEvent(displayStart, displayEnd),
  };
}

export interface FormatEventTimeOptions {
  /** Locale for formatting (e.g., 'en-US') */
  locale?: string;
  /** Whether to include date for single-day events */
  alwaysShowDate?: boolean;
}

export interface FormattedEventTime {
  /** Formatted start string */
  startFormatted: string;
  /** Formatted end string */
  endFormatted: string;
  /** Full formatted range string */
  rangeFormatted: string;
  /** Whether this is a multi-day event */
  isMultiDay: boolean;
}

/**
 * Formats an event's time range for display
 * For multi-day events: includes date and time
 * For single-day events: includes only time (unless alwaysShowDate is true)
 */
export function formatEventTimeRange(
  start: string,
  end: string,
  options: FormatEventTimeOptions = {},
): FormattedEventTime {
  const { locale = "en-US", alwaysShowDate = false } = options;

  const startDate = new Date(start);
  const endDate = new Date(end);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  const showDate = isMultiDay || alwaysShowDate;

  const startFormatted = showDate
    ? startDate.toLocaleString(locale, dateTimeOptions)
    : startDate.toLocaleTimeString(locale, timeOptions);

  const endFormatted = showDate
    ? endDate.toLocaleString(locale, dateTimeOptions)
    : endDate.toLocaleTimeString(locale, timeOptions);

  return {
    startFormatted,
    endFormatted,
    rangeFormatted: `${startFormatted} - ${endFormatted}`,
    isMultiDay,
  };
}
