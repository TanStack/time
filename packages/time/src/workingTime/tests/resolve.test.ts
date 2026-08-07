import { describe, expect, it } from "vitest";
import {
  getWorkingTime,
  hasWorkingCalendar,
  resolveCalendarChain,
  resolveDayMinutes,
} from "../resolve";
import type { WorkingCalendar } from "../types";

const MONDAY = "2026-01-05";
const TUESDAY = "2026-01-06";
const SATURDAY = "2026-01-10";

const officeWeek: WorkingCalendar = {
  id: "project",
  label: "Company",
  intervals: [
    {
      isWorking: true,
      recurrent: {
        weekdays: [1, 2, 3, 4, 5],
        startTime: "09:00",
        endTime: "17:00",
      },
    },
  ],
};

describe("resolveCalendarChain", () => {
  it("returns root first, leaf last", () => {
    const calendars: Array<WorkingCalendar> = [
      officeWeek,
      { id: "team", parentId: "project", intervals: [] },
      { id: "ana", parentId: "team", intervals: [] },
    ];

    expect(resolveCalendarChain("ana", calendars).map((c) => c.id)).toEqual([
      "project",
      "team",
      "ana",
    ]);
  });

  it("is empty for an unknown or absent id", () => {
    expect(resolveCalendarChain("nope", [officeWeek])).toEqual([]);
    expect(resolveCalendarChain(undefined, [officeWeek])).toEqual([]);
    expect(hasWorkingCalendar("project", [officeWeek])).toBe(true);
    expect(hasWorkingCalendar("nope", [officeWeek])).toBe(false);
  });

  it("stops at a missing parent instead of failing", () => {
    const orphan: WorkingCalendar = {
      id: "ana",
      parentId: "gone",
      intervals: [],
    };

    expect(resolveCalendarChain("ana", [orphan]).map((c) => c.id)).toEqual([
      "ana",
    ]);
  });

  it("throws on a parent cycle", () => {
    const calendars: Array<WorkingCalendar> = [
      { id: "a", parentId: "b", intervals: [] },
      { id: "b", parentId: "a", intervals: [] },
    ];

    expect(() => resolveCalendarChain("a", calendars)).toThrow(
      /Working calendar cycle/,
    );
  });
});

