import { Temporal } from "@js-temporal/polyfill";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";
import { createCalendar } from "../calendar";
import { stockFeatures } from "../features";
import type { Calendar } from "../calendar";
import type { StockFeatures } from "../features";
import { calculateSegmentResizePreview } from "../getResizeProps";
import type { Event, Resource } from "../types";
import type { RecurrentWorkingInterval, WorkingCalendar } from "~/workingTime";

const { emitSpy } = vi.hoisted(() => ({ emitSpy: vi.fn() }));
vi.mock("../../client", () => ({
  getTimeClient: () => ({ emit: emitSpy }),
}));

type TestResource = Resource;
type TestEvent = Event<TestResource>;

type TestCalendar = Calendar<StockFeatures, TestResource, TestEvent>;

const testCalendars: Array<WorkingCalendar> = [];
let calendarSeq = 0;

function workingHours(...slots: Array<RecurrentWorkingInterval>): string {
  const id = `wc-${++calendarSeq}`;
  testCalendars.push({
    id,
    intervals: slots.map((recurrent) => ({ isWorking: true, recurrent })),
  });
  return id;
}

function createTestCalendar(
  overrides: Partial<
    Parameters<typeof createCalendar<StockFeatures, TestResource, TestEvent>>[0]
  > = {},
): TestCalendar {
  return createCalendar<StockFeatures, TestResource, TestEvent>({
    viewMode: { value: 1, unit: "week" },
    timeZone: "UTC",
    features: stockFeatures,
    calendars: testCalendars,
    ...overrides,
  });
}

const weekdayResource: TestResource = {
  id: "r1",
  label: "Weekday Room",
  capacity: [2],
  calendarId: workingHours({
    weekdays: [1, 2, 3, 4, 5],
    startTime: "08:00",
    endTime: "17:00",
  }),
};

const afternoonResource: TestResource = {
  id: "r2",
  label: "Afternoon Room",
  capacity: [1],
  calendarId: workingHours({
    weekdays: [1, 2, 3, 4, 5],
    startTime: "12:00",
    endTime: "18:00",
  }),
};

const allDayResource: TestResource = {
  id: "r3",
  label: "All Day Room",
  calendarId: workingHours({
    weekdays: [1, 2, 3, 4, 5, 6, 7],
    startTime: "00:00",
    endTime: "24:00",
  }),
};

const noAvailabilityResource: TestResource = {
  id: "r4",
  label: "No Availability Room",
};

function layoutPosition(cal: TestCalendar): number | null {
  return cal.getTimelineLayout().currentTimePosition;
}

const DATE_MON = "2024-03-18";
const DATE_TUE = "2024-03-19";
const DATE_WED = "2024-03-20";

