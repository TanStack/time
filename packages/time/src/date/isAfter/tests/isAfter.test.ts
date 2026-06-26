import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { isAfter } from "../isAfter";

describe("isAfter", () => {
  describe("with string inputs", () => {
    test("should return true when first date is after second date", () => {
      const result = isAfter(
        "2024-03-16T14:42:12.789Z",
        "2024-03-15T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should return false when first date is before second date", () => {
      const result = isAfter(
        "2024-03-15T14:42:12.789Z",
        "2024-03-16T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(false);
    });

    test("should return false when dates are equal", () => {
      const result = isAfter(
        "2024-03-15T14:42:12.789Z",
        "2024-03-15T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(false);
    });

    test("should handle different times on same day", () => {
      const result = isAfter("2024-03-15T15:00:00Z", "2024-03-15T10:00:00Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should handle different days", () => {
      const result = isAfter(
        "2024-03-16T14:42:12.789Z",
        "2024-03-15T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle different months", () => {
      const result = isAfter(
        "2024-03-15T14:42:12.789Z",
        "2024-02-15T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle different years", () => {
      const result = isAfter(
        "2024-03-15T14:42:12.789Z",
        "2023-03-15T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });
  });

  describe("with different input types", () => {
    test("should work with Date objects", () => {
      const date1 = new Date("2024-03-16T14:42:12.789Z");
      const date2 = new Date("2024-03-15T14:42:12.789Z");
      const result = isAfter(date1, date2, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with epoch time", () => {
      const date1 = new Date("2024-03-16T14:42:12.789Z").getTime();
      const date2 = new Date("2024-03-15T14:42:12.789Z").getTime();
      const result = isAfter(date1, date2, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with ZonedDateTime", () => {
      const zdt1 = Temporal.ZonedDateTime.from(
        "2024-03-16T14:42:12.789Z[UTC][u-ca=gregory]",
      );
      const zdt2 = Temporal.ZonedDateTime.from(
        "2024-03-15T14:42:12.789Z[UTC][u-ca=gregory]",
      );
      const result = isAfter(zdt1, zdt2, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with mixed input types", () => {
      const date1 = "2024-03-16T14:42:12.789Z";
      const date2 = new Date("2024-03-15T14:42:12.789Z");
      const result = isAfter(date1, date2, {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const result = isAfter("2024-03-15T19:00:00Z", "2024-03-15T14:00:00Z", {
        timeZone: "America/New_York",
      });
      expect(result).toBe(true);
    });

    test("should handle different timezones correctly", () => {
      const result = isAfter("2024-03-16T00:00:00Z", "2024-03-15T00:00:00Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar", () => {
      const result = isAfter(
        "2024-03-16T14:42:12.789Z",
        "2024-03-15T14:42:12.789Z",
        {
          calendar: "japanese",
        },
      );
      expect(result).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle milliseconds precision", () => {
      const result = isAfter(
        "2024-03-15T14:42:12.790Z",
        "2024-03-15T14:42:12.789Z",
        {
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle leap year dates", () => {
      const result = isAfter("2024-02-29T00:00:00Z", "2024-02-28T00:00:00Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should handle year boundaries", () => {
      const result = isAfter("2024-01-01T00:00:00Z", "2023-12-31T23:59:59Z", {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });
});
