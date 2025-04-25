import { describe, expect, test } from 'vitest'
import { validateDate } from '../src/utils/validateDate'

describe('validateDate', () => {
  test('should return a valid date', () => {
    const date = new Date()
    expect(validateDate({ date }).toString()).toBe(date.toString())
  })

  test('should throw an error for an invalid date', () => {
    expect(() => validateDate({ date: new Date('45-92-12') })).toThrowError(
      'Invalid Date: "Invalid Date"',
    )
  })
})
