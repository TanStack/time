import { describe, expect, test } from "vitest";
import { fromUnixTime } from "../fromUnixTime";

describe("fromUnixTime", () => {
  describe("with unix timestamp", () => {
    test("should convert unix timestamp to date", () => {
      const timestamp = 1710513732;
      const result = fromUnixTime(timestamp, { timeZone: "UTC" });
      expect(result.toISOString()).toBe("2024-03-15T14:42:12.000Z");
    });

    test("should convert zero timestamp", () => {
      const result = fromUnixTime(0, { timeZone: "UTC" });
      expect(result.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    });
  });

  describe("output", () => {
    test("should return the instant as a Date", () => {
      const result = fromUnixTime(1710513732, { timeZone: "UTC" });

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2024-03-15T14:42:12.000Z");
      expect(result.getTime()).toBe(1710513732000);
    });

    test("should ignore the timezone, an epoch already names the instant", () => {
      expect(
        fromUnixTime(1710513732, { timeZone: "America/New_York" }).getTime(),
      ).toBe(fromUnixTime(1710513732, { timeZone: "Asia/Tokyo" }).getTime());
    });
  });
});
