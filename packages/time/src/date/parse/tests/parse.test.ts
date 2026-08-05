import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { parse } from "../parse";

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
  timeZone: "America/New_York",
});

const timeOnlyFormat = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "America/New_York",
});

describe("parse", () => {
  beforeEach(() => {
    vi.stubEnv("TZ", "America/New_York");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should parse a valid year only date string", () => {
    const date = parse("2021");
    expect(dateTimeFormat.format(date)).toBe("01/01/2021, 12:00:00 AM EST");
  });

  test("should parse a valid year and month only date string", () => {
    const date = parse("2021-03");
    expect(dateTimeFormat.format(date)).toBe("03/01/2021, 12:00:00 AM EST");
  });

  test("should parse a valid year, month and day only date string", () => {
    const date = parse("2021-03-12");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 12:00:00 AM EST");
  });

  test("should cast date only string to UTC", () => {
    const date = parse("2021-03-12TZ");
    expect(dateTimeFormat.format(date)).toBe("03/11/2021, 07:00:00 PM EST");
  });

  test("should cast date only string to offset", () => {
    const date = parse("2021-03-12T-07:00");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 02:00:00 AM EST");
  });

  test("should parse a valid year, month, day and hour only date/time string with separator", () => {
    const date = parse("2021-03-12T14");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 02:00:00 PM EST");
  });

  test("should parse a valid year, month, day and hour only date/time string without separator", () => {
    const date = parse("2021-03-12 16");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 04:00:00 PM EST");
  });

  test("should parse a valid year, month, day, hour and minute only date/time string", () => {
    const date = parse("2021-03-12T14:42");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 02:42:00 PM EST");
  });

  test("should parse a valid year, month, day, hour, minute and seconds only date/time string", () => {
    const date = parse("2021-03-12T14:42:12");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 02:42:12 PM EST");
  });

  test("should parse a valid UTC date/time string", () => {
    const date = parse("2021-03-12T14:42:12Z");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 09:42:12 AM EST");
  });

  test("should parse a valid UTC date/time string with lower case separator and zulu", () => {
    const date = parse("2021-03-12t14:42:12z");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 09:42:12 AM EST");
  });

  test("should parse a valid date/time string with offset", () => {
    const date = parse("2021-03-12T14:42:12+09:00");
    expect(dateTimeFormat.format(date)).toBe("03/12/2021, 12:42:12 AM EST");
  });

  test("should parse a valid epoch date/time", () => {
    const date = parse(1711639239717);
    expect(dateTimeFormat.format(date)).toBe("03/28/2024, 11:20:39 AM EDT");
  });

  test("should parse a valid hour and minute time string", () => {
    const date = parse("14:00");
    expect(timeOnlyFormat.format(date)).toBe("02:00:00 PM");
  });

  test("should parse a valid hour, minute and second time string", () => {
    const date = parse("14:14:34");
    expect(timeOnlyFormat.format(date)).toBe("02:14:34 PM");
  });

  test("should parse a valid hour, minute and second time string with meridiem", () => {
    const date = parse("08:14:34 PM");
    expect(timeOnlyFormat.format(date)).toBe("08:14:34 PM");
  });

  test("should throw an error for an invalid date string", () => {
    expect(() => parse("2021-15-37")).toThrowError(
      '"2021-15-37" is an invalid RFC339 Internet Date Time string',
    );
  });

  test("should throw an error for an invalid time string", () => {
    expect(() => parse("27:62")).toThrowError(
      '"27:62" is an invalid RFC339 Internet Date Time string',
    );
  });

  test("should throw an error for an invalid time string", () => {
    expect(() => parse("14:12 PM")).toThrowError(
      '"14:12 PM" is an invalid time string',
    );
  });

  test("should throw an error for an invalid epoch", () => {
    expect(() => parse(9274309587123413)).toThrowError(
      '"9274309587123412" is an invalid epoch date value',
    );
  });
});
