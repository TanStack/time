import {describe, expect, test} from 'vitest';
import {isValidDate} from '../utils/isValidDate';

describe('isValidDate', () => {
  test('should return true for a valid date', () => {
    expect(isValidDate(new Date())).toBe(true);
  })

  test('should return false for an invalid date', () => {
    expect(isValidDate(new Date("invalid"))).toBe(false);
  });

  test("should return false for null", () => {
    expect(isValidDate(null)).toBe(false);
  });
});
