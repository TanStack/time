import { createRoot } from "solid-js";
import { describe, expect, test } from "vitest";
import {
  calendarFeatures,
  dayEventLayoutFeature,
  historyFeature,
} from "@tanstack/time";
import { createCalendar } from "../src";
import type { Event, Resource } from "@tanstack/time";

type TestEvent = Event<Resource>;

const DAY = "2025-06-02";

const events: Array<TestEvent> = [
  {
    id: "e1",
    title: "E",
    start: `${DAY}T09:00:00`,
    end: `${DAY}T10:00:00`,
  },
];

describe("createCalendar", () => {
  test("days track navigation", () =>
    createRoot((dispose) => {
      const { calendar, days } = createCalendar({
        features: calendarFeatures([dayEventLayoutFeature]),
        viewMode: { value: 1, unit: "week" },
        timeZone: "UTC",
        events,
      });
      calendar.goToSpecificPeriod(DAY);

      expect(days()).toHaveLength(7);
      expect(days().flatMap((day) => day.events)).toHaveLength(1);

      calendar.goToNextPeriod();
      expect(days().flatMap((day) => day.events)).toHaveLength(0);

      dispose();
    }));

  test("days recompute after a write", () =>
    createRoot((dispose) => {
      const { calendar, days } = createCalendar({
        features: calendarFeatures([dayEventLayoutFeature]),
        viewMode: { value: 1, unit: "week" },
        timeZone: "UTC",
        events,
      });
      calendar.goToSpecificPeriod(DAY);

      calendar.commitAdd({
        id: "e2",
        title: "Second",
        start: `${DAY}T11:00:00`,
        end: `${DAY}T12:00:00`,
      });

      expect(days().flatMap((day) => day.events)).toHaveLength(2);

      dispose();
    }));

  test("state and isPending read the store", () =>
    createRoot((dispose) => {
      const { calendar, state, isPending } = createCalendar({
        features: calendarFeatures([dayEventLayoutFeature]),
        viewMode: { value: 1, unit: "week" },
        timeZone: "UTC",
      });

      expect(isPending()).toBe(false);
      calendar.goToSpecificPeriod(DAY);
      expect(state().activeDate).toBe(DAY);

      dispose();
    }));

  test("composed feature api is reachable on the instance", () =>
    createRoot((dispose) => {
      const { calendar, days } = createCalendar({
        features: calendarFeatures([historyFeature, dayEventLayoutFeature]),
        viewMode: { value: 1, unit: "week" },
        timeZone: "UTC",
        events,
      });
      calendar.goToSpecificPeriod(DAY);

      calendar.commitAdd({
        id: "e2",
        title: "Second",
        start: `${DAY}T11:00:00`,
        end: `${DAY}T12:00:00`,
      });
      expect(calendar.canUndo()).toBe(true);

      calendar.undo();
      expect(days().flatMap((day) => day.events)).toHaveLength(1);

      dispose();
    }));
});
