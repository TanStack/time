import { Store } from "@tanstack/store";
import { Temporal } from "@js-temporal/polyfill";
import {
  constrainDateToRange,
  getFirstDayOfMonth,
  getFirstDayOfWeek,
  isDateInRange,
  parseDateRange,
} from "../utils";
import { getDateTimeDefaults } from "../utils/dateDefaults";
import { buildDateFormatter } from "../formatter/buildDateFormatter";
import { buildDateTimeFormatter } from "../formatter/buildDateTimeFormatter";
import { buildTimeFormatter } from "../formatter/buildTimeFormatter";
import { getTimeClient } from "../client";
import { generateDateRange } from "./generateDateRange";
import type { ParsedDateRange } from "../utils/dateRange";
import type { CalendarStore, DateRange, ViewMode } from "./types";
import type { DateInput } from "~/date";

function toTemporalPlainDateString(date: DateInput): string {
  if (date instanceof Temporal.PlainDate) {
    return date.toString({ calendarName: "never" });
  }
  if (date instanceof Temporal.ZonedDateTime) {
    return date.toPlainDate().toString({ calendarName: "never" });
  }
  if (date instanceof Date) {
    return date.toISOString().split("T")[0]!;
  }
  if (typeof date === "number") {
    return new Date(date).toISOString().split("T")[0]!;
  }
  return date;
}

function toDate(date: DateInput): Date {
  if (date instanceof Date) {
    return date;
  }
  if (date instanceof Temporal.ZonedDateTime) {
    return new Date(date.toPlainDate().toString({ calendarName: "auto" }));
  }
  if (date instanceof Temporal.PlainDate) {
    return new Date(date.year, date.month - 1, date.day);
  }
  return new Date(date);
}

/**
 * Base options interface for date-related core classes.
 */
export interface DateCoreOptions {
  /** The initial view mode configuration. */
  viewMode: ViewMode;
  /** Optional locale for date formatting. Uses a BCP 47 language tag. */
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
  /** Optional time zone specification. */
  timeZone?: Temporal.TimeZoneLike;
  /** Optional calendar system to be used. */
  calendar?: Temporal.CalendarLike;
  /** Optional range of dates to be used. */
  range?: DateRange;
  /** Optional date formatter. */
  dateFormatter?: Intl.DateTimeFormat;
  /** Optional time formatter. */
  timeFormatter?: Intl.DateTimeFormat;
  /** Optional date time formatter. */
  dateTimeFormatter?: Intl.DateTimeFormat;
}

export interface ParsedDateCoreOptions
  extends Omit<
    Required<DateCoreOptions>,
    "range" | "dateFormatter" | "timeFormatter" | "dateTimeFormatter"
  > {
  range: ParsedDateRange;
}

export abstract class DateCore {
  store: Store<CalendarStore>;
  options: ParsedDateCoreOptions;
  formatters: {
    date: Intl.DateTimeFormat;
    time: Intl.DateTimeFormat;
    dateTime: Intl.DateTimeFormat;
  };
  constructor(options: DateCoreOptions) {
    const defaults = getDateTimeDefaults();
    const parsedRange = parseDateRange({
      range: options.range,
      calendar: defaults.calendar,
    });

    this.options = {
      ...defaults,
      ...options,
      range: parsedRange,
    };

    this.formatters = {
      date:
        options.dateFormatter ??
        buildDateFormatter({
          locale: this.options.locale,
        }),
      time:
        options.timeFormatter ??
        buildTimeFormatter({
          locale: this.options.locale,
        }),
      dateTime:
        options.dateTimeFormatter ??
        buildDateTimeFormatter({
          locale: this.options.locale,
        }),
    };

    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar);
    const initialDate = constrainDateToRange({
      date: now,
      range: this.options.range,
    });

