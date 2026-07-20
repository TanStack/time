import { describe, expect, it } from "vitest";
import {
  checkAvailability,
  type AvailabilityResourceInput,
  type AvailabilityTargetEvent,
  type CheckAvailabilityInput,
} from "../index";

const nineToFive: AvailabilityResourceInput = {
  id: "r1",
  label: "Room 1",
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" },
  ],
};

describe("checkAvailability", () => {
  it("passes when the event fits inside the availability window", () => {
    const event: AvailabilityTargetEvent = {
      id: "e1",
      title: "Standup",
      start: "2026-01-05T10:00:00",
      end: "2026-01-05T11:00:00",
    };
    const input: CheckAvailabilityInput = { event, resources: [nineToFive] };
    const conflicts = checkAvailability(input);
    expect(conflicts).toHaveLength(0);
  });

  it("flags outside-hours when the event runs past the window", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Late",
        start: "2026-01-05T16:00:00",
        end: "2026-01-05T18:00:00",
      },
      resources: [nineToFive],
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.reason).toBe("outside-hours");
  });

  it("flags no-availability when a resource has none configured", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Any",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [{ id: "r2", label: "Unconfigured" }],
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.reason).toBe("no-availability");
  });

  it("returns no conflict when there are no resources", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Any",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [],
    });
    expect(conflicts).toHaveLength(0);
  });

  it("flags capacity when overlapping consumption exceeds the resource capacity", () => {
    const capped: AvailabilityResourceInput = {
      id: "r1",
      label: "Room 1",
      availability: [
        { weekdays: [1, 2, 3, 4, 5], startTime: "00:00", endTime: "23:59" },
      ],
      capacity: [2],
    };

    const conflicts = checkAvailability({
      event: {
        id: "e-new",
        title: "New",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [capped],
      consumption: [2],
      otherEvents: [
        {
          id: "e-existing",
          start: "2026-01-05T10:30:00",
          end: "2026-01-05T11:30:00",
          resourceIds: ["r1"],
          consumption: [1],
        },
      ],
    });

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.reason).toBe("capacity");
    expect(conflicts[0]!.resourceDetails[0]!.capacityInfo).toEqual({
      max: 2,
      used: 3,
      remaining: 1,
    });
  });

  it("does not count a non-overlapping event against capacity", () => {
    const capped: AvailabilityResourceInput = {
      id: "r1",
      label: "Room 1",
      availability: [
        { weekdays: [1, 2, 3, 4, 5], startTime: "00:00", endTime: "23:59" },
      ],
      capacity: [2],
    };

    const conflicts = checkAvailability({
      event: {
        id: "e-new",
        title: "New",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [capped],
      consumption: [2],
      otherEvents: [
        {
          id: "e-existing",
          start: "2026-01-05T14:00:00",
          end: "2026-01-05T15:00:00",
          resourceIds: ["r1"],
          consumption: [2],
        },
      ],
    });

    expect(conflicts).toHaveLength(0);
  });
});
