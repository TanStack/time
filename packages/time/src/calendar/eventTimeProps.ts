const extractDateFromDateTime = (dateTime: string): string =>
  dateTime.split("T")[0] ?? dateTime;

export interface SegmentInfo {
  isFirstSegment: boolean;

  isLastSegment: boolean;

  isSplitEvent: boolean;

  originalStart: string;

  originalEnd: string;

  segmentStart: string;

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

export function isMultiDayEvent(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate.toDateString() !== endDate.toDateString();
}

export interface FormatEventTimeOptions {
  locale?: string;

  alwaysShowDate?: boolean;
}

export interface FormattedEventTime {
  startFormatted: string;

  endFormatted: string;

  rangeFormatted: string;

  isMultiDay: boolean;
}

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
