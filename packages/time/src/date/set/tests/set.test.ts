import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { set } from "../set";

describe("set", () => {
  describe("with string input", () => {
    test("should set year", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { year: 2025 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2025-03-15T14:42:12.000Z");
    });

    test("should set month", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { month: 5 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-05-15T14:42:12.000Z");
    });

    test("should set day", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { day: 1 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-01T14:42:12.000Z");
    });

    test("should set hour", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { hour: 9 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T09:42:12.000Z");
    });

    test("should set minute", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { minute: 30 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T14:30:12.000Z");
    });

    test("should set second", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { second: 45 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T14:42:45.000Z");
    });

    test("should set millisecond", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { millisecond: 500 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T14:42:12.500Z");
    });

    test("should set multiple fields", () => {
      const result = set("2024-03-15T14:42:12Z", {
        fields: { year: 2025, month: 6, day: 1 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2025-06-01T14:42:12.000Z");
    });
  });

  describe("edge cases", () => {
    test("should handle month end correctly", () => {
      const result = set("2024-01-31T00:00:00Z", {
        fields: { month: 2 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-02-29T00:00:00.000Z");
    });

    test("should handle leap year correctly", () => {
      const result = set("2024-02-29T00:00:00Z", {
        fields: { year: 2025 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2025-02-28T00:00:00.000Z");
    });
  });

  describe("with different input types", () => {
    test("should work with Date objects", () => {
      const date = new Date("2024-03-15T14:42:12Z");
      const result = set(date, {
        fields: { year: 2025 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2025-03-15T14:42:12.000Z");
    });

    test("should work with epoch time", () => {
      const epoch = new Date("2024-03-15T14:42:12Z").getTime();
      const result = set(epoch, {
        fields: { year: 2025 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2025-03-15T14:42:12.000Z");
    });

    test("should work with ZonedDateTime", () => {
      const zdt = Temporal.ZonedDateTime.from(
        "2024-03-15T14:42:12Z[UTC][u-ca=gregory]",
      );
      const result = set(zdt, {
        fields: { year: 2025 },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2025-03-15T14:42:12.000Z");
    });
  });

  describe("timezone handling", () => {
    test("should set the field on the local clock, not on UTC", () => {
      const fields = { hour: 9 } as const;

      expect(
        set("2024-03-15T14:42:12Z", {
          fields,
          timeZone: "America/New_York",
        }).toISOString(),
      ).toBe("2024-03-15T13:42:12.000Z");

      expect(
        set("2024-03-15T14:42:12Z", { fields, timeZone: "UTC" }).toISOString(),
      ).toBe("2024-03-15T09:42:12.000Z");
    });
  });

  describe("calendar handling", () => {
    test("should set the year in the given calendar's era", () => {
      const options = { fields: { year: 2025 }, timeZone: "UTC" } as const;

      expect(
        set("2024-03-15T14:42:12Z", {
          ...options,
          calendar: "islamic",
        }).toISOString(),
      ).toBe("2586-12-06T14:42:12.000Z");

      expect(
        set("2024-03-15T14:42:12Z", {
          ...options,
          calendar: "iso8601",
        }).toISOString(),
      ).toBe("2025-03-15T14:42:12.000Z");
    });
  });
});
