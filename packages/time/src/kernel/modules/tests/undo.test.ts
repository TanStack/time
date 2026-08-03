import { describe, expect, it } from "vitest";
import { Kernel } from "../../index";
import {
  dependencyModule,
  redoIntent,
  resizeIntent,
  resizeModule,
  undoIntent,
  undoModule,
} from "../index";
import type { KernelEvent } from "../../index";
import type { DependencyLink } from "~/validation/dependency";

interface CalEvent extends KernelEvent {
  title: string;
  dependsOn?: Array<DependencyLink>;
}

const MONDAY = "2026-01-05";

const event = (id: string, start: string, end: string): CalEvent => ({
  id,
  title: id,
  start: `${MONDAY}T${start}:00`,
  end: `${MONDAY}T${end}:00`,
});

describe("undoModule", () => {
  it("starts with nothing to undo or redo", () => {
    const history = undoModule<CalEvent>();
    new Kernel<CalEvent>().use(history);

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it("undoes an add by removing the event", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("e1", "10:00", "11:00") });
    expect(history.canUndo()).toBe(true);

    kernel.write(undoIntent());

    expect(kernel.getEvents()).toEqual([]);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it("undoes a remove by restoring the event", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>({
      events: [event("e1", "10:00", "11:00")],
    }).use(history);

    kernel.write({
      kind: "remove",
      id: "e1",
      event: kernel.getEvent("e1")!,
    });
    kernel.write(undoIntent());

    expect(kernel.getEvent("e1")).toMatchObject({
      start: `${MONDAY}T10:00:00`,
      end: `${MONDAY}T11:00:00`,
    });
  });

  it("undoes an update by restoring the previous span", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>({
      events: [event("e1", "10:00", "11:00")],
    }).use(history);

    kernel.write({
      kind: "update",
      id: "e1",
      before: kernel.getEvent("e1")!,
      after: { ...kernel.getEvent("e1")!, end: `${MONDAY}T12:00:00` },
    });
    kernel.write(undoIntent());

    expect(kernel.getEvent("e1")!.end).toBe(`${MONDAY}T11:00:00`);
  });

  it("redoes what it just undid", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("e1", "10:00", "11:00") });
    kernel.write(undoIntent());
    kernel.write(redoIntent());

    expect(kernel.getEvent("e1")).toBeDefined();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });

  it("walks back through several writes one at a time", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("a", "09:00", "10:00") });
    kernel.write({ kind: "add", event: event("b", "10:00", "11:00") });
    kernel.write({ kind: "add", event: event("c", "11:00", "12:00") });

    kernel.write(undoIntent());
    expect(kernel.getEvents().map((e) => e.id)).toEqual(["a", "b"]);

    kernel.write(undoIntent());
    expect(kernel.getEvents().map((e) => e.id)).toEqual(["a"]);

    kernel.write(redoIntent());
    expect(kernel.getEvents().map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("drops the redo stack once a new write lands", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("a", "09:00", "10:00") });
    kernel.write(undoIntent());
    expect(history.canRedo()).toBe(true);

    kernel.write({ kind: "add", event: event("b", "10:00", "11:00") });

    expect(history.canRedo()).toBe(false);
  });

  it("ignores an undo with an empty stack", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>({
      events: [event("e1", "10:00", "11:00")],
    }).use(history);

    const result = kernel.write(undoIntent());

    expect(result.status).toBe("committed");
    expect(kernel.getEvents()).toHaveLength(1);
    expect(history.canRedo()).toBe(false);
  });

  it("treats a cascaded batch as one entry", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>({
      events: [
        event("e1", "10:00", "11:00"),
        {
          ...event("e2", "11:00", "12:00"),
          dependsOn: [{ id: "e1", type: "FS" }],
        },
      ],
    })
      .use(history)
      .use(resizeModule<CalEvent>({ timeZone: "UTC" }))
      .use(dependencyModule<CalEvent>({ timeZone: "UTC" }));

    kernel.write(
      resizeIntent({ eventId: "e1", edge: "bottom", deltaMinutes: 60 }),
    );
    expect(kernel.getEvent("e2")!.start).toBe(`${MONDAY}T12:00:00`);
    expect(history.undoStack()).toHaveLength(1);

    kernel.write(undoIntent());

    expect(kernel.getEvent("e1")!.end).toBe(`${MONDAY}T11:00:00`);
    expect(kernel.getEvent("e2")!.start).toBe(`${MONDAY}T11:00:00`);
    expect(history.canUndo()).toBe(false);
  });

  it("records the reason each entry came from", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("e1", "10:00", "11:00") });

    expect(history.undoStack()[0]).toMatchObject({
      reason: "add",
      ops: [{ kind: "add" }],
    });
  });

  it("keeps only the newest entries once the limit is reached", () => {
    const history = undoModule<CalEvent>({ limit: 2 });
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("a", "09:00", "10:00") });
    kernel.write({ kind: "add", event: event("b", "10:00", "11:00") });
    kernel.write({ kind: "add", event: event("c", "11:00", "12:00") });

    expect(history.undoStack().map((entry) => entry.ops[0])).toMatchObject([
      { kind: "add", event: { id: "b" } },
      { kind: "add", event: { id: "c" } },
    ]);
  });

  it("forgets everything when cleared", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history);

    kernel.write({ kind: "add", event: event("e1", "10:00", "11:00") });
    history.clearHistory();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it("does not record a rejected write", () => {
    const history = undoModule<CalEvent>();
    const kernel = new Kernel<CalEvent>().use(history).use({
      name: "veto",
      contributions: [
        {
          pipeline: "write",
          kind: "validate",
          stage: "availability-validate",
          run: () => [{ code: "test/veto", message: "no", eventIds: ["e1"] }],
        },
      ],
    });

    const result = kernel.write({
      kind: "add",
      event: event("e1", "10:00", "11:00"),
    });

    expect(result.status).toBe("rejected");
    expect(history.canUndo()).toBe(false);
  });
});