describe("CalendarCore", () => {
  beforeEach(() => {
    emitSpy.mockClear();
  });

  describe("constructor", () => {
    test("initializes with events and resources", () => {
      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event 1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ];

      const cal = createTestCalendar({
        events,
        resources: [weekdayResource],
      });

      expect(cal.getEvents()).toHaveLength(1);
      expect(cal.getEvents()[0]?.id).toBe("e1");
    });

    test("normalizes date-only event start/end to full datetime", () => {
      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event",
          start: DATE_MON,
          end: DATE_TUE,
        },
      ];

      const cal = createTestCalendar({ events });
      const e = cal.getEvents()[0]!;
      expect(e.start).toBe(`${DATE_MON}T00:00:00`);
      expect(e.end).toBe(`${DATE_TUE}T00:00:00`);
    });

    test("normalizes partial datetime event start/end", () => {
      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event",
          start: `${DATE_MON}T09`,
          end: `${DATE_MON}T10`,
        },
      ];

      const cal = createTestCalendar({ events });
      const e = cal.getEvents()[0]!;
      expect(e.start).toBe(`${DATE_MON}T09:00:00`);
      expect(e.end).toBe(`${DATE_MON}T10:00:00`);
    });

    test("normalizes Date objects in event start/end", () => {
      const startDate = new Date(2024, 2, 18, 9, 0, 0);
      const endDate = new Date(2024, 2, 18, 10, 0, 0);

      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event",
          start: startDate,
          end: endDate,
        },
      ];

      const cal = createTestCalendar({ events });
      const e = cal.getEvents()[0]!;
      expect(e.start).toBe("2024-03-18T09:00:00");
      expect(e.end).toBe("2024-03-18T10:00:00");
    });
  });

  describe("getEventsByDate", () => {
    test("returns events matching the date", () => {
      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event 1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
        {
          id: "e2",
          title: "Event 2",
          start: `${DATE_TUE}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
        },
      ];

      const cal = createTestCalendar({ events });
      const monEvents = cal.getEventsByDate(DATE_MON);
      expect(monEvents).toHaveLength(1);
      expect(monEvents[0]!.id).toBe("e1");
    });

    test("returns empty array for date without events", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_TUE}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
          },
        ],
      });

      expect(cal.getEventsByDate(DATE_MON)).toHaveLength(0);
    });

    test("splits multi-day events across dates", () => {
      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
        },
      ];

      const cal = createTestCalendar({ events });
      const monEvents = cal.getEventsByDate(DATE_MON);
      const tueEvents = cal.getEventsByDate(DATE_TUE);

      expect(monEvents).toHaveLength(1);
      expect(tueEvents).toHaveLength(1);
      expect(monEvents[0]!.id).toBe("e1");
      expect(tueEvents[0]!.id).toBe("e1");
    });

    test("returns empty when no events configured", () => {
      const cal = createTestCalendar({ events: [] });
      expect(cal.getEventsByDate(DATE_MON)).toHaveLength(0);
    });
  });

  describe("commitAdd", () => {
    test("adds an event to an empty calendar", () => {
      const cal = createTestCalendar();
      const event: TestEvent = {
        id: "e1",
        title: "New Event",
        start: `${DATE_MON}T09:00:00`,
        end: `${DATE_MON}T10:00:00`,
      };

      cal.commitAdd(event);
      expect(cal.getEvents()).toHaveLength(1);
      expect(cal.getEvents()[0]!.id).toBe("e1");
    });

    test("adds an event to existing events", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Existing",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.commitAdd({
        id: "e2",
        title: "New",
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      });

      expect(cal.getEvents()).toHaveLength(2);
    });

    test("normalizes date-only start/end when adding event", () => {
      const cal = createTestCalendar();
      cal.commitAdd({
        id: "e1",
        title: "Event",
        start: DATE_MON,
        end: DATE_TUE,
      });

      const e = cal.getEvents()[0]!;
      expect(e.start).toBe(`${DATE_MON}T00:00:00`);
      expect(e.end).toBe(`${DATE_TUE}T00:00:00`);
    });

    test("normalizes Date objects when adding event", () => {
      const cal = createTestCalendar();
      cal.commitAdd({
        id: "e1",
        title: "Event",
        start: new Date(2024, 2, 18, 9, 0, 0),
        end: new Date(2024, 2, 18, 10, 0, 0),
      });

      const e = cal.getEvents()[0]!;
      expect(e.start).toBe("2024-03-18T09:00:00");
      expect(e.end).toBe("2024-03-18T10:00:00");
    });
  });

  describe("commitUpdate", () => {
    test("updates an existing event", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Original",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.commitUpdate("e1", { title: "Updated" });
      expect(cal.getEvents()[0]!.title).toBe("Updated");
    });

    test("updates start/end times", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.commitUpdate("e1", {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      });

      const e = cal.getEvents()[0]!;
      expect(e.start).toBe(`${DATE_MON}T10:00:00`);
      expect(e.end).toBe(`${DATE_MON}T11:00:00`);
    });

    test("normalizes date-only start/end when updating event", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.commitUpdate("e1", {
        start: DATE_TUE,
        end: `${DATE_TUE}T12:00:00`,
      });

      const e = cal.getEvents()[0]!;
      expect(e.start).toBe(`${DATE_TUE}T00:00:00`);
      expect(e.end).toBe(`${DATE_TUE}T12:00:00`);
    });

    test("normalizes Date objects when updating event", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.commitUpdate("e1", {
        start: new Date(2024, 2, 19, 10, 0, 0),
        end: new Date(2024, 2, 19, 11, 0, 0),
      });

      const e = cal.getEvents()[0]!;
      expect(e.start).toBe("2024-03-19T10:00:00");
      expect(e.end).toBe("2024-03-19T11:00:00");
    });

    test("does nothing when event not found", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Original",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.commitUpdate("nonexistent", { title: "Updated" });
      expect(cal.getEvents()).toHaveLength(1);
      expect(cal.getEvents()[0]!.title).toBe("Original");
    });

    test("does nothing when events is null", () => {
      const cal = createTestCalendar();
      cal.commitUpdate("e1", { title: "Updated" });
      expect(cal.getEvents()).toHaveLength(0);
    });
  });

  describe("removeEvent", () => {
    test("removes an existing event", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event 1",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
          {
            id: "e2",
            title: "Event 2",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
          },
        ],
      });

      cal.removeEvent("e1");
      expect(cal.getEvents()).toHaveLength(1);
      expect(cal.getEvents()[0]!.id).toBe("e2");
    });

    test("does nothing when event not found", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.removeEvent("nonexistent");
      expect(cal.getEvents()).toHaveLength(1);
    });

    test("does nothing when events is null", () => {
      const cal = createTestCalendar();
      expect(() => cal.removeEvent("e1")).not.toThrow();
    });
  });

  describe("getUnavailableRanges", () => {
    test("returns empty when no resources", () => {
      const cal = createTestCalendar({ resources: [] });
      expect(cal.getUnavailableRanges(DATE_MON)).toHaveLength(0);
    });

    test("returns full day unavailable when resource has no availability for that weekday", () => {
      const weekendOnlyResource: TestResource = {
        id: "r-wknd",
        label: "Weekend Only",
        calendarId: workingHours({
          weekdays: [6, 7],
          startTime: "09:00",
          endTime: "17:00",
        }),
      };

      const cal = createTestCalendar({
        resources: [weekendOnlyResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: ["r-wknd"],
      });

      expect(ranges).toHaveLength(1);
      expect(ranges[0]).toMatchObject({
        startFraction: 0,
        endFraction: 1,
        top: "0%",
        height: "100%",
      });
    });

    test("returns unavailable ranges before and after availability window", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: ["r1"],
      });

      expect(ranges).toHaveLength(2);
      expect(ranges[0]).toMatchObject({
        top: "0%",
        startTime: "00:00",
        endTime: "08:00",
      });
      expect(ranges[1]).toMatchObject({
        startTime: "17:00",
        endTime: "24:00",
      });
    });

    test("merges overlapping availability from multiple resources", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource, afternoonResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON);

      expect(ranges).toHaveLength(2);
    });

    test("filters by resourceIds when provided", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource, afternoonResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: ["r2"],
      });

      expect(ranges).toHaveLength(2);
    });

    test("returns no unavailable ranges for all-day resource", () => {
      const cal = createTestCalendar({
        resources: [allDayResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: ["r3"],
      });

      expect(ranges).toHaveLength(0);
    });

    test("returns full day when resource has no availability config", () => {
      const cal = createTestCalendar({
        resources: [noAvailabilityResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: ["r4"],
      });

      expect(ranges).toHaveLength(1);
      expect(ranges[0]!.height).toBe("100%");
    });

    test("emits fractions and percentage styles, never pixels", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource],
      });

      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: ["r1"],
      });

      expect(ranges[0]).toMatchObject({
        startFraction: 0,
        endFraction: 8 / 24,
        top: "0%",
        height: `${(8 / 24) * 100}%`,
      });
      expect(ranges[1]!.startFraction).toBeCloseTo(17 / 24);
      expect(ranges[1]!.endFraction).toBe(1);
    });
  });

  describe("getUnavailabilityDetails", () => {
    test("returns empty when no resources", () => {
      const cal = createTestCalendar({ resources: [] });
      expect(cal.getUnavailabilityDetails(DATE_MON, 0, 1440)).toHaveLength(0);
    });

    test("returns no-calendar for a resource that references none", () => {
      const cal = createTestCalendar({
        resources: [noAvailabilityResource],
      });

      const details = cal.getUnavailabilityDetails(DATE_MON, 0, 1440, {
        resourceIds: ["r4"],
      });

      expect(details).toHaveLength(1);
      expect(details[0]!.reason).toBe("no-calendar");
      expect(details[0]!.resourceId).toBe("r4");
    });

    test("resolves project, resource and event calendars together", () => {
      const hierarchy: Array<WorkingCalendar> = [
        {
          id: "company",
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
            { isWorking: false, startDate: DATE_TUE, endDate: DATE_TUE },
          ],
        },
        {
          id: "ana-shift",
          parentId: "company",
          intervals: [
            {
              isWorking: true,
              recurrent: {
                weekdays: [1, 2, 3, 4, 5],
                startTime: "08:00",
                endTime: "17:00",
              },
            },
          ],
        },
        {
          id: "after-hours",
          intervals: [
            {
              isWorking: true,
              startDate: DATE_MON,
              endDate: DATE_MON,
              startTime: "17:00",
              endTime: "19:00",
            },
          ],
        },
      ];

      const ana: TestResource = {
        id: "ana",
        label: "Ana",
        calendarId: "ana-shift",
      };
      const cal = createTestCalendar({
        resources: [ana],
        calendars: hierarchy,
      });

      expect(
        cal.getUnavailableMinuteRanges(DATE_MON, { resourceIds: ["ana"] }),
      ).toEqual([
        { startMinutes: 0, endMinutes: 480 },
        { startMinutes: 1020, endMinutes: 1440 },
      ]);

      expect(
        cal.getUnavailableMinuteRanges(DATE_TUE, { resourceIds: ["ana"] }),
      ).toEqual([{ startMinutes: 0, endMinutes: 1440 }]);

      const lateEvent = {
        title: "Late review",
        start: `${DATE_MON}T17:00:00`,
        end: `${DATE_MON}T19:00:00`,
        resources: [ana],
      };

      expect(cal.validateEventPlacement(lateEvent).blocked).toBe(true);
      expect(
        cal.validateEventPlacement({ ...lateEvent, calendarId: "after-hours" })
          .blocked,
      ).toBe(false);
    });

    test("the union policy needs every assigned resource to be closed", () => {
      const placement = {
        title: "Evening pairing",
        start: `${DATE_MON}T17:30:00`,
        end: `${DATE_MON}T18:30:00`,
        resources: [weekdayResource, allDayResource],
      };

      expect(
        createTestCalendar({
          resources: [weekdayResource, allDayResource],
        }).validateEventPlacement(placement).blocked,
      ).toBe(true);

      expect(
        createTestCalendar({
          resources: [weekdayResource, allDayResource],
          multiResource: "union",
        }).validateEventPlacement(placement).blocked,
      ).toBe(false);
    });

    test("falls back to the project calendar when a resource names none", () => {
      const cal = createTestCalendar({
        resources: [noAvailabilityResource],
        defaultCalendarId: weekdayResource.calendarId,
      });

      expect(
        cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
          resourceIds: ["r4"],
        }),
      ).toEqual([]);
    });

    test("returns outside-hours when resource not available on that weekday", () => {
      const weekendResource: TestResource = {
        id: "r-wknd",
        label: "Weekend Only",
        calendarId: workingHours({
          weekdays: [6, 7],
          startTime: "09:00",
          endTime: "17:00",
        }),
      };

      const cal = createTestCalendar({
        resources: [weekendResource],
      });

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
        resourceIds: ["r-wknd"],
      });

      expect(details).toHaveLength(1);
      expect(details[0]!.reason).toBe("outside-hours");
      expect(details[0]!.resourceId).toBe("r-wknd");
    });

    test("returns outside-hours when time range exceeds availability window", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource],
      });

      const details = cal.getUnavailabilityDetails(DATE_MON, 7 * 60, 10 * 60, {
        resourceIds: ["r1"],
      });

      expect(details).toHaveLength(1);
      expect(details[0]!.reason).toBe("outside-hours");
      expect(details[0]!.resourceId).toBe("r1");
    });

    test("returns empty when time range is within availability", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource],
      });

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
        resourceIds: ["r1"],
      });

      expect(details).toHaveLength(0);
    });

    test("checks multiple resources independently", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource, noAvailabilityResource],
      });

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60, {
        resourceIds: ["r1", "r4"],
      });

      expect(details).toHaveLength(1);
      expect(details[0]!.resourceId).toBe("r4");
    });

    test("uses all resources when resourceIds not specified", () => {
      const cal = createTestCalendar({
        resources: [weekdayResource, noAvailabilityResource],
      });

      const details = cal.getUnavailabilityDetails(DATE_MON, 9 * 60, 10 * 60);

      expect(details).toHaveLength(1);
    });
  });

  describe("validateResize", () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    };

    describe("same-day resize within availability", () => {
      test("allows extending bottom edge within available time", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
      });

      test("allows shrinking top edge within available time", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: "top",
          totalDeltaMinutes: -60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
      });
    });

    describe("same-day resize blocked by availability", () => {
      test("blocks extending bottom edge into unavailable time", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });

      test("blocks extending top edge into unavailable time", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "top",
          totalDeltaMinutes: -90,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });
    });

    describe("capacity constraints", () => {
      test("allows resize when event already coexists with other events at capacity", () => {
        const resource: TestResource = {
          id: "r-cap",
          label: "Capacity 1",
          capacity: [1],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [resource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        });

        const result = cal.validateResize({
          eventId: "e2",
          originalStart: `${DATE_MON}T10:00:00`,
          originalEnd: `${DATE_MON}T11:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
      });

      test("blocks resize when it would create NEW capacity conflicts", () => {
        const resource: TestResource = {
          id: "r-cap",
          label: "Capacity 1",
          capacity: [1],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [resource],
            },
            {
              id: "e3",
              title: "E3",
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        });

        const result = cal.validateResize({
          eventId: "e3",
          originalStart: `${DATE_MON}T14:00:00`,
          originalEnd: `${DATE_MON}T15:00:00`,
          edge: "top",
          totalDeltaMinutes: -180,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        assert(result.blocked);
        expect(result.error?.reason).toBe("unavailable-time");
      });

      test("names the saturated resource when a resize overruns capacity", () => {
        const resource: TestResource = {
          id: "r-cap",
          label: "Capacity 1",
          capacity: [1],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        });

        const result = cal.validateResize({
          eventId: "e2",
          originalStart: `${DATE_MON}T14:00:00`,
          originalEnd: `${DATE_MON}T15:00:00`,
          edge: "top",
          totalDeltaMinutes: -240,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        assert(result.blocked);
        expect(result.error?.reason).toBe("unavailable-time");
        expect(result.error?.message).toBe(
          "Unavailable: Event at 10:00-15:00 conflicts with Capacity 1 (capacity)",
        );
      });

      test("allows resize when capacity is not exceeded", () => {
        const resource: TestResource = {
          id: "r-cap",
          label: "Capacity 3",
          capacity: [3],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [resource],
            },
            {
              id: "e3",
              title: "E3",
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [resource],
            },
          ],
          resources: [resource],
        });

        const result = cal.validateResize({
          eventId: "e3",
          originalStart: `${DATE_MON}T14:00:00`,
          originalEnd: `${DATE_MON}T15:00:00`,
          edge: "top",
          totalDeltaMinutes: -240,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
      });
    });

    describe("event without resources", () => {
      test("allows resize freely when event has no resources", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 120,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
      });
    });

    describe("zero delta", () => {
      test("returns original times when delta is zero", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 0,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
        expect(result.result.start).toBe(`${DATE_MON}T09:00:00`);
        expect(result.result.end).toBe(`${DATE_MON}T10:00:00`);
      });
    });

    describe("blocked resize returns original day date", () => {
      test("targetDayDate falls back to originalDayDate when blocked", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: "2024-03-20",
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.targetDayDate).toBe(DATE_MON);
      });
    });

    describe("cross-day resize (top edge to earlier day)", () => {
      test("blocks when target day has unavailable time at the target range", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_TUE}T09:00:00`,
          originalEnd: `${DATE_TUE}T10:00:00`,
          edge: "top",
          totalDeltaMinutes: -480,
          targetDayDate: "2024-03-15",
          originalDayDate: DATE_TUE,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });

      test("blocks when source day has unavailable time before event start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T07:00:00`,
              end: `${DATE_MON}T08:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T07:00:00`,
          originalEnd: `${DATE_MON}T08:00:00`,
          edge: "top",
          totalDeltaMinutes: -60,
          targetDayDate: "2024-03-15",
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });
    });

    describe("cross-day resize (bottom edge to later day)", () => {
      test("blocks when target day has unavailable time at the target range", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_TUE}T09:00:00`,
          originalEnd: `${DATE_TUE}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 480,
          targetDayDate: "2024-03-22",
          originalDayDate: DATE_TUE,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });

      test("blocks when source day has unavailable time after event end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_TUE,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });
    });

    describe("result shape", () => {
      test("returns valid result structure when not blocked", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
        expect(result.targetDayDate).toBe(DATE_MON);
        expect(result.result).toBeDefined();
        expect(result.result.start).toBeDefined();
        expect(result.result.end).toBeDefined();
      });

      test("returns valid error structure when blocked", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T16:00:00`,
              end: `${DATE_MON}T17:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T16:00:00`,
          originalEnd: `${DATE_MON}T17:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
        expect(result.error).toBeDefined();
      });
    });

    describe("multiple resources on one event", () => {
      test("blocks when any resource is unavailable for the new range", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource, afternoonResource],
            },
          ],
          resources: [weekdayResource, afternoonResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 480,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(true);
      });

      test("allows when all resources are available for the new range", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [weekdayResource, afternoonResource],
            },
          ],
          resources: [weekdayResource, afternoonResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T13:00:00`,
          originalEnd: `${DATE_MON}T14:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(result.blocked).toBe(false);
      });
    });

    describe("no constraints provided", () => {
      test("works with default snap of 1 minute", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Event",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateResize({
          eventId: "e1",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 1,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
        });

        expect(result.blocked).toBe(false);
      });
    });
  });

  describe("boundary types (ADR 0002)", () => {
    test("keeps the store's dates as ISO strings", () => {
      const cal = createTestCalendar();

      expect(cal.store.state.activeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(cal.store.state.currentPeriod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test("navigates by ISO string, without a calendar annotation", () => {
      const cal = createTestCalendar();

      cal.goToSpecificPeriod("2024-03-18");

      expect(cal.store.state.activeDate).toBe("2024-03-18");
      expect(cal.store.state.currentPeriod).toBe("2024-03-18");
    });

    test("moves whole periods while staying an ISO string", () => {
      const cal = createTestCalendar({ viewMode: { value: 1, unit: "week" } });

      cal.goToSpecificPeriod("2024-03-18");
      cal.goToNextPeriod();
      expect(cal.store.state.activeDate).toBe("2024-03-25");

      cal.goToPreviousPeriod();
      expect(cal.store.state.activeDate).toBe("2024-03-18");
    });

    test("exposes days by ISO date only", () => {
      const cal = createTestCalendar();
      cal.goToSpecificPeriod(DATE_MON);

      const [day] = cal.getDaysWithEvents();

      expect(day!.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day).not.toHaveProperty("date");
    });

    test("keeps filler days from groupDaysBy on the same shape", () => {
      const cal = createTestCalendar({ viewMode: { value: 1, unit: "month" } });
      cal.goToSpecificPeriod("2024-03-18");

      const weeks = cal.groupDaysBy({
        days: cal.getDaysWithEvents(),
        unit: "week",
      });

      for (const day of weeks.flat()) {
        expect(day!.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day).not.toHaveProperty("date");
      }
    });
  });

  describe("navigation", () => {
    test("changeViewMode updates the visible mode", () => {
      const cal = createTestCalendar();
      cal.changeViewMode({ value: 2, unit: "week" });
      expect(cal.getDaysWithEvents().length).toBeGreaterThan(0);
    });

    test("goToSpecificPeriod accepts an ISO date string", () => {
      const cal = createTestCalendar();
      expect(() => cal.goToSpecificPeriod("2024-06-01")).not.toThrow();
    });

    test("goToNextPeriod and goToPreviousPeriod do not throw", () => {
      const cal = createTestCalendar({
        viewMode: { value: 1, unit: "week" },
      });
      expect(() => cal.goToNextPeriod()).not.toThrow();
      expect(() => cal.goToPreviousPeriod()).not.toThrow();
    });

    test("canGoPreviousPeriod returns true without range", () => {
      const cal = createTestCalendar();
      expect(cal.canGoPreviousPeriod()).toBe(true);
    });

    test("canGoNextPeriod returns true without range", () => {
      const cal = createTestCalendar();
      expect(cal.canGoNextPeriod()).toBe(true);
    });

    describe("goToNextOccurrence / goToPreviousOccurrence", () => {
      const recurringEvent: TestEvent = {
        id: "rec",
        title: "Recurring",
        start: "2025-06-02T09:00:00",
        end: "2025-06-02T10:00:00",
        recurrence: { frequency: "weekly", interval: 1 },
      };

      const nonRecurringEvent: TestEvent = {
        id: "plain",
        title: "Plain",
        start: "2025-06-02T09:00:00",
        end: "2025-06-02T10:00:00",
      };

      test("goToNextOccurrence navigates to next weekly occurrence", () => {
        const cal = createTestCalendar({ events: [recurringEvent] });
        cal.goToSpecificPeriod("2025-06-02");
        cal.goToNextOccurrence("rec");
        expect(cal.store.state.activeDate).toBe("2025-06-09");
      });

      test("goToNextOccurrence is no-op for non-recurring event", () => {
        const cal = createTestCalendar({ events: [nonRecurringEvent] });
        cal.goToSpecificPeriod("2025-06-02");
        cal.goToNextOccurrence("plain");
        expect(cal.store.state.activeDate).toBe("2025-06-02");
      });

      test("goToNextOccurrence accepts occurrence id and resolves master", () => {
        const cal = createTestCalendar({ events: [recurringEvent] });
        cal.goToSpecificPeriod("2025-06-02");
        cal.goToNextOccurrence("rec_1");
        expect(cal.store.state.activeDate).toBe("2025-06-09");
      });

      test("goToPreviousOccurrence navigates to previous weekly occurrence", () => {
        const cal = createTestCalendar({ events: [recurringEvent] });
        cal.goToSpecificPeriod("2025-06-16");
        cal.goToPreviousOccurrence("rec");
        expect(cal.store.state.activeDate).toBe("2025-06-09");
      });

      test("goToPreviousOccurrence is no-op when already at master start", () => {
        const cal = createTestCalendar({ events: [recurringEvent] });
        cal.goToSpecificPeriod("2025-06-02");
        cal.goToPreviousOccurrence("rec");
        expect(cal.store.state.activeDate).toBe("2025-06-02");
      });

      test("goToPreviousOccurrence from occurrence id resolves master", () => {
        const cal = createTestCalendar({ events: [recurringEvent] });
        cal.goToSpecificPeriod("2025-06-09");
        cal.goToPreviousOccurrence("rec_1");
        expect(cal.store.state.activeDate).toBe("2025-06-02");
      });
    });
  });

  describe("getDaysNames", () => {
    test("returns 7 day names", () => {
      const cal = createTestCalendar({ locale: "en-US" });
      const names = cal.getDaysNames();
      expect(names).toHaveLength(7);
    });

    test("returns long day names", () => {
      const cal = createTestCalendar({ locale: "en-US" });
      const names = cal.getDaysNames("long");
      expect(names).toContain("Sunday");
    });
  });

  describe("getTimeSlots", () => {
    test("returns time slots for the day", () => {
      const cal = createTestCalendar();
      const slots = cal.getTimeSlots();
      expect(slots).toBeDefined();
      expect(Array.isArray(slots)).toBe(true);
    });
  });

  describe("getDaysWithEvents", () => {
    test("returns days array with events mapped to dates", () => {
      const cal = createTestCalendar({
        viewMode: { value: 1, unit: "week" },
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      cal.goToSpecificPeriod(DATE_MON);
      const days = cal.getDaysWithEvents();
      const targetDay = days.find((d) => d.isoDate === DATE_MON);

      expect(targetDay).toBeDefined();
      expect(targetDay!.events).toHaveLength(1);
    });

    test("marks today correctly", () => {
      const cal = createTestCalendar({
        viewMode: { value: 1, unit: "week" },
      });

      const days = cal.getDaysWithEvents();
      const todayCount = days.filter((d) => d.isToday).length;

      expect(todayCount).toBe(1);
    });
  });

  describe("validateResize - horizontal timeline (multi-day events)", () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    };

    test("blocks extending right edge of multi-day event into unavailable hours", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "e1",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_TUE}T10:00:00`,
        edge: "right",
        totalDeltaMinutes: 480,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(true);
    });

    test("allows extending right edge of multi-day event within available hours", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "e1",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_TUE}T10:00:00`,
        edge: "right",
        totalDeltaMinutes: 60,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(false);
    });

    test("blocks extending left edge of multi-day event into unavailable hours", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_TUE}T09:00:00`,
            end: `${DATE_TUE}T17:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "e1",
        originalStart: `${DATE_TUE}T09:00:00`,
        originalEnd: `${DATE_TUE}T17:00:00`,
        edge: "left",
        totalDeltaMinutes: -480,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(true);
    });

    test("blocks large delta on single-day event that crosses midnight into next unavailable day", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T22:00:00`,
            end: `${DATE_TUE}T02:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "e1",
        originalStart: `${DATE_MON}T22:00:00`,
        originalEnd: `${DATE_TUE}T02:00:00`,
        edge: "bottom",
        totalDeltaMinutes: 480,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(true);
    });

    test("shrinking is always allowed regardless of availability", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T17:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "e1",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_TUE}T17:00:00`,
        edge: "right",
        totalDeltaMinutes: -480,
        targetDayDate: DATE_TUE,
        originalDayDate: DATE_TUE,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(false);
    });
  });

  describe("getEvents", () => {
    test("returns a shallow copy of all events", () => {
      const events: Array<TestEvent> = [
        {
          id: "e1",
          title: "Event 1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ];

      const cal = createTestCalendar({ events });
      const out = cal.getEvents();

      expect(out).toHaveLength(1);
      expect(out).not.toBe(events);
    });

    test("returns empty array when no events configured", () => {
      const cal = createTestCalendar({ events: [] });
      expect(cal.getEvents()).toHaveLength(0);
    });
  });

  describe("commitUpdate - dependsOn cascade (propagateEndDelta)", () => {
    test("shifts dependent forward when predecessor end extends past dependent start", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("a", { end: `${DATE_MON}T12:30:00` });

      const b = cal.getEvents().find((e) => e.id === "b")!;
      expect(b.start).toBe(`${DATE_MON}T12:30:00`);
      expect(b.end).toBe(`${DATE_MON}T13:30:00`);
    });

    test("does not shift dependent when predecessor end still ends before dependent start", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T14:00:00`,
            end: `${DATE_MON}T15:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("a", { end: `${DATE_MON}T11:30:00` });

      const b = cal.getEvents().find((e) => e.id === "b")!;
      expect(b.start).toBe(`${DATE_MON}T14:00:00`);
    });

    test("propagates through a chain A → B → C", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
          {
            id: "c",
            title: "C",
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T13:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "b", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("a", { end: `${DATE_MON}T12:00:00` });

      const b = cal.getEvents().find((e) => e.id === "b")!;
      const c = cal.getEvents().find((e) => e.id === "c")!;
      expect(b.start).toBe(`${DATE_MON}T12:00:00`);
      expect(c.start).toBe(`${DATE_MON}T13:00:00`);
    });

    test("pulls a predecessor back when the dependent moves earlier", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "P",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "s",
            title: "S",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("s", {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      });

      const p = cal.getEvents().find((e) => e.id === "p")!;
      expect(p.start).toBe(`${DATE_MON}T09:00:00`);
      expect(p.end).toBe(`${DATE_MON}T10:00:00`);
    });

    test("pulls a whole predecessor chain back", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "q",
            title: "Q",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "p",
            title: "P",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "q", type: "FS" }],
          },
          {
            id: "s",
            title: "S",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("s", {
        start: `${DATE_MON}T10:00:00`,
        end: `${DATE_MON}T11:00:00`,
      });

      const byId = new Map(cal.getEvents().map((e) => [e.id, e]));
      expect(byId.get("p")!.start).toBe(`${DATE_MON}T09:00:00`);
      expect(byId.get("q")!.start).toBe(`${DATE_MON}T08:00:00`);
    });

    test("shifts multiple dependents of the same predecessor", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
          {
            id: "c",
            title: "C",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:30:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("a", { end: `${DATE_MON}T12:30:00` });

      const b = cal.getEvents().find((e) => e.id === "b")!;
      const c = cal.getEvents().find((e) => e.id === "c")!;
      expect(b.start).toBe(`${DATE_MON}T12:30:00`);
      expect(c.end).toBe(`${DATE_MON}T14:00:00`);
    });

    test("does not cascade when only start changes (end unchanged)", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      cal.commitUpdate("a", { start: `${DATE_MON}T09:00:00` });

      const b = cal.getEvents().find((e) => e.id === "b")!;
      expect(b.start).toBe(`${DATE_MON}T11:00:00`);
    });
  });

  describe("validateMove", () => {
    test("returns blocked:false for unknown event id", () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "nonexistent",
        `${DATE_MON}T14:00:00`,
        `${DATE_MON}T15:00:00`,
      );
      expect(r.blocked).toBe(false);
    });

    test("allows move fully inside availability", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "e1",
        `${DATE_MON}T10:00:00`,
        `${DATE_MON}T11:00:00`,
      );
      expect(r.blocked).toBe(false);
    });

    test("blocks when the moved range overlaps unavailable hours", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "e1",
        `${DATE_MON}T07:00:00`,
        `${DATE_MON}T08:00:00`,
      );
      expect(r.blocked).toBe(true);
    });

    test("allows move when event has no resources (no availability to violate)", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ],
      });

      const r = cal.validateMove(
        "e1",
        `${DATE_MON}T06:00:00`,
        `${DATE_MON}T07:00:00`,
      );
      expect(r.blocked).toBe(false);
    });

    test("blocks when extending end pushes a dependent into unavailable time", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "Predecessor",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "d",
            title: "Dependent",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "p",
        `${DATE_MON}T09:00:00`,
        `${DATE_MON}T17:00:00`,
      );
      expect(r.blocked).toBe(true);
    });

    test("blocks transitive dependent when cascade would violate availability", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
          {
            id: "c",
            title: "C",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "b", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "a",
        `${DATE_MON}T09:00:00`,
        `${DATE_MON}T15:00:00`,
      );
      expect(r.blocked).toBe(true);
    });

    test("does not run downstream availability check when new end is not extended", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "a",
        `${DATE_MON}T09:00:00`,
        `${DATE_MON}T10:00:00`,
      );
      expect(r.blocked).toBe(false);
    });

    test("treats split multi-day segment rows as non-targets (no _originalStart match)", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "e1",
            title: "Event",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_TUE}T10:00:00`,
            resources: [weekdayResource],
            _originalStart: `${DATE_MON}T09:00:00`,
            _originalEnd: `${DATE_TUE}T10:00:00`,
          },
        ],
        resources: [weekdayResource],
      });

      const r = cal.validateMove(
        "e1",
        `${DATE_TUE}T10:00:00`,
        `${DATE_TUE}T11:00:00`,
      );
      expect(r.blocked).toBe(false);
    });
  });

  describe("validateResize - dependsOn (finish-to-start)", () => {
    const baseResizeOptions = {
      constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
    };

    test("blocks moving dependent start before predecessor end (edge left → top)", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "Predecessor",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "d",
            title: "Dependent",
            start: `${DATE_MON}T12:00:00`,
            end: `${DATE_MON}T14:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "d",
        originalStart: `${DATE_MON}T12:00:00`,
        originalEnd: `${DATE_MON}T14:00:00`,
        edge: "top",
        totalDeltaMinutes: -60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      });

      assert(result.blocked);
      expect(result.error?.reason).toBe("blocked");
    });

    test("blocks extending predecessor when dependent would enter unavailable time", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "Predecessor",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "d",
            title: "Dependent",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "p",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: "bottom",
        totalDeltaMinutes: 420,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(true);
    });

    test("allows extending predecessor when dependent stays inside availability", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "Predecessor",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "d",
            title: "Dependent",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "p",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: "bottom",
        totalDeltaMinutes: 60,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(false);
    });

    test("blocks when transitive dependent would leave availability", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "b",
            title: "B",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "a", type: "FS" }],
          },
          {
            id: "c",
            title: "C",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T12:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "b", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "a",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: "bottom",
        totalDeltaMinutes: 420,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(true);
    });

    test("skips cascade availability check when dependent is already outside hours", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "Predecessor",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "d",
            title: "Dependent",
            start: `${DATE_MON}T06:00:00`,
            end: `${DATE_MON}T07:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "p",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: "bottom",
        totalDeltaMinutes: 120,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(false);
    });

    test("same cascade rule applies with edge bottom (vertical resize)", () => {
      const cal = createTestCalendar({
        timeZone: "UTC",
        events: [
          {
            id: "p",
            title: "Predecessor",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [weekdayResource],
          },
          {
            id: "d",
            title: "Dependent",
            start: `${DATE_MON}T10:00:00`,
            end: `${DATE_MON}T11:00:00`,
            resources: [weekdayResource],
            dependsOn: [{ id: "p", type: "FS" }],
          },
        ],
        resources: [weekdayResource],
      });

      const result = cal.validateResize({
        eventId: "p",
        originalStart: `${DATE_MON}T09:00:00`,
        originalEnd: `${DATE_MON}T10:00:00`,
        edge: "bottom",
        totalDeltaMinutes: 420,
        targetDayDate: DATE_MON,
        originalDayDate: DATE_MON,
        ...baseResizeOptions,
      });

      expect(result.blocked).toBe(true);
    });
  });

  describe("groupDaysBy", () => {
    test("groups days into weeks", () => {
      const cal = createTestCalendar({
        viewMode: { value: 2, unit: "week" },
      });

      const days = cal.getDaysWithEvents();
      const grouped = cal.groupDaysBy({ days, unit: "week" });

      expect(grouped.length).toBeGreaterThanOrEqual(2);
      expect(grouped[0]!).toHaveLength(7);
    });
  });

  describe("capacity / consumption", () => {
    const capResource: TestResource = {
      id: "r-cap",
      label: "Capacity Room",
      capacity: [1],
      calendarId: workingHours({
        weekdays: [1, 2, 3, 4, 5],
        startTime: "09:00",
        endTime: "17:00",
      }),
    };

    describe("validateEventPlacement", () => {
      test("blocks placement when consumption + existing usage exceeds capacity", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [capResource],
          consumption: [1],
        });

        expect(result.blocked).toBe(true);
      });

      test("allows placement when consumption + existing usage equals capacity", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
          resources: [capResource],
          consumption: [1],
        });

        expect(result.blocked).toBe(false);
      });

      test("allows placement at capacity when ranges do not overlap", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T11:00:00`,
          end: `${DATE_MON}T12:00:00`,
          resources: [capResource],
          consumption: [1],
        });

        expect(result.blocked).toBe(false);
      });

      test("treats missing consumption as 1", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [capResource],
        });

        expect(result.blocked).toBe(true);
      });

      test("blocks when single new event consumption alone exceeds capacity", () => {
        const cal = createTestCalendar({
          events: [],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [capResource],
          consumption: [5],
        });

        expect(result.blocked).toBe(true);
      });

      test("allows placement when resource has no capacity configured", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
              consumption: [1],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [weekdayResource],
          consumption: [1],
        });

        expect(result.blocked).toBe(false);
      });

      test("sums multi-segment capacity array", () => {
        const multiCapResource: TestResource = {
          id: "r-multi",
          label: "Multi",
          capacity: [1, 2],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [multiCapResource],
              consumption: [1, 1],
            },
          ],
          resources: [multiCapResource],
        });

        const ok = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
          resources: [multiCapResource],
          consumption: [0, 1],
        });

        const blocked = cal.validateEventPlacement({
          title: "E3",
          start: `${DATE_MON}T09:30:00`,
          end: `${DATE_MON}T10:30:00`,
          resources: [multiCapResource],
          consumption: [1, 2],
        });

        expect(ok.blocked).toBe(false);
        expect(blocked.blocked).toBe(true);
      });

      test("checks capacity per day for multi-day events", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_TUE}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
          resources: [capResource],
          consumption: [1],
        });

        expect(result.blocked).toBe(true);
      });

      test("does not double-count split multi-day segments", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_TUE}T11:00:00`,
          resources: [capResource],
          consumption: [1],
        });

        expect(result.blocked).toBe(true);
      });
    });

    describe("validateMove with capacity", () => {
      test("blocks move when destination overlap exceeds capacity", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const r = cal.validateMove(
          "e2",
          `${DATE_MON}T09:00:00`,
          `${DATE_MON}T10:00:00`,
        );

        expect(r.blocked).toBe(true);
      });

      test("allows move when self consumption would still fit", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const r = cal.validateMove(
          "e2",
          `${DATE_MON}T14:00:00`,
          `${DATE_MON}T15:00:00`,
        );

        expect(r.blocked).toBe(false);
      });

      test("uses passed-in newConsumption over event.consumption", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const r = cal.validateMove(
          "e2",
          `${DATE_MON}T09:00:00`,
          `${DATE_MON}T10:00:00`,
          undefined,
          [0],
        );

        expect(r.blocked).toBe(false);
      });
    });

    describe("validateEventPlacement - additional", () => {
      test("skips own id when validating an existing event", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [capResource],
              consumption: [1],
            },
          ],
          resources: [capResource],
        });

        const r = cal.validateEventPlacement({
          id: "e1",
          title: "E1 Updated",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [capResource],
          consumption: [1],
        });

        expect(r.blocked).toBe(false);
      });
    });
  });

  describe("dependency types (FS, SS, FF, SF)", () => {
    beforeEach(() => {
      emitSpy.mockClear();
    });

    describe("validateEventDependencies", () => {
      const PRED_START = `${DATE_MON}T10:00:00`;
      const PRED_END = `${DATE_MON}T12:00:00`;

      function withPredecessor() {
        return createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: PRED_START,
              end: PRED_END,
            },
          ],
        });
      }

      describe("FS - successor.start must be ≥ predecessor.end", () => {
        test("valid when successor starts exactly at predecessor end", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
            },
            [{ id: "p", type: "FS" }],
          );
          expect(result.valid).toBe(true);
        });

        test("valid when successor starts after predecessor end", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
            },
            [{ id: "p", type: "FS" }],
          );
          expect(result.valid).toBe(true);
        });

        test("invalid when successor starts before predecessor end", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T13:00:00`,
            },
            [{ id: "p", type: "FS" }],
          );
          assert(!result.valid);
          expect(result.error?.reason).toBe("blocked");
          expect(result.error?.message).toContain("cannot start before");
          expect(result.error?.message).toContain("ends");
          expect(result.error?.message).toContain("(FS)");
        });
      });

      describe("SS - successor.start must be ≥ predecessor.start", () => {
        test("valid when successor starts exactly at predecessor start", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
            },
            [{ id: "p", type: "SS" }],
          );
          expect(result.valid).toBe(true);
        });

        test("valid when successor starts after predecessor start (even if predecessor still running)", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T10:30:00`,
              end: `${DATE_MON}T11:30:00`,
            },
            [{ id: "p", type: "SS" }],
          );
          expect(result.valid).toBe(true);
        });

        test("invalid when successor starts before predecessor start", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T09:30:00`,
              end: `${DATE_MON}T11:00:00`,
            },
            [{ id: "p", type: "SS" }],
          );
          assert(!result.valid);
          expect(result.error?.message).toContain("cannot start before");
          expect(result.error?.message).toContain("starts");
          expect(result.error?.message).toContain("(SS)");
        });
      });

      describe("FF - successor.end must be ≥ predecessor.end", () => {
        test("valid when successor ends exactly at predecessor end", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
            [{ id: "p", type: "FF" }],
          );
          expect(result.valid).toBe(true);
        });

        test("valid when successor ends after predecessor end", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T13:00:00`,
            },
            [{ id: "p", type: "FF" }],
          );
          expect(result.valid).toBe(true);
        });

        test("invalid when successor ends before predecessor end", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T11:30:00`,
            },
            [{ id: "p", type: "FF" }],
          );
          assert(!result.valid);
          expect(result.error?.message).toContain("cannot end before");
          expect(result.error?.message).toContain("ends");
          expect(result.error?.message).toContain("(FF)");
        });
      });

      describe("SF - successor.end must be ≥ predecessor.start", () => {
        test("valid when successor ends exactly at predecessor start", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
            [{ id: "p", type: "SF" }],
          );
          expect(result.valid).toBe(true);
        });

        test("valid when successor ends after predecessor start", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T11:00:00`,
            },
            [{ id: "p", type: "SF" }],
          );
          expect(result.valid).toBe(true);
        });

        test("invalid when successor ends before predecessor start", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T09:30:00`,
            },
            [{ id: "p", type: "SF" }],
          );
          assert(!result.valid);
          expect(result.error?.message).toContain("cannot end before");
          expect(result.error?.message).toContain("starts");
          expect(result.error?.message).toContain("(SF)");
        });
      });

      describe("shape and edge cases", () => {
        test("returns valid:true when there are no events in the calendar", () => {
          const cal = createTestCalendar();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
            },
            [{ id: "missing", type: "FS" }],
          );
          expect(result.valid).toBe(true);
        });

        test("skips dependencies whose predecessor id is unknown", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T09:00:00`,
            },
            [{ id: "does-not-exist", type: "FS" }],
          );
          expect(result.valid).toBe(true);
        });

        test("reports the first failing dependency when multiple are violated", () => {
          const cal = createTestCalendar({
            events: [
              {
                id: "p1",
                title: "P1",
                start: `${DATE_MON}T10:00:00`,
                end: `${DATE_MON}T11:00:00`,
              },
              {
                id: "p2",
                title: "P2",
                start: `${DATE_MON}T13:00:00`,
                end: `${DATE_MON}T14:00:00`,
              },
            ],
          });

          const result = cal.validateEventDependencies(
            {
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T09:30:00`,
            },
            [
              { id: "p1", type: "FS" },
              { id: "p2", type: "FS" },
            ],
          );

          assert(!result.valid);
          expect(result.error?.message).toContain("P1");
        });

        test("passes through provided event id and title in the error payload", () => {
          const cal = withPredecessor();
          const result = cal.validateEventDependencies(
            {
              id: "my-event",
              title: "My Event",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T11:30:00`,
            },
            [{ id: "p", type: "FS" }],
          );

          assert(!result.valid);
          expect(result.error?.eventId).toBe("my-event");
          expect(result.error?.eventTitle).toBe("My Event");
          expect(result.error?.originalStart).toBe(`${DATE_MON}T11:00:00`);
          expect(result.error?.originalEnd).toBe(`${DATE_MON}T11:30:00`);
        });
      });
    });

    describe("validateMove - predecessor cascade per type", () => {
      test("FS: moving successor earlier pulls predecessor back into unavailable hours → blocked", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T08:30:00`,
              end: `${DATE_MON}T09:30:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [weekdayResource],
        });

        const r = cal.validateMove(
          "s",
          `${DATE_MON}T08:00:00`,
          `${DATE_MON}T09:00:00`,
        );
        expect(r.blocked).toBe(true);
        expect(r.blockedEventTitle).toBe("P");
        expect(r.message).toContain("pulled into unavailable");
      });

      test("SS: moving successor before predecessor.start pulls predecessor back", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T08:30:00`,
              end: `${DATE_MON}T09:30:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
              dependsOn: [{ id: "p", type: "SS" }],
            },
          ],
          resources: [weekdayResource],
        });

        const r = cal.validateMove(
          "s",
          `${DATE_MON}T07:30:00`,
          `${DATE_MON}T08:30:00`,
        );
        expect(r.blocked).toBe(true);
        expect(r.blockedEventTitle).toBe("P");
      });

      test("FF: shrinking successor.end below predecessor.end pulls predecessor back", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T08:30:00`,
              end: `${DATE_MON}T09:30:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
              dependsOn: [{ id: "p", type: "FF" }],
            },
          ],
          resources: [weekdayResource],
        });

        const allowed = cal.validateMove(
          "s",
          `${DATE_MON}T08:00:00`,
          `${DATE_MON}T09:00:00`,
        );
        expect(allowed.blocked).toBe(false);

        const blocked = cal.validateMove(
          "s",
          `${DATE_MON}T07:30:00`,
          `${DATE_MON}T08:30:00`,
        );
        expect(blocked.blocked).toBe(true);
        expect(blocked.blockedEventTitle).toBe("P");
      });

      test("SF: shrinking successor.end below predecessor.start pulls predecessor back", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T08:30:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
              dependsOn: [{ id: "p", type: "SF" }],
            },
          ],
          resources: [weekdayResource],
        });

        const r = cal.validateMove(
          "s",
          `${DATE_MON}T06:30:00`,
          `${DATE_MON}T07:30:00`,
        );
        expect(r.blocked).toBe(true);
        expect(r.blockedEventTitle).toBe("P");
      });

      test("FS: moving successor later (constraint already satisfied) does not touch predecessor", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        const r = cal.validateMove(
          "s",
          `${DATE_MON}T14:00:00`,
          `${DATE_MON}T15:00:00`,
        );
        expect(r.blocked).toBe(false);
      });
    });

    describe("createDependency", () => {
      test("FS: reschedules target forward when target.start < source.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });
        cal.commitUpdate("s", { dependsOn: [] });

        const result = cal.createDependency("p", "s", "FS");

        expect(result.blocked).toBe(false);
        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T12:00:00`);
        expect(s.end).toBe(`${DATE_MON}T14:00:00`);
        expect(s.dependsOn).toEqual([{ id: "p", type: "FS" }]);
      });

      test("SS: reschedules target forward when target.start < source.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:30:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });
        cal.commitUpdate("s", { dependsOn: [] });

        const result = cal.createDependency("p", "s", "SS");

        expect(result.blocked).toBe(false);
        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T10:00:00`);
        expect(s.end).toBe(`${DATE_MON}T11:30:00`);
      });

      test("FF: reschedules target forward when target.end < source.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });
        cal.commitUpdate("s", { dependsOn: [] });

        const result = cal.createDependency("p", "s", "FF");

        expect(result.blocked).toBe(false);
        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T11:00:00`);
        expect(s.end).toBe(`${DATE_MON}T13:00:00`);
      });

      test("SF: reschedules target forward when target.end < source.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });
        cal.commitUpdate("s", { dependsOn: [] });

        const result = cal.createDependency("p", "s", "SF");

        expect(result.blocked).toBe(false);
        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T12:00:00`);
        expect(s.end).toBe(`${DATE_MON}T13:00:00`);
      });

      test("does not reschedule when constraint is already satisfied", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });

        const result = cal.createDependency("p", "s", "FS");

        expect(result.blocked).toBe(false);
        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T11:00:00`);
        expect(s.end).toBe(`${DATE_MON}T12:00:00`);
        expect(s.dependsOn).toEqual([{ id: "p", type: "FS" }]);
      });

      test("default type is FS when no type is specified", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });

        cal.createDependency("p", "s");

        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.dependsOn).toEqual([{ id: "p", type: "FS" }]);
      });

      test("does nothing when source or target is missing", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
        });

        expect(cal.createDependency("p", "missing", "FS")).toEqual({
          blocked: false,
        });
        expect(cal.createDependency("missing", "p", "FS")).toEqual({
          blocked: false,
        });
      });

      test("is idempotent - adding the same (sourceId, type) pair twice is a no-op", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });

        cal.createDependency("p", "s", "FS");
        cal.createDependency("p", "s", "FS");

        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.dependsOn).toEqual([{ id: "p", type: "FS" }]);
      });

      test("allows the same source to be linked to the same target with different types", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });

        cal.createDependency("p", "s", "FS");
        cal.createDependency("p", "s", "SS");

        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.dependsOn).toEqual([
          { id: "p", type: "FS" },
          { id: "p", type: "SS" },
        ]);
      });

      test("blocks creation when reschedule would land target in unavailable time", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T15:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.createDependency("p", "s", "FS");

        assert(result.blocked);
        expect(result.error?.reason).toBe("unavailable-time");
        expect(result.error?.eventId).toBe("s");
        expect(result.error?.attemptedStart).toBe(`${DATE_MON}T16:00:00`);
        expect(result.error?.attemptedEnd).toBe(`${DATE_MON}T23:00:00`);

        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T09:00:00`);
        expect(s.end).toBe(`${DATE_MON}T16:00:00`);
        expect(s.dependsOn ?? []).toEqual([]);
      });

      test("blocks circular dependency: A->B, B->C, try C->A", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T09:00:00`,
              resources: ["r1"],
            },
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: ["r1"],
              dependsOn: [{ id: "a", type: "FS" as const }],
            },
            {
              id: "c",
              title: "C",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: ["r1"],
              dependsOn: [{ id: "b", type: "FS" as const }],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.createDependency("c", "a", "FS");
        assert(result.blocked);
        expect(result.error?.reason).toBe("blocked");
        expect(result.error?.message).toContain("circular dependency");
      });

      test("blocks self-dependency", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T09:00:00`,
              resources: ["r1"],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.createDependency("a", "a", "FS");
        assert(result.blocked);
        expect(result.error?.reason).toBe("blocked");
        expect(result.error?.message).toContain("circular dependency");
      });

      test("allows non-circular chain: A->B, B->C, C->D", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T08:00:00`,
              end: `${DATE_MON}T09:00:00`,
              resources: ["r1"],
            },
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: ["r1"],
              dependsOn: [{ id: "a", type: "FS" as const }],
            },
            {
              id: "c",
              title: "C",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: ["r1"],
              dependsOn: [{ id: "b", type: "FS" as const }],
            },
            {
              id: "d",
              title: "D",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: ["r1"],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.createDependency("c", "d", "FS");
        assert(!result.blocked);
      });
    });

    describe("commitUpdate forward cascade per type", () => {
      test("FS: shifts successor when predecessor.end extends past successor.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("p", { end: `${DATE_MON}T12:30:00` });

        const s = cal.getEvents().find((e) => e.id === "s")!;

        expect(s.start).toBe(`${DATE_MON}T12:30:00`);
        expect(s.end).toBe(`${DATE_MON}T13:30:00`);
      });

      test("SS: shifts successor when predecessor.start moves later past successor.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T10:30:00`,
              end: `${DATE_MON}T11:30:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "SS" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("p", {
          start: `${DATE_MON}T11:00:00`,
          end: `${DATE_MON}T12:00:00`,
        });

        const s = cal.getEvents().find((e) => e.id === "s")!;

        expect(s.start).toBe(`${DATE_MON}T11:00:00`);
        expect(s.end).toBe(`${DATE_MON}T12:00:00`);
      });

      test("FF: shifts successor when predecessor.end moves past successor.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T10:30:00`,
              end: `${DATE_MON}T11:30:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FF" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("p", { end: `${DATE_MON}T13:00:00` });

        const s = cal.getEvents().find((e) => e.id === "s")!;

        expect(s.start).toBe(`${DATE_MON}T12:00:00`);
        expect(s.end).toBe(`${DATE_MON}T13:00:00`);
      });

      test("SF: shifts successor when predecessor.start moves past successor.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "SF" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("p", {
          start: `${DATE_MON}T13:00:00`,
          end: `${DATE_MON}T14:00:00`,
        });

        const s = cal.getEvents().find((e) => e.id === "s")!;

        expect(s.start).toBe(`${DATE_MON}T12:00:00`);
        expect(s.end).toBe(`${DATE_MON}T13:00:00`);
      });

      test("does not shift when constraint stays satisfied", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T14:00:00`,
              end: `${DATE_MON}T15:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("p", { end: `${DATE_MON}T11:30:00` });

        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.start).toBe(`${DATE_MON}T14:00:00`);
        expect(s.end).toBe(`${DATE_MON}T15:00:00`);
      });

      test("mixed-type chain propagates correctly: A -SS→ B -FS→ C", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:30:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "a", type: "SS" }],
            },
            {
              id: "c",
              title: "C",
              start: `${DATE_MON}T10:30:00`,
              end: `${DATE_MON}T11:30:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "b", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("a", {
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
        });

        const events = cal.getEvents();
        const b = events.find((e) => e.id === "b")!;
        const c = events.find((e) => e.id === "c")!;
        expect(b.start).toBe(`${DATE_MON}T10:00:00`);
        expect(b.end).toBe(`${DATE_MON}T11:30:00`);
        expect(c.start).toBe(`${DATE_MON}T11:30:00`);
        expect(c.end).toBe(`${DATE_MON}T12:30:00`);
      });

      test("shifts only the dependents of the changed predecessor - unrelated events stay put", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
            {
              id: "unrelated",
              title: "Unrelated",
              start: `${DATE_MON}T11:30:00`,
              end: `${DATE_MON}T12:30:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("p", { end: `${DATE_MON}T13:00:00` });

        const u = cal.getEvents().find((e) => e.id === "unrelated")!;
        expect(u.start).toBe(`${DATE_MON}T11:30:00`);
        expect(u.end).toBe(`${DATE_MON}T12:30:00`);
      });
    });

    describe("commitUpdate backward cascade per type", () => {
      test("FS: pulls predecessor back when successor.start moves before predecessor.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("s", {
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
        });

        const p = cal.getEvents().find((e) => e.id === "p")!;

        expect(p.start).toBe(`${DATE_MON}T09:00:00`);
        expect(p.end).toBe(`${DATE_MON}T10:00:00`);
      });

      test("SS: pulls predecessor back when successor.start moves before predecessor.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:30:00`,
              end: `${DATE_MON}T12:30:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "SS" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("s", {
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
        });

        const p = cal.getEvents().find((e) => e.id === "p")!;

        expect(p.start).toBe(`${DATE_MON}T10:00:00`);
        expect(p.end).toBe(`${DATE_MON}T11:00:00`);
      });
    });

    describe("validateResize top-edge dependency check", () => {
      const baseResizeOptions = {
        constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
      };

      test("FS: blocked when shrinking start before predecessor.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        const r = cal.validateResize({
          eventId: "s",
          originalStart: `${DATE_MON}T12:00:00`,
          originalEnd: `${DATE_MON}T14:00:00`,
          edge: "top",
          totalDeltaMinutes: -60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(r.blocked).toBe(true);
        expect(r.error?.reason).toBe("blocked");
        expect(r.error?.message).toContain("FS");
      });

      test("SS: blocked when shrinking start before predecessor.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "SS" }],
            },
          ],
          resources: [allDayResource],
        });

        const r = cal.validateResize({
          eventId: "s",
          originalStart: `${DATE_MON}T11:00:00`,
          originalEnd: `${DATE_MON}T14:00:00`,
          edge: "top",
          totalDeltaMinutes: -120,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(r.blocked).toBe(true);
        expect(r.error?.message).toContain("SS");
      });

      test("FF: not blocked by top-edge resize because end stays unchanged", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FF" }],
            },
          ],
          resources: [allDayResource],
        });

        const r = cal.validateResize({
          eventId: "s",
          originalStart: `${DATE_MON}T11:00:00`,
          originalEnd: `${DATE_MON}T13:00:00`,
          edge: "top",
          totalDeltaMinutes: -90,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(r.blocked).toBe(false);
      });
    });

    describe("addEvent", () => {
      test("successfully adds an event and returns { success: true }", async () => {
        const cal = createTestCalendar({ resources: [weekdayResource] });

        const result = await cal.addEvent({
          id: "e1",
          title: "New Event",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [weekdayResource],
        });

        expect(result.success).toBe(true);
        expect(cal.getEvents()).toHaveLength(1);
        expect(cal.getEvents()[0]!.id).toBe("e1");
      });

      test("returns failure when placement violates resource availability", async () => {
        const cal = createTestCalendar({ resources: [weekdayResource] });

        const result = await cal.addEvent({
          id: "e1",
          title: "Too Early",
          start: `${DATE_MON}T06:00:00`,
          end: `${DATE_MON}T07:00:00`,
          resources: [weekdayResource],
        });

        assert(!result.success);
        expect(result.error.reason).toBe("blocked");
        expect(result.error.eventId).toBe("e1");
        expect(result.error.eventTitle).toBe("Too Early");
        expect(result.error.originalStart).toBe(`${DATE_MON}T06:00:00`);
        expect(result.error.originalEnd).toBe(`${DATE_MON}T07:00:00`);

        expect(cal.getEvents()).toHaveLength(0);
      });

      test("returns failure when dependency constraint is violated", async () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
          ],
        });

        const result = await cal.addEvent(
          {
            id: "s",
            title: "S",
            start: `${DATE_MON}T11:00:00`,
            end: `${DATE_MON}T13:00:00`,
          },
          { dependsOn: [{ id: "p", type: "FS" }] },
        );

        assert(!result.success);
        expect(result.error.reason).toBe("blocked");
        expect(result.error.message).toContain("cannot start before");
        expect(cal.getEvents().find((e) => e.id === "s")).toBeUndefined();
      });

      test("triggers fetchEvents for the event date range before validating", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({
          resources: [weekdayResource],
          fetchEvents,
        });

        await cal.addEvent({
          id: "e1",
          title: "Event",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [weekdayResource],
        });

        expect(fetchEvents).toHaveBeenCalledTimes(1);
        const call = fetchEvents.mock.calls[0]![0];
        expect(call.start).toBe(DATE_MON);
        expect(call.end).toBe(DATE_TUE);
      });

      test("does not fetch when fetchEvents is not configured", async () => {
        const cal = createTestCalendar({ resources: [weekdayResource] });

        const result = await cal.addEvent({
          id: "e1",
          title: "Event",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
          resources: [weekdayResource],
        });

        expect(result.success).toBe(true);
      });
    });

    describe("editEvent", () => {
      test("successfully updates an event", async () => {
        const cal = createTestCalendar({
          resources: [weekdayResource],
          events: [
            {
              id: "e1",
              title: "Original",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
        });

        const result = await cal.editEvent("e1", { title: "Updated" });

        expect(result.success).toBe(true);
        expect(cal.getEvents()[0]!.title).toBe("Updated");
      });

      test("returns failure for unknown event id", async () => {
        const cal = createTestCalendar();

        const result = await cal.editEvent("nonexistent", { title: "X" });

        assert(!result.success);
        expect(result.error.eventId).toBe("nonexistent");
        expect(result.error.message).toContain("not found");
      });

      test("skips move validation when start/end/resources/consumption are unchanged", async () => {
        const cal = createTestCalendar({
          resources: [weekdayResource],
          events: [
            {
              id: "e1",
              title: "Original",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
        });

        const result = await cal.editEvent("e1", { title: "Renamed" });
        expect(result.success).toBe(true);
        expect(cal.getEvents()[0]!.title).toBe("Renamed");
      });

      test("returns failure when new position violates availability", async () => {
        const cal = createTestCalendar({
          resources: [weekdayResource],
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
          ],
        });

        const result = await cal.editEvent("e1", {
          start: `${DATE_MON}T06:00:00`,
          end: `${DATE_MON}T07:00:00`,
        });

        assert(!result.success);
        expect(result.error.attemptedStart).toBe(`${DATE_MON}T06:00:00`);
        expect(result.error.attemptedEnd).toBe(`${DATE_MON}T07:00:00`);
        expect(result.error.originalStart).toBe(`${DATE_MON}T09:00:00`);
        expect(result.error.originalEnd).toBe(`${DATE_MON}T10:00:00`);
        expect(cal.getEvents()[0]!.start).toBe(`${DATE_MON}T09:00:00`);
      });

      test("fetchEvents range covers both old and new positions", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({
          resources: [allDayResource],
          fetchEvents,
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_TUE}T09:00:00`,
              end: `${DATE_TUE}T10:00:00`,
              resources: [allDayResource],
            },
          ],
        });

        fetchEvents.mockClear();

        await cal.editEvent("e1", {
          start: `${DATE_WED}T09:00:00`,
          end: `${DATE_WED}T10:00:00`,
        });

        expect(fetchEvents).toHaveBeenCalled();
        const call = fetchEvents.mock.calls[0]![0];
        expect(call.start <= DATE_TUE).toBe(true);
        expect(call.end > DATE_WED).toBe(true);
      });

      test("validates dependency constraint when dependsOn is provided", async () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
            },
          ],
        });

        const result = await cal.editEvent(
          "s",
          { start: `${DATE_MON}T11:00:00`, end: `${DATE_MON}T12:00:00` },
          { dependsOn: [{ id: "p", type: "FS" }] },
        );

        assert(!result.success);
        expect(result.error.reason).toBe("blocked");
      });
    });

    describe("fetchEventsForRange", () => {
      test("resolves immediately and is a no-op when fetchEvents is not configured", async () => {
        const cal = createTestCalendar();
        await expect(
          cal.fetchEventsForRange(DATE_MON, DATE_TUE),
        ).resolves.toBeUndefined();
        expect(cal.getLoadedRanges()).toHaveLength(0);
      });

      test("calls fetchEvents and merges fetched events into the calendar", async () => {
        const fetched: Array<TestEvent> = [
          {
            id: "e1",
            title: "Fetched",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ];
        const fetchEvents = vi.fn().mockResolvedValue(fetched);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);

        expect(fetchEvents).toHaveBeenCalledWith({
          start: DATE_MON,
          end: DATE_TUE,
        });
        expect(cal.getEvents()).toHaveLength(1);
        expect(cal.getEvents()[0]!.id).toBe("e1");
      });

      test("does not refetch a range that is already loaded", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);
        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);

        expect(fetchEvents).toHaveBeenCalledTimes(1);
      });

      test("does not refetch a sub-range of an already loaded range", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange(DATE_MON, "2024-03-25");
        await cal.fetchEventsForRange(DATE_TUE, DATE_WED);

        expect(fetchEvents).toHaveBeenCalledTimes(1);
      });

      test("deduplicates fetched events by id", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([
          {
            id: "e1",
            title: "Existing",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ]);
        const cal = createTestCalendar({
          fetchEvents,
          events: [
            {
              id: "e1",
              title: "Existing",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
        });

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);

        expect(cal.getEvents().filter((e) => e.id === "e1")).toHaveLength(1);
      });

      test("un-marks the range on fetch error so future calls can retry", async () => {
        const fetchEvents = vi
          .fn()
          .mockRejectedValueOnce(new Error("network"))
          .mockResolvedValueOnce([]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);
        expect(cal.getLoadedRanges()).toHaveLength(0);

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);
        expect(fetchEvents).toHaveBeenCalledTimes(2);
        expect(cal.getLoadedRanges()).toHaveLength(1);
      });

      test("getLoadedRanges merges overlapping ranges", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange("2024-03-01", "2024-03-10");
        await cal.fetchEventsForRange("2024-03-05", "2024-03-15");

        const ranges = cal.getLoadedRanges();
        expect(ranges).toHaveLength(1);
        expect(ranges[0]!.start).toBe("2024-03-01");
        expect(ranges[0]!.end).toBe("2024-03-15");
      });

      test("getLoadedRanges keeps disjoint ranges separate", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange("2024-03-01", "2024-03-05");
        await cal.fetchEventsForRange("2024-03-10", "2024-03-15");

        expect(cal.getLoadedRanges()).toHaveLength(2);
      });

      test("emits events:set when new events are merged in", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([
          {
            id: "e1",
            title: "Fetched",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          },
        ]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);

        const setCall = emitSpy.mock.calls.find(
          ([name]) => name === "events:set",
        );
        expect(setCall).toBeDefined();
        expect(setCall![1].events).toHaveLength(1);
        expect(setCall![1].events[0].eventId).toBe("e1");
      });

      test("does not emit events:set when fetch returns nothing new", async () => {
        const fetchEvents = vi.fn().mockResolvedValue([]);
        const cal = createTestCalendar({ fetchEvents });

        await cal.fetchEventsForRange(DATE_MON, DATE_TUE);

        const setCall = emitSpy.mock.calls.find(
          ([name]) => name === "events:set",
        );
        expect(setCall).toBeUndefined();
      });
    });

    describe("event emissions", () => {
      test("commitAdd emits event:added", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "New",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        });

        const addCall = emitSpy.mock.calls.find(
          ([name]) => name === "event:added",
        );
        expect(addCall).toBeDefined();
        expect(addCall![1]).toMatchObject({
          eventId: "e1",
          eventTitle: "New",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        });
      });

      test("commitUpdate emits event:updated with the patch", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Original",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
        });
        emitSpy.mockClear();

        cal.commitUpdate("e1", { title: "Renamed" });

        const upd = emitSpy.mock.calls.find(
          ([name]) => name === "event:updated",
        );
        expect(upd).toBeDefined();
        expect(upd![1].eventId).toBe("e1");
        expect(upd![1].updates).toMatchObject({ title: "Renamed" });
      });

      test("removeEvent emits event:removed", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "To Remove",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
        });
        emitSpy.mockClear();

        cal.removeEvent("e1");

        const rem = emitSpy.mock.calls.find(
          ([name]) => name === "event:removed",
        );
        expect(rem).toBeDefined();
        expect(rem![1].eventId).toBe("e1");
        expect(rem![1].eventTitle).toBe("To Remove");
      });

      test("removeEvent does not emit when id does not exist", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Keep",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
        });
        emitSpy.mockClear();

        cal.removeEvent("nope");

        const rem = emitSpy.mock.calls.find(
          ([name]) => name === "event:removed",
        );
        expect(rem).toBeUndefined();
      });

      test("commitUpdate cascade emits event:updated for shifted dependents", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });
        emitSpy.mockClear();

        cal.commitUpdate("p", { end: `${DATE_MON}T12:30:00` });

        const updatedIds = emitSpy.mock.calls
          .filter(([name]) => name === "event:updated")
          .map(([, payload]) => payload.eventId);
        expect(updatedIds).toContain("p");
        expect(updatedIds).toContain("s");
      });
    });

    describe("getTimelineLayout", () => {
      test("returns one row per resource", () => {
        const cal = createTestCalendar({
          resources: [weekdayResource, afternoonResource, allDayResource],
        });

        const layout = cal.getTimelineLayout();
        expect(layout.rows).toHaveLength(3);
        expect(layout.rows.map((r) => r.resource.id)).toEqual([
          "r1",
          "r2",
          "r3",
        ]);
      });

      test("row has empty events when resource has none", () => {
        const cal = createTestCalendar({ resources: [weekdayResource] });

        const layout = cal.getTimelineLayout();
        expect(layout.rows[0]!.events).toHaveLength(0);
        expect(layout.rows[0]!.laneCount).toBe(1);
      });

      test("places non-overlapping events on the same lane", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource],
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const layout = cal.getTimelineLayout();
        const row = layout.rows[0]!;
        expect(row.events).toHaveLength(2);
        expect(row.laneCount).toBe(1);
        expect(row.events.every((e) => e.lane === 0)).toBe(true);
      });

      test("assigns overlapping events to separate lanes", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource],
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const layout = cal.getTimelineLayout();
        const row = layout.rows[0]!;
        expect(row.events).toHaveLength(2);
        expect(row.laneCount).toBe(2);
        const lanes = row.events.map((e) => e.lane).sort();
        expect(lanes).toEqual([0, 1]);
      });

      test("exposes fractions consistent with the percentage positions", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource],
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const item = cal.getTimelineLayout().rows[0]!.events[0]!;

        expect(item.left).toBeCloseTo(item.startFraction * 100);
        expect(item.width).toBeCloseTo(
          (item.endFraction - item.startFraction) * 100,
        );
        expect(item.startFraction).toBeGreaterThan(0);
        expect(item.endFraction).toBeLessThan(1);
      });

      test("currentTimePosition is null when today is not in the visible range", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const layout = cal.getTimelineLayout();
        expect(layout.currentTimePosition).toBeNull();
      });

      test("events fully outside the visible range are filtered out (zero width)", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource],
          events: [
            {
              id: "far",
              title: "Far",
              start: "2025-01-01T09:00:00",
              end: "2025-01-01T10:00:00",
              resources: [allDayResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const layout = cal.getTimelineLayout();
        expect(layout.rows[0]!.events).toHaveLength(0);
      });

      test("currentTimePosition is a percentage of the visible range", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "day" },
          resources: [allDayResource],
        });
        cal.goToCurrentPeriod();

        const now = Temporal.Now.plainDateTimeISO("UTC");
        const expected = ((now.hour * 60 + now.minute) / (24 * 60)) * 100;

        expect(layoutPosition(cal)).toBeCloseTo(expected, 3);
      });
    });

    describe("getEventsByResource", () => {
      test("buckets an event that references a resource by id", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource, afternoonResource],
          events: [
            {
              id: "by-id",
              title: "By Id",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: ["r3"],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const byResource = cal.getEventsByResource();
        expect(byResource.get("r3")!.map((e) => e.id)).toEqual(["by-id"]);
        expect(byResource.get("r2")).toEqual([]);
      });

      test("returns one entry per configured resource", () => {
        const cal = createTestCalendar({
          resources: [weekdayResource, afternoonResource],
        });

        const byResource = cal.getEventsByResource();
        expect(byResource.has("r1")).toBe(true);
        expect(byResource.has("r2")).toBe(true);
      });

      test("groups events by their assigned resources", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource, afternoonResource],
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [afternoonResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const byResource = cal.getEventsByResource();
        expect(byResource.get("r3")!.map((e) => e.id)).toEqual(["e1"]);
        expect(byResource.get("r2")!.map((e) => e.id)).toEqual(["e2"]);
      });

      test("merges multi-day segments back to a single full-span event", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource],
          events: [
            {
              id: "multi",
              title: "Multi",
              start: `${DATE_MON}T20:00:00`,
              end: `${DATE_TUE}T04:00:00`,
              resources: [allDayResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const byResource = cal.getEventsByResource();
        const events = byResource.get("r3")!;
        expect(events).toHaveLength(1);
        expect(events[0]!.id).toBe("multi");
        expect(events[0]!.start).toBe(`${DATE_MON}T20:00:00`);
        expect(events[0]!.end).toBe(`${DATE_TUE}T04:00:00`);
      });

      test("event attached to multiple resources appears in each resource bucket", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          resources: [allDayResource, afternoonResource],
          events: [
            {
              id: "shared",
              title: "Shared",
              start: `${DATE_MON}T13:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [allDayResource, afternoonResource],
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const byResource = cal.getEventsByResource();
        expect(byResource.get("r3")!.map((e) => e.id)).toContain("shared");
        expect(byResource.get("r2")!.map((e) => e.id)).toContain("shared");
      });
    });

    describe("formatPeriodLabel", () => {
      test("returns a non-empty string for a normal week view", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          locale: "en-US",
        });
        cal.goToSpecificPeriod(DATE_MON);

        const label = cal.formatPeriodLabel();
        expect(typeof label).toBe("string");
        expect(label.length).toBeGreaterThan(0);
      });

      test("uses an em-dash range separator when spanning multiple days", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          locale: "en-US",
        });
        cal.goToSpecificPeriod(DATE_MON);

        const label = cal.formatPeriodLabel();
        expect(label).toContain("\u2014");
      });

      test("accepts a locale override", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          locale: "en-US",
        });
        cal.goToSpecificPeriod(DATE_MON);

        const en = cal.formatPeriodLabel({ locale: "en-US" });
        const de = cal.formatPeriodLabel({ locale: "de-DE" });
        expect(en).not.toBe(de);
      });
    });

    describe("getEventProps", () => {
      test("returns a result with start/end and overlappingEvents for a visible event", () => {
        const event: TestEvent = {
          id: "e1",
          title: "Event",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        };
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [event],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const props = cal.getEventProps(cal.getEvents()[0]!);
        expect(props.start).toBe(`${DATE_MON}T09:00:00`);
        expect(props.end).toBe(`${DATE_MON}T10:00:00`);
        expect(Array.isArray(props.overlappingEvents)).toBe(true);
      });

      test("exposes the logical layout alongside the style", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T06:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const props = cal.getEventProps(cal.getEvents()[0]!) as {
          layout: {
            startFraction: number;
            endFraction: number;
            column: number;
            columnCount: number;
          };
        };

        expect(props.layout).toMatchObject({
          startFraction: 0.25,
          endFraction: 0.5,
          column: 0,
          columnCount: 1,
        });
      });

      test("columns a chained overlap by cluster, not by pairwise count", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:30:00`,
            },
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:30:00`,
            },
            {
              id: "c",
              title: "C",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:30:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const widths = cal.getEvents().map((event) => {
          const props = cal.getEventProps(event) as {
            style: { left: string; width: string };
          };
          return [event.id, props.style.left, props.style.width];
        });

        expect(widths).toEqual([
          ["a", "0%", "50%"],
          ["b", "50%", "50%"],
          ["c", "0%", "50%"],
        ]);
      });

      test("agrees on geometry for days rendered outside the current viewport", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "standup",
              title: "Stand-up",
              start: "2024-03-18T11:00:00",
              end: "2024-03-18T12:30:00",
              recurrence: { frequency: "daily", interval: 1 },
            },
            {
              id: "meeting",
              title: "Meeting",
              start: "2024-04-08T11:30:00",
              end: "2024-04-08T12:00:00",
            },
            {
              id: "interview",
              title: "Interview",
              start: "2024-04-08T12:00:00",
              end: "2024-04-08T13:30:00",
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const bufferedDay = cal
          .getDaysInRange("2024-04-08", "2024-04-14")
          .find((d) => d.isoDate === "2024-04-08")!;

        expect(bufferedDay.events).toHaveLength(3);

        const geometry = bufferedDay.events.map((event) => {
          const props = cal.getEventProps(event) as {
            layout: { columnCount: number };
            style: { width: string };
          };
          return [props.layout.columnCount, props.style.width];
        });

        expect(geometry).toEqual([
          [2, "50%"],
          [2, "50%"],
          [2, "50%"],
        ]);
      });

      test("does not let all-day events take a column in the timed grid", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "holiday",
              title: "Holiday",
              start: `${DATE_MON}T00:00:00`,
              end: `${DATE_MON}T23:59:59`,
              allDay: true,
            },
            {
              id: "meeting",
              title: "Meeting",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
            {
              id: "interview",
              title: "Interview",
              start: `${DATE_MON}T11:30:00`,
              end: `${DATE_MON}T13:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const timed = cal
          .getEvents()
          .filter((e) => !e.allDay)
          .map((event) => {
            const props = cal.getEventProps(event) as {
              layout: { concurrency: number; columnCount: number };
              style: { left: string; width: string };
            };
            return [
              event.id,
              props.layout.concurrency,
              props.layout.columnCount,
              props.style.left,
              props.style.width,
            ];
          });

        expect(timed).toEqual([
          ["meeting", 2, 2, "0%", "50%"],
          ["interview", 2, 2, "50%", "50%"],
        ]);
      });

      test("lays all-day events out against each other, not against timed ones", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "holiday",
              title: "Holiday",
              start: `${DATE_MON}T00:00:00`,
              end: `${DATE_MON}T23:59:59`,
              allDay: true,
            },
            {
              id: "timed",
              title: "Timed",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const props = cal.getEventProps(
          cal.getEvents().find((e) => e.id === "holiday")!,
        ) as { layout: { concurrency: number }; style: { width: string } };

        expect(props.layout.concurrency).toBe(1);
        expect(props.style.width).toBe("100%");
      });

      test("honours the constructor layout strategy", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          layout: { strategy: "cascade", cascadeOffset: 0.25 },
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const styles = cal.getEvents().map((event) => {
          const props = cal.getEventProps(event) as {
            style: { left: string; width: string; zIndex?: number };
          };
          return props.style;
        });

        expect(styles[0]).toMatchObject({
          left: "0%",
          width: "100%",
          zIndex: 0,
        });
        expect(styles[1]).toMatchObject({
          left: "25%",
          width: "75%",
          zIndex: 1,
        });
      });

      test("lets a call override the configured layout strategy", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          layout: { strategy: "cascade" },
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const event = cal.getEvents().find((e) => e.id === "b")!;
        const cascade = cal.getEventProps(event) as {
          style: { left: string; width: string };
        };
        const columns = cal.getEventProps(event, { strategy: "columns" }) as {
          style: { left: string; width: string };
        };

        expect(cascade.style).toMatchObject({ left: "20%", width: "80%" });
        expect(columns.style).toMatchObject({ left: "50%", width: "50%" });
      });

      test("keeps an event outside the busy cluster at full width", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "x",
              title: "X",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
            {
              id: "y",
              title: "Y",
              start: `${DATE_MON}T09:30:00`,
              end: `${DATE_MON}T10:30:00`,
            },
            {
              id: "alone",
              title: "Alone",
              start: `${DATE_MON}T15:00:00`,
              end: `${DATE_MON}T16:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const props = cal.getEventProps(
          cal.getEvents().find((e) => e.id === "alone")!,
        ) as { style: { left: string; width: string } };

        expect(props.style).toMatchObject({ left: "0%", width: "100%" });
      });

      test("detects overlap with a sibling event", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T11:00:00`,
            },
            {
              id: "e2",
              title: "E2",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T12:00:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const props = cal.getEventProps(
          cal.getEvents().find((e) => e.id === "e1")!,
        );
        expect(props.overlappingEvents.some((e) => e.id === "e2")).toBe(true);
      });

      test("renders an event at its true height (no min-height floor)", () => {
        const cal = createTestCalendar({
          viewMode: { value: 1, unit: "week" },
          events: [
            {
              id: "e1",
              title: "Short",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T09:20:00`,
            },
          ],
        });
        cal.goToSpecificPeriod(DATE_MON);

        const props = cal.getEventProps(cal.getEvents()[0]!) as {
          style: { top: string; height: string };
        };
        expect(props.style.top).toBe(`${(540 / 1440) * 100}%`);
        expect(props.style.height).toBe(`${(20 / 1440) * 100}%`);
      });

      test("top-edge resize keeps the bottom (end) fixed at the real end", () => {
        const day = DATE_MON;
        const originalEnd = `${day}T09:20:00`;
        const realBottom = (560 / 1440) * 100;

        for (const previewStart of [
          `${day}T08:57:00`,
          `${day}T08:45:00`,
          `${day}T08:00:00`,
        ]) {
          const preview = calculateSegmentResizePreview({
            dayDate: day,
            originalStart: `${day}T09:00:00`,
            originalEnd,
            previewStart,
            previewEnd: originalEnd,
          });
          expect(preview.previewStyle).not.toBeNull();
          const top = parseFloat(preview.previewStyle!.top);
          const height = parseFloat(preview.previewStyle!.height);

          expect(top + height).toBeCloseTo(realBottom, 6);
        }
      });

      test("bottom-edge resize keeps the start (top) fixed at the real start", () => {
        const day = DATE_MON;
        const originalStart = `${day}T09:00:00`;
        const realTop = (540 / 1440) * 100;

        const preview = calculateSegmentResizePreview({
          dayDate: day,
          originalStart,
          originalEnd: `${day}T09:20:00`,
          previewStart: originalStart,
          previewEnd: `${day}T10:30:00`,
        });
        expect(preview.previewStyle).not.toBeNull();
        expect(parseFloat(preview.previewStyle!.top)).toBeCloseTo(realTop, 6);
      });
    });

    describe("commitUpdate backward cascade - FF and SF", () => {
      test("FF: pulls predecessor back when successor.end moves before predecessor.end", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T14:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FF" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("s", {
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T12:00:00`,
        });

        const p = cal.getEvents().find((e) => e.id === "p")!;
        expect(p.start).toBe(`${DATE_MON}T10:00:00`);
        expect(p.end).toBe(`${DATE_MON}T12:00:00`);
      });

      test("SF: pulls predecessor back when successor.end moves before predecessor.start", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "SF" }],
            },
          ],
          resources: [allDayResource],
        });

        cal.commitUpdate("s", {
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        });

        const p = cal.getEvents().find((e) => e.id === "p")!;
        expect(p.start).toBe(`${DATE_MON}T10:00:00`);
        expect(p.end).toBe(`${DATE_MON}T11:00:00`);
      });
    });

    describe("validateMove backward cascade - allowed when target available", () => {
      test("FS: allows move when predecessor pull-back stays within availability", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T12:00:00`,
              end: `${DATE_MON}T13:00:00`,
              resources: [allDayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [allDayResource],
        });

        const r = cal.validateMove(
          "s",
          `${DATE_MON}T10:30:00`,
          `${DATE_MON}T11:30:00`,
        );
        expect(r.blocked).toBe(false);
      });
    });

    describe("validateResize bottom-edge cascade through dependents", () => {
      const baseResizeOptions = {
        constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
      };

      test("blocks bottom-edge extension when dependent would be pushed into unavailable hours", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [weekdayResource],
        });

        const r = cal.validateResize({
          eventId: "p",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 420,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(r.blocked).toBe(true);
      });

      test("allows bottom-edge extension when dependent still fits inside availability", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [weekdayResource],
              dependsOn: [{ id: "p", type: "FS" }],
            },
          ],
          resources: [weekdayResource],
        });

        const r = cal.validateResize({
          eventId: "p",
          originalStart: `${DATE_MON}T09:00:00`,
          originalEnd: `${DATE_MON}T10:00:00`,
          edge: "bottom",
          totalDeltaMinutes: 60,
          targetDayDate: DATE_MON,
          originalDayDate: DATE_MON,
          ...baseResizeOptions,
        });

        expect(r.blocked).toBe(false);
      });
    });

    describe("capacity edge cases", () => {
      test("resource with capacity [0] effectively prevents any concurrent usage", () => {
        const zeroCapResource: TestResource = {
          id: "r-zero",
          label: "Zero",
          capacity: [0],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({ resources: [zeroCapResource] });

        const result = cal.validateEventPlacement({
          title: "Anything",
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
          resources: [zeroCapResource],
          consumption: [1],
        });
        expect(result.blocked).toBe(false);
      });

      test("treats missing event.consumption as [1] when checking against existing usage", () => {
        const capResource: TestResource = {
          id: "r-cap",
          label: "Cap1",
          capacity: [1],
          calendarId: workingHours({
            weekdays: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
          }),
        };

        const cal = createTestCalendar({
          resources: [capResource],
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
              resources: [capResource],
            },
          ],
        });

        const result = cal.validateEventPlacement({
          title: "E2",
          start: `${DATE_MON}T10:00:00`,
          end: `${DATE_MON}T11:00:00`,
          resources: [capResource],
        });
        expect(result.blocked).toBe(true);
      });
    });

    describe("partial datetime normalization in commit*", () => {
      test('commitAdd normalizes "YYYY-MM-DDTHH" form', () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E",
          start: `${DATE_MON}T09` as unknown as string,
          end: `${DATE_MON}T10` as unknown as string,
        });

        const e = cal.getEvents()[0]!;
        expect(e.start).toBe(`${DATE_MON}T09:00:00`);
        expect(e.end).toBe(`${DATE_MON}T10:00:00`);
      });

      test('commitUpdate normalizes "YYYY-MM-DDTHH" form', () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            },
          ],
        });

        cal.commitUpdate("e1", {
          start: `${DATE_MON}T11` as unknown as string,
          end: `${DATE_MON}T12` as unknown as string,
        });

        const e = cal.getEvents()[0]!;
        expect(e.start).toBe(`${DATE_MON}T11:00:00`);
        expect(e.end).toBe(`${DATE_MON}T12:00:00`);
      });
    });

    describe("createDependency - shape and idempotency edges", () => {
      test("emits a single event:updated when dependency is added without reschedule", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
              resources: [allDayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              resources: [allDayResource],
            },
          ],
          resources: [allDayResource],
        });
        emitSpy.mockClear();

        cal.createDependency("p", "s", "FS");

        const targetUpdates = emitSpy.mock.calls.filter(
          ([name, payload]) =>
            name === "event:updated" && payload.eventId === "s",
        );
        expect(targetUpdates.length).toBeGreaterThanOrEqual(1);
      });

      test("does not modify target when reschedule attempt is blocked", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "p",
              title: "P",
              start: `${DATE_MON}T15:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [weekdayResource],
            },
            {
              id: "s",
              title: "S",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T16:00:00`,
              resources: [weekdayResource],
            },
          ],
          resources: [weekdayResource],
        });

        const result = cal.createDependency("p", "s", "FS");

        expect(result.blocked).toBe(true);
        const s = cal.getEvents().find((e) => e.id === "s")!;
        expect(s.dependsOn ?? []).toEqual([]);
        expect(s.start).toBe(`${DATE_MON}T09:00:00`);
        expect(s.end).toBe(`${DATE_MON}T16:00:00`);
      });
    });
  });

  describe("undo/redo", () => {
    beforeEach(() => {
      emitSpy.mockClear();
    });

    describe("canUndo / canRedo", () => {
      test("initially both return false", () => {
        const cal = createTestCalendar();
        expect(cal.canUndo()).toBe(false);
        expect(cal.canRedo()).toBe(false);
      });

      test("canUndo returns true after commitAdd", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        expect(cal.canUndo()).toBe(true);
        expect(cal.canRedo()).toBe(false);
      });
    });

    describe("undo", () => {
      test("undo after commitAdd removes the event", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        expect(cal.getEvents()).toHaveLength(1);
        cal.undo();
        expect(cal.getEvents()).toHaveLength(0);
      });

      test("undo after commitUpdate restores original event", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Original",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            } as TestEvent,
          ],
        });
        cal.commitUpdate("e1", { title: "Updated" });
        expect(cal.getEvents()[0]!.title).toBe("Updated");
        cal.undo();
        expect(cal.getEvents()[0]!.title).toBe("Original");
      });

      test("undo after removeEvent brings back the event", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            } as TestEvent,
          ],
        });
        cal.removeEvent("e1");
        expect(cal.getEvents()).toHaveLength(0);
        cal.undo();
        expect(cal.getEvents()).toHaveLength(1);
        expect(cal.getEvents()[0]!.id).toBe("e1");
      });

      test("undo is a no-op when stack is empty", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "E1",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            } as TestEvent,
          ],
        });
        cal.undo();
        expect(cal.getEvents()).toHaveLength(1);
      });

      test("multiple undos restore in reverse order", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        cal.commitAdd({
          id: "e2",
          title: "E2",
          start: `${DATE_MON}T11:00:00`,
          end: `${DATE_MON}T12:00:00`,
        } as TestEvent);
        expect(cal.getEvents()).toHaveLength(2);
        cal.undo();
        expect(cal.getEvents()).toHaveLength(1);
        cal.undo();
        expect(cal.getEvents()).toHaveLength(0);
      });
    });

    describe("redo", () => {
      test("redo after undo reapplies commitAdd", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        cal.undo();
        expect(cal.getEvents()).toHaveLength(0);
        cal.redo();
        expect(cal.getEvents()).toHaveLength(1);
        expect(cal.getEvents()[0]!.id).toBe("e1");
      });

      test("redo after undo reapplies commitUpdate", () => {
        const cal = createTestCalendar({
          events: [
            {
              id: "e1",
              title: "Original",
              start: `${DATE_MON}T09:00:00`,
              end: `${DATE_MON}T10:00:00`,
            } as TestEvent,
          ],
        });
        cal.commitUpdate("e1", { title: "Updated" });
        cal.undo();
        expect(cal.getEvents()[0]!.title).toBe("Original");
        cal.redo();
        expect(cal.getEvents()[0]!.title).toBe("Updated");
      });

      test("new action after undo clears redo stack", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        cal.undo();
        expect(cal.canRedo()).toBe(true);
        cal.commitAdd({
          id: "e2",
          title: "E2",
          start: `${DATE_MON}T11:00:00`,
          end: `${DATE_MON}T12:00:00`,
        } as TestEvent);
        expect(cal.canRedo()).toBe(false);
      });

      test("redo is a no-op when stack is empty", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        cal.redo();
        expect(cal.getEvents()).toHaveLength(1);
      });

      test("canRedo returns false after redo exhausts the stack", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        cal.undo();
        cal.redo();
        expect(cal.canRedo()).toBe(false);
      });
    });

    describe("command diffs", () => {
      const cascadingCalendar = () =>
        createTestCalendar({
          timeZone: "UTC",
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T11:00:00`,
            } as TestEvent,
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
              dependsOn: [{ id: "a", type: "FS" }],
            } as TestEvent,
          ],
        });

      test("one undo reverses an update and everything it cascaded", () => {
        const cal = cascadingCalendar();

        cal.commitUpdate("a", { end: `${DATE_MON}T12:30:00` });
        expect(cal.getEvents().find((e) => e.id === "b")!.start).toBe(
          `${DATE_MON}T12:30:00`,
        );

        cal.undo();

        const byId = new Map(cal.getEvents().map((e) => [e.id, e]));
        expect(byId.get("a")!.end).toBe(`${DATE_MON}T11:00:00`);
        expect(byId.get("b")!.start).toBe(`${DATE_MON}T11:00:00`);
        expect(cal.canUndo()).toBe(false);
      });

      test("redo reapplies the cascade too", () => {
        const cal = cascadingCalendar();

        cal.commitUpdate("a", { end: `${DATE_MON}T12:30:00` });
        cal.undo();
        cal.redo();

        const byId = new Map(cal.getEvents().map((e) => [e.id, e]));
        expect(byId.get("a")!.end).toBe(`${DATE_MON}T12:30:00`);
        expect(byId.get("b")!.start).toBe(`${DATE_MON}T12:30:00`);
      });

      test("keeps createDependency's reschedule in a single entry", () => {
        const cal = createTestCalendar({
          timeZone: "UTC",
          events: [
            {
              id: "a",
              title: "A",
              start: `${DATE_MON}T10:00:00`,
              end: `${DATE_MON}T13:00:00`,
            } as TestEvent,
            {
              id: "b",
              title: "B",
              start: `${DATE_MON}T11:00:00`,
              end: `${DATE_MON}T12:00:00`,
            } as TestEvent,
          ],
        });

        cal.createDependency("a", "b", "FS");
        expect(cal.getEvents().find((e) => e.id === "b")!.start).toBe(
          `${DATE_MON}T13:00:00`,
        );

        cal.undo();

        const b = cal.getEvents().find((e) => e.id === "b")!;
        expect(b.start).toBe(`${DATE_MON}T11:00:00`);
        expect(b.dependsOn ?? []).toEqual([]);
        expect(cal.canUndo()).toBe(false);
      });

      test("reports the events an undo touched", () => {
        const cal = cascadingCalendar();
        cal.commitUpdate("a", { end: `${DATE_MON}T12:30:00` });
        emitSpy.mockClear();

        cal.undo();

        const [name, payload] = emitSpy.mock.calls.at(-1)!;
        expect(name).toBe("event:undo");
        expect(payload.added).toEqual([]);
        expect(payload.removed).toEqual([]);
        expect(
          payload.updated.map((e: { eventId: string }) => e.eventId),
        ).toEqual(["b", "a"]);
      });

      test("stays silent when there is nothing to undo or redo", () => {
        const cal = createTestCalendar();
        emitSpy.mockClear();

        cal.undo();
        cal.redo();

        const names = emitSpy.mock.calls.map(([name]) => name);
        expect(names).not.toContain("event:undo");
        expect(names).not.toContain("event:redo");
      });

      test("drops history when the event list is replaced", () => {
        const cal = createTestCalendar();
        cal.commitAdd({
          id: "e1",
          title: "E1",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        } as TestEvent);
        expect(cal.canUndo()).toBe(true);

        cal.setEvents([]);

        expect(cal.canUndo()).toBe(false);
        expect(cal.canRedo()).toBe(false);
      });
    });
  });

  describe("setResources", () => {
    test("replaces resources and invalidates availability caches", () => {
      const cal = createTestCalendar({ resources: [weekdayResource] });
      const ranges1 = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: [weekdayResource.id],
      });
      expect(ranges1.length).toBeGreaterThan(0);
      cal.setResources([allDayResource]);
      const ranges2 = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: [allDayResource.id],
      });
      expect(ranges2).toHaveLength(0);
    });

    test("accepts null to clear resources", () => {
      const cal = createTestCalendar({ resources: [weekdayResource] });
      cal.setResources(null);
      const ranges = cal.getUnavailableRanges(DATE_MON, {
        resourceIds: [weekdayResource.id],
      });
      expect(ranges).toHaveLength(0);
    });
  });

  describe("event storage", () => {
    const seed = () =>
      createTestCalendar({
        events: [
          {
            id: "e1",
            title: "E1",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
          } as TestEvent,
        ],
      });

    test("reads options.events back as the current collection", () => {
      const cal = seed();

      expect(cal.options.events?.map((e) => e.id)).toEqual(["e1"]);
    });

    test("reuses the same array until a write lands", () => {
      const cal = seed();

      expect(cal.options.events).toBe(cal.options.events);

      const before = cal.options.events;
      cal.commitAdd({
        id: "e2",
        title: "E2",
        start: `${DATE_MON}T11:00:00`,
        end: `${DATE_MON}T12:00:00`,
      } as TestEvent);

      expect(cal.options.events).not.toBe(before);
      expect(cal.options.events?.map((e) => e.id)).toEqual(["e1", "e2"]);
    });

    test("treats assigning options.events as a replacement", () => {
      const cal = seed();

      cal.options.events = [
        {
          id: "other",
          title: "Other",
          start: `${DATE_TUE}T09:00:00`,
          end: `${DATE_TUE}T10:00:00`,
        } as TestEvent,
      ];

      expect(cal.getEvents().map((e) => e.id)).toEqual(["other"]);
      expect(cal.getEventsByDate(DATE_TUE)).toHaveLength(1);
      expect(cal.canUndo()).toBe(false);
    });

    test("keeps a removed event out of the collection", () => {
      const cal = seed();

      cal.removeEvent("e1");

      expect(cal.options.events).toEqual([]);
    });
  });

  describe("setEvents", () => {
    test("replaces events and invalidates availability caches", () => {
      const res: TestResource = {
        id: "r-cap",
        label: "Cap",
        capacity: [1],
        calendarId: workingHours({
          weekdays: [1, 2, 3, 4, 5],
          startTime: "09:00",
          endTime: "17:00",
        }),
      };
      const cal = createTestCalendar({
        resources: [res],
        events: [
          {
            id: "a",
            title: "A",
            start: `${DATE_MON}T09:00:00`,
            end: `${DATE_MON}T10:00:00`,
            resources: [res],
            consumption: [1],
          },
        ],
      });
      expect(cal.getEvents()).toHaveLength(1);
      cal.setEvents([]);
      expect(cal.getEvents()).toHaveLength(0);
      const result = cal.validateEventPlacement({
        title: "New",
        start: `${DATE_MON}T09:00:00`,
        end: `${DATE_MON}T10:00:00`,
        resources: [res],
        consumption: [1],
      });
      expect(result.blocked).toBe(false);
    });

    test("reindexes after setEvents", () => {
      const cal = createTestCalendar({ events: [] as any, resources: [] });
      cal.setEvents([
        {
          id: "x",
          title: "X",
          start: `${DATE_MON}T09:00:00`,
          end: `${DATE_MON}T10:00:00`,
        },
      ] as any);
      expect(cal.getEvents()).toHaveLength(1);
      expect(cal.getEventsByDate(DATE_MON)).toHaveLength(1);
    });
  });

  describe("recurrence exceptions", () => {
    const recurringEvent: TestEvent = {
      id: "rec-ex",
      title: "Recurring",
      start: "2025-06-02T09:00:00",
      end: "2025-06-02T10:00:00",
      recurrence: { frequency: "weekly", interval: 1 },
    };

    test("expands recurring master occurrence and later occurrences", () => {
      const cal = createTestCalendar({ events: [recurringEvent] });
      expect(cal.getEventsByDate("2025-06-02").map((e) => e.id)).toEqual([
        "rec-ex",
      ]);
      expect(cal.getEventsByDate("2025-06-09").map((e) => e.id)).toEqual([
        "rec-ex_1",
      ]);
    });

    test("EXDATE skips a specific occurrence", () => {
      const cal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: {
              frequency: "weekly",
              interval: 1,
              exDates: ["2025-06-09T09:00:00"],
            },
          },
        ],
      });

      expect(cal.getEventsByDate("2025-06-09")).toHaveLength(0);
      expect(cal.getEventsByDate("2025-06-16")).toHaveLength(1);
    });

    test("override moves one occurrence while others keep original time", () => {
      const cal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: {
              frequency: "weekly",
              interval: 1,
              overrides: [
                {
                  originalStart: "2025-06-09T09:00:00",
                  start: "2025-06-10T15:00:00",
                  end: "2025-06-10T16:00:00",
                  title: "Moved Tuesday",
                },
              ],
            },
          },
        ],
      });

      const moved = cal.getEventsByDate("2025-06-10");
      expect(moved).toHaveLength(1);
      expect(moved[0]!.start).toBe("2025-06-10T15:00:00");
      expect(moved[0]!._occurrenceOriginalStart).toBe("2025-06-09T09:00:00");
      expect(moved[0]!.title).toBe("Moved Tuesday");
      expect(cal.getEventsByDate("2025-06-17")).toHaveLength(0);
    });

    test("override and EXDATE can target original master occurrence", () => {
      const movedCal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: {
              frequency: "weekly",
              overrides: [
                {
                  originalStart: "2025-06-02T09:00:00",
                  start: "2025-06-02T15:00:00",
                  end: "2025-06-02T16:00:00",
                },
              ],
            },
          },
        ],
      });
      expect(movedCal.getEventsByDate("2025-06-02")[0]!.start).toBe(
        "2025-06-02T15:00:00",
      );

      const skippedCal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: {
              frequency: "weekly",
              exDates: ["2025-06-02T09:00:00"],
            },
          },
        ],
      });
      expect(skippedCal.getEventsByDate("2025-06-02")).toHaveLength(0);
      expect(skippedCal.getEventsByDate("2025-06-09")).toHaveLength(1);
    });

    test("COUNT is based on total occurrences, not viewport emissions", () => {
      const cal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: { frequency: "weekly", count: 2 },
          },
        ],
      });

      expect(cal.getEventsByDate("2025-06-02")).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-09")).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-16")).toHaveLength(0);
    });

    test("UNTIL remains exclusive", () => {
      const cal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: { frequency: "weekly", until: "2025-06-16" },
          },
        ],
      });

      expect(cal.getEventsByDate("2025-06-02")).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-09")).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-16")).toHaveLength(0);
    });

    test("editRecurringEvent with scope this creates an override", async () => {
      const cal = createTestCalendar({ events: [recurringEvent] });

      const result = await cal.editRecurringEvent(
        "rec-ex_1",
        {
          start: "2025-06-09T15:00:00",
          end: "2025-06-09T16:00:00",
          title: "Moved One",
        },
        { scope: "this", occurrenceStart: "2025-06-09T09:00:00" },
      );

      expect(result.success).toBe(true);
      const master = cal.getEvents()[0]!;
      expect(master.recurrence?.overrides).toHaveLength(1);
      const moved = cal.getEventsByDate("2025-06-09")[0]!;
      expect(moved.start).toBe("2025-06-09T15:00:00");
      expect(moved.title).toBe("Moved One");
      expect(cal.getEventsByDate("2025-06-16")[0]!.start).toBe(
        "2025-06-16T09:00:00",
      );
    });

    test("removeRecurringEvent with scope this creates EXDATE", () => {
      const cal = createTestCalendar({ events: [recurringEvent] });

      cal.removeRecurringEvent("rec-ex_1", {
        scope: "this",
        occurrenceStart: "2025-06-09T09:00:00",
      });

      expect(cal.getEvents()[0]!.recurrence?.exDates).toEqual([
        "2025-06-09T09:00:00",
      ]);
      expect(cal.getEventsByDate("2025-06-09")).toHaveLength(0);
      expect(cal.getEventsByDate("2025-06-16")).toHaveLength(1);
    });

    test("validateResize checks capacity for a recurring occurrence", () => {
      const room: TestResource = {
        id: "rec-room",
        label: "Recurring Room",
        capacity: [1],
        calendarId: workingHours({
          weekdays: [1, 2, 3, 4, 5, 6, 7],
          startTime: "00:00",
          endTime: "24:00",
        }),
      };
      const cal = createTestCalendar({
        resources: [room],
        events: [
          {
            ...recurringEvent,
            resources: [room],
            consumption: [1],
          },
          {
            id: "blocker",
            title: "Blocker",
            start: "2025-06-09T10:00:00",
            end: "2025-06-09T11:00:00",
            resources: [room],
            consumption: [1],
          },
        ],
      });

      const result = cal.validateResize({
        eventId: "rec-ex_1",
        originalStart: "2025-06-09T09:00:00",
        originalEnd: "2025-06-09T10:00:00",
        edge: "bottom",
        totalDeltaMinutes: 60,
        targetDayDate: "2025-06-09",
        originalDayDate: "2025-06-09",
        occurrenceStart: "2025-06-09T09:00:00",
        constraints: { snapToMinutes: 15, minDurationMinutes: 15 },
      });

      expect(result.blocked).toBe(true);
      expect(result.error?.conflicts?.[0]?.resourceDetails[0]?.reason).toBe(
        "capacity",
      );
    });

    test("editRecurringEvent with scope thisAndFollowing splits the series", async () => {
      const cal = createTestCalendar({
        events: [
          {
            ...recurringEvent,
            recurrence: { frequency: "weekly", count: 5 },
          },
        ],
      });

      const result = await cal.editRecurringEvent(
        "rec-ex_2",
        { start: "2025-06-16T15:00:00", end: "2025-06-16T16:00:00" },
        { scope: "thisAndFollowing", occurrenceStart: "2025-06-16T09:00:00" },
      );

      expect(result.success).toBe(true);
      expect(cal.getEvents()).toHaveLength(2);
      const [oldMaster, newMaster] = cal.getEvents();
      expect(oldMaster!.recurrence?.until).toBe("2025-06-16");
      expect(newMaster!.start).toBe("2025-06-16T15:00:00");
      expect(newMaster!.recurrence?.count).toBe(3);
      expect(cal.getEventsByDate("2025-06-09")[0]!.start).toBe(
        "2025-06-09T09:00:00",
      );
      expect(cal.getEventsByDate("2025-06-16")[0]!.start).toBe(
        "2025-06-16T15:00:00",
      );
    });

    test("scope all updates or removes master event", async () => {
      const editCal = createTestCalendar({ events: [recurringEvent] });
      const editResult = await editCal.editRecurringEvent(
        "rec-ex_1",
        { title: "All Updated" },
        { scope: "all" },
      );
      expect(editResult.success).toBe(true);
      expect(editCal.getEvents()[0]!.title).toBe("All Updated");

      const removeCal = createTestCalendar({ events: [recurringEvent] });
      removeCal.removeRecurringEvent("rec-ex_1", { scope: "all" });
      expect(removeCal.getEvents()).toHaveLength(0);
    });

    test("editRecurringEvent rejects an occurrenceStart outside the series", async () => {
      const cal = createTestCalendar({ events: [recurringEvent] });

      const result = await cal.editRecurringEvent(
        "rec-ex_1",
        { title: "Nope" },
        { scope: "this", occurrenceStart: "2025-06-10T09:00:00" },
      );

      assert(!result.success);
      expect(result.error.message).toBe(
        'Occurrence "2025-06-10T09:00:00" not found.',
      );
      expect(cal.getEvents()[0]!.recurrence?.overrides).toBeUndefined();
    });

    test("editRecurringEvent with scope thisAndFollowing at the master start edits in place", async () => {
      const cal = createTestCalendar({ events: [recurringEvent] });

      const result = await cal.editRecurringEvent(
        "rec-ex",
        { title: "From The Top" },
        {
          scope: "thisAndFollowing",
          occurrenceStart: "2025-06-02T09:00:00",
        },
      );

      expect(result.success).toBe(true);
      expect(cal.getEvents()).toHaveLength(1);
      expect(cal.getEvents()[0]!.title).toBe("From The Top");
      expect(cal.getEvents()[0]!.recurrence?.until).toBeUndefined();
    });

    test("editRecurringEvent with scope thisAndFollowing at the master start clears that occurrence's own override", async () => {
      const cal = createTestCalendar({ events: [recurringEvent] });

      await cal.editRecurringEvent(
        "rec-ex",
        { start: "2025-06-02T09:30:00", end: "2025-06-02T10:30:00" },
        { scope: "this", occurrenceStart: "2025-06-02T09:00:00" },
      );

      const result = await cal.editRecurringEvent(
        "rec-ex",
        { start: "2025-06-02T09:30:00", end: "2025-06-02T12:00:00" },
        { scope: "thisAndFollowing", occurrenceStart: "2025-06-02T09:00:00" },
      );

      expect(result.success).toBe(true);
      expect(cal.getEvents()[0]!.recurrence?.overrides).toEqual([]);
      expect(cal.getEventsByDate("2025-06-02")[0]).toMatchObject({
        start: "2025-06-02T09:30:00",
        end: "2025-06-02T12:00:00",
      });
      expect(cal.getEventsByDate("2025-06-09")[0]).toMatchObject({
        start: "2025-06-09T09:30:00",
        end: "2025-06-09T12:00:00",
      });
    });

    test("editRecurringEvent with scope thisAndFollowing at the master start keeps later overrides", async () => {
      const cal = createTestCalendar({ events: [recurringEvent] });

      await cal.editRecurringEvent(
        "rec-ex",
        { title: "Moved Later One" },
        { scope: "this", occurrenceStart: "2025-06-09T09:00:00" },
      );

      await cal.editRecurringEvent(
        "rec-ex",
        { end: "2025-06-02T12:00:00" },
        { scope: "thisAndFollowing", occurrenceStart: "2025-06-02T09:00:00" },
      );

      expect(cal.getEvents()[0]!.recurrence?.overrides).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-09")[0]!.title).toBe(
        "Moved Later One",
      );
    });

    test("editRecurringEvent blocks an occurrence moved into unavailable time", async () => {
      const dayShiftRoom: TestResource = {
        id: "rec-shift",
        label: "Day Shift Room",
        calendarId: workingHours({
          weekdays: [1, 2, 3, 4, 5, 6, 7],
          startTime: "09:00",
          endTime: "17:00",
        }),
      };
      const cal = createTestCalendar({
        resources: [dayShiftRoom],
        events: [{ ...recurringEvent, resources: [dayShiftRoom] }],
      });

      const result = await cal.editRecurringEvent(
        "rec-ex_1",
        { start: "2025-06-09T20:00:00", end: "2025-06-09T21:00:00" },
        { scope: "this", occurrenceStart: "2025-06-09T09:00:00" },
      );

      assert(!result.success);
      expect(result.error.reason).toBe("blocked");
      expect(result.error.attemptedStart).toBe("2025-06-09T20:00:00");
      expect(cal.getEventsByDate("2025-06-09")[0]!.start).toBe(
        "2025-06-09T09:00:00",
      );
    });

    test("editRecurringEvent rejects an occurrence that violates a dependency", async () => {
      const cal = createTestCalendar({
        events: [
          {
            id: "rec-pred",
            title: "Predecessor",
            start: "2025-06-09T10:00:00",
            end: "2025-06-09T12:00:00",
          },
          recurringEvent,
        ],
      });

      const result = await cal.editRecurringEvent(
        "rec-ex_1",
        {},
        {
          scope: "this",
          occurrenceStart: "2025-06-09T09:00:00",
          dependsOn: [{ id: "rec-pred", type: "FS" }],
        },
      );

      assert(!result.success);
      expect(result.error.eventId).toBe("rec-ex_1");
      expect(result.error.reason).toBe("blocked");
      expect(cal.getEvents()[1]!.recurrence?.overrides).toBeUndefined();
    });

    test("editRecurringEvent loads the range spanning both positions", async () => {
      const requested: Array<{ start: string; end: string }> = [];
      const cal = createTestCalendar({
        events: [recurringEvent],
        fetchEvents: async (range) => {
          requested.push(range);
          return [];
        },
      });

      await cal.editRecurringEvent(
        "rec-ex_1",
        { start: "2025-06-11T09:00:00", end: "2025-06-11T10:00:00" },
        { scope: "this", occurrenceStart: "2025-06-09T09:00:00" },
      );

      expect(requested).toContainEqual({
        start: "2025-06-09",
        end: "2025-06-12",
      });
    });
  });

  describe("read path does not filter by availability", () => {
    const mondayOnlyResource: TestResource = {
      id: "r-mon",
      label: "Monday Room",
      calendarId: workingHours({
        weekdays: [1],
        startTime: "09:00",
        endTime: "17:00",
      }),
    };

    test("renders a recurring occurrence that violates resource availability", () => {
      const cal = createTestCalendar({
        resources: [mondayOnlyResource],
        events: [
          {
            id: "daily",
            title: "Daily standup",
            start: "2025-06-02T10:00:00",
            end: "2025-06-02T11:00:00",
            resources: ["r-mon"],
            recurrence: { frequency: "daily" },
          },
        ],
      });
      cal.goToSpecificPeriod("2025-06-02");

      expect(cal.getEventsByDate("2025-06-02")).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-03")).toHaveLength(1);
      expect(cal.getEventsByDate("2025-06-04")).toHaveLength(1);
    });

    test("treats recurring and non-recurring violations identically", () => {
      const recurring = createTestCalendar({
        resources: [mondayOnlyResource],
        events: [
          {
            id: "rec",
            title: "Recurring",
            start: "2025-06-02T10:00:00",
            end: "2025-06-02T11:00:00",
            resources: ["r-mon"],
            recurrence: { frequency: "daily" },
          },
        ],
      });
      recurring.goToSpecificPeriod("2025-06-03");

      const plain = createTestCalendar({
        resources: [mondayOnlyResource],
        events: [
          {
            id: "one",
            title: "One off",
            start: "2025-06-03T10:00:00",
            end: "2025-06-03T11:00:00",
            resources: ["r-mon"],
          },
        ],
      });
      plain.goToSpecificPeriod("2025-06-03");

      expect(recurring.getEventsByDate("2025-06-03")).toHaveLength(
        plain.getEventsByDate("2025-06-03").length,
      );
    });

    test("still reports the violation through validation", () => {
      const cal = createTestCalendar({
        resources: [mondayOnlyResource],
        events: [
          {
            id: "daily",
            title: "Daily standup",
            start: "2025-06-02T10:00:00",
            end: "2025-06-02T11:00:00",
            resources: ["r-mon"],
            recurrence: { frequency: "daily" },
          },
        ],
      });

      const placement = cal.validateEventPlacement({
        title: "Tuesday attempt",
        start: "2025-06-03T10:00:00",
        end: "2025-06-03T11:00:00",
        resources: ["r-mon"],
      });

      expect(placement.blocked).toBe(true);
    });
  });

  describe("isPending", () => {
    test("stays true until every in-flight fetch settles", async () => {
      const resolvers: Array<() => void> = [];
      const cal = createTestCalendar({
        fetchEvents: () =>
          new Promise<Array<TestEvent>>((resolve) => {
            resolvers.push(() => resolve([]));
          }),
      });

      const first = cal.fetchEventsForRange("2024-03-18", "2024-03-25");
      const second = cal.fetchEventsForRange("2024-04-01", "2024-04-08");
      expect(cal.store.state.isPending).toBe(true);

      resolvers[1]!();
      await second;
      expect(cal.store.state.isPending).toBe(true);

      resolvers[0]!();
      await first;
      expect(cal.store.state.isPending).toBe(false);
    });

    test("clears when a fetch rejects while another is in flight", async () => {
      const settlers: Array<{ resolve: () => void; reject: () => void }> = [];
      const cal = createTestCalendar({
        fetchEvents: () =>
          new Promise<Array<TestEvent>>((resolve, reject) => {
            settlers.push({
              resolve: () => resolve([]),
              reject: () => reject(new Error("boom")),
            });
          }),
      });

      const first = cal.fetchEventsForRange("2024-03-18", "2024-03-25");
      const second = cal.fetchEventsForRange("2024-04-01", "2024-04-08");

      settlers[0]!.reject();
      await first;
      expect(cal.store.state.isPending).toBe(true);

      settlers[1]!.resolve();
      await second;
      expect(cal.store.state.isPending).toBe(false);
      expect(cal.getLoadedRanges().some((r) => r.start === "2024-03-18")).toBe(
        false,
      );
    });
  });
});
