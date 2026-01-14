import { Store } from '@tanstack/store'
import { Temporal } from '@js-temporal/polyfill'
import {
  getFirstDayOfMonth,
  getFirstDayOfWeek,
  parseDateRange,
  constrainDateToRange,
  isDateInRange,
} from '../utils'
import { generateDateRange } from '../calendar/generateDateRange'
import { getDateDefaults } from '../utils/dateDefaults'
import type { CalendarStore, DateRange } from '../calendar/types'
import type { ParsedDateRange } from '../utils/dateRange'

export type DateInput = string | number | Date | Temporal.PlainDate

function toTemporalPlainDateString(date: DateInput): string {
  if (date instanceof Temporal.PlainDate) {
    return date.toString({ calendarName: 'never' })
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]!
  }
  if (typeof date === 'number') {
    return new Date(date).toISOString().split('T')[0]!
  }
  return date
}

/**
 * Base options interface for date-related core classes.
 */
export interface BaseDateCoreOptions {
  /** The initial view mode configuration. */
  viewMode: CalendarStore['viewMode']
  /** Optional locale for date formatting. Uses a BCP 47 language tag. */
  locale?: Intl.UnicodeBCP47LocaleIdentifier
  /** Optional time zone specification. */
  timeZone?: Temporal.TimeZoneLike
  /** Optional calendar system to be used. */
  calendar?: Temporal.CalendarLike
  /** Optional range of dates to be used. */
  range?: DateRange
}

/**
 * Parsed options interface with all required fields and parsed range.
 */
export interface ParsedBaseDateCoreOptions
  extends Omit<Required<BaseDateCoreOptions>, 'range'> {
  range: ParsedDateRange
}

/**
 * Base actions interface for date-related core classes.
 */
export interface BaseDateActions {
  /** Navigates to the previous period according to the current view mode. */
  goToPreviousPeriod: () => void
  /** Navigates to the next period according to the current view mode. */
  goToNextPeriod: () => void
  /** Resets the view to the current period based on today's date. */
  goToCurrentPeriod: () => void
  /** Navigates to a specific date. */
  goToSpecificPeriod: (date: DateInput) => void
  /** Checks if navigation to the previous period is allowed within the range. */
  canGoPreviousPeriod: () => boolean
  /** Checks if navigation to the next period is allowed within the range. */
  canGoNextPeriod: () => boolean
  /** Changes the current view mode. */
  changeViewMode: (newViewMode: CalendarStore['viewMode']) => void
  /** Retrieves the names of the days of the week, based on the current locale. */
  getDaysNames: (weekday?: 'long' | 'short') => string[]
}

export abstract class BaseDateCore implements BaseDateActions {
  store: Store<CalendarStore>
  options: ParsedBaseDateCoreOptions

  constructor(options: BaseDateCoreOptions) {
    const defaults = getDateDefaults()
    const parsedRange = parseDateRange({
      range: options.range,
      calendar: defaults.calendar,
    })

    this.options = {
      locale: options.locale ?? defaults.locale,
      timeZone: options.timeZone ?? defaults.timeZone,
      calendar: options.calendar ?? defaults.calendar,
      viewMode: options.viewMode,
      range: parsedRange,
    }

    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar)
    const initialDate = constrainDateToRange({
      date: now,
      range: this.options.range,
    })

