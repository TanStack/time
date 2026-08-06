import { describe, expect, test, vi } from "vitest";
import { CalendarCore } from "../calendar";
import { allCalendarFeatures } from "../features";
import type { AllCalendarFeatures } from "../features";
import { ResizeController } from "../resizeController";
import type { CalendarHost } from "../features";
import type { Event, Resource, ValidateResizeOptions } from "../types";

type TestResource = Resource;
type TestEvent = Event<TestResource>;

const DAY = "2025-06-02";
const START = `${DAY}T09:00:00`;
const END = `${DAY}T10:00:00`;

function dayColumn(left: number, right: number): HTMLElement {
  const element = document.createElement("div");
  element.getBoundingClientRect = () =>
    ({
      left,
      right,
      top: 0,
      bottom: 0,
      width: right - left,
      height: 0,
    }) as DOMRect;
  return element;
}

function createHost(
  overrides: Partial<CalendarHost<TestResource, TestEvent>> = {},
  daysInView = 1,
) {
  const validated: Array<ValidateResizeOptions> = [];
  const host = {
    getEvent: () => undefined,
    getEvents: () => [],
    getState: () => ({
      currentPeriod: DAY,
      activeDate: DAY,
      viewMode: { value: 1, unit: "week" as const },
      eventsVersion: 0,
      isPending: false,
    }),
    getOptions: () => ({ timeZone: "UTC", resources: null }),
    getEventMap: () => new Map(),
    getDaysWithEvents: () =>
      Array.from({ length: daysInView }, (_, index) => ({
        isoDate: `2025-06-0${index + 2}`,
        events: [],
        allDayEvents: [],
        isToday: false,
        isInCurrentPeriod: true,
      })),
    goToSpecificPeriod: () => {},
    write: () => [],
    fetchEventsForRange: async () => {},
    editEvent: async () => ({ success: true as const }),
    removeEvent: () => {},
    editRecurringEvent: async () => ({ success: true as const }),
    commitUpdate: vi.fn(),
    validateMove: () => ({ blocked: false }),
    validateEventDependencies: () => ({ valid: true }),
    validateResize: (options: ValidateResizeOptions) => {
      validated.push(options);
      const durationMinutes = 60 + options.totalDeltaMinutes;
      return {
        blocked: false,
        result: {
          start: options.originalStart,
          end: `${DAY}T${String(9 + durationMinutes / 60).padStart(2, "0")}:00:00`,
          durationMinutes,
        },
        targetDayDate: options.targetDayDate,
      };
    },
    validateEventPlacement: () => ({ blocked: false }),
    ...overrides,
  } as CalendarHost<TestResource, TestEvent> & {
    commitUpdate: ReturnType<typeof vi.fn>;
  };

  return { host, validated };
}

async function drag(
  controller: ResizeController<TestResource, TestEvent>,
  clientY: number,
) {
  controller.handleMouseMove({ clientX: 5, clientY } as MouseEvent);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}

function startResize(
  controller: ResizeController<TestResource, TestEvent>,
  args: { occurrenceStart?: string; recurrenceScope?: "this" | "all" } = {},
) {
  controller.registerDayColumn(DAY, dayColumn(0, 100));
  return controller.start({
    eventId: "e1",
    edge: "bottom",
    originalStart: START,
    originalEnd: END,
    clientX: 5,
    clientY: 0,
    ...args,
  });
}

