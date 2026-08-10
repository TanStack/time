import { describe, expect, test } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { clamp } from "../clamp";

describe("clamp", () => {
  describe("with string input", () => {
    test("should return date when within range", () => {
      const result = clamp("2024-03-15T00:00:00Z", {
        range: {
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-31T00:00:00Z",
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-15T00:00:00.000Z");
    });

    test("should clamp to start when before range", () => {
      const result = clamp("2024-02-15T00:00:00Z", {
        range: {
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-31T00:00:00Z",
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    });

    test("should clamp to end when after range", () => {
      const result = clamp("2024-04-15T00:00:00Z", {
        range: {
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-31T00:00:00Z",
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-31T00:00:00.000Z");
    });

    test("should clamp to start when equal to start", () => {
      const result = clamp("2024-03-01T00:00:00Z", {
        range: {
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-31T00:00:00Z",
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    });

    test("should clamp to end when equal to end", () => {
      const result = clamp("2024-03-31T00:00:00Z", {
        range: {
          start: "2024-03-01T00:00:00Z",
          end: "2024-03-31T00:00:00Z",
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-31T00:00:00.000Z");
    });
  });

  describe("with different input types", () => {
    test("should work with Date objects", () => {
      const result = clamp(new Date("2024-02-15T00:00:00Z"), {
        range: {
          start: new Date("2024-03-01T00:00:00Z"),
          end: new Date("2024-03-31T00:00:00Z"),
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    });

    test("should work with epoch time", () => {
      const result = clamp(new Date("2024-02-15T00:00:00Z").getTime(), {
        range: {
          start: new Date("2024-03-01T00:00:00Z").getTime(),
          end: new Date("2024-03-31T00:00:00Z").getTime(),
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    });

    test("should work with ZonedDateTime", () => {
      const zdt = Temporal.ZonedDateTime.from(
        "2024-02-15T00:00:00Z[UTC][u-ca=gregory]",
      );
      const result = clamp(zdt, {
        range: {
          start: Temporal.ZonedDateTime.from(
            "2024-03-01T00:00:00Z[UTC][u-ca=gregory]",
          ),
          end: Temporal.ZonedDateTime.from(
            "2024-03-31T00:00:00Z[UTC][u-ca=gregory]",
          ),
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    });
  });

  describe("edge cases", () => {
    test("should handle single day range", () => {
      const result = clamp("2024-03-15T00:00:00Z", {
        range: {
          start: "2024-03-10T00:00:00Z",
          end: "2024-03-10T00:00:00Z",
        },
        timeZone: "UTC",
      });
      expect(result.toISOString()).toBe("2024-03-10T00:00:00.000Z");
    });
  });
});
