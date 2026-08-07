import {
  hasWorkingCalendar,
  invertMinuteRanges,
  resolveDayMinutes,
  type MinuteRange,
  type WorkingCalendar,
} from "~/workingTime";

export {
  formatMinutesToTime,
  getWeekday,
  invertMinuteRanges,
  mergeMinuteRanges,
  MINUTES_IN_DAY,
  parseHmToMinutes,
  type MinuteRange,
} from "~/workingTime";

export interface WorkingTimeConfig {
  calendars?: Array<WorkingCalendar> | null;
  defaultCalendarId?: string;
}

export interface CalendarReference {
  calendarId?: string;
}

export interface ResourceDayWorkingTime {
  working: Array<MinuteRange>;
  nonWorking: Array<MinuteRange>;
  configured: boolean;
}

export function effectiveCalendarId(
  target: CalendarReference,
  config: WorkingTimeConfig,
): string | undefined {
  return target.calendarId ?? config.defaultCalendarId;
}

export function resourceDayWorkingTime(
  resource: CalendarReference,
  date: string,
  config: WorkingTimeConfig,
): ResourceDayWorkingTime {
  const calendarId = effectiveCalendarId(resource, config);
  const working = resolveDayMinutes(calendarId, date, config.calendars);

  return {
    working,
    nonWorking: invertMinuteRanges(working),
    configured: hasWorkingCalendar(calendarId, config.calendars),
  };
}
