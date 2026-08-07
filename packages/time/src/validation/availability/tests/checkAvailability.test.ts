import { describe, expect, it } from "vitest";
import {
  checkAvailability,
  type AvailabilityResourceInput,
  type AvailabilityTargetEvent,
  type CheckAvailabilityInput,
  type WorkingTimeConfig,
} from "../index";
import type { RecurrentWorkingInterval, WorkingCalendar } from "~/workingTime";

const hours = (
  id: string,
  ...slots: Array<RecurrentWorkingInterval>
): WorkingCalendar => ({
  id,
  intervals: slots.map((recurrent) => ({ isWorking: true, recurrent })),
});

const nineToFive: AvailabilityResourceInput = {
  id: "r1",
  label: "Room 1",
  calendarId: "office",
};

const workingTime: WorkingTimeConfig = {
  calendars: [
    hours("office", {
      weekdays: [1, 2, 3, 4, 5],
      startTime: "09:00",
      endTime: "17:00",
    }),
    hours("open", {
      weekdays: [1, 2, 3, 4, 5],
      startTime: "00:00",
      endTime: "23:59",
    }),
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
    const input: CheckAvailabilityInput = {
      event,
      resources: [nineToFive],
      workingTime,
    };
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
      workingTime,
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.reason).toBe("outside-hours");
  });

  it("flags no-calendar when a resource references none", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Any",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [{ id: "r2", label: "Unconfigured" }],
      workingTime,
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.reason).toBe("no-calendar");
  });

  it("flags no-calendar when the referenced calendar does not exist", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Any",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [{ id: "r2", label: "Dangling", calendarId: "gone" }],
      workingTime,
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.reason).toBe("no-calendar");
  });

  it("falls back to the default calendar when a resource names none", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Standup",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
      resources: [{ id: "r2", label: "Inherits" }],
      workingTime: { ...workingTime, defaultCalendarId: "office" },
    });
    expect(conflicts).toHaveLength(0);
  });

  it("lets an event calendar open time the resource calendar closes", () => {
    const late = {
      id: "e1",
      title: "Late",
      start: "2026-01-05T18:00:00",
      end: "2026-01-05T19:00:00",
    };

    expect(
      checkAvailability({ event: late, resources: [nineToFive], workingTime }),
    ).toHaveLength(1);

    expect(
      checkAvailability({
        event: { ...late, calendarId: "evening-exception" },
        resources: [nineToFive],
        workingTime: {
          calendars: [
            ...workingTime.calendars!,
            {
              id: "evening-exception",
              intervals: [
                {
                  isWorking: true,
                  startDate: "2026-01-05",
                  endDate: "2026-01-05",
                  startTime: "17:00",
                  endTime: "20:00",
                },
              ],
            },
          ],
        },
      }),
    ).toHaveLength(0);
  });

  it("blocks when any assigned resource is closed, by default", () => {
    const conflicts = checkAvailability({
      event: {
        id: "e1",
        title: "Pairing",
        start: "2026-01-05T18:00:00",
        end: "2026-01-05T19:00:00",
      },
      resources: [
        nineToFive,
        { id: "r9", label: "Always", calendarId: "open" },
      ],
      workingTime,
    });

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails).toHaveLength(1);
    expect(conflicts[0]!.resourceDetails[0]!.resourceId).toBe("r1");
  });

  it("blocks under the union policy only when every resource is closed", () => {
    const union: WorkingTimeConfig = { ...workingTime, multiResource: "union" };
    const event = {
      id: "e1",
      title: "Pairing",
      start: "2026-01-05T18:00:00",
      end: "2026-01-05T19:00:00",
    };

    expect(
      checkAvailability({
        event,
        resources: [
          nineToFive,
          { id: "r9", label: "Always", calendarId: "open" },
        ],
        workingTime: union,
      }),
    ).toHaveLength(0);

    expect(
      checkAvailability({ event, resources: [nineToFive], workingTime: union }),
    ).toHaveLength(1);
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
      workingTime,
    });
    expect(conflicts).toHaveLength(0);
  });

  it("flags capacity when overlapping consumption exceeds the resource capacity", () => {
    const capped: AvailabilityResourceInput = {
      id: "r1",
      label: "Room 1",
      calendarId: "open",
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
      workingTime,
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
      calendarId: "open",
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
      workingTime,
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
