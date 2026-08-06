import { describe, expectTypeOf, test } from "vitest";
import { CalendarCore } from "../calendar";
import {
  calendarFeatures,
  dayEventLayoutFeature,
  eventRecurrenceFeature,
  historyFeature,
} from "../features";
import type { CalendarApi } from "../calendar";
import type { Event, EventProps, Resource } from "../types";

type TestEvent = Event<Resource>;

describe("CalendarApi is the intersection of what was composed", () => {
  test("a composed feature contributes its methods", () => {
    const features = calendarFeatures([historyFeature, dayEventLayoutFeature]);
    type Api = CalendarApi<typeof features, Resource, TestEvent>;

    expectTypeOf<Api>().toHaveProperty("undo");
    expectTypeOf<Api>().toHaveProperty("canUndo");
    expectTypeOf<Api["getEventProps"]>().returns.toEqualTypeOf<
      EventProps<Resource, TestEvent>
    >();
  });

  test("an uncomposed feature contributes nothing", () => {
    const features = calendarFeatures([dayEventLayoutFeature]);
    type Api = CalendarApi<typeof features, Resource, TestEvent>;

    expectTypeOf<Api>().not.toHaveProperty("undo");
    expectTypeOf<Api>().not.toHaveProperty("canUndo");
    expectTypeOf<Api>().not.toHaveProperty("editRecurringEvent");
    expectTypeOf<Api>().not.toHaveProperty("getTimelineLayout");
  });

  test("core methods survive an empty feature list", () => {
    type Api = CalendarApi<[], Resource, TestEvent>;

    expectTypeOf<Api>().toHaveProperty("getEvents");
    expectTypeOf<Api>().toHaveProperty("editEvent");
    expectTypeOf<Api>().toHaveProperty("goToNextPeriod");
  });

  test("recurrence takes the consumer's event type, not the kernel's", () => {
    interface CustomEvent extends Event<Resource> {
      colour: string;
    }
    const features = calendarFeatures([eventRecurrenceFeature]);
    const cal = new CalendarCore<typeof features, Resource, CustomEvent>({
      viewMode: { value: 1, unit: "week" },
      timeZone: "UTC",
      features,
    });

    expectTypeOf(cal.getMasterEvent).parameter(0).toEqualTypeOf<CustomEvent>();
  });
});
