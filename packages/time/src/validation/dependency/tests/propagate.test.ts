import { describe, expect, it } from "vitest";
import {
  propagateToDependents,
  propagateToPredecessors,
  shiftToSatisfyLink,
} from "../propagate";
import type { DependencyGraphEvent } from "../validateDependencies";
import type { DependencyType } from "../shift";

const UTC = "UTC";
const DAY = "2026-03-02";

const at = (time: string): string => `${DAY}T${time}:00`;

const event = (
  id: string,
  start: string,
  end: string,
  dependsOn?: Array<{ id: string; type: DependencyType }>,
): DependencyGraphEvent => ({
  id,
  title: id,
  start: at(start),
  end: at(end),
  dependsOn,
});

describe("propagateToDependents", () => {
  it("pushes a chain of successors past their predecessor", () => {
    const shifts = propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      events: [
        event("a", "09:00", "10:30"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
        event("c", "11:00", "12:00", [{ id: "b", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([
      { id: "b", newStart: at("10:30"), newEnd: at("11:30") },
      { id: "c", newStart: at("11:30"), newEnd: at("12:30") },
    ]);
  });

  it("stops where the chain still has slack", () => {
    const shifts = propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      events: [
        event("a", "09:00", "10:30"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
        event("c", "14:00", "15:00", [{ id: "b", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([
      { id: "b", newStart: at("10:30"), newEnd: at("11:30") },
    ]);
  });

  it("leaves a satisfied constraint alone", () => {
    expect(
      propagateToDependents({
        sourceId: "a",
        timeZone: UTC,
        events: [
          event("a", "09:00", "09:30"),
          event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
        ],
      }),
    ).toEqual([]);
  });

  it("moves every successor of the same predecessor", () => {
    const shifts = propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      events: [
        event("a", "09:00", "10:30"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
        event("c", "10:00", "10:15", [{ id: "a", type: "FS" }]),
      ],
    });

    expect(shifts.map((s) => s.id)).toEqual(["b", "c"]);
  });

  it("honours each link type", () => {
    const shiftFor = (type: DependencyType, start: string, end: string) =>
      propagateToDependents({
        sourceId: "a",
        timeZone: UTC,
        events: [
          event("a", "09:00", "12:00"),
          event("b", start, end, [{ id: "a", type }]),
        ],
      })[0];

    expect(shiftFor("FS", "08:00", "09:00")).toEqual({
      id: "b",
      newStart: at("12:00"),
      newEnd: at("13:00"),
    });
    expect(shiftFor("SS", "08:00", "09:00")).toEqual({
      id: "b",
      newStart: at("09:00"),
      newEnd: at("10:00"),
    });
    expect(shiftFor("FF", "08:00", "09:00")).toEqual({
      id: "b",
      newStart: at("11:00"),
      newEnd: at("12:00"),
    });
    expect(shiftFor("SF", "07:00", "08:00")).toEqual({
      id: "b",
      newStart: at("08:00"),
      newEnd: at("09:00"),
    });
    expect(shiftFor("SF", "08:00", "09:00")).toBeUndefined();
  });

  it("never moves a visited event", () => {
    const visited = new Set(["b"]);
    const shifts = propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      visited,
      events: [
        event("a", "09:00", "10:30"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([]);
  });

  it("claims the events it moves in the visited set", () => {
    const visited = new Set(["a"]);
    propagateToDependents({
      sourceId: "a",
      timeZone: UTC,
      visited,
      events: [
        event("a", "09:00", "10:30"),
        event("b", "10:00", "11:00", [{ id: "a", type: "FS" }]),
      ],
    });

    expect([...visited]).toEqual(["a", "b"]);
  });

  it("returns nothing for an unknown or leaf source", () => {
    const events = [event("a", "09:00", "10:00")];

    expect(
      propagateToDependents({ sourceId: "a", timeZone: UTC, events }),
    ).toEqual([]);
    expect(
      propagateToDependents({ sourceId: "nope", timeZone: UTC, events }),
    ).toEqual([]);
  });
});

describe("shiftToSatisfyLink", () => {
  it("moves the successor just past the predecessor", () => {
    expect(
      shiftToSatisfyLink({
        type: "FS",
        predecessor: { start: at("09:00"), end: at("12:00") },
        successor: { start: at("10:00"), end: at("11:00") },
        timeZone: UTC,
      }),
    ).toEqual({ start: at("12:00"), end: at("13:00") });
  });

  it("returns null when the link already holds", () => {
    expect(
      shiftToSatisfyLink({
        type: "FS",
        predecessor: { start: at("09:00"), end: at("10:00") },
        successor: { start: at("10:00"), end: at("11:00") },
        timeZone: UTC,
      }),
    ).toBeNull();
  });

  it("uses the link type to pick the edges it compares", () => {
    expect(
      shiftToSatisfyLink({
        type: "SS",
        predecessor: { start: at("11:00"), end: at("12:00") },
        successor: { start: at("10:00"), end: at("10:30") },
        timeZone: UTC,
      }),
    ).toEqual({ start: at("11:00"), end: at("11:30") });
  });
});

describe("propagateToPredecessors", () => {
  it("pulls a predecessor back when the successor moves earlier", () => {
    const shifts = propagateToPredecessors({
      sourceId: "s",
      timeZone: UTC,
      events: [
        event("p", "09:00", "10:00"),
        event("s", "09:00", "10:00", [{ id: "p", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([
      { id: "p", newStart: at("08:00"), newEnd: at("09:00") },
    ]);
  });

  it("keeps pulling up the chain", () => {
    const shifts = propagateToPredecessors({
      sourceId: "s",
      timeZone: UTC,
      events: [
        event("q", "08:00", "09:00"),
        event("p", "09:00", "10:00", [{ id: "q", type: "FS" }]),
        event("s", "09:00", "10:00", [{ id: "p", type: "FS" }]),
      ],
    });

    expect(shifts).toEqual([
      { id: "p", newStart: at("08:00"), newEnd: at("09:00") },
      { id: "q", newStart: at("07:00"), newEnd: at("08:00") },
    ]);
  });

  it("leaves a predecessor that already fits", () => {
    expect(
      propagateToPredecessors({
        sourceId: "s",
        timeZone: UTC,
        events: [
          event("p", "08:00", "09:00"),
          event("s", "10:00", "11:00", [{ id: "p", type: "FS" }]),
        ],
      }),
    ).toEqual([]);
  });

  it("never moves a visited predecessor", () => {
    expect(
      propagateToPredecessors({
        sourceId: "s",
        timeZone: UTC,
        visited: new Set(["p"]),
        events: [
          event("p", "09:00", "10:00"),
          event("s", "09:00", "10:00", [{ id: "p", type: "FS" }]),
        ],
      }),
    ).toEqual([]);
  });

  it("ignores links to events outside the graph", () => {
    expect(
      propagateToPredecessors({
        sourceId: "s",
        timeZone: UTC,
        events: [event("s", "09:00", "10:00", [{ id: "gone", type: "FS" }])],
      }),
    ).toEqual([]);
  });
});
