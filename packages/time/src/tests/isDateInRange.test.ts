import { Temporal } from '@js-temporal/polyfill'
import { describe, expect, test } from 'vitest'
import { isDateInRange } from '../utils'
import type { ParsedDateRange } from '../utils'

describe('isDateInRange', () => {
  test('should return true when range is not specified', () => {
    const date = Temporal.PlainDate.from('2024-06-15')
    const range: ParsedDateRange = {
      start: null,
      end: null,
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return true when date is within range', () => {
    const date = Temporal.PlainDate.from('2024-06-15')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return false when date is before range start', () => {
    const date = Temporal.PlainDate.from('2023-12-31')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(false)
  })

  test('should return false when date is after range end', () => {
    const date = Temporal.PlainDate.from('2025-01-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(false)
  })

  test('should return true when date equals range start', () => {
    const date = Temporal.PlainDate.from('2024-01-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return true when date equals range end', () => {
    const date = Temporal.PlainDate.from('2024-12-31')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return true when date is after start and only start is specified', () => {
    const date = Temporal.PlainDate.from('2024-12-31')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: null,
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return false when date is before start and only start is specified', () => {
    const date = Temporal.PlainDate.from('2023-12-31')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: null,
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(false)
  })

  test('should return true when date is before end and only end is specified', () => {
    const date = Temporal.PlainDate.from('2024-01-01')
    const range: ParsedDateRange = {
      start: null,
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return false when date is after end and only end is specified', () => {
    const date = Temporal.PlainDate.from('2025-01-01')
    const range: ParsedDateRange = {
      start: null,
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(false)
  })

  test('should return true when date equals start and only start is specified', () => {
    const date = Temporal.PlainDate.from('2024-01-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: null,
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })

  test('should return true when date equals end and only end is specified', () => {
    const date = Temporal.PlainDate.from('2024-12-31')
    const range: ParsedDateRange = {
      start: null,
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = isDateInRange({ date, range })

    expect(result).toBe(true)
  })
})
