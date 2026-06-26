import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { getDayOfYear } from "../getDayOfYear";

describe("getDayOfYear", () => {
  describe("with string input", () => {
    test("should return day of year for January 1st", () => {
      const result = getDayOfYear("2024-01-01T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(1);
    });

    test("should return day of year for March 15th", () => {
      const result = getDayOfYear("2024-03-15T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(75);
    });

    test("should return day of year for December 31st in leap year", () => {
      const result = getDayOfYear("2024-12-31T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(366);
    });

    test("should return day of year for December 31st in non-leap year", () => {
      const result = getDayOfYear("2023-12-31T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(365);
    });
  });

  describe("with different input types", () => {
    test("should work with Date object", () => {
      const result = getDayOfYear(new Date("2024-03-15T00:00:00Z"), {
        timeZone: "UTC",
      });
      expect(result).toBe(75);
    });

    test("should work with epoch time", () => {
      const epoch = new Date("2024-03-15T00:00:00Z").getTime();
      const result = getDayOfYear(epoch, { timeZone: "UTC" });
      expect(result).toBe(75);
    });

    test("should work with ZonedDateTime", () => {
      const zdt = Temporal.ZonedDateTime.from(
        "2024-03-15T00:00:00Z[UTC][u-ca=gregory]",
      );
      const result = getDayOfYear(zdt, { timeZone: "UTC" });
      expect(result).toBe(75);
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const result = getDayOfYear("2024-03-15T00:00:00Z", {
        timeZone: "America/New_York",
      });
      expect(result).toBe(74);
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar", () => {
      const result = getDayOfYear("2024-03-15T00:00:00Z", {
        timeZone: "UTC",
        calendar: "japanese",
      });
      expect(result).toBe(75);
    });
  });
});
