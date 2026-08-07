import { describe, expect, it } from "vitest";
import {
  getUnavailabilityDetails,
  parseHmToMinutes,
  resourceDayWorkingTime,
  type MinuteRange,
  type ResourceDayWorkingTime,
} from "../index";

const MONDAY = "2026-01-05";

describe("time helpers", () => {
  it("parseHmToMinutes converts HH:mm to minutes", () => {
    expect(parseHmToMinutes("00:00")).toBe(0);
    expect(parseHmToMinutes("09:30")).toBe(570);
    expect(parseHmToMinutes("23:59")).toBe(1439);
  });

  it("resourceDayWorkingTime merges overlapping slots and derives gaps", () => {
    const info: ResourceDayWorkingTime = resourceDayWorkingTime(
      [
        { weekdays: [1], startTime: "09:00", endTime: "12:00" },
        { weekdays: [1], startTime: "11:00", endTime: "17:00" },
        { weekdays: [2], startTime: "09:00", endTime: "10:00" },
      ],
      MONDAY,
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

  it("resourceDayWorkingTime joins adjacent slots into one working range", () => {
    const info = resourceDayWorkingTime(
      [
        { weekdays: [1], startTime: "09:00", endTime: "12:00" },
        { weekdays: [1], startTime: "12:00", endTime: "17:00" },
      ],
      MONDAY,
    );

    expect(info.working).toEqual<Array<MinuteRange>>([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
  });

  it("resourceDayWorkingTime separates configured-but-closed from unconfigured", () => {
    expect(resourceDayWorkingTime(undefined, MONDAY)).toEqual({
      working: [],
      nonWorking: [{ startMinutes: 0, endMinutes: 1440 }],
      configured: false,
    });
    expect(resourceDayWorkingTime([], MONDAY).configured).toBe(true);
  });

  it("getUnavailabilityDetails reports no-availability for unconfigured resources", () => {
    const details = getUnavailabilityDetails(
      [{ id: "r1", label: "Room 1" }],
      "2026-01-05",
      600,
      660,
    );
    expect(details).toHaveLength(1);
    expect(details[0]!.reason).toBe("no-availability");
  });
});
