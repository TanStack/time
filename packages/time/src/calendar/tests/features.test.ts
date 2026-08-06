import { describe, expect, test } from "vitest";
import { CalendarCore } from "../calendar";
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
  historyFeature,
} from "../features";
import type { CalendarFeature, CalendarFeatureRecord } from "../features";
import type { Event, Resource } from "../types";

type TestResource = Resource;
type TestEvent = Event<TestResource>;

const DAY = "2025-06-02";

const recurringEvent: TestEvent = {
  id: "rec",
  title: "Recurring",
  start: `${DAY}T09:00:00`,
  end: `${DAY}T10:00:00`,
  recurrence: { frequency: "weekly", interval: 1 },
};

function createCalendar<TFeatures extends CalendarFeatureRecord>(
  features: TFeatures,
  events: Array<TestEvent> = [],
) {
  return new CalendarCore<TFeatures, TestResource, TestEvent>({
    viewMode: { value: 1, unit: "week" },
    timeZone: "UTC",
    events,
    features,
  });
}

describe("calendarFeatures composition", () => {
  test("composes only the features it is given", () => {
    const cal = createCalendar(calendarFeatures({ dayEventLayoutFeature }), [
      {
        id: "e1",
        title: "E",
        start: `${DAY}T09:00:00`,
        end: `${DAY}T10:00:00`,
      },
    ]);
    cal.goToSpecificPeriod(DAY);

    const event = cal.getEventsByDate(DAY)[0]!;
    expect(cal.getEventProps(event).isSplitEvent).toBe(false);
  });

  test("a method whose feature is absent is not callable", () => {
    const cal = createCalendar(calendarFeatures({ dayEventLayoutFeature }));

    expect(() => cal.undo()).toThrow(TypeError);
    expect(() => cal.canUndo()).toThrow(TypeError);
  });

  test("history alone still undoes a write", () => {
    const cal = createCalendar(calendarFeatures({ historyFeature }));

    cal.commitAdd({
      id: "e1",
      title: "E",
      start: `${DAY}T09:00:00`,
      end: `${DAY}T10:00:00`,
    });
    expect(cal.canUndo()).toBe(true);

    cal.undo();
    expect(cal.getEvents()).toHaveLength(0);
  });

  test("a feature's kernel module is mounted with it", async () => {
    const cal = createCalendar(calendarFeatures({ eventRecurrenceFeature }), [
      recurringEvent,
    ]);
    cal.goToSpecificPeriod(DAY);

    const result = await cal.editRecurringEvent(
      "rec_1",
      { title: "Moved" },
      { scope: "this", occurrenceStart: "2025-06-09T09:00:00" },
    );

    expect(result.success).toBe(true);
    expect(cal.getEvents()[0]!.recurrence?.overrides).toHaveLength(1);
  });

  test("occurrence edits are unreachable without the recurrence feature", async () => {
    const cal = createCalendar(calendarFeatures({ dayEventLayoutFeature }), [
      recurringEvent,
    ]);

    await expect(
      cal.editRecurringEvent("rec_1", {}, { scope: "this" }),
    ).rejects.toThrow(TypeError);
    expect(() => cal.removeRecurringEvent("rec_1", { scope: "all" })).toThrow(
      TypeError,
    );
  });

  test("throws when a composed feature's required peer is missing", () => {
    expect(() =>
      createCalendar(calendarFeatures({ eventResizeFeature })),
    ).toThrow(/"resize" requires "recurrence"/);

    expect(() =>
      createCalendar(
        calendarFeatures({ eventResizeFeature, eventRecurrenceFeature }),
      ),
    ).not.toThrow();
  });

  test("throws when two features contribute the same api key", () => {
    const shadowFeature = (): CalendarFeature<
      TestResource,
      TestEvent,
      object,
      { getEventProps: () => never },
      "shadow"
    > => ({
      name: "shadow",
      api: () => ({
        getEventProps: () => {
          throw new Error("unreachable");
        },
      }),
    });

    expect(() =>
      createCalendar(
        calendarFeatures({ dayEventLayoutFeature, shadowFeature }),
      ),
    ).toThrow(/contributes api "getEventProps"/);
  });
});
