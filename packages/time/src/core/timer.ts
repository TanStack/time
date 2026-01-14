import { Temporal } from '@js-temporal/polyfill'
import { TimeCore } from './time'
import type { TimeState } from './time'

export interface TimerOptions {
  /**
   * The initial time for the timer in seconds.
   */
  initialTime: number
  /**
   * The update interval in milliseconds.
   * @default 1000
   */
  intervalMs?: number
}

type State = 'idle' | 'running' | 'stopped' | 'finished'

interface TimerState extends TimeState {
  /**
   * The initial time for the timer in seconds.
   * @readonly
   * @type number
   */
  initialTime: number
  /**
   * The progress of the timer as a percentage (0-100).
   * @default 100
   * @readonly
   * @type number
   */
  progress: number
  /**
   * Whether the timer is running.
   * @default false
   * @readonly
   * @type boolean
   */
  state: State
}

export class Timer extends TimeCore<TimerState> {
  private interval: NodeJS.Timeout | null = null
  private intervalMs: number

  constructor(options: TimerOptions) {
    super({
      currentTime: options.initialTime,
    })
    this.intervalMs = options.intervalMs ?? 1000
    this.store.setState((prev) => ({
      ...prev,
      initialTime: options.initialTime,
      progress: options.initialTime > 0 ? 100 : 0,
      state: 'idle',
    }))
  }

  private startUpdatingTime() {
    if (!this.interval) {
      this.interval = setInterval(
        () => this.updateCurrentTime(),
        this.intervalMs,
      )
    }
  }

  private stopUpdatingTime() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  start() {
    if (this.store.state.state !== 'running') {
      this.store.setState((prev) => ({
        ...prev,
        state: 'running',
      }))
      this.startUpdatingTime()
    }
  }

  stop() {
    if (this.store.state.state === 'running') {
      this.store.setState((prev) => ({
        ...prev,
        state: 'stopped',
      }))
      this.stopUpdatingTime()
    }
  }

  toggle() {
    if (this.store.state.state === 'running') {
      this.stop()
    } else {
      this.start()
    }
  }

  reset() {
    this.stopUpdatingTime()
    this.store.setState((prev) => ({
      ...prev,
      currentTime: Temporal.Duration.from({ seconds: prev.initialTime }),
      progress: prev.initialTime > 0 ? 100 : 0,
      state: 'idle',
    }))
  }

  setTime(newTime: number) {
    if (newTime < 0) throw new Error('Time must be a positive number')

    this.stopUpdatingTime()
    this.store.setState((prev) => ({
      ...prev,
      currentTime: Temporal.Duration.from({ seconds: newTime }),
      initialTime: newTime,
      progress: newTime > 0 ? 100 : 0,
      state: 'idle',
    }))
  }

  add(duration: Temporal.Duration | Temporal.DurationLike) {
    super.add(duration)
    this.onCurrentTimeUpdated()
  }

  subtract(duration: Temporal.Duration | Temporal.DurationLike) {
    super.subtract(duration)
    this.onCurrentTimeUpdated()
  }

  private onCurrentTimeUpdated() {
    const currentTimeSeconds = this.getCurrentTimeDuration().total({
      unit: 'second',
    })
    const initialTime = this.store.state.initialTime
    const progress =
      initialTime > 0 ? (currentTimeSeconds / initialTime) * 100 : 0

    this.store.setState((prev) => ({
      ...prev,
      progress: Math.max(0, progress),
    }))
  }

  protected updateCurrentTime() {
    if (this.store.state.state !== 'running') return

    const decrementDuration = Temporal.Duration.from({
      milliseconds: this.intervalMs,
    })
    const newDuration = this.store.state.currentTime.subtract(decrementDuration)
    const remainingSeconds = newDuration.total({ unit: 'second' })

    if (remainingSeconds <= 0) {
      this.store.setState((prev) => ({
        ...prev,
        currentTime: Temporal.Duration.from({ seconds: 0 }),
        progress: 0,
        state: 'finished',
      }))
      this.stopUpdatingTime()
      return
    }

    this.store.setState((prev) => ({
      ...prev,
      currentTime: newDuration,
    }))
    this.onCurrentTimeUpdated()
  }
}
