import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { isPast } from "../isPast";

describe("isPast", () => {
  describe("with string input", () => {
    test("should return true for past date", () => {
      const result = isPast("2020-01-01T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(true);
    });

    test("should return false for future date", () => {
      const result = isPast("2030-01-01T00:00:00Z", { timeZone: "UTC" });
      expect(result).toBe(false);
    });
  });

  describe("with different input types", () => {
    test("should work with Date object", () => {
      const result = isPast(new Date("2020-01-01T00:00:00Z"), {
        timeZone: "UTC",
      });
      expect(result).toBe(true);
    });

    test("should work with epoch time", () => {
      const epoch = new Date("2020-01-01T00:00:00Z").getTime();
      const result = isPast(epoch, { timeZone: "UTC" });
      expect(result).toBe(true);
    });

    test("should work with ZonedDateTime", () => {
      const zdt = Temporal.ZonedDateTime.from(
        "2020-01-01T00:00:00Z[UTC][u-ca=gregory]",
      );
      const result = isPast(zdt, { timeZone: "UTC" });
      expect(result).toBe(true);
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const result = isPast("2020-01-01T00:00:00Z", {
        timeZone: "America/New_York",
      });
      expect(result).toBe(true);
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar", () => {
      const result = isPast("2020-01-01T00:00:00Z", {
        timeZone: "UTC",
        calendar: "japanese",
      });
      expect(result).toBe(true);
    });
  });
});
