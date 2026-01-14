import { beforeEach, describe, expect, test, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTimer } from '../useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  test('should start the timer', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }))
    act(() => {
      result.current.start()
    })
    expect(result.current.state).toBe('running')
  })

  test('should stop the timer', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }))
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.stop()
    })
    expect(result.current.state).toBe('stopped')
  })

  test('should reset the timer', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }))
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.stop()
    })
    expect(result.current.state).toBe('stopped')
    expect(result.current.currentTime.seconds).toBe(5)
  })

  test('should update the remaining time', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.currentTime.seconds).toBe(4)
  })
})
