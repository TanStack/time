import { Temporal } from "@js-temporal/polyfill";
import { getWeekInfo } from "../polyfills/getWeekInfo";
import type { Day, Event, Resource } from "./types";

const plainDateOf = (isoDate: string): Temporal.PlainDate =>
  Temporal.PlainDate.from(isoDate);

const filler = <TResource extends Resource, TEvent extends Event<TResource>>(
  date: Temporal.PlainDate,
): Day<TResource, TEvent> => ({
  isoDate: date.toString({ calendarName: "never" }),
  events: [],
  allDayEvents: [],
  isToday: false,
  isInCurrentPeriod: false,
});

interface GroupDaysByBaseProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  days: Array<Day<TResource, TEvent> | null>;
  weekStartsOn: number;
  locale: string;
}

type GroupDaysByMonthProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = GroupDaysByBaseProps<TResource, TEvent> & {
  unit: "month";
  fillMissingDays?: never;
};

type GroupDaysByWeekProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = GroupDaysByBaseProps<TResource, TEvent> & {
  unit: "week" | "workWeek";
  fillMissingDays?: boolean;
};

export type GroupDaysByProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> =
  | GroupDaysByMonthProps<TResource, TEvent>
  | GroupDaysByWeekProps<TResource, TEvent>;

export const groupDaysBy = <
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>({
  days,
  unit,
  fillMissingDays = true,
  weekStartsOn,
  locale,
}: GroupDaysByProps<TResource, TEvent>): Array<
  Array<Day<TResource, TEvent> | null>
> => {
  const groups: Array<Array<Day<TResource, TEvent> | null>> = [];
  const { weekend } = getWeekInfo(locale);

  switch (unit) {
    case "week": {
      const weeks: Array<Array<Day<TResource, TEvent> | null>> = [];
      let currentWeek: Array<Day<TResource, TEvent> | null> = [];

      days.forEach((day) => {
        const dayDate = day ? plainDateOf(day.isoDate) : null;
        if (currentWeek.length === 0 && dayDate?.dayOfWeek !== weekStartsOn) {
          if (dayDate) {
            const dayOfWeek = (dayDate.dayOfWeek - weekStartsOn + 7) % 7;
            for (let i = 0; i < dayOfWeek; i++) {
              const newDate = dayDate.subtract({ days: dayOfWeek - i });
              currentWeek.push(
                fillMissingDays ? filler<TResource, TEvent>(newDate) : null,
              );
            }
          }
        }
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          const lastIsoDate = currentWeek[currentWeek.length - 1]?.isoDate;
          const lastDate = lastIsoDate
            ? plainDateOf(lastIsoDate)
            : Temporal.PlainDate.from("2024-01-01");
          const newDate = lastDate.add({ days: 1 });
          currentWeek.push(
            fillMissingDays ? filler<TResource, TEvent>(newDate) : null,
          );
        }
        weeks.push(currentWeek);
      }

      return weeks;
    }

    case "workWeek": {
      const workWeeks: Array<Array<Day<TResource, TEvent> | null>> = [];
      let currentWorkWeek: Array<Day<TResource, TEvent> | null> = [];

      days.forEach((day) => {
        const dayDate = day ? plainDateOf(day.isoDate) : null;
        if (
          currentWorkWeek.length === 0 &&
          dayDate?.dayOfWeek !== weekStartsOn
        ) {
          if (dayDate) {
            const dayOfWeek = (dayDate.dayOfWeek - weekStartsOn + 7) % 7;
            for (let i = 0; i < dayOfWeek; i++) {
              const newDay = dayDate.subtract({ days: dayOfWeek - i });
              if (!weekend.includes(newDay.dayOfWeek)) {
                currentWorkWeek.push(
                  fillMissingDays ? filler<TResource, TEvent>(newDay) : null,
                );
              }
            }
          }
        }
        if (dayDate && day && !weekend.includes(dayDate.dayOfWeek)) {
          currentWorkWeek.push(day);
        }
        if (currentWorkWeek.length === 5) {
          workWeeks.push(currentWorkWeek);
          currentWorkWeek = [];
        }
      });

      if (currentWorkWeek.length > 0) {
        while (currentWorkWeek.length < 5) {
          const lastIsoDate =
            currentWorkWeek[currentWorkWeek.length - 1]?.isoDate;
          const lastDate = lastIsoDate
            ? plainDateOf(lastIsoDate)
            : Temporal.PlainDate.from("2024-01-01");
          const nextDate = lastDate.add({ days: 1 });
          if (!weekend.includes(nextDate.dayOfWeek)) {
            currentWorkWeek.push(
              fillMissingDays ? filler<TResource, TEvent>(nextDate) : null,
            );
          }
        }
        workWeeks.push(currentWorkWeek);
      }

      return workWeeks;
    }

    default:
      break;
  }
  return groups;
};
