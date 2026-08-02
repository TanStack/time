import {
  formatMinutesToTime,
  MINUTES_IN_DAY,
  type MinuteRange,
} from "~/validation/availability";

export interface UnavailableRange {
  /** Start of the range as a fraction of the day (0-1) */
  startFraction: number;
  /** End of the range as a fraction of the day (0-1) */
  endFraction: number;
  /** Style-ready offset along the time axis, e.g. "33.333%" */
  top: string;
  /** Style-ready size along the time axis, e.g. "20.833%" */
  height: string;
  /** Start time as HH:mm string */
  startTime: string;
  /** End time as HH:mm string */
  endTime: string;
}

export function toUnavailableRanges(
  ranges: Array<MinuteRange>,
): Array<UnavailableRange> {
  return ranges.map((range) => {
    const startFraction = range.startMinutes / MINUTES_IN_DAY;
    const endFraction = range.endMinutes / MINUTES_IN_DAY;
    const durationFraction =
      (range.endMinutes - range.startMinutes) / MINUTES_IN_DAY;
    return {
      startFraction,
      endFraction,
      top: `${startFraction * 100}%`,
      height: `${durationFraction * 100}%`,
      startTime: formatMinutesToTime(range.startMinutes),
      endTime: formatMinutesToTime(range.endMinutes),
    };
  });
}
