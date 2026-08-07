import { describe, expect, it } from "vitest";
import {
  effectiveCalendarId,
  getUnavailabilityDetails,
  parseHmToMinutes,
  resourceDayWorkingTime,
  type MinuteRange,
  type ResourceDayWorkingTime,
  type WorkingTimeConfig,
} from "../index";

const MONDAY = "2026-01-05";

const workingTime: WorkingTimeConfig = {
  calendars: [
    {
      id: "office",
      intervals: [
        {
          isWorking: true,
          recurrent: {
            weekdays: [1],
            startTime: "09:00",
            endTime: "12:00",
          },
        },
        {
          isWorking: true,
          recurrent: {
            weekdays: [1],
            startTime: "11:00",
            endTime: "17:00",
          },
        },
        {
          isWorking: true,
          recurrent: {
            weekdays: [2],
            startTime: "09:00",
            endTime: "10:00",
          },
        },
      ],
    },
    { id: "closed", intervals: [] },
  ],
};

describe("time helpers", () => {
  it("parseHmToMinutes converts HH:mm to minutes", () => {
    expect(parseHmToMinutes("00:00")).toBe(0);
    expect(parseHmToMinutes("09:30")).toBe(570);
    expect(parseHmToMinutes("23:59")).toBe(1439);
  });

  it("resourceDayWorkingTime merges overlapping intervals and derives gaps", () => {
    const info: ResourceDayWorkingTime = resourceDayWorkingTime(
      { calendarId: "office" },
      MONDAY,
      workingTime,
    );

    expect(info.working).toEqual<Array<MinuteRange>>([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
    expect(info.nonWorking).toEqual<Array<MinuteRange>>([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1440 },
    ]);
    expect(info.configured).toBe(true);
  });

  it("resourceDayWorkingTime separates a closed calendar from a missing one", () => {
    expect(resourceDayWorkingTime({}, MONDAY, workingTime)).toEqual({
      working: [],
      nonWorking: [{ startMinutes: 0, endMinutes: 1440 }],
      configured: false,
    });
    expect(
      resourceDayWorkingTime({ calendarId: "closed" }, MONDAY, workingTime)
        .configured,
    ).toBe(true);
  });

  it("effectiveCalendarId prefers the resource's own calendar", () => {
    expect(
      effectiveCalendarId(
        { calendarId: "office" },
        { ...workingTime, defaultCalendarId: "closed" },
      ),
    ).toBe("office");
    expect(
      effectiveCalendarId({}, { ...workingTime, defaultCalendarId: "closed" }),
    ).toBe("closed");
    expect(effectiveCalendarId({}, workingTime)).toBeUndefined();
  });

  it("getUnavailabilityDetails reports no-calendar for unreferenced resources", () => {
    const details = getUnavailabilityDetails(
      [{ id: "r1", label: "Room 1" }],
      MONDAY,
      600,
      660,
      workingTime,
    );
    expect(details).toHaveLength(1);
    expect(details[0]!.reason).toBe("no-calendar");
  });
});
