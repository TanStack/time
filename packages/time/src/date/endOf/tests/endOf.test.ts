import { describe, expect, test } from "vitest";
import { endOf } from "../endOf";

describe("endOf", () => {
  describe("with string input", () => {
    test("should return end of year", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", {
        unit: "year",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-12-31T23:59:59.999Z");
    });

    test("should return end of month", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", {
        unit: "month",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-31T23:59:59.999Z");
    });

    test("should return end of day", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", {
        unit: "day",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T23:59:59.999Z");
    });

    test("should return end of hour", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", { unit: "hour" });
      expect(result.toISOString()).toContain("2024-03-15T14:59:59.999");
    });

    test("should return end of minute", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", { unit: "minute" });
      expect(result.toISOString()).toContain("2024-03-15T14:42:59.999");
    });

    test("should return end of second", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", { unit: "second" });
      expect(result.toISOString()).toContain("2024-03-15T14:42:12.999");
    });

    test("should return end of millisecond", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", { unit: "millisecond" });
      expect(result.toISOString()).toContain("2024-03-15T14:42:12.789");
    });
  });

  describe("week calculation", () => {
    test("should return end of week (Sunday)", () => {
      const result = endOf("2024-03-15T14:42:12.789Z", {
        unit: "week",
        timeZone: "UTC",
      });
      const resultDate = result;
      expect(resultDate.getUTCDay()).toBe(0);
      expect(result.toISOString()).toContain("2024-03-17");
      expect(result.toISOString()).toContain("23:59:59.999");
    });

    test("should return end of week for Sunday", () => {
      const result = endOf("2024-03-17T14:42:12.789Z", {
        unit: "week",
        timeZone: "UTC",
      });
      const resultDate = result;
      expect(resultDate.getUTCDay()).toBe(0);
      expect(result.toISOString()).toContain("2024-03-17");
      expect(result.toISOString()).toContain("23:59:59.999");
    });

    test("should return end of week for Monday", () => {
      const result = endOf("2024-03-11T14:42:12.789Z", {
        unit: "week",
        timeZone: "UTC",
      });
      const resultDate = result;
      expect(resultDate.getUTCDay()).toBe(0);
      expect(result.toISOString()).toContain("2024-03-17");
    });
  });

  describe("edge cases", () => {
    test("should handle end of year for December 31st", () => {
      const result = endOf("2024-12-31T00:00:00Z", {
        unit: "year",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-12-31T23:59:59.999Z");
    });

    test("should handle end of month for last day", () => {
      const result = endOf("2024-03-31T00:00:00Z", {
        unit: "month",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-31T23:59:59.999Z");
    });

    test("should handle end of month for February in leap year", () => {
      const result = endOf("2024-02-15T00:00:00Z", {
        unit: "month",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-02-29T23:59:59.999Z");
    });

    test("should handle end of month for February in non-leap year", () => {
      const result = endOf("2023-02-15T00:00:00Z", {
        unit: "month",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2023-02-28T23:59:59.999Z");
    });

    test("should handle end of day at 23:59:59", () => {
      const result = endOf("2024-03-15T23:59:59Z", {
        unit: "day",
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T23:59:59.999Z");
    });

    test("should handle end of hour at 59:59", () => {
      const result = endOf("2024-03-15T14:59:59Z", { unit: "hour" });
      expect(result.toISOString()).toContain("2024-03-15T14:59:59.999");
    });
  });
});
