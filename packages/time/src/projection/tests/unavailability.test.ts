import { describe, expect, it } from "vitest";
import { toUnavailableRanges } from "../unavailability";

describe("toUnavailableRanges", () => {
  it("maps minute ranges to fractions, percentages and clock times", () => {
    expect(
      toUnavailableRanges([{ startMinutes: 540, endMinutes: 1020 }]),
    ).toEqual([
      {
        startFraction: 540 / 1440,
        endFraction: 1020 / 1440,
        top: "37.5%",
        height: `${(480 / 1440) * 100}%`,
        startTime: "09:00",
        endTime: "17:00",
      },
    ]);
  });

  it("keeps a full-day block at 0-100%", () => {
    expect(
      toUnavailableRanges([{ startMinutes: 0, endMinutes: 1440 }]),
    ).toEqual([
      {
        startFraction: 0,
        endFraction: 1,
        top: "0%",
        height: "100%",
        startTime: "00:00",
        endTime: "24:00",
      },
    ]);
  });

  it("maps every range in order", () => {
    const ranges = toUnavailableRanges([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1440 },
    ]);

    expect(ranges.map((r) => [r.top, r.height])).toEqual([
      ["0%", `${(540 / 1440) * 100}%`],
      [`${(1020 / 1440) * 100}%`, `${(420 / 1440) * 100}%`],
    ]);
  });

  it("returns nothing for an empty list", () => {
    expect(toUnavailableRanges([])).toEqual([]);
  });
});
