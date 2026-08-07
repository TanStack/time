import { describe, expect, it } from "vitest";
import { Kernel } from "../../index";
import { dependencyModule, resizeIntent, resizeModule } from "../index";
import type { ResizeModuleOptions } from "../index";
import type { KernelEvent } from "../../index";
import type { AvailabilityResourceInput } from "~/validation/availability";
import type { DependencyLink } from "~/validation/dependency";

interface CalEvent extends KernelEvent {
  title: string;
  resources?: Array<string>;
  dependsOn?: Array<DependencyLink>;
}

const MONDAY = "2026-01-05";
const UTC = "UTC";

const office: AvailabilityResourceInput = {
  id: "office",
  label: "Office",
  calendarId: "office",
};

const workingTime = {
  calendars: [
    {
      id: "office",
      intervals: [
        {
          isWorking: true,
          recurrent: {
            weekdays: [1],
            startTime: "09:00",
            endTime: "17:00",
          },
        },
      ],
    },
  ],
};

const options: ResizeModuleOptions = { timeZone: UTC };

const seed = (
  moduleOptions: ResizeModuleOptions = options,
  events: Array<CalEvent> = [
    {
      id: "e1",
      title: "E1",
      start: `${MONDAY}T10:00:00`,
      end: `${MONDAY}T11:00:00`,
    },
  ],
) =>
  new Kernel<CalEvent>({ events }).use(resizeModule<CalEvent>(moduleOptions));

describe("resizeModule", () => {
  it("expands a resize intent into an update", () => {
    const kernel = seed();

    const result = kernel.write(
      resizeIntent({ eventId: "e1", edge: "bottom", deltaMinutes: 60 }),
    );

    expect(result.status).toBe("committed");
    expect(kernel.getEvent("e1")).toMatchObject({
      start: `${MONDAY}T10:00:00`,
      end: `${MONDAY}T12:00:00`,
    });
  });

  it("moves the start when the top edge is dragged", () => {
    const kernel = seed();

    kernel.write(
      resizeIntent({ eventId: "e1", edge: "top", deltaMinutes: -30 }),
    );

    expect(kernel.getEvent("e1")!.start).toBe(`${MONDAY}T09:30:00`);
  });

  it("snaps the delta to the configured interval", () => {
    const kernel = seed({ ...options, snapToMinutes: 30 });

    kernel.write(
      resizeIntent({ eventId: "e1", edge: "bottom", deltaMinutes: 20 }),
    );

    expect(kernel.getEvent("e1")!.end).toBe(`${MONDAY}T11:30:00`);
  });

  it("keeps the minimum duration", () => {
    const kernel = seed({ ...options, minDurationMinutes: 30 });

    kernel.write(
      resizeIntent({ eventId: "e1", edge: "top", deltaMinutes: 120 }),
    );

    expect(kernel.getEvent("e1")).toMatchObject({
      start: `${MONDAY}T10:30:00`,
      end: `${MONDAY}T11:00:00`,
    });
  });

  it("stops at the resource's availability edge", () => {
    const kernel = seed({ timeZone: UTC, resources: [office], workingTime }, [
      {
        id: "e1",
        title: "E1",
        start: `${MONDAY}T16:00:00`,
        end: `${MONDAY}T17:00:00`,
        resources: ["office"],
      },
    ]);

    kernel.write(
      resizeIntent({ eventId: "e1", edge: "bottom", deltaMinutes: 120 }),
    );

    expect(kernel.getEvent("e1")!.end).toBe(`${MONDAY}T17:00:00`);
  });

  it("takes explicit unavailable ranges over the resource lookup", () => {
    const kernel = seed({ timeZone: UTC, resources: [office], workingTime });

    kernel.write(
      resizeIntent({
        eventId: "e1",
        edge: "bottom",
        deltaMinutes: 180,
        unavailableRanges: [{ startMinutes: 780, endMinutes: 1440 }],
      }),
    );

    expect(kernel.getEvent("e1")!.end).toBe(`${MONDAY}T13:00:00`);
  });

  it("drops a resize aimed at an unknown event", () => {
    const kernel = seed();

    const result = kernel.write(
      resizeIntent({ eventId: "gone", edge: "bottom", deltaMinutes: 60 }),
    );

    expect(result.status).toBe("committed");
    expect(kernel.getEvent("e1")!.end).toBe(`${MONDAY}T11:00:00`);
  });

  it("cascades dependents in the same batch", () => {
    const kernel = new Kernel<CalEvent>({
      events: [
        {
          id: "e1",
          title: "E1",
          start: `${MONDAY}T10:00:00`,
          end: `${MONDAY}T11:00:00`,
        },
        {
          id: "e2",
          title: "E2",
          start: `${MONDAY}T11:00:00`,
          end: `${MONDAY}T12:00:00`,
          dependsOn: [{ id: "e1", type: "FS" }],
        },
      ],
    })
      .use(resizeModule<CalEvent>(options))
      .use(dependencyModule<CalEvent>({ timeZone: UTC }));

    const result = kernel.write(
      resizeIntent({ eventId: "e1", edge: "bottom", deltaMinutes: 60 }),
    );

    expect(result.status).toBe("committed");
    expect(result.status === "committed" && result.batch.ops).toHaveLength(2);
    expect(kernel.getEvent("e2")).toMatchObject({
      start: `${MONDAY}T12:00:00`,
      end: `${MONDAY}T13:00:00`,
    });
  });
});
