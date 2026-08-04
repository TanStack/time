import { describe, expect, it } from "vitest";
import {
  masterIdOf,
  nextOccurrenceDate,
  previousOccurrenceDate,
} from "../occurrence";
import type { Event } from "~/calendar/types";

const weekly: Event = {
  id: "rec",
  title: "Weekly",
  start: "2025-06-02T09:00:00",
  end: "2025-06-02T10:00:00",
  recurrence: { frequency: "weekly", interval: 1 },
};

const plain: Event = {
  id: "plain",
  title: "Plain",
  start: "2025-06-02T09:00:00",
  end: "2025-06-02T10:00:00",
};

describe("masterIdOf", () => {
  it("strips the occurrence suffix", () => {
    expect(masterIdOf("rec_12")).toBe("rec");
  });

  it("leaves a master id alone", () => {
    expect(masterIdOf("rec")).toBe("rec");
  });

  it("keeps underscores that are not an occurrence index", () => {
    expect(masterIdOf("team_standup")).toBe("team_standup");
  });

  it("strips only the trailing index", () => {
    expect(masterIdOf("team_standup_3")).toBe("team_standup");
  });
});

describe("nextOccurrenceDate", () => {
  it("finds the occurrence after the cursor", () => {
    expect(nextOccurrenceDate(weekly, "2025-06-02")).toBe("2025-06-09");
  });

  it("skips a cursor that sits between occurrences", () => {
    expect(nextOccurrenceDate(weekly, "2025-06-11")).toBe("2025-06-16");
  });

  it("returns null for a non-recurring event", () => {
    expect(nextOccurrenceDate(plain, "2025-06-02")).toBeNull();
  });

  it("returns null once the series has ended", () => {
    const bounded: Event = {
      ...weekly,
      recurrence: { frequency: "weekly", interval: 1, count: 2 },
    };

    expect(nextOccurrenceDate(bounded, "2025-06-09")).toBeNull();
  });

  it("looks no further than the horizon", () => {
    const yearly: Event = {
      ...weekly,
      recurrence: { frequency: "yearly", interval: 10 },
    };

    expect(nextOccurrenceDate(yearly, "2025-06-02", 4)).toBeNull();
    expect(nextOccurrenceDate(yearly, "2025-06-02", 20)).toBe("2035-06-02");
  });
});

describe("previousOccurrenceDate", () => {
  it("finds the occurrence before the cursor", () => {
    expect(previousOccurrenceDate(weekly, "2025-06-16")).toBe("2025-06-09");
  });

  it("returns null at the series start", () => {
    expect(previousOccurrenceDate(weekly, "2025-06-02")).toBeNull();
  });

  it("returns null before the series start", () => {
    expect(previousOccurrenceDate(weekly, "2025-05-01")).toBeNull();
  });

  it("returns null for a non-recurring event", () => {
    expect(previousOccurrenceDate(plain, "2025-07-01")).toBeNull();
  });
});
