import { Store } from '@tanstack/store'
import { Temporal } from '@js-temporal/polyfill'
import { isDateInRange, ParsedDateRange } from '../utils'
import {
  BaseDateCore,
  type BaseDateCoreOptions,
  type DateInput,
} from './base-date-core'
import type { CalendarStore } from './calendar'
import { groupDaysBy as baseGroupDaysBy } from '../calendar/groupDaysBy'
import type { GroupDaysByProps } from '../calendar/groupDaysBy'
import type { Resource, Event } from '../calendar/types'

export type DatePickerMode = 'single' | 'multiple' | 'range'

function toTemporalPlainDate(
  date: DateInput,
  calendar?: Temporal.CalendarLike,
): Temporal.PlainDate {
  if (date instanceof Temporal.PlainDate) {
    return calendar ? date.withCalendar(calendar) : date
  }
  if (date instanceof Date) {
    const isoString = date.toISOString().split('T')[0]!
    return calendar
      ? Temporal.PlainDate.from(isoString).withCalendar(calendar)
      : Temporal.PlainDate.from(isoString)
  }
  if (typeof date === 'number') {
    const dateObj = new Date(date)
    const isoString = dateObj.toISOString().split('T')[0]!
    return calendar
      ? Temporal.PlainDate.from(isoString).withCalendar(calendar)
      : Temporal.PlainDate.from(isoString)
  }
  return calendar
    ? Temporal.PlainDate.from(date).withCalendar(calendar)
    : Temporal.PlainDate.from(date)
}

function toDate(temporalDate: Temporal.PlainDate): Date {
  return new Date(Date.UTC(temporalDate.year, temporalDate.month - 1, temporalDate.day))
}

export interface DatePickerOptions extends BaseDateCoreOptions {
  /**
   * Selection mode: 'single' for single date, 'multiple' for multiple dates, 'range' for date range.
   */
  mode?: DatePickerMode
  /**
   * Initial set of selected dates.
   */
  selectedDates?: DateInput[]
}

export interface DatePickerCoreState extends CalendarStore {
  /**
   * A map of selected dates, keyed by their string representation.
   */
  selectedDates: Map<string, Temporal.PlainDate>
}

export class DatePickerCore extends BaseDateCore {
  datePickerStore: Store<DatePickerCoreState>

  declare options: Required<DatePickerOptions> & {
    range: ParsedDateRange
  }

  constructor(options: DatePickerOptions) {
    super(options)

    Object.assign(this.options, {
      mode: options.mode ?? 'single',
      selectedDates: options.selectedDates ?? [],
    })
    this.datePickerStore = new Store<DatePickerCoreState>({
      ...this.store.state,
      selectedDates: new Map(
        options.selectedDates?.map((date) => {
          const temporalDate = toTemporalPlainDate(date, this.options.calendar)
          return [
            temporalDate.toString({ calendarName: 'never' }),
            temporalDate,
          ]
        }) ?? [],
      ),
    })
  }

  getSelectedDates(): Date[] {
    return Array.from(this.datePickerStore.state.selectedDates.values()).map(
      toDate,
    )
  }

  getDaysWithEvents() {
    const calendarDays = this.getCalendarDays()
    const selectedDates = this.datePickerStore.state.selectedDates
    return calendarDays.map((day) => {
      const currentMonthRange = Array.from(
        { length: this.store.state.viewMode.value },
        (_, i) => this.store.state.currentPeriod.add({ months: i }).month,
      )
      const isInCurrentPeriod = currentMonthRange.includes(day.month)
      const dayKey = day.toString({ calendarName: 'never' })
      return {
        date: day,
        events: [],
        isToday:
          Temporal.PlainDate.compare(day, Temporal.Now.plainDateISO()) === 0,
        isInCurrentPeriod,
        isSelected: selectedDates.has(dayKey),
        isBetweenDates: this.isBetweenDates(day),
      }
    })
  }

  groupDaysBy({
    days,
    unit,
    fillMissingDays = true,
  }: Omit<
    GroupDaysByProps<Resource, Event<Resource>>,
    'weekStartsOn' | 'locale'
  >) {
    const grouped = baseGroupDaysBy<Resource, Event<Resource>>({
      days,
      unit,
      fillMissingDays,
      weekStartsOn: this.getWeekStartsOn(),
      locale: this.options.locale,
    } as GroupDaysByProps<Resource, Event<Resource>>)

    return grouped.map((group) =>
      group.map((day) => {
        if (!day) return null
        const dayKey = day.date.toString({ calendarName: 'never' })
        return {
          ...day,
          isSelected: this.datePickerStore.state.selectedDates.has(dayKey),
          isBetweenDates: this.isBetweenDates(day.date),
        }
      }),
    )
  }

  selectDate(date: DateInput) {
    const { mode } = this.options
    const temporalDate = toTemporalPlainDate(date, this.options.calendar)

    if (this.options.range.start || this.options.range.end) {
      if (!isDateInRange({ date: temporalDate, range: this.options.range }))
        return
    }

    const selectedDates = new Map(this.datePickerStore.state.selectedDates)
    const dateKey = temporalDate.toString({ calendarName: 'never' })

    switch (mode) {
      case 'range': {
        if (selectedDates.size === 0) {
          selectedDates.set(dateKey, temporalDate)
        } else if (selectedDates.size === 1) {
          const firstDate = Array.from(selectedDates.values())[0]
          if (
            firstDate &&
            Temporal.PlainDate.compare(temporalDate, firstDate) < 0
          ) {
            selectedDates.clear()
            selectedDates.set(dateKey, temporalDate)
            selectedDates.set(
              firstDate.toString({ calendarName: 'never' }),
              firstDate,
            )
          } else {
            selectedDates.set(dateKey, temporalDate)
          }
        } else {
          selectedDates.clear()
          selectedDates.set(dateKey, temporalDate)
        }
        break
      }
      case 'multiple': {
        if (selectedDates.has(dateKey)) {
          selectedDates.delete(dateKey)
        } else {
          selectedDates.set(dateKey, temporalDate)
        }
        break
      }
      case 'single':
      default: {
        selectedDates.clear()
        selectedDates.set(dateKey, temporalDate)
        break
      }
    }

    this.datePickerStore.setState((prev) => ({
      ...prev,
      selectedDates,
    }))
  }

  isBetweenDates(date: DateInput): boolean {
    if (this.options.mode !== 'range') {
      return false
    }

    const selectedDates = Array.from(
      this.datePickerStore.state.selectedDates.values(),
    )

    if (selectedDates.length !== 2) {
      return false
    }

    const temporalDate = toTemporalPlainDate(date, this.options.calendar)
    const dateKey = temporalDate.toString({ calendarName: 'never' })

    if (this.datePickerStore.state.selectedDates.has(dateKey)) {
      return false
    }

    const sortedDates = selectedDates.sort((a, b) =>
      Temporal.PlainDate.compare(a, b),
    )
    const startDate = sortedDates[0]
    const endDate = sortedDates[1]

    if (!startDate || !endDate) {
      return false
    }

    const compareToStart = Temporal.PlainDate.compare(temporalDate, startDate)
    const compareToEnd = Temporal.PlainDate.compare(temporalDate, endDate)

    return compareToStart > 0 && compareToEnd < 0
  }
}
