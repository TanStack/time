import { describe, expect, it } from "vitest";
import { hasDependencyPath } from "../graph";
import type { DependencyGraphEvent } from "../validateDependencies";

const event = (
  id: string,
  dependsOn?: Array<string>,
): DependencyGraphEvent => ({
  id,
  title: id,
  start: "2026-03-02T09:00:00",
  end: "2026-03-02T10:00:00",
  dependsOn: dependsOn?.map((dep) => ({ id: dep, type: "FS" })),
});

const chain = [event("a"), event("b", ["a"]), event("c", ["b"])];

describe("hasDependencyPath", () => {
  it("finds a direct link", () => {
    expect(hasDependencyPath(chain, "b", "a")).toBe(true);
  });

  it("finds an indirect link", () => {
    expect(hasDependencyPath(chain, "c", "a")).toBe(true);
  });

  it("does not invent the reverse direction", () => {
    expect(hasDependencyPath(chain, "a", "c")).toBe(false);
  });

  it("treats an event as reaching itself", () => {
    expect(hasDependencyPath(chain, "a", "a")).toBe(true);
  });

  it("terminates on a cycle already in the data", () => {
    const cyclic = [event("a", ["b"]), event("b", ["a"])];

    expect(hasDependencyPath(cyclic, "a", "c")).toBe(false);
  });

  it("ignores links to events outside the graph", () => {
    expect(hasDependencyPath([event("a", ["gone"])], "a", "b")).toBe(false);
  });
});
