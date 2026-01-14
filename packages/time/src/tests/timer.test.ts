import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Timer } from '../core/timer'

describe('Timer', () => {
  let timer: Timer
  const initialTime = 60

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    test('should initialize with correct state', () => {
      timer = new Timer({ initialTime })
      expect(timer.store.state.state).toBe('idle')
      expect(timer.store.state.initialTime).toBe(initialTime)
      expect(timer.store.state.progress).toBe(100)
      expect(timer.getCurrentTime().seconds).toBe(initialTime)
    })

    test('should initialize with zero time', () => {
      timer = new Timer({ initialTime: 0 })
      expect(timer.store.state.state).toBe('idle')
      expect(timer.store.state.initialTime).toBe(0)
      expect(timer.store.state.progress).toBe(0)
    })

    test('should use custom intervalMs', () => {
      timer = new Timer({ initialTime: 10, intervalMs: 500 })
      timer.start()
      vi.advanceTimersByTime(500)
      const currentTime = timer.getCurrentTime().seconds
      expect(currentTime).toBeLessThan(10)
    })
  })

  describe('start', () => {
    test('should change state to running', () => {
      timer = new Timer({ initialTime })
      timer.start()
      expect(timer.store.state.state).toBe('running')
    })

    test('should not start if already running', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.start()
      expect(timer.store.state.state).toBe('running')
    })

    test('should start from stopped state', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.stop()
      timer.start()
      expect(timer.store.state.state).toBe('running')
    })
  })

  describe('stop', () => {
    test('should change state to stopped when running', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.stop()
      expect(timer.store.state.state).toBe('stopped')
    })

    test('should not stop if not running', () => {
      timer = new Timer({ initialTime })
      timer.stop()
      expect(timer.store.state.state).toBe('idle')
    })

    test('should preserve currentTime when stopping', () => {
      timer = new Timer({ initialTime })
      timer.start()
      vi.advanceTimersByTime(2000)
      const timeBeforeStop = timer.getCurrentTime().seconds
      timer.stop()
      const timeAfterStop = timer.getCurrentTime().seconds
      expect(timeAfterStop).toBe(timeBeforeStop)
    })
  })

  describe('toggle', () => {
    test('should start when idle', () => {
      timer = new Timer({ initialTime })
      timer.toggle()
      expect(timer.store.state.state).toBe('running')
    })

    test('should stop when running', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.toggle()
      expect(timer.store.state.state).toBe('stopped')
    })

    test('should start when stopped', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.stop()
      timer.toggle()
      expect(timer.store.state.state).toBe('running')
    })
  })

  describe('reset', () => {
    test('should reset to initial time and idle state', () => {
      timer = new Timer({ initialTime })
      timer.start()
      vi.advanceTimersByTime(3000)
      timer.reset()
      expect(timer.store.state.state).toBe('idle')
      expect(timer.store.state.initialTime).toBe(initialTime)
      expect(timer.getCurrentTime().seconds).toBe(initialTime)
      expect(timer.store.state.progress).toBe(100)
    })

    test('should stop timer when resetting', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.reset()
      expect(timer.store.state.state).toBe('idle')
    })
  })

  describe('setTime', () => {
    test('should update initialTime and currentTime', () => {
      timer = new Timer({ initialTime })
      timer.setTime(120)
      expect(timer.store.state.initialTime).toBe(120)
      expect(timer.getCurrentTime().seconds).toBe(120)
      expect(timer.store.state.progress).toBe(100)
    })

    test('should reset state to idle', () => {
      timer = new Timer({ initialTime })
      timer.start()
      timer.setTime(90)
      expect(timer.store.state.state).toBe('idle')
    })

    test('should throw error for negative time', () => {
      timer = new Timer({ initialTime })
      expect(() => timer.setTime(-10)).toThrow('Time must be a positive number')
    })

    test('should handle zero time', () => {
      timer = new Timer({ initialTime })
      timer.setTime(0)
      expect(timer.store.state.initialTime).toBe(0)
      expect(timer.store.state.progress).toBe(0)
    })
  })

  describe('add', () => {
    test('should add seconds and update progress', () => {
      timer = new Timer({ initialTime: 100 })
      timer.add({ seconds: 20 })
      expect(timer.getCurrentTime().seconds).toBe(120)
      expect(timer.store.state.progress).toBeGreaterThan(100)
    })

    test('should add minutes', () => {
      timer = new Timer({ initialTime: 60 })
      timer.add({ minutes: 1 })
      expect(timer.getCurrentTime().seconds).toBe(120)
    })

    test('should update progress correctly after adding', () => {
      timer = new Timer({ initialTime: 100 })
      timer.add({ seconds: 50 })
      const expectedProgress = (150 / 100) * 100
      expect(timer.store.state.progress).toBe(expectedProgress)
    })
  })

  describe('subtract', () => {
    test('should subtract seconds and update progress', () => {
      timer = new Timer({ initialTime: 100 })
      timer.subtract({ seconds: 30 })
      expect(timer.getCurrentTime().seconds).toBe(70)
      expect(timer.store.state.progress).toBe(70)
    })

    test('should subtract minutes', () => {
      timer = new Timer({ initialTime: 300 })
      timer.subtract({ minutes: 2 })
      expect(timer.getCurrentTime().seconds).toBe(180)
    })

    test('should clamp to zero when subtracting more than available', () => {
      timer = new Timer({ initialTime: 50 })
      timer.subtract({ seconds: 100 })
      expect(timer.getCurrentTime().seconds).toBe(0)
      expect(timer.store.state.progress).toBe(0)
    })
  })

  describe('updateCurrentTime', () => {
    test('should decrement time when running', () => {
      timer = new Timer({ initialTime })
      timer.start()
      vi.advanceTimersByTime(2000)
      const currentTime = timer.getCurrentTime().seconds
      expect(currentTime).toBeLessThan(initialTime)
    })

    test('should update progress as time decreases', () => {
      timer = new Timer({ initialTime: 100 })
      timer.start()
      vi.advanceTimersByTime(5000)
      const progress = timer.store.state.progress
      expect(progress).toBeLessThan(100)
      expect(progress).toBeGreaterThan(0)
    })

    test('should change state to finished when timer reaches zero', () => {
      timer = new Timer({ initialTime: 5 })
      timer.start()
      vi.advanceTimersByTime(6000)
      expect(timer.store.state.state).toBe('finished')
      expect(timer.getCurrentTime().seconds).toBe(0)
      expect(timer.store.state.progress).toBe(0)
    })

    test('should stop updating when finished', () => {
      timer = new Timer({ initialTime: 2 })
      timer.start()
      vi.advanceTimersByTime(3000)
      const timeAfterFinish = timer.getCurrentTime().seconds
      vi.advanceTimersByTime(5000)
      const timeLater = timer.getCurrentTime().seconds
      expect(timeAfterFinish).toBe(timeLater)
      expect(timeAfterFinish).toBe(0)
    })

    test('should not update when stopped', () => {
      timer = new Timer({ initialTime })
      timer.start()
      vi.advanceTimersByTime(2000)
      const timeBeforeStop = timer.getCurrentTime().seconds
      timer.stop()
      vi.advanceTimersByTime(5000)
      const timeAfterStop = timer.getCurrentTime().seconds
      expect(timeAfterStop).toBe(timeBeforeStop)
    })

    test('should not update when idle', () => {
      timer = new Timer({ initialTime })
      const initialTimeValue = timer.getCurrentTime().seconds
      vi.advanceTimersByTime(5000)
      const timeAfterWait = timer.getCurrentTime().seconds
      expect(timeAfterWait).toBe(initialTimeValue)
    })
  })

  describe('getCurrentTime', () => {
    test('should return Duration object', () => {
      timer = new Timer({ initialTime })
      const duration = timer.getCurrentTime()
      expect(duration.seconds).toBe(initialTime)
    })

    test('should return updated time after operations', () => {
      timer = new Timer({ initialTime: 100 })
      timer.add({ seconds: 50 })
      expect(timer.getCurrentTime().seconds).toBe(150)
      timer.subtract({ seconds: 30 })
      expect(timer.getCurrentTime().seconds).toBe(120)
    })
  })

  describe('progress calculation', () => {
    test('should calculate progress correctly', () => {
      timer = new Timer({ initialTime: 100 })
      timer.subtract({ seconds: 25 })
      expect(timer.store.state.progress).toBe(75)
    })

    test('should handle progress over 100% when time added', () => {
      timer = new Timer({ initialTime: 100 })
      timer.add({ seconds: 50 })
      expect(timer.store.state.progress).toBe(150)
    })

    test('should handle zero initialTime', () => {
      timer = new Timer({ initialTime: 0 })
      timer.add({ seconds: 10 })
      expect(timer.store.state.progress).toBe(0)
    })
  })
})
