import { describe, expect, it } from "vitest";
import { Kernel } from "../../index";
import { LAYOUT_FIELD, layoutModule } from "../layout";
import type { LaidOutEvent, LayoutModuleOptions } from "../layout";
import type { EventLayout } from "~/projection";
import type { KernelEvent } from "../../types";

interface TestEvent extends KernelEvent {
  title: string;
}

const UTC = "UTC";

const evt = (id: string, start: string, end: string): TestEvent => ({
  id,
  start,
  end,
  title: id,
});

const viewport = {
  start: "2025-06-03T00:00:00",
  end: "2025-06-05T23:59:59",
};

const layoutOf = (event: TestEvent): EventLayout =>
  (event as LaidOutEvent<TestEvent>)[LAYOUT_FIELD];

describe("layoutModule", () => {
  it("attaches logical layout to every projected event", () => {
    const options: LayoutModuleOptions = { timeZone: UTC };
    const kernel = new Kernel<TestEvent>({
      events: [evt("a", "2025-06-03T06:00:00", "2025-06-03T12:00:00")],
    }).use(layoutModule<TestEvent>(options));

    const [projected] = kernel.project(viewport);

    expect(layoutOf(projected!)).toMatchObject({
      id: "a",
      startFraction: 0.25,
      endFraction: 0.5,
      durationFraction: 0.25,
      concurrency: 1,
      overlapping: [],
      column: 0,
      columnCount: 1,
      crossStart: 0,
      crossSize: 1,
    });
  });

  it("columns overlapping events within the same day only", () => {
    const kernel = new Kernel<TestEvent>({
      events: [
        evt("mon-a", "2025-06-03T09:00:00", "2025-06-03T11:00:00"),
        evt("mon-b", "2025-06-03T10:00:00", "2025-06-03T12:00:00"),
        evt("wed", "2025-06-05T10:00:00", "2025-06-05T12:00:00"),
      ],
    }).use(layoutModule<TestEvent>({ timeZone: UTC }));

    const projected = kernel.project(viewport);
    const layouts = new Map(projected.map((e) => [e.id, layoutOf(e)]));

    expect(layouts.get("mon-a")).toMatchObject({ column: 0, columnCount: 2 });
    expect(layouts.get("mon-b")).toMatchObject({ column: 1, columnCount: 2 });
    expect(layouts.get("wed")).toMatchObject({ column: 0, columnCount: 1 });
  });

  it("splits a multi-day event and lays out each segment against its own day", () => {
    const kernel = new Kernel<TestEvent>({
      events: [
        evt("span", "2025-06-03T22:00:00", "2025-06-04T02:00:00"),
        evt("tue", "2025-06-04T01:00:00", "2025-06-04T03:00:00"),
      ],
    }).use(layoutModule<TestEvent>({ timeZone: UTC }));

    const projected = kernel.project(viewport);
    const segments = projected.filter((e) => e.id === "span");

    expect(segments).toHaveLength(2);
    expect(layoutOf(segments[0]!).columnCount).toBe(1);
    expect(layoutOf(segments[0]!).endFraction).toBeCloseTo(1, 4);
    expect(layoutOf(segments[1]!)).toMatchObject({ columnCount: 2 });
  });

  it("lays out all-day and timed events on separate tracks", () => {
    const kernel = new Kernel<TestEvent>({
      events: [
        { ...evt("holiday", "2025-06-03T00:00:00", "2025-06-03T23:59:59"), allDay: true },
        evt("meeting", "2025-06-03T11:00:00", "2025-06-03T12:00:00"),
        evt("interview", "2025-06-03T11:30:00", "2025-06-03T13:00:00"),
      ],
    }).use(layoutModule<TestEvent>({ timeZone: UTC }));

    const layouts = new Map(
      kernel.project(viewport).map((e) => [e.id, layoutOf(e)]),
    );

    expect(layouts.get("holiday")).toMatchObject({
      concurrency: 1,
      columnCount: 1,
      crossSize: 1,
    });
    expect(layouts.get("meeting")).toMatchObject({
      concurrency: 2,
      column: 0,
      columnCount: 2,
    });
    expect(layouts.get("interview")).toMatchObject({
      concurrency: 2,
      column: 1,
      columnCount: 2,
    });
  });

  it("skips splitting when splitMultiDayEvents is false", () => {
    const kernel = new Kernel<TestEvent>({
      events: [evt("span", "2025-06-03T22:00:00", "2025-06-04T02:00:00")],
    }).use(
      layoutModule<TestEvent>({ timeZone: UTC, splitMultiDayEvents: false }),
    );

    expect(kernel.project(viewport)).toHaveLength(1);
  });
});
