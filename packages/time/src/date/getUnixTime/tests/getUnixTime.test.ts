import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { getUnixTime } from "../getUnixTime";

describe("getUnixTime", () => {
  describe("with string input", () => {
    test("should return unix timestamp for date", () => {
      const result = getUnixTime("2024-03-15T14:42:12Z", { timeZone: "UTC" });
      expect(result).toBe(1710513732);
    });

    test("should return zero for epoch", () => {
      const result = getUnixTime("1970-01-01T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(0);
    });
  });

  describe("with different input types", () => {
    test("should work with Date object", () => {
      const result = getUnixTime(new Date("2024-03-15T14:42:12Z"), {
        timeZone: "UTC",
      });
      expect(result).toBe(1710513732);
    });

    test("should work with epoch time", () => {
      const epoch = new Date("2024-03-15T14:42:12Z").getTime();
      const result = getUnixTime(epoch, { timeZone: "UTC" });
      expect(result).toBe(1710513732);
    });

    test("should work with ZonedDateTime", () => {
      const zdt = Temporal.ZonedDateTime.from(
        "2024-03-15T14:42:12Z[UTC][u-ca=gregory]",
      );
      const result = getUnixTime(zdt, { timeZone: "UTC" });
      expect(result).toBe(1710513732);
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const result = getUnixTime("2024-03-15T14:42:12Z", {
        timeZone: "America/New_York",
      });
      expect(result).toBe(1710513732);
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar", () => {
      const result = getUnixTime("2024-03-15T14:42:12Z", {
        timeZone: "UTC",
        calendar: "japanese",
      });
      expect(result).toBe(1710513732);
    });
  });
});
