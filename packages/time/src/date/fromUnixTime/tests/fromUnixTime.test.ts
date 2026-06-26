import { describe, expect, test } from "vitest";
import { fromUnixTime } from "../fromUnixTime";

describe("fromUnixTime", () => {
  describe("with unix timestamp", () => {
    test("should convert unix timestamp to date", () => {
      const timestamp = 1710513732;
      const result = fromUnixTime(timestamp, { timeZone: "UTC" });
      expect(result.value).toBe("2024-03-15T14:42:12Z");
    });

    test("should convert zero timestamp", () => {
      const result = fromUnixTime(0, { timeZone: "UTC" });
      expect(result.value).toBe("1970-01-01T00:00:00Z");
    });
  });

  describe("timezone handling", () => {
    test("should respect timezone", () => {
      const timestamp = 1710513732;
      const result = fromUnixTime(timestamp, {
        timeZone: "America/New_York",
      });
      expect(result.timeZone).toBe("America/New_York");
      expect(result.value).toContain("2024-03-15");
    });
  });

  describe("calendar handling", () => {
    test("should respect calendar", () => {
      const timestamp = 1710513732;
      const result = fromUnixTime(timestamp, { calendar: "japanese" });
      expect(result.calendar).toBe("japanese");
    });
  });

  describe("output methods", () => {
    test("asDate should return Date object", () => {
      const timestamp = 1710513732;
      const result = fromUnixTime(timestamp, { timeZone: "UTC" });
      const date = result.asDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe("2024-03-15T14:42:12.000Z");
    });

    test("asEpoch should return epoch timestamp", () => {
      const timestamp = 1710513732;
      const result = fromUnixTime(timestamp, { timeZone: "UTC" });
      expect(result.asEpoch()).toBe(1710513732000);
    });
  });
});
