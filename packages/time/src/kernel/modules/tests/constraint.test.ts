import { describe, expect, it } from "vitest";
import { Kernel } from "../../index";
import type { KernelEvent } from "../../index";
import { constraintModule, dependencyModule } from "../index";
import type { DependencyLink } from "~/validation/dependency";
import type { SchedulingConstraint } from "~/validation/constraints";

interface CalEvent extends KernelEvent {
  title: string;
  dependsOn?: Array<DependencyLink>;
  constraint?: SchedulingConstraint;
}

const seed = (constraint?: SchedulingConstraint) => {
  const kernel = new Kernel<CalEvent>().use(constraintModule<CalEvent>());
  kernel.write({
    kind: "add",
    event: {
      id: "a",
      title: "A",
      start: "2026-01-05T09:00:00",
      end: "2026-01-05T10:00:00",
      constraint,
    },
  });
  return kernel;
};

describe("constraintModule", () => {
  it("rejects an add that already violates its constraint", () => {
    const kernel = new Kernel<CalEvent>().use(constraintModule<CalEvent>());

    const result = kernel.write({
      kind: "add",
      event: {
        id: "a",
        title: "A",
        start: "2026-01-05T09:00:00",
        end: "2026-01-05T10:00:00",
        constraint: { type: "start-no-earlier-than", date: "2026-01-06" },
      },
    });

    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") return;
    expect(result.conflicts[0]).toMatchObject({
      code: "constraint/start-no-earlier-than",
      eventIds: ["a"],
    });
    expect(kernel.getEvent("a")).toBeUndefined();
  });

  it("rejects a move that breaks the constraint", () => {
    const kernel = seed({ type: "start-no-later-than", date: "2026-01-05" });

    const result = kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: "2026-01-06T09:00:00",
        end: "2026-01-06T10:00:00",
      },
    });

    expect(result.status).toBe("rejected");
    expect(kernel.getEvent("a")!.start).toBe("2026-01-05T09:00:00");
  });

  it("commits a move the constraint still allows", () => {
    const kernel = seed({ type: "start-no-later-than", date: "2026-01-05" });

    const result = kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: "2026-01-05T14:00:00",
        end: "2026-01-05T15:00:00",
      },
    });

    expect(result.status).toBe("committed");
    expect(kernel.getEvent("a")!.start).toBe("2026-01-05T14:00:00");
  });

  it("ignores an event that carries no constraint", () => {
    const kernel = seed();

    expect(
      kernel.write({
        kind: "update",
        id: "a",
        before: kernel.getEvent("a")!,
        after: {
          ...kernel.getEvent("a")!,
          start: "2027-01-05T09:00:00",
          end: "2027-01-05T10:00:00",
        },
      }).status,
    ).toBe("committed");
  });

  it("rejects a move whose cascade pushes a dependent past its constraint", () => {
    const kernel = new Kernel<CalEvent>().use(
      dependencyModule<CalEvent>({ timeZone: "UTC" }),
      constraintModule<CalEvent>(),
    );
    kernel.write({
      kind: "add",
      event: {
        id: "a",
        title: "A",
        start: "2026-01-05T09:00:00",
        end: "2026-01-05T10:00:00",
      },
    });
    kernel.write({
      kind: "add",
      event: {
        id: "b",
        title: "B",
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
        dependsOn: [{ id: "a", type: "FS" }],
        constraint: {
          type: "finish-no-later-than",
          date: "2026-01-05T12:00:00",
        },
      },
    });

    const result = kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: "2026-01-05T14:00:00",
        end: "2026-01-05T15:00:00",
      },
    });

    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") return;
    expect(result.conflicts[0]).toMatchObject({
      code: "constraint/finish-no-later-than",
      eventIds: ["b"],
    });
    expect(kernel.getEvent("b")!.start).toBe("2026-01-05T10:00:00");
  });
});
