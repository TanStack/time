import { assert, describe, expect, test } from "vitest";
import { createCalendar } from "../calendar";
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventRecurrenceFeature,
  eventResizeFeature,
  eventDependencyFeature,
  historyFeature,
  resourceAvailabilityFeature,
} from "../features";
import type {
  CalendarFeature,
  CalendarFeatureList,
  FullFeatureApi,
  RecurrenceReadApi,
} from "../features";
import type { Event, Resource } from "../types";

type TestResource = Resource;
type TestEvent = Event<TestResource>;

interface PeerReaderApi<
  TResource extends Resource,
  TEvent extends Event<TResource>,
> {
  masterTitleOf: (eventId: string) => TEvent["title"] | undefined;
}

declare module "../features" {
  interface FeatureApiRegistry<
    TResource extends Resource,
    TEvent extends Event<TResource>,
  > {
    peerReader: PeerReaderApi<TResource, TEvent>;
  }
}

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

  test("occurrences are read back only when recurrence is composed", () => {
    const nextWeek = "2025-06-09";

    const withRecurrence = createTestCalendar(
      calendarFeatures([eventRecurrenceFeature]),
      [recurringEvent],
    );
    withRecurrence.goToSpecificPeriod(nextWeek);
    expect(withRecurrence.getEventsByDate(nextWeek)).toHaveLength(1);

    const withoutRecurrence = createTestCalendar(
      calendarFeatures([dayEventLayoutFeature]),
      [recurringEvent],
    );
    withoutRecurrence.goToSpecificPeriod(nextWeek);
    expect(withoutRecurrence.getEventsByDate(nextWeek)).toHaveLength(0);
    expect(withoutRecurrence.getEventsByDate(DAY)).toHaveLength(1);
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

  test("the availability veto stops a commit that skips validation", () => {
    const cal = createTestCalendar(
      calendarFeatures([resourceAvailabilityFeature]),
      [],
      [morningRoom],
    );

    cal.commitAdd(eveningEvent);
    expect(cal.getEvents()).toHaveLength(0);

    cal.commitAdd({
      ...eveningEvent,
      start: `${DAY}T09:00:00`,
      end: `${DAY}T10:00:00`,
    });
    expect(cal.getEvents()).toHaveLength(1);

    cal.commitUpdate("late", {
      start: `${DAY}T20:00:00`,
      end: `${DAY}T21:00:00`,
    });
    expect(cal.getEvents()[0]!.start).toBe(`${DAY}T09:00:00`);
  });

  test("a cascade that violates availability blocks the whole batch", () => {
    const dependentPair = [
      {
        id: "a",
        title: "A",
        start: `${DAY}T09:00:00`,
        end: `${DAY}T10:00:00`,
        resources: ["r1"],
      },
      {
        id: "b",
        title: "B",
        start: `${DAY}T10:00:00`,
        end: `${DAY}T11:00:00`,
        resources: ["r1"],
        dependsOn: [{ id: "a", type: "FS" as const }],
      },
    ];

    const blocked = createTestCalendar(
      calendarFeatures([resourceAvailabilityFeature, eventDependencyFeature]),
      dependentPair.map((event) => ({ ...event })),
      [morningRoom],
    );
    blocked.commitUpdate("a", { end: `${DAY}T11:30:00` });

    const afterBlock = new Map(blocked.getEvents().map((e) => [e.id, e]));
    expect(afterBlock.get("a")!.end).toBe(`${DAY}T10:00:00`);
    expect(afterBlock.get("b")!.start).toBe(`${DAY}T10:00:00`);

    const allowed = createTestCalendar(
      calendarFeatures([resourceAvailabilityFeature, eventDependencyFeature]),
      dependentPair.map((event) => ({ ...event })),
      [morningRoom],
    );
    allowed.commitUpdate("a", { end: `${DAY}T10:30:00` });

    const afterCommit = new Map(allowed.getEvents().map((e) => [e.id, e]));
    expect(afterCommit.get("a")!.end).toBe(`${DAY}T10:30:00`);
    expect(afterCommit.get("b")!.start).toBe(`${DAY}T10:30:00`);
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

  test("a feature reads a declared peer's api", () => {
    const peerReadingFeature = (): CalendarFeature<
      TestResource,
      TestEvent,
      object,
      PeerReaderApi<TestResource, TestEvent>,
      "peerReader",
      { recurrence: RecurrenceReadApi<TestResource, TestEvent> }
    > => ({
      name: "peerReader",
      requires: ["recurrence"],
      api: (host, _module, peers) => ({
        masterTitleOf: (eventId) => {
          const event = host.getEvent(eventId);
          if (!event) return undefined;
          return peers.recurrence.getMasterEvent(event).title;
        },
      }),
    });

    const cal = createTestCalendar(
      calendarFeatures([eventRecurrenceFeature, peerReadingFeature]),
      [recurringEvent],
    );

    expect(cal.masterTitleOf("rec")).toBe("Recurring");
    expect(() =>
      createTestCalendar(calendarFeatures([peerReadingFeature])),
    ).toThrow(/"peerReader" requires "recurrence"/);
  });

  test("resize blocks on unavailable time only with availability composed", () => {
    const resizeOptions = {
      eventId: "late",
      originalStart: `${DAY}T09:00:00`,
      originalEnd: `${DAY}T10:00:00`,
      edge: "bottom" as const,
      totalDeltaMinutes: 600,
      targetDayDate: DAY,
      originalDayDate: DAY,
    };
    const events = [
      { ...eveningEvent, start: `${DAY}T09:00:00`, end: `${DAY}T10:00:00` },
    ];

    const withAvailability = createTestCalendar(
      calendarFeatures([
        eventRecurrenceFeature,
        resourceAvailabilityFeature,
        eventResizeFeature,
      ]),
      events,
      [morningRoom],
    );
    expect(withAvailability.validateResize(resizeOptions).blocked).toBe(true);

    const withoutAvailability = createTestCalendar(
      calendarFeatures([eventRecurrenceFeature, eventResizeFeature]),
      events,
      [morningRoom],
    );
    expect(withoutAvailability.validateResize(resizeOptions).blocked).toBe(
      false,
    );
  });

  test("resize across days blocks on the target day's unavailability", () => {
    const cal = createTestCalendar(
      calendarFeatures([
        eventRecurrenceFeature,
        resourceAvailabilityFeature,
        eventResizeFeature,
      ]),
      [{ ...eveningEvent, start: `${DAY}T09:00:00`, end: `${DAY}T10:00:00` }],
      [morningRoom],
    );

    const validation = cal.validateResize({
      eventId: "late",
      originalStart: `${DAY}T09:00:00`,
      originalEnd: `${DAY}T10:00:00`,
      edge: "top",
      totalDeltaMinutes: -600,
      targetDayDate: "2025-06-01",
      originalDayDate: DAY,
    });

    expect(validation.blocked).toBe(true);
    expect(validation.error?.reason).toBe("unavailable-time");
    expect(validation.error?.message).toMatch(
      /^Unavailable: Event at 23:00 conflicts with /,
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