describe("ResizeController against the calendar host", () => {
  test("asks the host to validate every processed move", async () => {
    const { host, validated } = createHost();
    const controller = new ResizeController(host, { containerHeight: 1440 });

    expect(startResize(controller)).toBe(true);
    await drag(controller, 60);

    expect(validated).toHaveLength(1);
    expect(validated[0]!.eventId).toBe("e1");
    expect(validated[0]!.totalDeltaMinutes).toBe(60);
    expect(controller.getSnapshot().previewEnd).toBe(`${DAY}T11:00:00`);
  });

  test("keeps the last valid preview and reports the blocking error", async () => {
    const onResizeError = vi.fn();
    const { host } = createHost({
      validateResize: (options) => ({
        blocked: true,
        error: { reason: "unavailable-time", message: "nope", conflicts: [] },
        result: {
          start: options.originalStart,
          end: options.originalEnd,
          durationMinutes: 60,
        },
        targetDayDate: options.targetDayDate,
      }),
    });
    const controller = new ResizeController(host, {
      containerHeight: 1440,
      onResizeError,
    });

    startResize(controller);
    await drag(controller, 60);

    const state = controller.getSnapshot();
    expect(state.blocked).toBe(true);
    expect(state.previewEnd).toBe(END);
    expect(onResizeError).toHaveBeenCalledTimes(1);
    expect(onResizeError.mock.calls[0]![0].message).toBe("nope");
  });

  test("scales a horizontal drag by the host's day count", async () => {
    const oneDay = createHost({}, 1);
    const sevenDays = createHost({}, 7);
    const options = {
      containerWidth: 700,
      orientation: "horizontal" as const,
    };

    const narrow = new ResizeController(oneDay.host, options);
    startResize(narrow);
    await drag(narrow, 0);
    narrow.handleMouseMove({ clientX: 705, clientY: 0 } as MouseEvent);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const wide = new ResizeController(sevenDays.host, options);
    startResize(wide);
    await drag(wide, 0);
    wide.handleMouseMove({ clientX: 705, clientY: 0 } as MouseEvent);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(oneDay.validated.at(-1)!.totalDeltaMinutes).toBe(1440);
    expect(sevenDays.validated.at(-1)!.totalDeltaMinutes).toBe(10080);
  });

  test("commits a plain resize through the host", async () => {
    const { host } = createHost();
    const onResizeEnd = vi.fn();
    const controller = new ResizeController(host, {
      containerHeight: 1440,
      onResizeEnd,
    });

    startResize(controller);
    await drag(controller, 60);
    controller.handleMouseUp();

    expect(host.commitUpdate).toHaveBeenCalledWith("e1", {
      start: START,
      end: `${DAY}T11:00:00`,
    });
    expect(onResizeEnd).toHaveBeenCalledWith("e1", START, `${DAY}T11:00:00`);
    expect(controller.getSnapshot().isResizing).toBe(false);
  });

  test("commits a scoped occurrence resize through editRecurringEvent", async () => {
    const editRecurringEvent = vi.fn(async () => ({ success: true as const }));
    const { host } = createHost({ editRecurringEvent });
    const controller = new ResizeController(host, { containerHeight: 1440 });

    startResize(controller, {
      occurrenceStart: START,
      recurrenceScope: "this",
    });
    await drag(controller, 60);
    controller.handleMouseUp();

    expect(host.commitUpdate).not.toHaveBeenCalled();
    expect(editRecurringEvent).toHaveBeenCalledWith(
      "e1",
      { start: START, end: `${DAY}T11:00:00` },
      { scope: "this", occurrenceStart: START },
    );
  });
});

describe("eventResizeFeature api", () => {
  function createCalendar(events: Array<TestEvent>) {
    return new CalendarCore<AllCalendarFeatures, TestResource, TestEvent>({
      viewMode: { value: 1, unit: "week" },
      timeZone: "UTC",
      features: allCalendarFeatures,
      events,
    });
  }

  test("createResizeController hands the controller a working host", async () => {
    const cal = createCalendar([
      { id: "e1", title: "E", start: START, end: END },
    ]);
    const controller = cal.createResizeController({ containerHeight: 1440 });

    controller.registerDayColumn(DAY, dayColumn(0, 100));
    controller.start({
      eventId: "e1",
      edge: "bottom",
      originalStart: START,
      originalEnd: END,
      clientX: 5,
      clientY: 0,
    });
    await drag(controller, 60);
    controller.handleMouseUp();

    expect(cal.getEvents()[0]!.end).toBe(`${DAY}T11:00:00`);
  });

  test("getEventSegmentInfo reports the original bounds of a split event", () => {
    const cal = createCalendar([]);

    const plain = cal.getEventSegmentInfo({
      id: "e1",
      title: "E",
      start: START,
      end: END,
    });
    expect(plain.isSplitEvent).toBe(false);

    const segment = cal.getEventSegmentInfo({
      id: "e2",
      title: "E",
      start: `${DAY}T00:00:00`,
      end: `${DAY}T10:00:00`,
      _originalStart: "2025-06-01T22:00:00",
      _originalEnd: END,
    } as TestEvent);
    expect(segment.isSplitEvent).toBe(true);
    expect(segment.isFirstSegment).toBe(false);
    expect(segment.originalStart).toBe("2025-06-01T22:00:00");
  });
});
