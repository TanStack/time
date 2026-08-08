import { describe, expect, it } from "vitest";
import { findAnchoredViolations } from "../anchors";
import { computeCascade } from "../computeCascade";
import { propagateToDependents, propagateToPredecessors } from "../propagate";
import type { DependencyGraphEvent } from "../validateDependencies";
import type { DependencyType } from "../shift";

const UTC = "UTC";
const DAY = "2026-03-02";

const at = (time: string): string => `${DAY}T${time}:00`;

const event = (
  id: string,
  start: string,
  end: string,
  dependsOn?: Array<{ id: string; type: DependencyType; lag?: number }>,
  manuallyScheduled?: boolean,
): DependencyGraphEvent => ({
  id,
  title: id,
  start: at(start),
  end: at(end),
  dependsOn,
  manuallyScheduled,
});

describe("manually scheduled anchors", () => {
  it("keeps a dependent in place instead of pushing it forward", () => {
    const shifts = propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      events: [
        event("a", "09:00", "11:00"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }], true),
      ],
    });

    expect(shifts).toEqual([]);
  });

  it("does not push the successors of an anchor", () => {
    const shifts = propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      events: [
        event("a", "09:00", "11:00"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }], true),
        event("c", "11:00", "12:00", [{ id: "b", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([]);
  });

  it("keeps a predecessor in place instead of pulling it back", () => {
    const shifts = propagateToPredecessors({
      sourceId: "b",
      timeZone: UTC,
      events: [
        event("a", "09:00", "10:00", undefined, true),
        event("b", "09:00", "10:00", [{ id: "a", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([]);
  });

  it("stops a cascade at the anchor", () => {
    const shifts = computeCascade({
      sourceId: "a",
      deltaMs: 60 * 60 * 1000,
      timeZone: UTC,
      events: [
        event("a", "09:00", "10:00"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }], true),
        event("c", "11:00", "12:00", [{ id: "b", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([]);
  });

  it("still cascades through events that are not anchored", () => {
    const shifts = computeCascade({
      sourceId: "a",
      deltaMs: 60 * 60 * 1000,
      timeZone: UTC,
      events: [
        event("a", "09:00", "10:00"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([
      { id: "b", newStart: at("11:00"), newEnd: at("12:00") },
    ]);
  });
});

describe("findAnchoredViolations", () => {
  it("reports a link an anchored successor cannot satisfy", () => {
    const [conflict] = findAnchoredViolations({
      timeZone: UTC,
      changedIds: ["a"],
      events: [
        event("a", "09:00", "11:00"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }], true),
      ],
    });

    expect(conflict).toMatchObject({
      eventId: "b",
      predecessorId: "a",
      anchorId: "b",
      type: "FS",
      message:
        '"b" cannot start before "a" ends (FS) — "b" is manually scheduled',
    });
  });

  it("reports a link an anchored predecessor cannot satisfy", () => {
    const [conflict] = findAnchoredViolations({
      timeZone: UTC,
      changedIds: ["b"],
      events: [
        event("a", "09:00", "10:00", undefined, true),
        event("b", "09:00", "10:00", [{ id: "a", type: "FS" }]),
      ],
    });

    expect(conflict?.anchorId).toBe("a");
  });

  it("names the lag in the message", () => {
    const [conflict] = findAnchoredViolations({
      timeZone: UTC,
      changedIds: ["a"],
      events: [
        event("a", "09:00", "10:00"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS", lag: 30 }], true),
      ],
    });

    expect(conflict?.message).toBe(
      '"b" cannot start before "a" ends +30m (FS) — "b" is manually scheduled',
    );
  });

  it("stays silent when the anchor's link is satisfied", () => {
    expect(
      findAnchoredViolations({
        timeZone: UTC,
        changedIds: ["a"],
        events: [
          event("a", "09:00", "09:30"),
          event("b", "10:00", "11:00", [{ id: "a", type: "FS" }], true),
        ],
      }),
    ).toEqual([]);
  });

  it("stays silent when neither endpoint changed", () => {
    expect(
      findAnchoredViolations({
        timeZone: UTC,
        changedIds: ["c"],
        events: [
          event("a", "09:00", "11:00"),
          event("b", "10:00", "11:00", [{ id: "a", type: "FS" }], true),
          event("c", "14:00", "15:00"),
        ],
      }),
    ).toEqual([]);
  });

  it("stays silent when no endpoint is an anchor", () => {
    expect(
      findAnchoredViolations({
        timeZone: UTC,
        changedIds: ["a"],
        events: [
          event("a", "09:00", "11:00"),
          event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
        ],
      }),
    ).toEqual([]);
  });
});
