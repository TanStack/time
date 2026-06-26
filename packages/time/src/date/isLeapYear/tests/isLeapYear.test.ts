import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { isLeapYear } from "../isLeapYear";

describe("isLeapYear", () => {
  describe("leap years", () => {
    test("should return true for 2024 (divisible by 4)", () => {
      const result = isLeapYear("2024-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should return true for 2000 (divisible by 400)", () => {
      const result = isLeapYear("2000-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should return true for 2020 (divisible by 4)", () => {
      const result = isLeapYear("2020-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should return true for 2016 (divisible by 4)", () => {
      const result = isLeapYear("2016-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should return true when date is February 29 of leap year", () => {
      const result = isLeapYear("2024-02-29T00:00:00Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });

  describe("non-leap years", () => {
    test("should return false for 2023 (not divisible by 4)", () => {
      const result = isLeapYear("2023-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(false);
    });

    test("should return false for 2025 (not divisible by 4)", () => {
      const result = isLeapYear("2025-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(false);
    });

    test("should return false for 1900 (divisible by 100 but not 400)", () => {
      const result = isLeapYear("1900-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(false);
    });

    test("should return false for 2100 (divisible by 100 but not 400)", () => {
      const result = isLeapYear("2100-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(false);
    });
  });

  describe("with different input types", () => {
    test("should work with Date object", () => {
      const date = new Date("2024-03-15T14:42:12.789Z");
      const result = isLeapYear(date, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with epoch time", () => {
      const epoch = new Date("2024-03-15T14:42:12.789Z").getTime();
      const result = isLeapYear(epoch, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with ZonedDateTime", () => {
      const zdt = Temporal.ZonedDateTime.from(
        "2024-03-15T14:42:12.789Z[UTC][u-ca=gregory]",
      );
      const result = isLeapYear(zdt, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with date string", () => {
      const result = isLeapYear("2024-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });

  describe("timezone handling", () => {
    test("should respect timeZone option", () => {
      const result = isLeapYear("2024-03-15T14:42:12.789Z", {
        timeZone: "America/New_York",
      });
      expect(result).toBe(true);
    });

    test("should use default timeZone when not provided", () => {
      const result = isLeapYear("2024-03-15T14:42:12.789Z");
      expect(result).toBe(true);
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar option", () => {
      const result = isLeapYear("2024-03-15T14:42:12.789Z", {
        calendar: "japanese",
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should use default calendar when not provided", () => {
      const result = isLeapYear("2024-03-15T14:42:12.789Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle year boundaries correctly", () => {
      const result = isLeapYear("2024-12-31T23:59:59Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should handle January 1st correctly", () => {
      const result = isLeapYear("2024-01-01T00:00:00Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should handle different months correctly", () => {
      const result1 = isLeapYear("2024-01-15T00:00:00Z", {
        timeZone: "UTC",
      });
      const result2 = isLeapYear("2024-06-15T00:00:00Z", {
        timeZone: "UTC",
      });
      const result3 = isLeapYear("2024-12-15T00:00:00Z", {
        timeZone: "UTC",
      });
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });
});
