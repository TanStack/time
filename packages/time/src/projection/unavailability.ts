import { formatMinutesToTime, MINUTES_IN_DAY, type MinuteRange } from '~/validation/availability'

export interface UnavailableRange {
  startFraction: number

  endFraction: number

  top: string

  height: string

  startTime: string

  endTime: string
}

export function toUnavailableRanges(ranges: Array<MinuteRange>): Array<UnavailableRange> {
  return ranges.map((range) => {
    const startFraction = range.startMinutes / MINUTES_IN_DAY
    const endFraction = range.endMinutes / MINUTES_IN_DAY
    const durationFraction = (range.endMinutes - range.startMinutes) / MINUTES_IN_DAY
    return {
      startFraction,
      endFraction,
      top: `${startFraction * 100}%`,
      height: `${durationFraction * 100}%`,
      startTime: formatMinutesToTime(range.startMinutes),
      endTime: formatMinutesToTime(range.endMinutes),
    }
  })
}
