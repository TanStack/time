import { describe, expect, it } from "vitest";
import {
  layoutDaySegments,
  toLayoutStyle,
  type EventLayout,
  type LayoutInputEvent,
  type LayoutOrientation,
  type LayoutStyle,
} from "../layout";

const seg = (id: string, start: string, end: string): LayoutInputEvent => ({
  id,
  start: `2025-06-03T${start}:00`,
  end: `2025-06-03T${end}:00`,
});

const byId = (layouts: Array<EventLayout>) =>
  new Map(layouts.map((l) => [l.id, l]));

describe("layoutDaySegments", () => {
  it("returns fractions of the day for a single event", () => {
    const [layout] = layoutDaySegments([seg("a", "06:00", "12:00")]);

    expect(layout).toEqual({
      id: "a",
      startFraction: 0.25,
      endFraction: 0.5,
      durationFraction: 0.25,
      column: 0,
      columnCount: 1,
    });
  });

  it("preserves input order", () => {
    const layouts = layoutDaySegments([
      seg("late", "15:00", "16:00"),
      seg("early", "09:00", "10:00"),
    ]);

    expect(layouts.map((l) => l.id)).toEqual(["late", "early"]);
  });

  it("keeps non-overlapping events in one column", () => {
    const layouts = layoutDaySegments([
      seg("a", "09:00", "10:00"),
      seg("b", "10:00", "11:00"),
    ]);

    expect(layouts.map((l) => [l.column, l.columnCount])).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });

  it("splits two overlapping events into two columns", () => {
    const layouts = byId(
      layoutDaySegments([seg("a", "09:00", "11:00"), seg("b", "10:00", "12:00")]),
    );

    expect(layouts.get("a")).toMatchObject({ column: 0, columnCount: 2 });
    expect(layouts.get("b")).toMatchObject({ column: 1, columnCount: 2 });
  });

  it("colors a chained overlap by cluster, not by pairwise count", () => {
    const layouts = byId(
      layoutDaySegments([
        seg("a", "09:00", "10:30"),
        seg("b", "10:00", "11:30"),
        seg("c", "11:00", "12:30"),
      ]),
    );

    expect(layouts.get("a")).toMatchObject({ column: 0, columnCount: 2 });
    expect(layouts.get("b")).toMatchObject({ column: 1, columnCount: 2 });
    expect(layouts.get("c")).toMatchObject({ column: 0, columnCount: 2 });
  });

  it("reuses a freed column when an event ends", () => {
    const layouts = byId(
      layoutDaySegments([
        seg("long", "09:00", "17:00"),
        seg("first", "09:00", "10:00"),
        seg("second", "10:00", "11:00"),
      ]),
    );

    expect(layouts.get("long")).toMatchObject({ column: 0, columnCount: 2 });
    expect(layouts.get("first")).toMatchObject({ column: 1, columnCount: 2 });
    expect(layouts.get("second")).toMatchObject({ column: 1, columnCount: 2 });
  });

  it("scopes columnCount to the cluster, so a lone event stays full width", () => {
    const layouts = byId(
      layoutDaySegments([
        seg("x", "09:00", "10:00"),
        seg("y", "09:30", "10:30"),
        seg("alone", "15:00", "16:00"),
      ]),
    );

    expect(layouts.get("x")?.columnCount).toBe(2);
    expect(layouts.get("y")?.columnCount).toBe(2);
    expect(layouts.get("alone")).toMatchObject({ column: 0, columnCount: 1 });
  });

  it("treats a segment ending at midnight as the end of the day", () => {
    const [layout] = layoutDaySegments([
      { id: "a", start: "2025-06-03T22:00:00", end: "2025-06-04T00:00:00" },
    ]);

    expect(layout?.startFraction).toBeCloseTo(22 / 24);
    expect(layout?.endFraction).toBe(1);
  });

  it("returns nothing for an empty day", () => {
    expect(layoutDaySegments([])).toEqual([]);
  });
});

describe("toLayoutStyle", () => {
  it("maps the time axis to top/height when vertical", () => {
    const style: LayoutStyle = toLayoutStyle({
      id: "a",
      startFraction: 0.25,
      endFraction: 0.5,
      durationFraction: 0.25,
      column: 0,
      columnCount: 2,
    });

    expect(style).toEqual({
      top: "25%",
      height: "25%",
      left: "0%",
      width: "50%",
    });
  });

  it("maps the time axis to left/width when horizontal", () => {
    const orientation: LayoutOrientation = "horizontal";
    const style = toLayoutStyle(
      {
        id: "a",
        startFraction: 0.25,
        endFraction: 0.5,
        durationFraction: 0.25,
        column: 1,
        columnCount: 2,
      },
      orientation,
    );

    expect(style).toEqual({
      left: "25%",
      width: "25%",
      top: "50%",
      height: "50%",
    });
  });
});