    this.store = new Store<CalendarStore>({
      currentPeriod: initialDate,
      activeDate: initialDate,
      viewMode: options.viewMode,
      eventsVersion: 0,
      isPending: false,
    });
  }

  formatDate(date: DateInput) {
    return this.formatters.date.format(toDate(date));
  }

  formatTime(date: DateInput) {
    return this.formatters.time.format(toDate(date));
  }

  formatDateTime(date: DateInput) {
    return this.formatters.dateTime.format(toDate(date));
  }

  protected getFirstDayOfMonth() {
    return getFirstDayOfMonth(
      this.store.state.currentPeriod
        .toString({ calendarName: "auto" })
        .substring(0, 7),
    );
  }

  protected getFirstDayOfWeek() {
    return getFirstDayOfWeek(
      this.store.state.currentPeriod.toString(),
      this.options.locale,
    );
  }

  getWeekStartsOn() {
    return this.getFirstDayOfWeek().dayOfWeek;
  }

  protected getCalendarDays() {
    let start: Temporal.PlainDate;
    switch (this.store.state.viewMode.unit) {
      case "month":
        start = this.getFirstDayOfMonth().subtract({
          days:
            (this.getFirstDayOfMonth().dayOfWeek -
              (this.getFirstDayOfWeek().dayOfWeek + 1) +
              7) %
            7,
        });
        break;
      case "week":
      case "workWeek":
        start = this.getFirstDayOfWeek();
        break;
      case "day":
      default:
        start = this.store.state.currentPeriod;
        break;
    }

    let end: Temporal.PlainDate;
    switch (this.store.state.viewMode.unit) {
      case "month": {
        const lastDayOfMonth = this.getFirstDayOfMonth()
          .add({ months: this.store.state.viewMode.value })
          .subtract({ days: 1 });
        const lastDayOfMonthWeekDay =
          (lastDayOfMonth.dayOfWeek -
            (this.getFirstDayOfWeek().dayOfWeek + 1) +
            7) %
          7;
        end = lastDayOfMonth.add({ days: 6 - lastDayOfMonthWeekDay });
        break;
      }
      case "week": {
        end = this.getFirstDayOfWeek().add({
          days: 7 * this.store.state.viewMode.value - 1,
        });
        break;
      }
      case "day": {
        end = this.store.state.currentPeriod.add({
          days: this.store.state.viewMode.value - 1,
        });
        break;
      }
      case "workWeek": {
        end = start.add({ days: 4 });
        break;
      }
    }

    const allDays = generateDateRange(start.toString(), end.toString());

    if (this.store.state.viewMode.unit === "month") {
      const startMonthDate = this.store.state.currentPeriod.with({ day: 1 });
      const endMonthDate = this.store.state.currentPeriod
        .add({
          months: this.store.state.viewMode.value - 1,
        })
        .with({
          day: Temporal.PlainDate.from(
            this.store.state.currentPeriod.toString({ calendarName: "auto" }),
          ).daysInMonth,
        });

      const filteredDays = allDays.filter(
        (day) =>
          Temporal.PlainDate.compare(day, startMonthDate) >= 0 &&
          Temporal.PlainDate.compare(day, endMonthDate) <= 0,
      );

      if (this.options.range.start || this.options.range.end) {
        return filteredDays.filter((day) =>
          isDateInRange({ date: day, range: this.options.range }),
        );
      }

      return filteredDays;
    }

    if (this.options.range.start || this.options.range.end) {
      return allDays.filter((day) =>
        isDateInRange({ date: day, range: this.options.range }),
      );
    }

    return allDays;
  }

  getDaysNames(weekday: "long" | "short" = "short") {
    const baseDate = Temporal.PlainDate.from("2024-01-01");
    const firstDayOfWeek = this.getFirstDayOfWeek().dayOfWeek;

    return Array.from({ length: 7 }).map((_, i) =>
      baseDate
        .add({ days: (i + (firstDayOfWeek - 1)) % 7 })
        .toLocaleString(this.options.locale, { weekday: weekday }),
    );
  }

  changeViewMode(newViewMode: ViewMode) {
    this.store.setState((prev) => ({
      ...prev,
      viewMode: newViewMode,
    }));

    getTimeClient().emit("calendar:viewMode:changed", {
      viewMode: {
        value: newViewMode.value,
        unit: newViewMode.unit,
      },
    });
  }

  goToPreviousPeriod() {
    let newActiveDate: Temporal.PlainDate;

    switch (this.store.state.viewMode.unit) {
      case "month": {
        newActiveDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        });
        break;
      }

      case "week": {
        newActiveDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        });
        break;
      }

      case "day": {
        newActiveDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        });
        break;
      }
      case "workWeek": {
        newActiveDate = this.store.state.activeDate.subtract({
          days: 5,
        });
        break;
      }
    }

    const constrainedDate = constrainDateToRange({
      date: newActiveDate,
      range: this.options.range,
    });
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }));

    getTimeClient().emit("calendar:navigate", {
      direction: "previous",
      targetDate: constrainedDate.toString({ calendarName: "never" }),
    });
  }

  goToNextPeriod() {
    let newActiveDate: Temporal.PlainDate;

    switch (this.store.state.viewMode.unit) {
      case "month": {
        newActiveDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        });
        break;
      }

      case "week": {
        newActiveDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        });
        break;
      }

      case "day": {
        newActiveDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        });
        break;
      }
      case "workWeek": {
        newActiveDate = this.store.state.activeDate.add({
          days: 5,
        });
        break;
      }
    }

    const constrainedDate = constrainDateToRange({
      date: newActiveDate,
      range: this.options.range,
    });
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }));

    getTimeClient().emit("calendar:navigate", {
      direction: "next",
      targetDate: constrainedDate.toString({ calendarName: "never" }),
    });
  }

  goToCurrentPeriod() {
    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar);
    const constrainedDate = constrainDateToRange({
      date: now,
      range: this.options.range,
    });
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }));

    getTimeClient().emit("calendar:navigate", {
      direction: "current",
      targetDate: constrainedDate.toString({ calendarName: "never" }),
    });
  }

  goToSpecificPeriod(date: DateInput) {
    const dateStr = toTemporalPlainDateString(date);
    const targetDate = Temporal.PlainDate.from(dateStr).withCalendar(
      this.options.calendar,
    );
    const constrainedDate = constrainDateToRange({
      date: targetDate,
      range: this.options.range,
    });
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }));

    getTimeClient().emit("calendar:navigate", {
      direction: "specific",
      targetDate: constrainedDate.toString({ calendarName: "never" }),
    });
  }

  canGoPreviousPeriod(): boolean {
    let previousDate: Temporal.PlainDate;

    switch (this.store.state.viewMode.unit) {
      case "month": {
        previousDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        });
        break;
      }
      case "week": {
        previousDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        });
        break;
      }
      case "day": {
        previousDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        });
        break;
      }
      case "workWeek": {
        previousDate = this.store.state.activeDate.subtract({ days: 5 });
        break;
      }
    }

    return isDateInRange({ date: previousDate, range: this.options.range });
  }

  canGoNextPeriod(): boolean {
    let nextDate: Temporal.PlainDate;

    switch (this.store.state.viewMode.unit) {
      case "month": {
        nextDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        });
        break;
      }
      case "week": {
        nextDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        });
        break;
      }
      case "day": {
        nextDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        });
        break;
      }
      case "workWeek": {
        nextDate = this.store.state.activeDate.add({ days: 5 });
        break;
      }
    }

    return isDateInRange({ date: nextDate, range: this.options.range });
  }
}
