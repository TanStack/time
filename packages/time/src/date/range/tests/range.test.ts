import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { range } from "../range";

describe("range", () => {
  describe("with day intervals", () => {
    test("should generate daily range", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-05T00:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(5);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-02T00:00:00Z");
      expect(result[2]!.value).toBe("2024-03-03T00:00:00Z");
      expect(result[3]!.value).toBe("2024-03-04T00:00:00Z");
      expect(result[4]!.value).toBe("2024-03-05T00:00:00Z");
    });

    test("should generate range with 2-day intervals", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-07T00:00:00Z",
        step: { days: 2 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(4);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-03T00:00:00Z");
      expect(result[2]!.value).toBe("2024-03-05T00:00:00Z");
      expect(result[3]!.value).toBe("2024-03-07T00:00:00Z");
    });
  });

  describe("with hour intervals", () => {
    test("should generate hourly range", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-01T03:00:00Z",
        step: { hours: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(4);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-01T01:00:00Z");
      expect(result[2]!.value).toBe("2024-03-01T02:00:00Z");
      expect(result[3]!.value).toBe("2024-03-01T03:00:00Z");
    });

    test("should generate range with 6-hour intervals", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-02T00:00:00Z",
        step: { hours: 6 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(5);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-01T06:00:00Z");
      expect(result[2]!.value).toBe("2024-03-01T12:00:00Z");
      expect(result[3]!.value).toBe("2024-03-01T18:00:00Z");
      expect(result[4]!.value).toBe("2024-03-02T00:00:00Z");
    });
  });

  describe("with week intervals", () => {
    test("should generate weekly range", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-29T00:00:00Z",
        step: { weeks: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(5);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-08T00:00:00Z");
      expect(result[2]!.value).toBe("2024-03-15T00:00:00Z");
      expect(result[3]!.value).toBe("2024-03-22T00:00:00Z");
      expect(result[4]!.value).toBe("2024-03-29T00:00:00Z");
    });
  });

  describe("with month intervals", () => {
    test("should generate monthly range", () => {
      const result = range({
        start: "2024-01-15T00:00:00Z",
        end: "2024-05-15T00:00:00Z",
        step: { months: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(5);
      expect(result[0]!.value).toBe("2024-01-15T00:00:00Z");
      expect(result[1]!.value).toBe("2024-02-15T00:00:00Z");
      expect(result[2]!.value).toBe("2024-03-15T00:00:00Z");
      expect(result[3]!.value).toBe("2024-04-15T00:00:00Z");
      expect(result[4]!.value).toBe("2024-05-15T00:00:00Z");
    });
  });

  describe("with minute intervals", () => {
    test("should generate range with 15-minute intervals", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-01T01:00:00Z",
        step: { minutes: 15 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(5);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-01T00:15:00Z");
      expect(result[2]!.value).toBe("2024-03-01T00:30:00Z");
      expect(result[3]!.value).toBe("2024-03-01T00:45:00Z");
      expect(result[4]!.value).toBe("2024-03-01T01:00:00Z");
    });
  });

  describe("with combined intervals", () => {
    test("should generate range with days and hours", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-03T12:00:00Z",
        step: { days: 1, hours: 6 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(3);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-02T06:00:00Z");
      expect(result[2]!.value).toBe("2024-03-03T12:00:00Z");
    });
  });

  describe("backward ranges", () => {
    test("should generate backward daily range", () => {
      const result = range({
        start: "2024-03-05T00:00:00Z",
        end: "2024-03-01T00:00:00Z",
        step: { days: -1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(5);
      expect(result[0]!.value).toBe("2024-03-05T00:00:00Z");
      expect(result[1]!.value).toBe("2024-03-04T00:00:00Z");
      expect(result[2]!.value).toBe("2024-03-03T00:00:00Z");
      expect(result[3]!.value).toBe("2024-03-02T00:00:00Z");
      expect(result[4]!.value).toBe("2024-03-01T00:00:00Z");
    });

    test("should generate backward hourly range", () => {
      const result = range({
        start: "2024-03-01T03:00:00Z",
        end: "2024-03-01T00:00:00Z",
        step: { hours: -1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(4);
      expect(result[0]!.value).toBe("2024-03-01T03:00:00Z");
      expect(result[1]!.value).toBe("2024-03-01T02:00:00Z");
      expect(result[2]!.value).toBe("2024-03-01T01:00:00Z");
      expect(result[3]!.value).toBe("2024-03-01T00:00:00Z");
    });
  });

  describe("edge cases", () => {
    test("should return single item when start equals end", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-01T00:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(1);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
    });

    test("should throw error for zero step", () => {
      expect(() =>
        range({
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-05T00:00:00Z",
          step: { days: 0 },
          timeZone: "UTC",
        }),
      ).toThrow("Step duration cannot be zero");
    });

    test("should throw error for negative step with forward range", () => {
      expect(() =>
        range({
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-05T00:00:00Z",
          step: { days: -1 },
          timeZone: "UTC",
        }),
      ).toThrow("Step must be positive when start is before or equal to end");
    });

    test("should throw error for positive step with backward range", () => {
      expect(() =>
        range({
          start: "2024-03-05T00:00:00Z",
          end: "2024-03-01T00:00:00Z",
          step: { days: 1 },
          timeZone: "UTC",
        }),
      ).toThrow("Step must be negative when start is after end");
    });

    test("should handle range that does not land exactly on end", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-04T12:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(4);
      expect(result[3]!.value).toBe("2024-03-04T00:00:00Z");
    });
  });

  describe("with different input types", () => {
    test("should work with Date objects", () => {
      const result = range({
        start: new Date("2024-03-01T00:00:00Z"),
        end: new Date("2024-03-03T00:00:00Z"),
        step: { days: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(3);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
    });

    test("should work with epoch timestamps", () => {
      const startEpoch = new Date("2024-03-01T00:00:00Z").getTime();
      const endEpoch = new Date("2024-03-03T00:00:00Z").getTime();

      const result = range({
        start: startEpoch,
        end: endEpoch,
        step: { days: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(3);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
    });

    test("should work with ZonedDateTime", () => {
      const startZdt = Temporal.ZonedDateTime.from(
        "2024-03-01T00:00:00Z[UTC][u-ca=gregory]",
      );
      const endZdt = Temporal.ZonedDateTime.from(
        "2024-03-03T00:00:00Z[UTC][u-ca=gregory]",
      );

      const result = range({
        start: startZdt,
        end: endZdt,
        step: { days: 1 },
        timeZone: "UTC",
      });

      expect(result).toHaveLength(3);
      expect(result[0]!.value).toBe("2024-03-01T00:00:00Z");
    });
  });

  describe("output methods", () => {
    test("asDate should return Date objects", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-02T00:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
      });

      const date = result[0]!.asDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    });

    test("asEpoch should return epoch timestamps", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-02T00:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
      });

      const epoch = result[0]!.asEpoch();
      expect(typeof epoch).toBe("number");
      expect(epoch).toBe(new Date("2024-03-01T00:00:00Z").getTime());
    });

    test("asZonedDateTime should return ZonedDateTime instances", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-02T00:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
      });

      const zdt = result[0]!.asZonedDateTime();
      expect(zdt).toBeInstanceOf(Temporal.ZonedDateTime);
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-03T00:00:00Z",
        step: { days: 1 },
        timeZone: "America/New_York",
      });

      expect(result).toHaveLength(3);
    });
  });

  describe("returnFormat", () => {
    test("should return long format when specified", () => {
      const result = range({
        start: "2024-03-01T00:00:00Z",
        end: "2024-03-02T00:00:00Z",
        step: { days: 1 },
        timeZone: "UTC",
        calendar: "gregory",
        returnFormat: "long",
      });

      expect(result[0]!.value).toContain("[UTC]");
      expect(result[0]!.value).toContain("[u-ca=gregory]");
    });
  });
});
