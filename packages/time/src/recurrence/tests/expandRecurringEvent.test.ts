import { describe, expect, it } from "vitest";
import { expandRecurringEvent } from "../index";
import type { Event } from "~/calendar/types";

const daily = (overrides: Partial<Event> = {}): Event => ({
  id: "m",
  title: "Daily",
  start: "2026-01-05T09:00:00",
  end: "2026-01-05T10:00:00",
  recurrence: { frequency: "daily" },
  ...overrides,
});

const starts = (events: Array<Event>) => events.map((e) => e.start);

describe("expandRecurringEvent", () => {
  it("returns [] for non-recurring events", () => {
    expect(
      expandRecurringEvent(
        { ...daily(), recurrence: undefined },
        "2026-01-01",
        "2026-01-31",
      ),
    ).toHaveLength(0);
  });

  it("expands a daily rule across the window (end exclusive)", () => {
    const occ = expandRecurringEvent(daily(), "2026-01-05", "2026-01-08");
    expect(starts(occ)).toEqual([
      "2026-01-05T09:00:00",
      "2026-01-06T09:00:00",
      "2026-01-07T09:00:00",
    ]);
  });

  it("honours interval", () => {
    const occ = expandRecurringEvent(
      daily({ recurrence: { frequency: "daily", interval: 2 } }),
      "2026-01-05",
      "2026-01-10",
    );
    expect(starts(occ)).toEqual([
      "2026-01-05T09:00:00",
      "2026-01-07T09:00:00",
      "2026-01-09T09:00:00",
    ]);
  });

  it("stops at count", () => {
    const occ = expandRecurringEvent(
      daily({ recurrence: { frequency: "daily", count: 2 } }),
      "2026-01-05",
      "2026-01-31",
    );
    expect(occ).toHaveLength(2);
  });

  it("stops at until (exclusive)", () => {
    const occ = expandRecurringEvent(
      daily({ recurrence: { frequency: "daily", until: "2026-01-07" } }),
      "2026-01-05",
      "2026-01-31",
    );
    expect(starts(occ)).toEqual(["2026-01-05T09:00:00", "2026-01-06T09:00:00"]);
  });

  it("excludes exDates", () => {
    const occ = expandRecurringEvent(
      daily({ recurrence: { frequency: "daily", exDates: ["2026-01-06"] } }),
      "2026-01-05",
      "2026-01-08",
    );
    expect(starts(occ)).toEqual(["2026-01-05T09:00:00", "2026-01-07T09:00:00"]);
  });

  it("applies per-occurrence overrides", () => {
    const occ = expandRecurringEvent(
      daily({
        recurrence: {
          frequency: "daily",
          overrides: [
            {
              originalStart: "2026-01-06T09:00:00",
              start: "2026-01-06T14:00:00",
              end: "2026-01-06T15:00:00",
            },
          ],
        },
      }),
      "2026-01-05",
      "2026-01-08",
    );
    const overridden = occ.find((e) => e._occurrenceIndex === 1);
    expect(overridden?.start).toBe("2026-01-06T14:00:00");
  });

  it("expands weekly on byWeekday", () => {
    const occ = expandRecurringEvent(
      daily({
        start: "2026-01-05T09:00:00",
        end: "2026-01-05T10:00:00",
        recurrence: { frequency: "weekly", byWeekday: [1, 3] },
      }),
      "2026-01-05",
      "2026-01-12",
    );
    expect(starts(occ)).toEqual(["2026-01-05T09:00:00", "2026-01-07T09:00:00"]);
  });

  it("clamps monthly day-of-month overflow", () => {
    const occ = expandRecurringEvent(
      daily({
        start: "2026-01-31T09:00:00",
        end: "2026-01-31T10:00:00",
        recurrence: { frequency: "monthly", count: 2 },
      }),
      "2026-01-01",
      "2026-03-31",
    );
    expect(starts(occ)).toEqual(["2026-01-31T09:00:00", "2026-02-28T09:00:00"]);
  });

  it("tags occurrences with master id and index", () => {
    const occ = expandRecurringEvent(daily(), "2026-01-05", "2026-01-07");
    expect(occ[0]!.id).toBe("m");
    expect(occ[0]!._recurringMasterId).toBe("m");
    expect(occ[1]!.id).toBe("m_1");
    expect(occ[1]!._occurrenceIndex).toBe(1);
  });
});
