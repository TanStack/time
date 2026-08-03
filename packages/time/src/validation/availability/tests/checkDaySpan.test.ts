import { describe, expect, it } from "vitest";
import { checkDaySpan } from "../checkDaySpan";
import type { AvailabilityResourceInput } from "../checkAvailability";

const MONDAY = "2026-01-05";
const SATURDAY = "2026-01-10";

const office: AvailabilityResourceInput = {
  id: "office",
  label: "Office",
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" },
  ],
};

const desk: AvailabilityResourceInput = {
  id: "desk",
  label: "Desk",
  availability: [{ weekdays: [1], startTime: "09:00", endTime: "17:00" }],
  capacity: [2],
};

describe("checkDaySpan", () => {
  it("passes a span inside the availability window", () => {
    expect(
      checkDaySpan({
        date: MONDAY,
        startMinutes: 600,
        endMinutes: 660,
        resources: [office],
      }),
    ).toEqual([]);
  });

  it("reports the clamped overlap with an unavailable range", () => {
    const [conflict] = checkDaySpan({
      date: MONDAY,
      startMinutes: 960,
      endMinutes: 1140,
      resources: [office],
    });

    expect(conflict).toMatchObject({
      date: MONDAY,
      conflictRange: { start: "17:00", end: "19:00" },
      resourceIds: ["office"],
    });
    expect(conflict!.resourceDetails[0]!.reason).toBe("outside-hours");
  });

  it("reports both bracketing ranges when the span covers the whole day", () => {
    const conflicts = checkDaySpan({
      date: MONDAY,
      startMinutes: 0,
      endMinutes: 1440,
      resources: [office],
    });

    expect(conflicts.map((c) => c.conflictRange)).toEqual([
      { start: "00:00", end: "09:00" },
      { start: "17:00", end: "24:00" },
    ]);
  });

  it("blocks a day the resource never works", () => {
    const [conflict] = checkDaySpan({
      date: SATURDAY,
      startMinutes: 600,
      endMinutes: 660,
      resources: [office],
    });

    expect(conflict).toMatchObject({
      conflictRange: { start: "10:00", end: "11:00" },
    });
    expect(conflict!.resourceDetails[0]!.description).toBe(
      "Office: Not available on this day",
    );
  });

  it("ignores an unavailable range another resource covers", () => {
    const evening: AvailabilityResourceInput = {
      id: "evening",
      label: "Evening",
      availability: [{ weekdays: [1], startTime: "17:00", endTime: "22:00" }],
    };

    expect(
      checkDaySpan({
        date: MONDAY,
        startMinutes: 960,
        endMinutes: 1140,
        resources: [office, evening],
      }),
    ).toEqual([]);
  });

  it("returns nothing when no resource constrains the span", () => {
    expect(
      checkDaySpan({
        date: MONDAY,
        startMinutes: 0,
        endMinutes: 1440,
        resources: [],
      }),
    ).toEqual([]);
  });

  it("flags a span that exceeds resource capacity", () => {
    const [conflict] = checkDaySpan({
      date: MONDAY,
      startMinutes: 600,
      endMinutes: 660,
      resources: [desk],
      consumption: [1],
      otherEvents: [
        {
          id: "other",
          startMinutes: 630,
          endMinutes: 690,
          resourceIds: ["desk"],
          consumption: [2],
        },
      ],
    });

    expect(conflict).toMatchObject({
      conflictRange: { start: "10:00", end: "11:00" },
      resourceIds: ["desk"],
      description: "Desk: Capacity exceeded (3/2 units used)",
    });
    expect(conflict!.resourceDetails[0]!.capacityInfo).toEqual({
      max: 2,
      used: 3,
      remaining: 0,
    });
  });

  it("counts only events that overlap and share the resource", () => {
    expect(
      checkDaySpan({
        date: MONDAY,
        startMinutes: 600,
        endMinutes: 660,
        resources: [desk],
        consumption: [2],
        otherEvents: [
          {
            id: "later",
            startMinutes: 660,
            endMinutes: 720,
            resourceIds: ["desk"],
            consumption: [2],
          },
          {
            id: "elsewhere",
            startMinutes: 600,
            endMinutes: 660,
            resourceIds: ["other-room"],
            consumption: [2],
          },
        ],
      }),
    ).toEqual([]);
  });

  it("treats a missing consumption as one unit", () => {
    const conflicts = checkDaySpan({
      date: MONDAY,
      startMinutes: 600,
      endMinutes: 660,
      resources: [desk],
      otherEvents: [
        {
          id: "a",
          startMinutes: 600,
          endMinutes: 660,
          resourceIds: ["desk"],
        },
        {
          id: "b",
          startMinutes: 600,
          endMinutes: 660,
          resourceIds: ["desk"],
        },
      ],
    });

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.description).toBe(
      "Desk: Capacity exceeded (3/2 units used)",
    );
  });

  it("skips capacity checks for resources without capacity", () => {
    expect(
      checkDaySpan({
        date: MONDAY,
        startMinutes: 600,
        endMinutes: 660,
        resources: [office],
        consumption: [99],
        otherEvents: [
          {
            id: "other",
            startMinutes: 600,
            endMinutes: 660,
            resourceIds: ["office"],
            consumption: [99],
          },
        ],
      }),
    ).toEqual([]);
  });
});
