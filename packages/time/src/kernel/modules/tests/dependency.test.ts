import { describe, expect, it } from "vitest";
import { Kernel } from "../../index";
import type { KernelEvent } from "../../index";
import { dependencyModule } from "../index";
import type { DependencyModuleOptions } from "../index";
import type { DependencyLink } from "~/validation/dependency";

interface CalEvent extends KernelEvent {
  title: string;
  dependsOn?: Array<DependencyLink>;
}

const options: DependencyModuleOptions = { timeZone: "UTC" };

const seed = () => {
  const kernel = new Kernel<CalEvent>().use(dependencyModule<CalEvent>(options));
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
    },
  });
  return kernel;
};

describe("dependencyModule", () => {
  it("cascades a dependent forward when the predecessor moves", () => {
    const kernel = seed();

    const result = kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: "2026-01-05T10:00:00",
        end: "2026-01-05T11:00:00",
      },
    });

    expect(result.status).toBe("committed");
    const b = kernel.getEvent("b")!;
    expect(b.start).toBe("2026-01-05T11:00:00");
    expect(b.end).toBe("2026-01-05T12:00:00");
  });

  it("leaves dependents untouched when no constraint is violated", () => {
    const kernel = seed();

    kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: "2026-01-05T08:00:00",
        end: "2026-01-05T09:00:00",
      },
    });

    const b = kernel.getEvent("b")!;
    expect(b.start).toBe("2026-01-05T10:00:00");
  });
});
