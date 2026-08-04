import { describe, expect, it } from "vitest";
import { Kernel } from "../index";
import type { Conflict, KernelEvent, KernelOptions, Module } from "../index";

interface TestEvent extends KernelEvent {
  title: string;
}

const evt = (
  id: string,
  start: string,
  end: string,
  title = id,
): TestEvent => ({ id, start, end, title });

describe("Kernel", () => {
  describe("event collection", () => {
    it("seeds events from options and reads them back", () => {
      const options: KernelOptions<TestEvent> = {
        events: [evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")],
      };
      const kernel = new Kernel<TestEvent>(options);
      expect(kernel.getEvents()).toHaveLength(1);
      expect(kernel.getEvent("a")?.title).toBe("a");
    });

    it("merges loaded events over the ones already held", () => {
      const kernel = new Kernel<TestEvent>({
        events: [evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")],
      });

      kernel.load([
        evt("a", "2026-01-01T09:00:00Z", "2026-01-01T11:00:00Z", "renamed"),
        evt("b", "2026-01-02T09:00:00Z", "2026-01-02T10:00:00Z"),
      ]);

      expect(kernel.getEvents().map((e) => e.id)).toEqual(["a", "b"]);
      expect(kernel.getEvent("a")?.title).toBe("renamed");
    });

    it("swaps the whole collection when loading with replace", () => {
      const kernel = new Kernel<TestEvent>({
        events: [evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")],
      });

      kernel.load([evt("b", "2026-01-02T09:00:00Z", "2026-01-02T10:00:00Z")], {
        replace: true,
      });

      expect(kernel.getEvents().map((e) => e.id)).toEqual(["b"]);
    });

    it("loads without producing a batch to roll back", () => {
      const kernel = new Kernel<TestEvent>();

      kernel.load([evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")]);

      expect(kernel.rollback()).toBeNull();
      expect(kernel.getEvents()).toHaveLength(1);
    });
  });

  describe("projection pipeline", () => {
    it("runs recurrence-expand → clip-to-viewport → layout in order", () => {
      const trace: Array<string> = [];
      const kernel = new Kernel<TestEvent>({
        events: [
          evt("in", "2026-01-05T09:00:00Z", "2026-01-05T10:00:00Z"),
          evt("out", "2026-02-05T09:00:00Z", "2026-02-05T10:00:00Z"),
        ],
      });

      const module: Module<TestEvent> = {
        name: "trace",
        contributions: [
          {
            pipeline: "projection",
            stage: "recurrence-expand",
            run: (ctx) => {
              trace.push("recurrence-expand");
              return ctx.events;
            },
          },
          {
            pipeline: "projection",
            stage: "layout",
            run: (ctx) => {
              trace.push("layout");
              return ctx.events;
            },
          },
        ],
      };

      kernel.use(module);
      const projected = kernel.project({
        start: "2026-01-01T00:00:00Z",
        end: "2026-01-31T23:59:59Z",
      });

      expect(trace).toEqual(["recurrence-expand", "layout"]);
      expect(projected.map((e) => e.id)).toEqual(["in"]);
    });

    it("orders stages within a stage by priority ascending", () => {
      const trace: Array<number> = [];
      const kernel = new Kernel<TestEvent>({ events: [] });
      const stage = (priority: number): Module<TestEvent> => ({
        name: `p${priority}`,
        contributions: [
          {
            pipeline: "projection",
            stage: "recurrence-expand",
            priority,
            run: (ctx) => {
              trace.push(priority);
              return ctx.events;
            },
          },
        ],
      });

      kernel.use(stage(10)).use(stage(1)).use(stage(5));
      kernel.project({ start: "2026-01-01", end: "2026-01-02" });

      expect(trace).toEqual([1, 5, 10]);
    });
  });

  describe("write pipeline", () => {
    it("commits an add and exposes it", () => {
      const kernel = new Kernel<TestEvent>();
      const result = kernel.write({
        kind: "add",
        event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
      });

      expect(result.status).toBe("committed");
      expect(kernel.getEvents()).toHaveLength(1);
    });

    it("commits several ops as one batch", () => {
      const kernel = new Kernel<TestEvent>({
        events: [evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")],
      });

      const result = kernel.write(
        [
          {
            kind: "remove",
            id: "a",
            event: kernel.getEvent("a")!,
          },
          {
            kind: "add",
            event: evt("b", "2026-01-01T11:00:00Z", "2026-01-01T12:00:00Z"),
          },
        ],
        "split",
      );

      expect(result.status).toBe("committed");
      expect(result.status === "committed" && result.batch.reason).toBe(
        "split",
      );
      expect(kernel.getEvents().map((e) => e.id)).toEqual(["b"]);
    });

    it("rolls a multi-op batch back in one step", () => {
      const kernel = new Kernel<TestEvent>({
        events: [evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")],
      });

      kernel.write([
        { kind: "remove", id: "a", event: kernel.getEvent("a")! },
        {
          kind: "add",
          event: evt("b", "2026-01-01T11:00:00Z", "2026-01-01T12:00:00Z"),
        },
      ]);
      kernel.rollback();

      expect(kernel.getEvents().map((e) => e.id)).toEqual(["a"]);
    });

    it("names the batch after the first op when no reason is given", () => {
      const kernel = new Kernel<TestEvent>();

      const result = kernel.write([
        {
          kind: "add",
          event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
        },
      ]);

      expect(result.status === "committed" && result.batch.reason).toBe("add");
    });

    it("runs transform stages that cascade ops into the batch", () => {
      const kernel = new Kernel<TestEvent>();
      const cascade: Module<TestEvent> = {
        name: "cascade",
        contributions: [
          {
            pipeline: "write",
            kind: "transform",
            stage: "schedule",
            run: (batch) => ({
              ...batch,
              ops: [
                ...batch.ops,
                {
                  kind: "add",
                  event: evt(
                    "shadow",
                    "2026-01-01T11:00:00Z",
                    "2026-01-01T12:00:00Z",
                  ),
                },
              ],
            }),
          },
        ],
      };

      kernel.use(cascade);
      const result = kernel.write({
        kind: "add",
        event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
      });

      expect(result.status).toBe("committed");
      expect(kernel.getEvent("shadow")).toBeDefined();
    });

    it("vetoes the batch when a validate stage returns conflicts and does not mutate", () => {
      const kernel = new Kernel<TestEvent>();
      const veto: Module<TestEvent> = {
        name: "veto",
        contributions: [
          {
            pipeline: "write",
            kind: "validate",
            stage: "availability-validate",
            run: (batch): Array<Conflict> => [
              {
                code: "blocked",
                message: "nope",
                eventIds: batch.ops.flatMap((o) => {
                  if (o.kind === "intent") return [];
                  return [o.kind === "add" ? o.event.id : o.id];
                }),
              },
            ],
          },
        ],
      };

      kernel.use(veto);
      const result = kernel.write({
        kind: "add",
        event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
      });

      expect(result.status).toBe("rejected");
      expect(kernel.getEvents()).toHaveLength(0);
    });
  });

  describe("rollback", () => {
    it("reverts the last committed batch", () => {
      const kernel = new Kernel<TestEvent>();
      kernel.write({
        kind: "add",
        event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
      });
      expect(kernel.getEvents()).toHaveLength(1);

      kernel.rollback();
      expect(kernel.getEvents()).toHaveLength(0);
    });
  });

  describe("getRequiredRange", () => {
    it("defaults to the event's own span", () => {
      const kernel = new Kernel<TestEvent>();
      const range = kernel.getRequiredRange({
        kind: "add",
        event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
      });
      expect(toDay(range!.start)).toBe("2026-01-01");
      expect(toDay(range!.end)).toBe("2026-01-01");
    });

    it("widens to a module-declared required range", () => {
      const kernel = new Kernel<TestEvent>();
      kernel.use({
        name: "wide",
        contributions: [],
        getRequiredRange: () => ({
          start: "2025-12-01T00:00:00Z",
          end: "2026-03-01T00:00:00Z",
        }),
      });

      const range = kernel.getRequiredRange({
        kind: "add",
        event: evt("a", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z"),
      });
      expect(toDay(range!.start)).toBe("2025-12-01");
      expect(toDay(range!.end)).toBe("2026-03-01");
    });
  });
});

const toDay = (iso: string) => iso.slice(0, 10);
