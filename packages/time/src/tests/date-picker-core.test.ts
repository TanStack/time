import { Temporal } from '@js-temporal/polyfill'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { DatePickerCore } from '../core/date-picker'
import type { DatePickerOptions } from '../core/date-picker'

function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]!
}

describe('DatePicker', () => {
  let options: DatePickerOptions
  let datePicker: DatePickerCore
  const mockDate = new Date('2023-06-15')
  const mockDateTime = new Date('2023-06-15T10:00:00')

  beforeEach(() => {
    options = {
      viewMode: { value: 1, unit: 'month' },
      selectedDates: ['2023-06-10'],
      mode: 'multiple',
    }
    datePicker = new DatePickerCore(options)
    const mockTemporalDate = Temporal.PlainDate.from(
      mockDate.toISOString().split('T')[0]!,
    )
    const mockTemporalDateTime = Temporal.PlainDateTime.from(
      mockDateTime.toISOString().replace('Z', ''),
    )
    vi.spyOn(Temporal.Now, 'plainDateISO').mockReturnValue(mockTemporalDate)
    vi.spyOn(Temporal.Now, 'plainDateTimeISO').mockReturnValue(
      mockTemporalDateTime,
    )
  })

  test('should initialize with the correct selected dates', () => {
    const selectedDates = datePicker.getSelectedDates()
    expect(selectedDates).toHaveLength(1)
    expect(selectedDates[0]).toBeDefined()
    expect(toISODateString(selectedDates[0]!)).toBe('2023-06-10')
  })

  test('should select a date correctly in single selection mode', () => {
    datePicker = new DatePickerCore({
      ...options,
      mode: 'single',
    })
    datePicker.selectDate('2023-06-15')
    const selectedDates = datePicker.getSelectedDates()
    expect(selectedDates).toHaveLength(1)
    expect(selectedDates[0]).toBeDefined()
    expect(toISODateString(selectedDates[0]!)).toBe('2023-06-15')
  })

  test('should select multiple dates correctly', () => {
    datePicker.selectDate('2023-06-15')
    datePicker.selectDate('2023-06-20')
    const selectedDates = datePicker.getSelectedDates()
    expect(selectedDates).toHaveLength(3)
    const dateStrings = selectedDates.map(toISODateString)
    expect(dateStrings).toContain('2023-06-15')
    expect(dateStrings).toContain('2023-06-20')
  })

  test('should deselect a date correctly in multiple selection mode', () => {
    datePicker.selectDate('2023-06-10')
    const selectedDates = datePicker.getSelectedDates()
    expect(selectedDates).toHaveLength(0)
  })

  test('should select a date range correctly', () => {
    datePicker = new DatePickerCore({
      ...options,
      mode: 'range',
      range: {
        start: '2023-06-10',
        end: '2023-06-20',
      },
      selectedDates: ['2023-06-10'],
    })
    datePicker.selectDate('2023-06-15')
    const selectedDates = datePicker.getSelectedDates()
    expect(selectedDates).toHaveLength(2)
    const dateStrings = selectedDates.map(toISODateString)
    expect(dateStrings).toContain('2023-06-10')
    expect(dateStrings).toContain('2023-06-15')
  })

  test('should not select a date outside the min and max range', () => {
    datePicker = new DatePickerCore({
      ...options,
      range: {
        start: '2023-06-05',
        end: '2023-06-20',
      },
    })
    datePicker.selectDate('2023-06-01')
    datePicker.selectDate('2023-06-25')
    const selectedDates = datePicker.getSelectedDates()
    expect(selectedDates).toHaveLength(1)
    expect(selectedDates[0]).toBeDefined()
    expect(toISODateString(selectedDates[0]!)).toBe('2023-06-10')
  })
})
