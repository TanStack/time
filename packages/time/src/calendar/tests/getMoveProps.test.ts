import { describe, expect, test } from "vitest";
import {
  calculateDayShift,
  calculateMovedEvent,
  snapToInterval,
} from "../getMoveProps";

const DAY = "2025-06-02";
const START = `${DAY}T09:00:00`;
const END = `${DAY}T10:30:00`;

describe("snapToInterval", () => {
  test("rounds to the nearest multiple", () => {
    expect(snapToInterval(37, 15)).toBe(30);
    expect(snapToInterval(38, 15)).toBe(45);
    expect(snapToInterval(-38, 15)).toBe(-45);
    expect(snapToInterval(-37, 15)).toBe(-30);
  });

  test("rounds to whole minutes when there is nothing to snap to", () => {
    expect(snapToInterval(37.4, 1)).toBe(37);
    expect(snapToInterval(37.6, 0)).toBe(38);
  });
});

describe("calculateDayShift", () => {
  test("counts calendar days between two iso dates", () => {
    expect(calculateDayShift(DAY, "2025-06-05")).toBe(3);
    expect(calculateDayShift("2025-06-05", DAY)).toBe(-3);
    expect(calculateDayShift(DAY, DAY)).toBe(0);
  });

  test("accepts date-times and ignores the time part", () => {
    expect(calculateDayShift(START, `2025-06-03T23:00:00`)).toBe(1);
  });

  test("crosses month and year boundaries", () => {
    expect(calculateDayShift("2025-12-31", "2026-01-01")).toBe(1);
    expect(calculateDayShift("2024-02-28", "2024-03-01")).toBe(2);
  });
});

describe("calculateMovedEvent", () => {
  const base = {
    originalStart: START,
    originalEnd: END,
    timeZone: "UTC",
  };

  test("shifts both ends by the same amount, preserving duration", () => {
    const result = calculateMovedEvent({
      ...base,
      dayShift: 1,
      minuteShift: 30,
    });

    expect(result.start).toBe("2025-06-03T09:30:00");
    expect(result.end).toBe("2025-06-03T11:00:00");
    expect(result.durationMinutes).toBe(90);
    expect(result.moved).toBe(true);
  });

  test("accepts a day and minute shift of opposite signs", () => {
    const result = calculateMovedEvent({
      ...base,
      dayShift: 1,
      minuteShift: -30,
    });

    expect(result.start).toBe("2025-06-03T08:30:00");
    expect(result.end).toBe("2025-06-03T10:00:00");

    const back = calculateMovedEvent({
      ...base,
      dayShift: -1,
      minuteShift: 30,
    });

    expect(back.start).toBe("2025-06-01T09:30:00");
  });

  test("snaps the minute shift", () => {
    const result = calculateMovedEvent({ ...base, minuteShift: 37 });

    expect(result.minuteShift).toBe(30);
    expect(result.start).toBe(`${DAY}T09:30:00`);
  });

  test("honours a custom snap interval", () => {
    const result = calculateMovedEvent({
      ...base,
      minuteShift: 37,
      constraints: { snapToMinutes: 5 },
    });

    expect(result.minuteShift).toBe(35);
  });

  test("ignores the minute shift at day granularity", () => {
    const result = calculateMovedEvent({
      ...base,
      dayShift: 2,
      minuteShift: 240,
      granularity: "day",
    });

    expect(result.start).toBe("2025-06-04T09:00:00");
    expect(result.end).toBe("2025-06-04T10:30:00");
    expect(result.moved).toBe(true);
  });

  test("reports an unmoved event when nothing shifts", () => {
    const result = calculateMovedEvent(base);

    expect(result.start).toBe(START);
    expect(result.end).toBe(END);
    expect(result.moved).toBe(false);
  });

  test("a sub-snap drag is not a move", () => {
    const result = calculateMovedEvent({ ...base, minuteShift: 4 });

    expect(result.moved).toBe(false);
    expect(result.start).toBe(START);
  });

  test("keeps wall-clock times across a DST transition", () => {
    const result = calculateMovedEvent({
      originalStart: "2025-03-08T09:00:00",
      originalEnd: "2025-03-08T10:00:00",
      dayShift: 1,
      timeZone: "America/New_York",
    });

    expect(result.start).toBe("2025-03-09T09:00:00");
    expect(result.end).toBe("2025-03-09T10:00:00");
    expect(result.durationMinutes).toBe(60);
  });
});
