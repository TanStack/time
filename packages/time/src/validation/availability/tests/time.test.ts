import { describe, expect, it } from "vitest";
import {
  getUnavailabilityDetails,
  parseHmToMinutes,
  resourceDayAvail,
  type MinuteRange,
  type ResourceDayAvailability,
} from "../index";

describe("time helpers", () => {
  it("parseHmToMinutes converts HH:mm to minutes", () => {
    expect(parseHmToMinutes("00:00")).toBe(0);
    expect(parseHmToMinutes("09:30")).toBe(570);
    expect(parseHmToMinutes("23:59")).toBe(1439);
  });

  it("resourceDayAvail merges overlapping slots and derives gaps", () => {
    const info: ResourceDayAvailability = resourceDayAvail(
      [
        { weekdays: [1], startTime: "09:00", endTime: "12:00" },
        { weekdays: [1], startTime: "11:00", endTime: "17:00" },
        { weekdays: [2], startTime: "09:00", endTime: "10:00" },
      ],
      1,
    );

    expect(info.available).toEqual<Array<MinuteRange>>([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
    expect(info.unavailable).toEqual<Array<MinuteRange>>([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1440 },
    ]);
    expect(info.hasAvailability).toBe(true);
  });

  it("resourceDayAvail reports whole day unavailable when nothing configured", () => {
    const info = resourceDayAvail(undefined, 1);
    expect(info.hasAvailability).toBe(false);
    expect(info.unavailable).toEqual([{ startMinutes: 0, endMinutes: 1440 }]);
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
