import { describe, expect, it } from "vitest";
import { Kernel } from "../../index";
import type { KernelEvent } from "../../index";
import { durationModule } from "../index";
import type { DurationModuleApi } from "../index";
import type { WorkingCalendar } from "~/workingTime";

interface CalEvent extends KernelEvent {
  title: string;
  resources?: Array<string>;
  duration?: number;
  effort?: number;
}

const OFFICE: WorkingCalendar = {
  id: "office",
  intervals: [
    {
      isWorking: true,
      recurrent: {
        weekdays: [1, 2, 3, 4, 5],
        startTime: "09:00",
        endTime: "17:00",
      },
    },
  ],
};

const MON = "2026-03-02";

const kernelWith = () =>
  new Kernel<CalEvent, DurationModuleApi>().use(
    durationModule<CalEvent>({
      resources: [{ id: "r", calendarId: "office" }],
      workingTime: { calendars: [OFFICE], defaultCalendarId: "office" },
    }),
  );

const add = (
  kernel: Kernel<CalEvent, DurationModuleApi>,
  event: Partial<CalEvent> = {},
) =>
  kernel.write({
    kind: "add",
    event: {
      id: "a",
      title: "A",
      start: `${MON}T08:00:00`,
      end: `${MON}T12:00:00`,
      resources: ["r"],
      ...event,
    } as CalEvent,
  });

describe("durationModule", () => {
  it("commits a duration that matches the working span", () => {
    const kernel = kernelWith();

    expect(add(kernel, { duration: 180 }).status).toBe("committed");
  });

  it("rejects a duration measured in wall-clock time", () => {
    const kernel = kernelWith();

    const result = add(kernel, { duration: 240 });

    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") return;
    expect(result.conflicts[0]).toMatchObject({
      code: "duration/duration-mismatch",
      eventIds: ["a"],
    });
    expect(kernel.getEvent("a")).toBeUndefined();
  });

  it("rejects a move that changes the working span out from under the duration", () => {
    const kernel = kernelWith();
    add(kernel, { duration: 180 });

    const result = kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: `${MON}T13:00:00`,
        end: `${MON}T16:00:00`,
      },
    });

    expect(result.status).toBe("committed");
    expect(kernel.getEvent("a")!.start).toBe(`${MON}T13:00:00`);

    const shrunk = kernel.write({
      kind: "update",
      id: "a",
      before: kernel.getEvent("a")!,
      after: {
        ...kernel.getEvent("a")!,
        start: `${MON}T13:00:00`,
        end: `${MON}T15:00:00`,
      },
    });

    expect(shrunk.status).toBe("rejected");
    expect(kernel.getEvent("a")!.end).toBe(`${MON}T16:00:00`);
  });

  it("rejects effort that outgrows the duration", () => {
    const kernel = kernelWith();

    const result = add(kernel, { duration: 180, effort: 240 });

    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") return;
    expect(result.conflicts[0]).toMatchObject({
      code: "duration/effort-exceeds-duration",
    });
  });

  it("ignores an event that declares neither field", () => {
    const kernel = kernelWith();

    expect(add(kernel).status).toBe("committed");
  });

  it("answers the working duration of a span through its api", () => {
    const kernel = kernelWith();

    expect(
      kernel.api.getWorkingDuration({
        start: `${MON}T08:00:00`,
        end: `${MON}T12:00:00`,
        resources: ["r"],
      }),
    ).toBe(180);
  });
});
