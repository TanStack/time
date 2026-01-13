import { Temporal } from '@js-temporal/polyfill'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { TimeCore } from '../core/time'

export class TestTimeCore extends TimeCore {
  getCurrentTime(): Temporal.ZonedDateTime {
    return super.getCurrentTime()
  }

  startUpdatingTime(intervalMs: number = 1000) {
    super.startUpdatingTime(intervalMs)
  }

  stopUpdatingTime() {
    super.stopUpdatingTime()
  }
}

describe('TimeCore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const mockNow = Temporal.PlainDateTime.from({
      year: 2024,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    })
    vi.setSystemTime(mockNow.toZonedDateTime('UTC').epochMilliseconds)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should initialize with the current time in the default time zone', () => {
    const timeCore = new TestTimeCore()
    const currentTime = Temporal.Now.zonedDateTimeISO()
    expect(timeCore.getCurrentTime().toString()).toBe(currentTime.toString())
  })

  test('should initialize with the current time in the specified time zone', () => {
    const timeZone = 'America/New_York'
    const timeCore = new TestTimeCore({ timeZone })
    const currentTime = Temporal.Now.zonedDateTimeISO(timeZone)
    expect(timeCore.getCurrentTime().toString()).toBe(currentTime.toString())
  })

  test('should start updating the current time', () => {
    const timeCore = new TestTimeCore()
    timeCore.startUpdatingTime()
    vi.advanceTimersByTime(1000)
    const currentTime = Temporal.Now.zonedDateTimeISO()
    expect(timeCore.getCurrentTime().epochMilliseconds).toBe(
      currentTime.epochMilliseconds,
    )
  })

  test('should stop updating the current time', () => {
    const timeCore = new TestTimeCore()
    timeCore.startUpdatingTime()

    vi.advanceTimersByTime(1000)
    timeCore.stopUpdatingTime()
    const stoppedTime = timeCore.getCurrentTime()

    vi.advanceTimersByTime(1000)
    const timeAfterStop = timeCore.getCurrentTime()
    expect(timeAfterStop.epochMilliseconds).toBe(stoppedTime.epochMilliseconds)
  })
})
