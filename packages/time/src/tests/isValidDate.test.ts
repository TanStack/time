import { describe, expect, test } from 'vitest'
import { isValidDate } from '../utils/isValidDate'

describe('isValidDate', () => {
  test('should return true for a valid date', () => {
    const date = new Date();
    expect(isValidDate(date)).toBe(true)
  })

  test.each([
    '2021-10-10',
    new Date('invalid'),
    {},
    undefined,
    null,
    NaN,
    0,
  ])('should return false for invalid date %p', (date) => {
    expect(isValidDate(date)).toBe(false)
  })

  test('should assert type guards correctly', () => {
    const notADate = 'not a date';
    if (isValidDate(notADate)) {
      expect(notADate).toBeInstanceOf(Date)
      notADate.getDate()
    } else {
      expect(() => {
        // @ts-expect-error
        notADate.getTime()
      }).toThrowError()
    }
  })
})
