import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { isSameOrAfter } from "../isSameOrAfter";

describe("isSameOrAfter", () => {
  describe("with string inputs", () => {
    test("should return true when first date is after second date at day level", () => {
      const result = isSameOrAfter(
        "2024-03-16T14:42:12.789Z",
        "2024-03-15T14:42:12.789Z",
        {
          unit: "day",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should return true when dates are equal at day level", () => {
      const result = isSameOrAfter(
        "2024-03-15T23:59:59Z",
        "2024-03-15T10:00:00Z",
        {
          unit: "day",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should return false when first date is before second date at day level", () => {
      const result = isSameOrAfter(
        "2024-03-15T14:42:12.789Z",
        "2024-03-16T14:42:12.789Z",
        {
          unit: "day",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(false);
    });

    test("should handle year level comparison", () => {
      const result = isSameOrAfter(
        "2024-12-31T23:59:59Z",
        "2024-01-01T00:00:00Z",
        {
          unit: "year",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle month level comparison", () => {
      const result = isSameOrAfter(
        "2024-03-31T23:59:59Z",
        "2024-03-01T00:00:00Z",
        {
          unit: "month",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle week level comparison", () => {
      const result = isSameOrAfter(
        "2024-03-17T23:59:59Z",
        "2024-03-11T00:00:00Z",
        {
          unit: "week",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle hour level comparison", () => {
      const result = isSameOrAfter(
        "2024-03-15T14:59:59Z",
        "2024-03-15T14:00:00Z",
        {
          unit: "hour",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });
  });

  describe("with different input types", () => {
    test("should work with Date objects", () => {
      const date1 = new Date("2024-03-15T23:59:59Z");
      const date2 = new Date("2024-03-15T10:00:00Z");
      const result = isSameOrAfter(date1, date2, {
        unit: "day",
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with epoch time", () => {
      const date1 = new Date("2024-03-15T23:59:59Z").getTime();
      const date2 = new Date("2024-03-15T10:00:00Z").getTime();
      const result = isSameOrAfter(date1, date2, {
        unit: "day",
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with ZonedDateTime", () => {
      const zdt1 = Temporal.ZonedDateTime.from(
        "2024-03-15T23:59:59Z[UTC][u-ca=gregory]",
      );
      const zdt2 = Temporal.ZonedDateTime.from(
        "2024-03-15T10:00:00Z[UTC][u-ca=gregory]",
      );
      const result = isSameOrAfter(zdt1, zdt2, {
        unit: "day",
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const result = isSameOrAfter(
        "2024-03-15T19:00:00Z",
        "2024-03-15T14:00:00Z",
        {
          unit: "day",
          timeZone: "America/New_York",
        },
      );
      expect(result).toBe(true);
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar", () => {
      const result = isSameOrAfter(
        "2024-03-15T23:59:59Z",
        "2024-03-15T10:00:00Z",
        {
          unit: "day",
          calendar: "japanese",
        },
      );
      expect(result).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle different years correctly", () => {
      const result = isSameOrAfter(
        "2024-01-01T00:00:00Z",
        "2023-12-31T23:59:59Z",
        {
          unit: "year",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });

    test("should handle leap year dates", () => {
      const result = isSameOrAfter(
        "2024-02-29T00:00:00Z",
        "2024-02-28T00:00:00Z",
        {
          unit: "day",
          timeZone: "UTC",
        },
      );
      expect(result).toBe(true);
    });
  });
});
