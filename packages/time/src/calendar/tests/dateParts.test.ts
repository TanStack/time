import { describe, expect, test, vi } from "vitest";
import { createCalendar } from "../calendar";
import { stockFeatures } from "../features";
import type { Event, Resource } from "../types";

vi.mock("../../client", () => ({
  getTimeClient: () => ({ emit: vi.fn() }),
}));

const ISO_DATE = "2025-07-25";

function createTestCalendar(
  overrides: Partial<
    Parameters<typeof createCalendar<typeof stockFeatures>>[0]
  > = {},
) {
  return createCalendar<typeof stockFeatures, Resource, Event<Resource>>({
    viewMode: { value: 1, unit: "week" },
    timeZone: "UTC",
    locale: "en-US",
    calendar: "gregory",
    features: stockFeatures,
    ...overrides,
  });
}

describe("calendar date parts", () => {
  test("days carry their month key and day number", () => {
    const calendar = createTestCalendar();

    const [day] = calendar.getDaysInRange(ISO_DATE, ISO_DATE);

    expect(day).toMatchObject({
      isoDate: ISO_DATE,
      isoMonth: "2025-07",
      dayOfMonth: 25,
    });
  });

  test("day numbers follow the configured calendar", () => {
    const calendar = createTestCalendar({ calendar: "hebrew" });

    expect(calendar.getDaysInRange(ISO_DATE, ISO_DATE)[0]!.dayOfMonth).toBe(29);
  });

  test("grouped placeholder days carry the same fields", () => {
    const calendar = createTestCalendar();
    calendar.goToSpecificPeriod(ISO_DATE);

    const week = calendar
      .groupDaysBy({
        days: calendar.getDaysInRange(ISO_DATE, ISO_DATE),
        unit: "week",
        fillMissingDays: true,
      })
      .flat();

    for (const day of week) {
      expect(day!.dayOfMonth).toBe(Number(day!.isoDate.slice(8, 10)));
      expect(day!.isoMonth).toBe(day!.isoDate.slice(0, 7));
    }
  });

  test("resolves parts with instance defaults", () => {
    const calendar = createTestCalendar();

    expect(calendar.getDateParts(ISO_DATE)).toMatchObject({
      calendar: "gregory",
      weekdayShort: "Fri",
      dayOfMonth: "25",
    });
  });

  test("overrides the calendar per call", () => {
    const calendar = createTestCalendar();

    const lunar = calendar.getDateParts(ISO_DATE, { calendar: "chinese" });

    expect(lunar).toMatchObject({ calendar: "chinese", isLeapMonth: true });
    expect(calendar.getDateParts(ISO_DATE).calendar).toBe("gregory");
  });

  test("formats a period with defaults, overrides and units", () => {
    const calendar = createTestCalendar();
    calendar.goToSpecificPeriod(ISO_DATE);

    expect(calendar.formatPeriod()).toBe("July 2025");
    expect(calendar.formatCurrentPeriod()).toBe("July 2025");
    expect(calendar.formatPeriod("2025-01")).toBe("January 2025");
    expect(calendar.formatPeriod(ISO_DATE, { unit: "day" })).toBe(
      "July 25, 2025",
    );
    expect(calendar.formatPeriod(ISO_DATE, { unit: "year" })).toBe("2025");
    expect(calendar.formatPeriod(ISO_DATE, { locale: "de-DE" })).toBe(
      "Juli 2025",
    );
    expect(calendar.formatPeriod(ISO_DATE, { calendar: "chinese" })).not.toBe(
      "July 2025",
    );
  });
});
