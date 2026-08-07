import { describe, expect, it } from "vitest";
import { mergeUnavailableMinuteRanges } from "../unavailableRanges";
import type { AvailabilityResourceInput } from "../checkAvailability";
import type { WorkingTimeConfig } from "../time";
import type { RecurrentWorkingInterval, WorkingCalendar } from "~/workingTime";

const MONDAY = "2026-01-05";
const SATURDAY = "2026-01-10";

const calendars: Array<WorkingCalendar> = [];
const workingTime: WorkingTimeConfig = { calendars };

const resource = (
  id: string,
  ...slots: Array<RecurrentWorkingInterval>
): AvailabilityResourceInput => {
  if (slots.length === 0) return { id, label: id };

  calendars.push({
    id,
    intervals: slots.map((recurrent) => ({ isWorking: true, recurrent })),
  });
  return { id, label: id, calendarId: id };
};

const office = resource("office", {
  weekdays: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
});

describe("mergeUnavailableMinuteRanges", () => {
  it("returns null when no resource constrains the day", () => {
    expect(mergeUnavailableMinuteRanges([], MONDAY, workingTime)).toBeNull();
    expect(mergeUnavailableMinuteRanges(null, MONDAY, workingTime)).toBeNull();
    expect(
      mergeUnavailableMinuteRanges(undefined, MONDAY, workingTime),
    ).toBeNull();
  });

  it("returns null when resourceIds match nothing", () => {
    expect(
      mergeUnavailableMinuteRanges([office], MONDAY, workingTime, ["other"]),
    ).toBeNull();
  });

  it("brackets a single working window", () => {
    expect(mergeUnavailableMinuteRanges([office], MONDAY, workingTime)).toEqual(
      [
        { startMinutes: 0, endMinutes: 540 },
        { startMinutes: 1020, endMinutes: 1440 },
      ],
    );
  });

  it("blocks the whole day when the weekday has no slot", () => {
    expect(
      mergeUnavailableMinuteRanges([office], SATURDAY, workingTime),
    ).toEqual([{ startMinutes: 0, endMinutes: 1440 }]);
  });

  it("blocks the whole day when no resource references a calendar", () => {
    expect(
      mergeUnavailableMinuteRanges([resource("free")], MONDAY, workingTime),
    ).toEqual([{ startMinutes: 0, endMinutes: 1440 }]);
  });

  it("unions working time across resources", () => {
    const evening = resource("evening", {
      weekdays: [1],
      startTime: "18:00",
      endTime: "22:00",
    });

    expect(
      mergeUnavailableMinuteRanges([office, evening], MONDAY, workingTime),
    ).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1020, endMinutes: 1080 },
      { startMinutes: 1320, endMinutes: 1440 },
    ]);
  });

  it("merges touching windows into one gap-free block", () => {
    const late = resource("late", {
      weekdays: [1],
      startTime: "17:00",
      endTime: "20:00",
    });

    expect(
      mergeUnavailableMinuteRanges([office, late], MONDAY, workingTime),
    ).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 1200, endMinutes: 1440 },
    ]);
  });

  it("narrows the union to the requested resources", () => {
    const evening = resource("evening-only", {
      weekdays: [1],
      startTime: "18:00",
      endTime: "22:00",
    });

    expect(
      mergeUnavailableMinuteRanges([office, evening], MONDAY, workingTime, [
        "evening-only",
      ]),
    ).toEqual([
      { startMinutes: 0, endMinutes: 1080 },
      { startMinutes: 1320, endMinutes: 1440 },
    ]);
  });

  it("reports nothing unavailable for a round-the-clock resource", () => {
    const always = resource("always", {
      weekdays: [1],
      startTime: "00:00",
      endTime: "24:00",
    });

    expect(mergeUnavailableMinuteRanges([always], MONDAY, workingTime)).toEqual(
      [],
    );
  });

  it("does not leak mutable state between calls", () => {
    const first = mergeUnavailableMinuteRanges([office], MONDAY, workingTime)!;
    first[0]!.endMinutes = 0;

    expect(
      mergeUnavailableMinuteRanges([office], MONDAY, workingTime)![0],
    ).toEqual({
      startMinutes: 0,
      endMinutes: 540,
    });
  });

  it("resolves a resource's calendar through its parent chain", () => {
    calendars.push({
      id: "ana",
      parentId: "office",
      intervals: [
        {
          isWorking: false,
          startDate: MONDAY,
          endDate: MONDAY,
          startTime: "12:00",
          endTime: "13:00",
        },
      ],
    });

    expect(
      mergeUnavailableMinuteRanges(
        [{ id: "ana", label: "Ana", calendarId: "ana" }],
        MONDAY,
        workingTime,
      ),
    ).toEqual([
      { startMinutes: 0, endMinutes: 540 },
      { startMinutes: 720, endMinutes: 780 },
      { startMinutes: 1020, endMinutes: 1440 },
    ]);
  });
});