describe("resolveDayMinutes", () => {
  it("expands a recurring working week", () => {
    expect(resolveDayMinutes("project", MONDAY, [officeWeek])).toEqual([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
    expect(resolveDayMinutes("project", SATURDAY, [officeWeek])).toEqual([]);
  });

  it("returns nothing when no calendar resolves", () => {
    expect(resolveDayMinutes(undefined, MONDAY, [officeWeek])).toEqual([]);
    expect(resolveDayMinutes("project", MONDAY, [])).toEqual([]);
  });

  it("falls through to the parent on a day the child does not paint", () => {
    const calendars: Array<WorkingCalendar> = [
      officeWeek,
      {
        id: "ana",
        parentId: "project",
        intervals: [{ isWorking: false, startDate: TUESDAY, endDate: TUESDAY }],
      },
    ];

    expect(resolveDayMinutes("ana", MONDAY, calendars)).toEqual([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
    expect(resolveDayMinutes("ana", TUESDAY, calendars)).toEqual([]);
  });

  it("lets a child punch a hole in the parent's working day", () => {
    const calendars: Array<WorkingCalendar> = [
      officeWeek,
      {
        id: "ana",
        parentId: "project",
        intervals: [
          {
            isWorking: false,
            startDate: MONDAY,
            endDate: MONDAY,
            startTime: "12:00",
            endTime: "13:00",
          },
        ],
      },
    ];

    expect(resolveDayMinutes("ana", MONDAY, calendars)).toEqual([
      { startMinutes: 540, endMinutes: 720 },
      { startMinutes: 780, endMinutes: 1020 },
    ]);
  });

  it("lets a child open time the parent leaves closed", () => {
    const calendars: Array<WorkingCalendar> = [
      officeWeek,
      {
        id: "ana",
        parentId: "project",
        intervals: [
          {
            isWorking: true,
            recurrent: {
              weekdays: [6],
              startTime: "10:00",
              endTime: "14:00",
            },
          },
        ],
      },
    ];

    expect(resolveDayMinutes("ana", SATURDAY, calendars)).toEqual([
      { startMinutes: 600, endMinutes: 840 },
    ]);
  });

  it("paints dated intervals over recurring ones regardless of array order", () => {
    const shutdown: WorkingCalendar = {
      id: "project",
      intervals: [
        { isWorking: false, startDate: MONDAY, endDate: TUESDAY },
        officeWeek.intervals[0]!,
      ],
    };

    expect(resolveDayMinutes("project", MONDAY, [shutdown])).toEqual([]);
    expect(resolveDayMinutes("project", "2026-01-07", [shutdown])).toEqual([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
  });

  it("clips a multi-day dated interval by time only on its edge days", () => {
    const calendars: Array<WorkingCalendar> = [
      {
        id: "always",
        intervals: [
          {
            isWorking: true,
            startDate: MONDAY,
            endDate: "2026-01-07",
            startTime: "08:00",
            endTime: "12:00",
          },
        ],
      },
    ];

    expect(resolveDayMinutes("always", MONDAY, calendars)).toEqual([
      { startMinutes: 480, endMinutes: 1440 },
    ]);
    expect(resolveDayMinutes("always", TUESDAY, calendars)).toEqual([
      { startMinutes: 0, endMinutes: 1440 },
    ]);
    expect(resolveDayMinutes("always", "2026-01-07", calendars)).toEqual([
      { startMinutes: 0, endMinutes: 720 },
    ]);
  });

  it("lets a project shutdown override a child's recurring shift", () => {
    const calendars: Array<WorkingCalendar> = [
      {
        id: "project",
        intervals: [{ isWorking: false, startDate: MONDAY, endDate: TUESDAY }],
      },
      {
        id: "ana",
        parentId: "project",
        intervals: [
          {
            isWorking: true,
            recurrent: {
              weekdays: [1, 2, 3, 4, 5],
              startTime: "09:00",
              endTime: "17:00",
            },
          },
        ],
      },
    ];

    expect(resolveDayMinutes("ana", MONDAY, calendars)).toEqual([]);
    expect(resolveDayMinutes("ana", "2026-01-07", calendars)).toEqual([
      { startMinutes: 540, endMinutes: 1020 },
    ]);
  });

  it("lets a child's dated exception win over a parent's dated shutdown", () => {
    const calendars: Array<WorkingCalendar> = [
      {
        id: "project",
        intervals: [{ isWorking: false, startDate: MONDAY, endDate: MONDAY }],
      },
      {
        id: "ana",
        parentId: "project",
        intervals: [
          {
            isWorking: true,
            startDate: MONDAY,
            endDate: MONDAY,
            startTime: "10:00",
            endTime: "12:00",
          },
        ],
      },
    ];

    expect(resolveDayMinutes("ana", MONDAY, calendars)).toEqual([
      { startMinutes: 600, endMinutes: 720 },
    ]);
  });

  it("resolves a three-level chain most-specific-wins", () => {
    const calendars: Array<WorkingCalendar> = [
      officeWeek,
      {
        id: "team",
        parentId: "project",
        intervals: [{ isWorking: false, startDate: MONDAY, endDate: MONDAY }],
      },
      {
        id: "ana",
        parentId: "team",
        intervals: [
          {
            isWorking: true,
            startDate: MONDAY,
            endDate: MONDAY,
            startTime: "10:00",
            endTime: "11:00",
          },
        ],
      },
    ];

    expect(resolveDayMinutes("team", MONDAY, calendars)).toEqual([]);
    expect(resolveDayMinutes("ana", MONDAY, calendars)).toEqual([
      { startMinutes: 600, endMinutes: 660 },
    ]);
  });
});

describe("getWorkingTime", () => {
  it("clips the first and last day to the range", () => {
    expect(
      getWorkingTime(
        "project",
        { start: `${MONDAY}T12:00`, end: "2026-01-07T10:00" },
        [officeWeek],
      ),
    ).toEqual([
      { start: "2026-01-05T12:00:00", end: "2026-01-05T17:00:00" },
      { start: "2026-01-06T09:00:00", end: "2026-01-06T17:00:00" },
      { start: "2026-01-07T09:00:00", end: "2026-01-07T10:00:00" },
    ]);
  });

  it("treats the range end as exclusive", () => {
    expect(
      getWorkingTime("project", { start: MONDAY, end: TUESDAY }, [officeWeek]),
    ).toEqual([{ start: "2026-01-05T09:00:00", end: "2026-01-05T17:00:00" }]);
  });

  it("merges across midnight when the calendar never closes", () => {
    const alwaysOpen: WorkingCalendar = {
      id: "24-7",
      intervals: [
        {
          isWorking: true,
          recurrent: {
            weekdays: [1, 2, 3, 4, 5, 6, 7],
            startTime: "00:00",
            endTime: "24:00",
          },
        },
      ],
    };

    expect(
      getWorkingTime("24-7", { start: MONDAY, end: "2026-01-07" }, [
        alwaysOpen,
      ]),
    ).toEqual([{ start: "2026-01-05T00:00:00", end: "2026-01-07T00:00:00" }]);
  });

  it("returns nothing for an empty or inverted range", () => {
    expect(
      getWorkingTime("project", { start: MONDAY, end: MONDAY }, [officeWeek]),
    ).toEqual([]);
    expect(
      getWorkingTime("project", { start: TUESDAY, end: MONDAY }, [officeWeek]),
    ).toEqual([]);
    expect(
      getWorkingTime("nope", { start: MONDAY, end: SATURDAY }, []),
    ).toEqual([]);
  });
});
