import { describe, expect, test } from 'vitest'
import { foo } from '../src/index'

describe('angular-time', () => {
  test('should be foo', () => {
    expect(foo).toBe('foo')
  })
})
