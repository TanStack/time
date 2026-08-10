import { describe, expect, it } from "vitest";
import { checkDuration, workingMinutesBetween } from "../checkDuration";
import type { WorkingTimeConfig } from "../../availability";
import type { WorkingCalendar } from "~/workingTime";

const OFFICE: WorkingCalendar = {
  id: "office",
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

const withCalendar: WorkingTimeConfig = {
  calendars: [OFFICE],
  defaultCalendarId: "office",
};

const withoutCalendar: WorkingTimeConfig = { calendars: [] };

const MON = "2026-03-02";
const TUE = "2026-03-03";
const SAT = "2026-03-07";

describe("workingMinutesBetween", () => {
  it("falls back to wall-clock minutes when no calendar resolves", () => {
    expect(
      workingMinutesBetween(
        { start: `${MON}T09:00:00`, end: `${MON}T11:30:00` },
        [],
        withoutCalendar,
      ),
    ).toBe(150);
  });

  it("counts only working minutes inside the span", () => {
    expect(
      workingMinutesBetween(
        { start: `${MON}T08:00:00`, end: `${MON}T12:00:00` },
        [],
        withCalendar,
      ),
    ).toBe(180);
  });

  it("skips the non-working gap between two days", () => {
    expect(
      workingMinutesBetween(
        { start: `${MON}T16:00:00`, end: `${TUE}T10:00:00` },
        [],
        withCalendar,
      ),
    ).toBe(120);
  });

  it("counts a span that lands entirely outside working time as zero", () => {
    expect(
      workingMinutesBetween(
        { start: `${SAT}T09:00:00`, end: `${SAT}T17:00:00` },
        [],
        withCalendar,
      ),
    ).toBe(0);
  });

  it("returns zero for an inverted span", () => {
    expect(
      workingMinutesBetween(
        { start: `${MON}T11:00:00`, end: `${MON}T09:00:00` },
        [],
        withCalendar,
      ),
    ).toBe(0);
  });

  it("uses the resource's own calendar over the default", () => {
    const late: WorkingCalendar = {
      id: "late",
      intervals: [
        {
          isWorking: true,
          recurrent: {
            weekdays: [1, 2, 3, 4, 5],
            startTime: "13:00",
            endTime: "17:00",
          },
        },
      ],
    };

    expect(
      workingMinutesBetween(
        { start: `${MON}T09:00:00`, end: `${MON}T17:00:00` },
        [{ id: "r", calendarId: "late" }],
        { calendars: [OFFICE, late], defaultCalendarId: "office" },
      ),
    ).toBe(240);
  });
});

const event = (duration?: number, effort?: number) => ({
  id: "a",
  title: "A",
  start: `${MON}T08:00:00`,
  end: `${MON}T12:00:00`,
  duration,
  effort,
});

describe("checkDuration", () => {
  it("stays silent when neither field is declared", () => {
    expect(
      checkDuration({ event: event(), workingTime: withCalendar }),
    ).toEqual([]);
  });

  it("accepts a duration that matches the span's working minutes", () => {
    expect(
      checkDuration({ event: event(180), workingTime: withCalendar }),
    ).toEqual([]);
  });

  it("flags a duration measured in wall-clock time", () => {
    const [conflict] = checkDuration({
      event: event(240),
      workingTime: withCalendar,
    });

    expect(conflict).toMatchObject({
      eventId: "a",
      reason: "duration-mismatch",
      declared: 240,
      actual: 180,
      message: '"A" declares 240m of duration but spans 180m of working time',
    });
  });

  it("flags effort that exceeds the declared duration", () => {
    const conflicts = checkDuration({
      event: event(180, 240),
      workingTime: withCalendar,
    });

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({
      reason: "effort-exceeds-duration",
      declared: 240,
      actual: 180,
    });
  });

  it("measures effort against the working span when no duration is declared", () => {
    expect(
      checkDuration({
        event: event(undefined, 200),
        workingTime: withCalendar,
      })[0],
    ).toMatchObject({ reason: "effort-exceeds-duration", actual: 180 });

    expect(
      checkDuration({
        event: event(undefined, 120),
        workingTime: withCalendar,
      }),
    ).toEqual([]);
  });

  it("reports both failures when duration and effort are each wrong", () => {
    expect(
      checkDuration({
        event: event(60, 90),
        workingTime: withCalendar,
      }).map((conflict) => conflict.reason),
    ).toEqual(["duration-mismatch", "effort-exceeds-duration"]);
  });
});
