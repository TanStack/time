export { useCalendar } from "./useCalendar";
export type {
  ResizeState,
  ResizeOptions,
  UseCalendarOptions,
} from "./useCalendar";

export type {
  ResizeError,
  AvailabilityConflict,
  UnavailabilityReason,
  SaveEventResult,
} from "@tanstack/time";

export {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  calculateTimelineResizePreview,
  formatEventTimeRange,
  getEventDisplayTimeRange,
  getSegmentInfo,
  isMultiDayEvent,
} from "@tanstack/time";

export type {
  EventTimeRange,
  FormatEventTimeOptions,
  FormattedEventTime,
  GhostPreviewOptions,
  PositionStyle,
  ResizePreviewOptions,
  SegmentInfo,
  SegmentResizePreview,
  TimelineResizePreviewOptions,
  TimelineResizePreviewStyle,
} from "@tanstack/time";
