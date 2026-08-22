import {
  hasAnyWorkingCalendar,
  invertMinuteRanges,
  resolveLayeredDayMinutes,
  type MinuteRange,
  type WorkingCalendar,
} from '~/workingTime'

export {
  formatMinutesToTime,
  invertMinuteRanges,
  mergeMinuteRanges,
  MINUTES_IN_DAY,
  parseHmToMinutes,
  type MinuteRange,
} from '~/workingTime'

export interface WorkingTimeConfig {
  calendars?: Array<WorkingCalendar> | null
  defaultCalendarId?: string
  multiResource?: 'intersection' | 'union'
}

interface CalendarReference {
  calendarId?: string
}

export interface ResourceDayWorkingTime {
  working: Array<MinuteRange>
  nonWorking: Array<MinuteRange>
  configured: boolean
}

export function effectiveCalendarId(
  target: CalendarReference,
  config: WorkingTimeConfig,
): string | undefined {
  return target.calendarId ?? config.defaultCalendarId
}

export function resourceDayWorkingTime(
  resource: CalendarReference,
  date: string,
  config: WorkingTimeConfig,
  eventCalendarId?: string,
): ResourceDayWorkingTime {
  const layers = [effectiveCalendarId(resource, config), eventCalendarId]
  const working = resolveLayeredDayMinutes(layers, date, config.calendars)

  return {
    working,
    nonWorking: invertMinuteRanges(working),
    configured: hasAnyWorkingCalendar(layers, config.calendars),
  }
}

export function applyMultiResourcePolicy<TDetail>(
  details: Array<TDetail>,
  resourceCount: number,
  config: WorkingTimeConfig,
): Array<TDetail> {
  if (config.multiResource !== 'union') return details
  return details.length >= resourceCount ? details : []
}
