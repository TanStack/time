import { describe, expect, it } from "vitest";
import { mergeUnavailableMinuteRanges } from "../unavailableRanges";
import type { AvailabilityResourceInput } from "../checkAvailability";

const MONDAY = "2026-01-05";
const SATURDAY = "2026-01-10";

const resource = (
  id: string,
  availability?: AvailabilityResourceInput["availability"],
): AvailabilityResourceInput => ({ id, label: id, availability });

const office = resource("office", [
  { weekdays: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" },
]);

describe("mergeUnavailableMinuteRanges", () => {
  it("returns null when no resource constrains the day", () => {
    expect(mergeUnavailableMinuteRanges([], MONDAY)).toBeNull();
    expect(mergeUnavailableMinuteRanges(null, MONDAY)).toBeNull();
    expect(mergeUnavailableMinuteRanges(undefined, MONDAY)).toBeNull();
  });

  it("returns null when resourceIds match nothing", () => {
    expect(
      mergeUnavailableMinuteRanges([office], MONDAY, ["other"]),
    ).toBeNull();
  });

  it("brackets a single availability window", () => {
    expect(mergeUnavailableMinuteRanges([office], MONDAY)).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1440 },
    ]);
  });

  it("blocks the whole day when the weekday has no slot", () => {
    expect(mergeUnavailableMinuteRanges([office], SATURDAY)).toEqual([
      { startMinutes: 0, endMinutes: 1440 },
    ]);
  });

  it("blocks the whole day when no resource declares availability", () => {
    expect(mergeUnavailableMinuteRanges([resource("free")], MONDAY)).toEqual([
      { startMinutes: 0, endMinutes: 1440 },
    ]);
  });

  it("unions availability across resources", () => {
    const evening = resource("evening", [
      { weekdays: [1], startTime: "18:00", endTime: "22:00" },
    ]);

    expect(mergeUnavailableMinuteRanges([office, evening], MONDAY)).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1080 },
      { startMinutes: 1320, endMinutes: 1440 },
    ]);
  });

  it("merges touching windows into one gap-free block", () => {
    const late = resource("late", [
      { weekdays: [1], startTime: "17:00", endTime: "20:00" },
    ]);

    expect(mergeUnavailableMinuteRanges([office, late], MONDAY)).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1200, endMinutes: 1440 },
    ]);
  });

  it("narrows the union to the requested resources", () => {
    const evening = resource("evening", [
      { weekdays: [1], startTime: "18:00", endTime: "22:00" },
    ]);

    expect(
      mergeUnavailableMinuteRanges([office, evening], MONDAY, ["evening"]),
    ).toEqual([
      { startMinutes: 0, endMinutes: 1080 },
      { startMinutes: 1320, endMinutes: 1440 },
    ]);
  });

  it("reports nothing unavailable for a round-the-clock resource", () => {
    const always = resource("always", [
      { weekdays: [1], startTime: "00:00", endTime: "24:00" },
    ]);

    expect(mergeUnavailableMinuteRanges([always], MONDAY)).toEqual([]);
  });

  it("does not leak mutable state between calls", () => {
    const first = mergeUnavailableMinuteRanges([office], MONDAY)!;
    first[0]!.endMinutes = 0;

    expect(mergeUnavailableMinuteRanges([office], MONDAY)![0]).toEqual({
      startMinutes: 0,
      endMinutes: 540,
    });
  });
});
