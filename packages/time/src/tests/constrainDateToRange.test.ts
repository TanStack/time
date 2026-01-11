import { Temporal } from '@js-temporal/polyfill'
import { describe, expect, test } from 'vitest'
import { constrainDateToRange } from '../utils'
import type { ParsedDateRange } from '../utils'

describe('constrainDateToRange', () => {
  test('should return date unchanged when range is not specified', () => {
    const date = Temporal.PlainDate.from('2024-06-15')
    const range: ParsedDateRange = {
      start: null,
      end: null,
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(date)
  })

  test('should constrain date before range start', () => {
    const date = Temporal.PlainDate.from('2024-01-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-06-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(range.start)
  })

  test('should constrain date after range end', () => {
    const date = Temporal.PlainDate.from('2025-01-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(range.end)
  })

  test('should return date unchanged when within range', () => {
    const date = Temporal.PlainDate.from('2024-06-15')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(date)
  })

  test('should constrain to start when only start is specified', () => {
    const date = Temporal.PlainDate.from('2024-01-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-06-01'),
      end: null,
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(range.start)
  })

  test('should not constrain when date is after start and only start is specified', () => {
    const date = Temporal.PlainDate.from('2024-12-31')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-06-01'),
      end: null,
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(date)
  })

  test('should constrain to end when only end is specified', () => {
    const date = Temporal.PlainDate.from('2025-01-01')
    const range: ParsedDateRange = {
      start: null,
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(range.end)
  })

  test('should not constrain when date is before end and only end is specified', () => {
    const date = Temporal.PlainDate.from('2024-01-01')
    const range: ParsedDateRange = {
      start: null,
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(date)
  })

  test('should constrain to start when date equals start', () => {
    const date = Temporal.PlainDate.from('2024-06-01')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-06-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(date)
    expect(result).toEqual(range.start)
  })

  test('should constrain to end when date equals end', () => {
    const date = Temporal.PlainDate.from('2024-12-31')
    const range: ParsedDateRange = {
      start: Temporal.PlainDate.from('2024-01-01'),
      end: Temporal.PlainDate.from('2024-12-31'),
    }

    const result = constrainDateToRange({ date, range })

    expect(result).toEqual(date)
    expect(result).toEqual(range.end)
  })
})
