import { Temporal } from '@js-temporal/polyfill'
import { Store } from '@tanstack/store'

type Duration = Required<Temporal.DurationLike>

export interface TimeCoreOptions {
  /**
   * The initial value for currentTime.
   * Must be provided by subclasses.
   */
  currentTime: number
}

export interface TimeState {
  /**
   * The current time or time-related value.
   * @readonly
   */
  currentTime: Temporal.Duration
}

export abstract class TimeCore<TState extends TimeState> {
  store: Store<TState>

  constructor(options: TimeCoreOptions) {
    this.store = new Store<TState>({
      currentTime: Temporal.Duration.from({ seconds: options.currentTime }),
    } as TState)
  }

  protected getCurrentTimeDuration(): Temporal.Duration {
    return this.store.state.currentTime
  }

  getCurrentTime(): Duration {
    const duration = this.getCurrentTimeDuration()
    const totalSeconds = duration.total({ unit: 'second' })
    return {
      years: duration.years,
      months: duration.months,
      weeks: duration.weeks,
      days: duration.days,
      hours: duration.hours,
      minutes: duration.minutes,
      seconds: totalSeconds,
      milliseconds: duration.milliseconds,
      microseconds: duration.microseconds,
      nanoseconds: duration.nanoseconds,
    }
  }

  /**
   * Adds a duration to the current time and updates the store.
   * @param duration - The duration to add (can be a Temporal.Duration or duration-like object)
   * @returns The new time after adding the duration (in seconds)
   */
  add(duration: Temporal.Duration | Temporal.DurationLike) {
    const durationObj =
      duration instanceof Temporal.Duration
        ? duration
        : Temporal.Duration.from(duration)
    const newDuration = this.store.state.currentTime.add(durationObj)
    const totalSeconds = newDuration.total({ unit: 'second' })
    const clampedDuration =
      totalSeconds >= 0 ? newDuration : Temporal.Duration.from({ seconds: 0 })

    this.store.setState((prev) => ({
      ...prev,
      currentTime: clampedDuration,
    }))
  }

  /**
   * Subtracts a duration from the current time and updates the store.
   * @param duration - The duration to subtract (can be a Temporal.Duration or duration-like object)
   * @returns The new time after subtracting the duration (in seconds)
   */
  subtract(duration: Temporal.Duration | Temporal.DurationLike) {
    const durationObj =
      duration instanceof Temporal.Duration
        ? duration
        : Temporal.Duration.from(duration)
    const newDuration = this.store.state.currentTime.subtract(durationObj)
    const totalSeconds = newDuration.total({ unit: 'second' })
    const clampedDuration =
      totalSeconds >= 0 ? newDuration : Temporal.Duration.from({ seconds: 0 })
    this.store.setState((prev) => ({
      ...prev,
      currentTime: clampedDuration,
    }))
  }
}
