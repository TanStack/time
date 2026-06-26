import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { buildFinalFormatter } from "../buildFinalFormatter";

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
  timeZone: "America/New_York",
});

const timeOnlyFormat = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/New_York",
});

describe("buildFinalFormatter", () => {
  beforeEach(() => {
    vi.stubEnv("TZ", "America/New_York");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should format a date string", () => {
    const format = buildFinalFormatter({
      formatter: dateTimeFormat,
      formatterName: "dateTimeFormat",
    });
    expect(format("2021-03-12T14:42")).toBe("03/12/2021, 02:42:00 PM EST");
  });

  test("should format a time string range", () => {
    const timeFormat = buildFinalFormatter({
      formatter: timeOnlyFormat,
      formatterName: "timeOnlyFormat",
      forRange: true,
    });
    // output does not show 2-digit hour in range due to a bug in Intl.DateTimeFormat.formatRange
    expect(timeFormat("2021-03-12T14:42", "2021-03-12T15:42")).toBe(
      "2:42 – 3:42 PM",
    );
  });
});
