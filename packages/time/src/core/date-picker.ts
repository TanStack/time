import { Store } from '@tanstack/store'
import { Temporal } from '@js-temporal/polyfill'
import { isDateInRange, ParsedDateRange } from '../utils'
import { BaseDateCore, type BaseDateCoreOptions } from './base-date-core'
import type { CalendarStore } from './calendar'

export type DatePickerMode = 'single' | 'multiple' | 'range'

export interface DatePickerOptions extends BaseDateCoreOptions {
  /**
   * Selection mode: 'single' for single date, 'multiple' for multiple dates, 'range' for date range.
   */
  mode?: DatePickerMode
  /**
   * Initial set of selected dates.
   */
  selectedDates?: Temporal.PlainDate[]
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
        options.selectedDates?.map((date) => [date.toString(), date]) ?? [],
      ),
    })
  }

  getSelectedDates() {
    return Array.from(this.datePickerStore.state.selectedDates.values())
  }

  getDaysWithEvents() {
    const calendarDays = this.getCalendarDays()
    return calendarDays.map((day) => {
      const currentMonthRange = Array.from(
        { length: this.store.state.viewMode.value },
        (_, i) => this.store.state.currentPeriod.add({ months: i }).month,
      )
      const isInCurrentPeriod = currentMonthRange.includes(day.month)
      return {
        date: day,
        events: [] as never[],
        isToday:
          Temporal.PlainDate.compare(day, Temporal.Now.plainDateISO()) === 0,
        isInCurrentPeriod,
      }
    })
  }

  selectDate(date: Temporal.PlainDate) {
    const { mode } = this.options

    if (this.options.range.start || this.options.range.end) {
      if (!isDateInRange({ date, range: this.options.range })) return
    }

    const selectedDates = new Map(this.datePickerStore.state.selectedDates)

    switch (mode) {
      case 'range': {
        if (selectedDates.size === 0) {
          selectedDates.set(date.toString(), date)
        } else if (selectedDates.size === 1) {
          const firstDate = Array.from(selectedDates.values())[0]
          if (firstDate && Temporal.PlainDate.compare(date, firstDate) < 0) {
            selectedDates.clear()
            selectedDates.set(date.toString(), date)
            selectedDates.set(firstDate.toString(), firstDate)
          } else {
            selectedDates.set(date.toString(), date)
          }
        } else {
          selectedDates.clear()
          selectedDates.set(date.toString(), date)
        }
        break
      }
      case 'multiple': {
        if (selectedDates.has(date.toString())) {
          selectedDates.delete(date.toString())
        } else {
          selectedDates.set(date.toString(), date)
        }
        break
      }
      case 'single':
      default: {
        selectedDates.clear()
        selectedDates.set(date.toString(), date)
        break
      }
    }

    this.datePickerStore.setState((prev) => ({
      ...prev,
      selectedDates,
    }))
  }
}
