import {
  invertMinuteRanges,
  resolveDayMinutes,
  type MinuteRange,
} from "~/workingTime";
import type { WorkingCalendar } from "~/workingTime";

export {
  formatMinutesToTime,
  getWeekday,
  invertMinuteRanges,
  mergeMinuteRanges,
  MINUTES_IN_DAY,
  parseHmToMinutes,
  type MinuteRange,
} from "~/workingTime";

export interface AvailabilitySlotInput {
  weekdays: Array<number>;
  startTime: string;
  endTime: string;
}

export interface ResourceDayWorkingTime {
  working: Array<MinuteRange>;
  nonWorking: Array<MinuteRange>;
  configured: boolean;
}

const RESOURCE_CALENDAR_ID = "__resource__";

function calendarFromAvailability(
  availability: Array<AvailabilitySlotInput>,
): WorkingCalendar {
  return {
    id: RESOURCE_CALENDAR_ID,
    intervals: availability.map((slot) => ({
      isWorking: true,
      recurrent: {
        weekdays: slot.weekdays,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    })),
  };
}

export function resourceDayWorkingTime(
  availability: Array<AvailabilitySlotInput> | undefined,
  date: string,
): ResourceDayWorkingTime {
  const working = availability
    ? resolveDayMinutes(RESOURCE_CALENDAR_ID, date, [
        calendarFromAvailability(availability),
      ])
    : [];

  return {
    working,
    nonWorking: invertMinuteRanges(working),
    configured: availability !== undefined,
  };
}
