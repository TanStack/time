export { useCalendar } from './useCalendar'
export type {
  ResizeState,
  ResizeOptions,
  UseCalendarOptions,
} from './useCalendar'

// Re-export ResizeError and AvailabilityConflict from core package
export type {
  ResizeError,
  AvailabilityConflict,
  UnavailabilityReason,
} from '@tanstack/time'

export {
  calculateGhostPreviewStyle,
  calculateSegmentResizePreview,
  formatEventTimeRange,
  getEventDisplayTimeRange,
  getSegmentInfo,
  isMultiDayEvent,
} from '@tanstack/time'

export type {
  EventTimeRange,
  FormatEventTimeOptions,
  FormattedEventTime,
  GhostPreviewOptions,
  PositionStyle,
  ResizePreviewOptions,
  SegmentInfo,
  SegmentResizePreview,
} from '@tanstack/time'