    this.store = new Store<CalendarStore>({
      currentPeriod: initialDate,
      activeDate: initialDate,
      viewMode: options.viewMode,
    })
  }

  protected getFirstDayOfMonth() {
    return getFirstDayOfMonth(
      this.store.state.currentPeriod
        .toString({ calendarName: 'auto' })
        .substring(0, 7),
    )
  }

  protected getFirstDayOfWeek() {
    return getFirstDayOfWeek(
      this.store.state.currentPeriod.toString(),
      this.options.locale,
    )
  }

  getWeekStartsOn() {
    return this.getFirstDayOfWeek().dayOfWeek
  }

  protected getCalendarDays() {
    const start =
      this.store.state.viewMode.unit === 'month'
        ? this.getFirstDayOfMonth().subtract({
            days:
              (this.getFirstDayOfMonth().dayOfWeek -
                (this.getFirstDayOfWeek().dayOfWeek + 1) +
                7) %
              7,
          })
        : this.store.state.currentPeriod

    let end: Temporal.PlainDate
    switch (this.store.state.viewMode.unit) {
      case 'month': {
        const lastDayOfMonth = this.getFirstDayOfMonth()
          .add({ months: this.store.state.viewMode.value })
          .subtract({ days: 1 })
        const lastDayOfMonthWeekDay =
          (lastDayOfMonth.dayOfWeek -
            (this.getFirstDayOfWeek().dayOfWeek + 1) +
            7) %
          7
        end = lastDayOfMonth.add({ days: 6 - lastDayOfMonthWeekDay })
        break
      }
      case 'week': {
        end = this.getFirstDayOfWeek().add({
          days: 7 * this.store.state.viewMode.value - 1,
        })
        break
      }
      case 'day': {
        end = this.store.state.currentPeriod.add({
          days: this.store.state.viewMode.value - 1,
        })
        break
      }
      case 'workWeek': {
        end = start.add({ days: 4 })
        break
      }
    }

    const allDays = generateDateRange(start.toString(), end.toString())
    const startMonthDate = this.store.state.currentPeriod.with({ day: 1 })
    const endMonthDate = this.store.state.currentPeriod
      .add({
        months: this.store.state.viewMode.value - 1,
      })
      .with({
        day: Temporal.PlainDate.from(
          this.store.state.currentPeriod.toString({ calendarName: 'auto' }),
        ).daysInMonth,
      })

    const filteredDays = allDays.filter(
      (day) =>
        Temporal.PlainDate.compare(day, startMonthDate) >= 0 &&
        Temporal.PlainDate.compare(day, endMonthDate) <= 0,
    )

    if (this.options.range.start || this.options.range.end) {
      return filteredDays.filter((day) =>
        isDateInRange({ date: day, range: this.options.range }),
      )
    }

    return filteredDays
  }

  getDaysNames(weekday: 'long' | 'short' = 'short') {
    const baseDate = Temporal.PlainDate.from('2024-01-01')
    const firstDayOfWeek = this.getFirstDayOfWeek().dayOfWeek

    return Array.from({ length: 7 }).map((_, i) =>
      baseDate
        .add({ days: (i + (firstDayOfWeek - 1)) % 7 })
        .toLocaleString(this.options.locale, { weekday: weekday }),
    )
  }

  changeViewMode(newViewMode: CalendarStore['viewMode']) {
    this.store.setState((prev) => ({
      ...prev,
      viewMode: newViewMode,
    }))
  }

  goToPreviousPeriod() {
    let newActiveDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        newActiveDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        })
        break
      }

      case 'week': {
        newActiveDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        })
        break
      }

      case 'day': {
        newActiveDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        newActiveDate = this.store.state.activeDate.subtract({
          days: 5,
        })
        break
      }
    }

    const constrainedDate = constrainDateToRange({
      date: newActiveDate,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  goToNextPeriod() {
    let newActiveDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        newActiveDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        })
        break
      }

      case 'week': {
        newActiveDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        })
        break
      }

      case 'day': {
        newActiveDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        newActiveDate = this.store.state.activeDate.add({
          days: 5,
        })
        break
      }
    }

    const constrainedDate = constrainDateToRange({
      date: newActiveDate,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  goToCurrentPeriod() {
    const now = Temporal.Now.plainDateISO().withCalendar(this.options.calendar)
    const constrainedDate = constrainDateToRange({
      date: now,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  goToSpecificPeriod(date: DateInput) {
    const dateStr = toTemporalPlainDateString(date)
    const targetDate = Temporal.PlainDate.from(dateStr).withCalendar(
      this.options.calendar,
    )
    const constrainedDate = constrainDateToRange({
      date: targetDate,
      range: this.options.range,
    })
    this.store.setState((prev) => ({
      ...prev,
      activeDate: constrainedDate,
      currentPeriod: constrainedDate,
    }))
  }

  canGoPreviousPeriod(): boolean {
    let previousDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        previousDate = this.store.state.activeDate.subtract({
          months: this.store.state.viewMode.value,
        })
        break
      }
      case 'week': {
        previousDate = this.store.state.activeDate.subtract({
          weeks: this.store.state.viewMode.value,
        })
        break
      }
      case 'day': {
        previousDate = this.store.state.activeDate.subtract({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        previousDate = this.store.state.activeDate.subtract({ days: 5 })
        break
      }
    }

    return isDateInRange({ date: previousDate, range: this.options.range })
  }

  canGoNextPeriod(): boolean {
    let nextDate: Temporal.PlainDate

    switch (this.store.state.viewMode.unit) {
      case 'month': {
        nextDate = this.store.state.activeDate.add({
          months: this.store.state.viewMode.value,
        })
        break
      }
      case 'week': {
        nextDate = this.store.state.activeDate.add({
          weeks: this.store.state.viewMode.value,
        })
        break
      }
      case 'day': {
        nextDate = this.store.state.activeDate.add({
          days: this.store.state.viewMode.value,
        })
        break
      }
      case 'workWeek': {
        nextDate = this.store.state.activeDate.add({ days: 5 })
        break
      }
    }

    return isDateInRange({ date: nextDate, range: this.options.range })
  }
}
