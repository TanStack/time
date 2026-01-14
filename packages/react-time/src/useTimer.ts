import { Temporal } from '@js-temporal/polyfill'
import { useStore } from '@tanstack/react-store'
import { Timer, type TimerOptions } from '@tanstack/time'
import { useCallback, useState } from 'react'

export const useTimer = (options: TimerOptions) => {
  const [timer] = useState(() => new Timer(options))
  const state = useStore(timer.store)

  const start = useCallback<typeof timer.start>(() => {
    timer.start()
  }, [timer])

  const stop = useCallback<typeof timer.stop>(() => {
    timer.stop()
  }, [timer])

  const reset = useCallback<typeof timer.reset>(() => {
    timer.reset()
  }, [timer])

  const toggle = useCallback<typeof timer.toggle>(() => {
    timer.toggle()
  }, [timer])

  const setTime = useCallback<typeof timer.setTime>(
    (newTime: number) => {
      timer.setTime(newTime)
    },
    [timer],
  )

  const add = useCallback<typeof timer.add>(
    (duration: Temporal.DurationLike) => {
      return timer.add(duration)
    },
    [timer],
  )

  const subtract = useCallback<typeof timer.subtract>(
    (duration: Temporal.DurationLike) => {
      return timer.subtract(duration)
    },
    [timer],
  )

  return {
    ...state,
    currentTime: timer.getCurrentTime(),
    start,
    stop,
    reset,
    toggle,
    setTime,
    add,
    subtract,
  }
}
