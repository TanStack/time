import { describe, expect, it } from "vitest";
import { currentTimeFraction, layoutTimelineRange } from "../timelineLayout";
import type {
  TimelineRangeInput,
  TimelineRangeLayout,
  TimelineSpanEvent,
  TimelineSpanLayout,
} from "../timelineLayout";

const FIRST_DAY = "2025-06-02";

const span = (id: string, start: string, end: string): TimelineSpanEvent => ({
  id,
  start,
  end,
});

const layout = (
  events: Array<TimelineSpanEvent>,
  totalDays = 5,
): TimelineRangeLayout =>
  layoutTimelineRange({ events, firstDay: FIRST_DAY, totalDays });

describe("layoutTimelineRange", () => {
  it("positions an event as a fraction of the whole visible range", () => {
    const input: TimelineRangeInput<TimelineSpanEvent> = {
      events: [span("a", "2025-06-03T12:00:00", "2025-06-03T18:00:00")],
      firstDay: FIRST_DAY,
      totalDays: 5,
    };

    const [item] = layoutTimelineRange(input).items;

    expect(item).toEqual<TimelineSpanLayout>({
      index: 0,
      id: "a",
      startFraction: 36 / 120,
      endFraction: 42 / 120,
      durationFraction: 42 / 120 - 36 / 120,
      lane: 0,
      isStartClipped: false,
      isEndClipped: false,
    });
  });

  it("keeps non-overlapping events on one lane", () => {
    const { items, laneCount } = layout([
      span("a", "2025-06-02T09:00:00", "2025-06-02T10:00:00"),
      span("b", "2025-06-02T11:00:00", "2025-06-02T12:00:00"),
    ]);

    expect(items.map((i) => i.lane)).toEqual([0, 0]);
    expect(laneCount).toBe(1);
  });

  it("pushes overlapping events onto separate lanes", () => {
    const { items, laneCount } = layout([
      span("a", "2025-06-02T09:00:00", "2025-06-02T11:00:00"),
      span("b", "2025-06-02T10:00:00", "2025-06-02T12:00:00"),
    ]);

    expect(items.map((i) => i.lane)).toEqual([0, 1]);
    expect(laneCount).toBe(2);
  });

  it("does not reuse a lane when an out-of-order event overlaps an earlier placement", () => {
    const { items, laneCount } = layout([
      span("late", "2025-06-02T14:00:00", "2025-06-02T16:00:00"),
      span("early", "2025-06-02T09:00:00", "2025-06-02T11:00:00"),
      span("straddle", "2025-06-02T10:00:00", "2025-06-02T15:00:00"),
    ]);

    expect(items.map((i) => [i.id, i.lane])).toEqual([
      ["late", 0],
      ["early", 0],
      ["straddle", 1],
    ]);
    expect(laneCount).toBe(2);
  });

  it("clips at the range edges and flags which edge was clipped", () => {
    const { items } = layout([
      span("before", "2025-06-01T20:00:00", "2025-06-02T04:00:00"),
      span("after", "2025-06-06T20:00:00", "2025-06-07T04:00:00"),
    ]);

    expect(items[0]).toMatchObject({
      id: "before",
      startFraction: 0,
      isStartClipped: true,
      isEndClipped: false,
    });
    expect(items[1]).toMatchObject({
      id: "after",
      endFraction: 1,
      isStartClipped: false,
      isEndClipped: true,
    });
  });

  it("drops events with no visible width and keeps original indices", () => {
    const { items } = layout([
      span("outside", "2025-01-01T09:00:00", "2025-01-01T10:00:00"),
      span("inside", "2025-06-03T09:00:00", "2025-06-03T10:00:00"),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "inside", index: 1 });
  });

  it("reports at least one lane for an empty row", () => {
    expect(layout([])).toEqual({ items: [], laneCount: 1 });
  });
});

describe("currentTimeFraction", () => {
  it("returns the fraction of the range for a visible day", () => {
    expect(
      currentTimeFraction({
        isoDates: ["2025-06-02", "2025-06-03"],
        now: { isoDate: "2025-06-03", hour: 12, minute: 0 },
      }),
    ).toBe(36 / 48);
  });

  it("returns null when the day is not visible", () => {
    expect(
      currentTimeFraction({
        isoDates: ["2025-06-02", "2025-06-03"],
        now: { isoDate: "2025-07-01", hour: 12, minute: 0 },
      }),
    ).toBeNull();
  });
});
