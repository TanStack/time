import { assert, describe, expect, test } from "vitest";
import { createCalendar } from "../calendar";
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
  historyFeature,
  resourceAvailabilityFeature,
} from "../features";
import type {
  CalendarFeature,
  CalendarFeatureList,
  FullFeatureApi,
} from "../features";
import type { Event, Resource } from "../types";

type TestResource = Resource;
type TestEvent = Event<TestResource>;

const uncomposed = (cal: object): FullFeatureApi<TestResource, TestEvent> =>
  cal as FullFeatureApi<TestResource, TestEvent>;

const DAY = "2025-06-02";

const recurringEvent: TestEvent = {
  id: "rec",
  title: "Recurring",
  start: `${DAY}T09:00:00`,
  end: `${DAY}T10:00:00`,
  recurrence: { frequency: "weekly", interval: 1 },
};

function createTestCalendar<TFeatures extends CalendarFeatureList>(
  features: TFeatures,
  events: Array<TestEvent> = [],
  resources?: Array<TestResource>,
) {
  return createCalendar<TFeatures, TestResource, TestEvent>({
    viewMode: { value: 1, unit: "week" },
    timeZone: "UTC",
    events,
    resources,
    features,
  });
}

const morningRoom: TestResource = {
  id: "r1",
  label: "Morning Room",
  availability: [
    { weekdays: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "12:00" },
  ],
};

const eveningEvent: TestEvent = {
  id: "late",
  title: "Late",
  start: `${DAY}T20:00:00`,
  end: `${DAY}T21:00:00`,
  resources: ["r1"],
};

describe("calendarFeatures composition", () => {
  test("composes only the features it is given", () => {
    const cal = createTestCalendar(calendarFeatures([dayEventLayoutFeature]), [
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
    const cal = createTestCalendar(calendarFeatures([dayEventLayoutFeature]));

    expect(() => uncomposed(cal).undo()).toThrow(
      'CalendarCore: "undo" requires historyFeature. Compose it via calendarFeatures([historyFeature, ...]).',
    );
    expect(() => uncomposed(cal).canUndo()).toThrow(
      'CalendarCore: "canUndo" requires historyFeature. Compose it via calendarFeatures([historyFeature, ...]).',
    );
  });

  test("history alone still undoes a write", () => {
    const cal = createTestCalendar(calendarFeatures([historyFeature]));

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
    const cal = createTestCalendar(calendarFeatures([eventRecurrenceFeature]), [
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

  test("occurrence edits are unreachable without the recurrence feature", () => {
    const cal = createTestCalendar(calendarFeatures([dayEventLayoutFeature]), [
      recurringEvent,
    ]);

    expect(() =>
      uncomposed(cal).editRecurringEvent("rec_1", {}, { scope: "this" }),
    ).toThrow(
      'CalendarCore: "editRecurringEvent" requires eventRecurrenceFeature. Compose it via calendarFeatures([eventRecurrenceFeature, ...]).',
    );
    expect(() =>
      uncomposed(cal).removeRecurringEvent("rec_1", { scope: "all" }),
    ).toThrow(
      'CalendarCore: "removeRecurringEvent" requires eventRecurrenceFeature. Compose it via calendarFeatures([eventRecurrenceFeature, ...]).',
    );
  });

  test("throws when a composed feature's required peer is missing", () => {
    expect(() =>
      createTestCalendar(calendarFeatures([eventResizeFeature])),
    ).toThrow(/"resize" requires "recurrence"/);

    expect(() =>
      createTestCalendar(
        calendarFeatures([eventResizeFeature, eventRecurrenceFeature]),
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
      createTestCalendar(
        calendarFeatures([dayEventLayoutFeature, shadowFeature]),
      ),
    ).toThrow(/contributes api "getEventProps"/);
  });

  test("availability blocks a write only when it is composed", async () => {
    const withAvailability = createTestCalendar(
      calendarFeatures([resourceAvailabilityFeature]),
      [],
      [morningRoom],
    );
    const blocked = await withAvailability.addEvent(eveningEvent);
    assert(!blocked.success);
    expect(blocked.error.message).toContain("unavailable zone");
    expect(withAvailability.getEvents()).toHaveLength(0);

    const withoutAvailability = createTestCalendar(
      calendarFeatures([dayEventLayoutFeature]),
      [],
      [morningRoom],
    );
    const allowed = await withoutAvailability.addEvent(eveningEvent);
    expect(allowed.success).toBe(true);
    expect(withoutAvailability.getEvents()).toHaveLength(1);
  });

  test("validateMove stops consulting availability when it is absent", () => {
    const withAvailability = createTestCalendar(
      calendarFeatures([resourceAvailabilityFeature]),
      [{ ...eveningEvent, start: `${DAY}T09:00:00`, end: `${DAY}T10:00:00` }],
      [morningRoom],
    );
    expect(
      withAvailability.validateMove(
        "late",
        `${DAY}T20:00:00`,
        `${DAY}T21:00:00`,
      ).blocked,
    ).toBe(true);

    const withoutAvailability = createTestCalendar(
      calendarFeatures([dayEventLayoutFeature]),
      [{ ...eveningEvent, start: `${DAY}T09:00:00`, end: `${DAY}T10:00:00` }],
      [morningRoom],
    );
    expect(
      withoutAvailability.validateMove(
        "late",
        `${DAY}T20:00:00`,
        `${DAY}T21:00:00`,
      ).blocked,
    ).toBe(false);
  });

  test("availability reads are unreachable without the feature", () => {
    const cal = createTestCalendar(
      calendarFeatures([dayEventLayoutFeature]),
      [],
      [morningRoom],
    );

    expect(() => uncomposed(cal).getUnavailableRanges(DAY)).toThrow(
      'CalendarCore: "getUnavailableRanges" requires resourceAvailabilityFeature. Compose it via calendarFeatures([resourceAvailabilityFeature, ...]).',
    );
  });

  test("throws when a feature shadows a core method", () => {
    const coreShadowFeature = (): CalendarFeature<
      TestResource,
      TestEvent,
      object,
      { getEvents: () => Array<TestEvent> },
      "coreShadow"
    > => ({
      name: "coreShadow",
      api: () => ({ getEvents: () => [] }),
    });

    expect(() =>
      createTestCalendar(calendarFeatures([coreShadowFeature])),
    ).toThrow(/contributes api "getEvents", which shadows a core method/);
  });
});
