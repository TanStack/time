import { Temporal } from '@js-temporal/polyfill'
import type { Day, Event, Resource } from './types'

interface GroupDaysByBaseProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> {
  days: (Day<TResource, TEvent> | null)[]
  weekStartsOn: number
  locale: string
}

type GroupDaysByMonthProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = GroupDaysByBaseProps<TResource, TEvent> & {
  unit: 'month'
  fillMissingDays?: never
}

type GroupDaysByWeekProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> = GroupDaysByBaseProps<TResource, TEvent> & {
  unit: 'week' | 'workWeek'
  fillMissingDays?: boolean
}

export type GroupDaysByProps<
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
> =
  | GroupDaysByMonthProps<TResource, TEvent>
  | GroupDaysByWeekProps<TResource, TEvent>

export const groupDaysBy = <
  TResource extends Resource,
  TEvent extends Event<TResource> = Event<TResource>,
>({
  days,
  unit,
  fillMissingDays = true,
  weekStartsOn,
  locale,
}: GroupDaysByProps<TResource, TEvent>): (Day<
  TResource,
  TEvent
> | null)[][] => {
  const groups: (Day<TResource, TEvent> | null)[][] = []
  const loc = new Intl.Locale(locale)
  const { weekend } = loc.getWeekInfo()

  switch (unit) {
    case 'month': {
      let currentMonth: (Day<TResource, TEvent> | null)[] = []
      days.forEach((day) => {
        if (
          currentMonth.length > 0 &&
          day?.date.month !== currentMonth[0]?.date.month
        ) {
          groups.push(currentMonth)
          currentMonth = []
        }
        currentMonth.push(day)
      })
      if (currentMonth.length > 0) {
        groups.push(currentMonth)
      }
      break
    }

    case 'week': {
      const weeks: (Day<TResource, TEvent> | null)[][] = []
      let currentWeek: (Day<TResource, TEvent> | null)[] = []

      days.forEach((day) => {
        if (currentWeek.length === 0 && day?.date.dayOfWeek !== weekStartsOn) {
          if (day) {
            const dayOfWeek = (day.date.dayOfWeek - weekStartsOn + 7) % 7
            for (let i = 0; i < dayOfWeek; i++) {
              currentWeek.push(
                fillMissingDays
                  ? {
                      date: day.date.subtract({ days: dayOfWeek - i }),
                      events: [],
                      isToday: false,
                      isInCurrentPeriod: false,
                    }
                  : null,
              )
            }
          }
        }
        currentWeek.push(day)
        if (currentWeek.length === 7) {
          weeks.push(currentWeek)
          currentWeek = []
        }
      })

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          const lastDate =
            currentWeek[currentWeek.length - 1]?.date ??
            Temporal.PlainDate.from('2024-01-01')
          currentWeek.push(
            fillMissingDays
              ? {
                  date: lastDate.add({ days: 1 }),
                  events: [],
                  isToday: false,
                  isInCurrentPeriod: false,
                }
              : null,
          )
        }
        weeks.push(currentWeek)
      }

      return weeks
    }

    case 'workWeek': {
      const workWeeks: (Day<TResource, TEvent> | null)[][] = []
      let currentWorkWeek: (Day<TResource, TEvent> | null)[] = []

      days.forEach((day) => {
        if (
          currentWorkWeek.length === 0 &&
          day?.date.dayOfWeek !== weekStartsOn
        ) {
          if (day) {
            const dayOfWeek = (day.date.dayOfWeek - weekStartsOn + 7) % 7
            for (let i = 0; i < dayOfWeek; i++) {
              const newDay = day.date.subtract({ days: dayOfWeek - i })
              if (!weekend.includes(newDay.dayOfWeek)) {
                currentWorkWeek.push(
                  fillMissingDays
                    ? {
                        date: newDay,
                        events: [],
                        isToday: false,
                        isInCurrentPeriod: false,
                      }
                    : null,
                )
              }
            }
          }
        }
        if (day && !weekend.includes(day.date.dayOfWeek)) {
          currentWorkWeek.push(day)
        }
        if (currentWorkWeek.length === 5) {
          workWeeks.push(currentWorkWeek)
          currentWorkWeek = []
        }
      })

      if (currentWorkWeek.length > 0) {
        while (currentWorkWeek.length < 5) {
          const lastDate =
            currentWorkWeek[currentWorkWeek.length - 1]?.date ??
            Temporal.PlainDate.from('2024-01-01')
          const nextDate = lastDate.add({ days: 1 })
          if (!weekend.includes(nextDate.dayOfWeek)) {
            currentWorkWeek.push(
              fillMissingDays
                ? {
                    date: nextDate,
                    events: [],
                    isToday: false,
                    isInCurrentPeriod: false,
                  }
                : null,
            )
          }
        }
        workWeeks.push(currentWorkWeek)
      }

      return workWeeks
    }

    default:
      break
  }
  return groups
}
