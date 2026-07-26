import { describe, expect, it } from "vitest";
import {
  compareRecurrenceInputToOccurrence,
  durationPreservingEnd,
  getRecurringOccurrence,
  makeSplitRecurringEventId,
  materializeRecurringEdit,
  materializeRecurringRemove,
  normalizeRecurrenceRule,
  recurrenceInputMatchesOccurrence,
  resolveOccurrenceStart,
  type MaterializeEditInput,
  type MaterializeRemoveInput,
  type MaterializeResult,
} from "../index";
import type { Event, Resource } from "~/calendar/types";

const master = (): Event => ({
  id: "m",
  title: "Daily",
  start: "2026-01-05T09:00:00",
  end: "2026-01-05T10:00:00",
  recurrence: { frequency: "daily" },
});

describe("recurrence helpers", () => {
  it("normalizeRecurrenceRule normalizes exDates and override times", () => {
    const rule = normalizeRecurrenceRule({
      frequency: "daily",
      exDates: [new Date("2026-01-06T09:00:00Z")],
      overrides: [{ originalStart: "2026-01-07", start: "2026-01-07T14:00" }],
    });
    expect(rule.exDates![0]).toContain("T");
    expect(rule.overrides![0]!.start).toBe("2026-01-07T14:00:00");
  });

  it("resolveOccurrenceStart falls back to the master start", () => {
    expect(resolveOccurrenceStart("2026-01-05T09:00:00")).toBe(
      "2026-01-05T09:00:00",
    );
    expect(
      resolveOccurrenceStart("2026-01-05T09:00:00", "2026-01-08T09:00:00"),
    ).toBe("2026-01-08T09:00:00");
  });

  it("recurrenceInputMatchesOccurrence matches by date or datetime", () => {
    expect(
      recurrenceInputMatchesOccurrence("2026-01-06", "2026-01-06T09:00:00"),
    ).toBe(true);
    expect(
      recurrenceInputMatchesOccurrence(
        "2026-01-06T09:00:00",
        "2026-01-06T09:00:00",
      ),
    ).toBe(true);
    expect(
      recurrenceInputMatchesOccurrence("2026-01-07", "2026-01-06T09:00:00"),
    ).toBe(false);
  });

  it("compareRecurrenceInputToOccurrence orders inputs", () => {
    expect(
      compareRecurrenceInputToOccurrence("2026-01-07", "2026-01-06T09:00:00"),
    ).toBeGreaterThan(0);
  });

  it("durationPreservingEnd keeps the duration when the start moves", () => {
    expect(
      durationPreservingEnd(
        "2026-01-05T09:00:00",
        "2026-01-05T10:30:00",
        "2026-01-06T14:00:00",
      ),
    ).toBe("2026-01-06T15:30:00");
  });

  it("makeSplitRecurringEventId avoids collisions", () => {
    const taken = new Set(["m_20260108T090000"]);
    expect(
      makeSplitRecurringEventId("m", "2026-01-08T09:00:00", (id) =>
        taken.has(id),
      ),
    ).toBe("m_20260108T090000_1");
  });

  it("getRecurringOccurrence resolves a materialized occurrence", () => {
    const occ = getRecurringOccurrence(master(), "2026-01-08T09:00:00");
    expect(occ?.id).toBe("m_3");
    expect(occ?._occurrenceOriginalStart).toBe("2026-01-08T09:00:00");
  });
});

describe("materializeRecurringEdit", () => {
  it('scope "this" adds an override without a split event', () => {
    const occurrence = getRecurringOccurrence(master(), "2026-01-08T09:00:00")!;
    const input: MaterializeEditInput<Resource, Event> = {
      master: master(),
      scope: "this",
      occurrence,
      occurrenceStart: "2026-01-08T09:00:00",
      effectiveStart: "2026-01-08T14:00:00",
      effectiveEnd: "2026-01-08T15:00:00",
      normalizedUpdates: {
        start: "2026-01-08T14:00:00",
        end: "2026-01-08T15:00:00",
      },
      isTaken: () => false,
    };
    const { nextMaster, addedEvents }: MaterializeResult<Event> =
      materializeRecurringEdit(input);

    expect(addedEvents).toHaveLength(0);
    const override = nextMaster.recurrence!.overrides!.find(
      (o) => o.originalStart === "2026-01-08T09:00:00",
    );
    expect(override?.start).toBe("2026-01-08T14:00:00");
  });

  it('scope "thisAndFollowing" splits the series with until + a new master', () => {
    const occurrence = getRecurringOccurrence(master(), "2026-01-08T09:00:00")!;
    const { nextMaster, addedEvents } = materializeRecurringEdit({
      master: master(),
      scope: "thisAndFollowing",
      occurrence,
      occurrenceStart: "2026-01-08T09:00:00",
      effectiveStart: "2026-01-08T11:00:00",
      effectiveEnd: "2026-01-08T12:00:00",
      normalizedUpdates: {
        start: "2026-01-08T11:00:00",
        end: "2026-01-08T12:00:00",
      },
      isTaken: () => false,
    });

    expect(nextMaster.recurrence!.until).toBe("2026-01-08");
    expect(addedEvents).toHaveLength(1);
    expect(addedEvents[0]!.start).toBe("2026-01-08T11:00:00");
    expect(addedEvents[0]!.recurrence!.frequency).toBe("daily");
    expect(addedEvents[0]!._recurringMasterId).toBeUndefined();
  });
});

describe("materializeRecurringRemove", () => {
  it('scope "this" excludes the occurrence via exDates', () => {
    const input: MaterializeRemoveInput<Resource, Event> = {
      master: master(),
      scope: "this",
      occurrenceStart: "2026-01-08T09:00:00",
    };
    const { nextMaster } = materializeRecurringRemove(input);
    expect(nextMaster.recurrence!.exDates).toContain("2026-01-08T09:00:00");
  });

  it('scope "thisAndFollowing" caps the series with until', () => {
    const { nextMaster } = materializeRecurringRemove({
      master: master(),
      scope: "thisAndFollowing",
      occurrenceStart: "2026-01-08T09:00:00",
    });
    expect(nextMaster.recurrence!.until).toBe("2026-01-08");
  });
});
