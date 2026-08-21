import { Temporal } from "@js-temporal/polyfill";
import { afterEach, describe, expect, test } from "vitest";
import { getDateParts } from "../getDateParts";

const ISO_DATE = "2025-07-25";

const nativeDateTimeFormat = Intl.DateTimeFormat;

afterEach(() => {
  Intl.DateTimeFormat = nativeDateTimeFormat;
});

describe("getDateParts", () => {
  test("splits a date into numeric and localized parts", () => {
    const parts = getDateParts(ISO_DATE, {
      calendar: "gregory",
      locale: "en-US",
    });

    expect(parts).toMatchObject({
      calendar: "gregory",
      year: 2025,
      month: 7,
      monthCode: "M07",
      day: 25,
      isLeapMonth: false,
      dayOfMonth: "25",
      weekdayShort: "Fri",
      weekdayLong: "Friday",
      monthShort: "Jul",
      monthLong: "July",
      yearLabel: "2025",
    });
  });

  test("formats iso8601 dates with gregorian patterns", () => {
    const parts = getDateParts(ISO_DATE, {
      calendar: "iso8601",
      locale: "en-US",
    });

    expect(parts.calendar).toBe("iso8601");
    expect(parts.weekdayShort).toBe("Fri");
    expect(parts.monthLong).toBe("July");
  });

  test("reads numeric fields from the requested calendar", () => {
    const chinese = getDateParts(ISO_DATE, {
      calendar: "chinese",
      locale: "en-US",
    });
    const hebrew = getDateParts(ISO_DATE, {
      calendar: "hebrew",
      locale: "en-US",
    });

    expect(chinese).toMatchObject({
      day: 1,
      monthCode: "M06L",
      isLeapMonth: true,
      yearName: "yi-si",
    });
    expect(hebrew).toMatchObject({ year: 5785, day: 29, isLeapMonth: false });
  });

  test("localizes the same calendar per locale", () => {
    const enUs = getDateParts(ISO_DATE, {
      calendar: "chinese",
      locale: "en-US",
    });
    const zhCn = getDateParts(ISO_DATE, {
      calendar: "chinese",
      locale: "zh-CN",
    });

    expect(zhCn.day).toBe(enUs.day);
    expect(zhCn.monthLong).not.toBe(enUs.monthLong);
  });

  test("takes the day token from the calendar's own numbering", () => {
    expect(
      getDateParts("2026-08-21", { calendar: "chinese", locale: "zh-CN" }),
    ).toMatchObject({ monthLong: "\u4e03\u6708", dayOfMonth: "\u521d\u4e5d" });
    expect(
      getDateParts("2026-08-21", { calendar: "hebrew", locale: "he-IL" })
        .dayOfMonth,
    ).toBe("\u05d7\u05f3");
    expect(
      getDateParts("2026-08-21", { calendar: "gregory", locale: "en-US" })
        .dayOfMonth,
    ).toBe("21");
  });

  test("accepts every date input shape", () => {
    const expected = getDateParts(ISO_DATE, {
      calendar: "gregory",
      locale: "en-US",
      timeZone: "UTC",
    });

    const inputs = [
      "2025-07-25T13:45:00",
      new Date("2025-07-25T12:00:00Z"),
      Date.UTC(2025, 6, 25, 12),
      Temporal.PlainDate.from(ISO_DATE),
      Temporal.ZonedDateTime.from(`${ISO_DATE}T12:00:00[UTC]`),
    ];

    for (const input of inputs) {
      expect(
        getDateParts(input, {
          calendar: "gregory",
          locale: "en-US",
          timeZone: "UTC",
        }),
      ).toEqual(expected);
    }
  });

  test("expands a year-month string to its first day", () => {
    expect(
      getDateParts("2025-07", { calendar: "gregory", locale: "en-US" }).day,
    ).toBe(1);
  });

  test("labels lunisolar dates on runtimes whose ICU breaks Temporal", () => {
    const RealDateTimeFormat = Intl.DateTimeFormat;
    // Current Chrome renders the Chinese calendar's numeric month as "Mo6",
    // which the Temporal polyfill rejects with "Unexpected leap month suffix".
    Intl.DateTimeFormat = function patched(
      locale?: string,
      options?: Intl.DateTimeFormatOptions,
    ) {
      const formatter = new RealDateTimeFormat(locale, options);
      if (options?.calendar !== "chinese" || options.month !== "numeric") {
        return formatter;
      }
      return {
        ...formatter,
        format: (date?: Date) => formatter.format(date),
        formatToParts: (date?: Date) =>
          formatter
            .formatToParts(date)
            .map((part) =>
              part.type === "month"
                ? { ...part, value: `Mo${part.value}` }
                : part,
            ),
      } as Intl.DateTimeFormat;
    } as unknown as typeof Intl.DateTimeFormat;

    const parts = getDateParts("2027-03-14", {
      calendar: "chinese",
      locale: "zh-CN",
      timeZone: "UTC",
    });

    expect(`${parts.monthLong}${parts.dayOfMonth}`).toBe(
      "\u4e8c\u6708\u521d\u4e03",
    );
  });

  test("returns a cached instance per locale and calendar", () => {
    const first = getDateParts(ISO_DATE, {
      calendar: "gregory",
      locale: "en-US",
    });

    expect(
      getDateParts(ISO_DATE, { calendar: "gregory", locale: "en-US" }),
    ).toBe(first);
    expect(
      getDateParts(ISO_DATE, { calendar: "gregory", locale: "de-DE" }),
    ).not.toBe(first);
    expect(
      getDateParts(ISO_DATE, { calendar: "chinese", locale: "en-US" }),
    ).not.toBe(first);
  });
});
