import { Temporal } from "@js-temporal/polyfill";
import { getWeekInfo } from "../polyfills/getWeekInfo";

export function getFirstDayOfMonth(yearMonth: string): Temporal.PlainDate {
  const [year, month] = yearMonth.split("-").map(Number);
  if (!year || !month) {
    throw new Error(`Invalid yearMonth format: ${yearMonth}. Expected YYYY-MM`);
  }
  return Temporal.PlainDate.from({ year, month, day: 1 });
}

export function getFirstDayOfWeek(
  dateString: string,
  locale: string,
): Temporal.PlainDate {
  const date = Temporal.PlainDate.from(dateString);
  const weekInfo = getWeekInfo(locale);
  const firstDayOfWeek = weekInfo.firstDay;
  const dayOfWeek = date.dayOfWeek;
  const daysToSubtract = (dayOfWeek - firstDayOfWeek + 7) % 7;

  return date.subtract({ days: daysToSubtract });
}
