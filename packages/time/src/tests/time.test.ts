import { describe, expect, test } from 'vitest'
import { TimeCore, type TimeState } from '../core/time'

export class TestTimeCore extends TimeCore<TimeState> {
  getCurrentTime() {
    return this.getCurrentTimeDuration()
  }
}

describe('TimeCore', () => {
  describe('initialization', () => {
    test('should initialize with the provided currentTime in seconds', () => {
      const timeCore = new TestTimeCore({ currentTime: 60 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(60)
    })

    test('should initialize with zero', () => {
      const timeCore = new TestTimeCore({ currentTime: 0 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(0)
    })

    test('should initialize with large values', () => {
      const timeCore = new TestTimeCore({ currentTime: 86400 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(86400)
    })
  })

  describe('getCurrentTime', () => {
    test('should return duration matching the initial value', () => {
      const initialSeconds = 300
      const timeCore = new TestTimeCore({ currentTime: initialSeconds })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(initialSeconds)
    })
  })

  describe('add', () => {
    test('should add seconds using Duration object', () => {
      const timeCore = new TestTimeCore({ currentTime: 100 })
      timeCore.add({ seconds: 50 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(150)
    })

    test('should add minutes', () => {
      const timeCore = new TestTimeCore({ currentTime: 60 })
      timeCore.add({ minutes: 2 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(180)
    })

    test('should add hours', () => {
      const timeCore = new TestTimeCore({ currentTime: 3600 })
      timeCore.add({ hours: 1 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(7200)
    })

    test('should add complex duration with multiple units', () => {
      const timeCore = new TestTimeCore({ currentTime: 100 })
      timeCore.add({ hours: 1, minutes: 30, seconds: 15 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(5515)
    })

    test('should handle adding zero', () => {
      const timeCore = new TestTimeCore({ currentTime: 100 })
      timeCore.add({ seconds: 0 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(100)
    })
  })

  describe('subtract', () => {
    test('should subtract seconds using Duration object', () => {
      const timeCore = new TestTimeCore({ currentTime: 100 })
      timeCore.subtract({ seconds: 30 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(70)
    })

    test('should subtract minutes', () => {
      const timeCore = new TestTimeCore({ currentTime: 300 })
      timeCore.subtract({ minutes: 2 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(180)
    })

    test('should subtract hours', () => {
      const timeCore = new TestTimeCore({ currentTime: 7200 })
      timeCore.subtract({ hours: 1 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(3600)
    })

    test('should subtract complex duration with multiple units', () => {
      const timeCore = new TestTimeCore({ currentTime: 6000 })
      timeCore.subtract({ hours: 1, minutes: 30, seconds: 15 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(585)
    })

    test('should clamp to zero when subtracting more than available', () => {
      const timeCore = new TestTimeCore({ currentTime: 50 })
      timeCore.subtract({ seconds: 100 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(0)
    })

    test('should handle subtracting zero', () => {
      const timeCore = new TestTimeCore({ currentTime: 100 })
      timeCore.subtract({ seconds: 0 })
      const duration = timeCore.getCurrentTime()
      expect(duration.total({ unit: 'second' })).toBe(100)
    })
  })
})
