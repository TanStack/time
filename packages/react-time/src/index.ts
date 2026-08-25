export { useCalendar } from './useCalendar'
export type {
  MoveOptions,
  MoveState,
  ResizeState,
  ResizeOptions,
  UseCalendarOptions,
} from './useCalendar'

export type {
  EventMutationError,
  EventMutationKind,
  ResizeError,
  AvailabilityConflict,
  UnavailabilityReason,
  SaveEventResult,
} from '@tanstack/time'

export {
  getDateParts,
  calculateDayShift,
  calculateMovedEvent,
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  calculateTimelineResizePreview,
  formatEventTimeRange,
  getEventDisplayTimeRange,
  getSegmentInfo,
  isMultiDayEvent,
} from '@tanstack/time'

export type {
  DateParts,
  GetDatePartsOptions,
  FormatPeriodOptions,
  MoveConstraints,
  MoveGranularity,
  MoveStartArgs,
  MoveToArgs,
  MovedEventResult,
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
} from '@tanstack/time'
