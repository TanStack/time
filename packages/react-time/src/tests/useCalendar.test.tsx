import { Temporal } from '@js-temporal/polyfill'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { CalendarCore } from '@tanstack/time'
import { useStore } from '@tanstack/react-store'
import { useCalendar } from '../useCalendar'
import type { Mock } from 'vitest'
import type { Event } from '@tanstack/time'

vi.mock('@tanstack/time', () => {
  return {
    CalendarCore: vi.fn(),
  }
})

vi.mock('@tanstack/react-store', () => {
  return {
    useStore: vi.fn(),
  }
})

describe('useCalendar', () => {
  const events: Array<Event> = [
    {
      id: '1',
      start: '2024-06-01T10:00:00',
      end: '2024-06-01T12:00:00',
      title: 'Event 1',
    },
    {
      id: '2',
      start: '2024-06-02T14:00:00',
      end: '2024-06-02T16:00:00',
      title: 'Event 2',
    },
  ]

  const mockDate = Temporal.PlainDate.from('2024-06-15')
  const mockDateTime = Temporal.PlainDateTime.from('2024-06-15T10:00')
  const mockTimeZone = 'America/New_York'

  let mockStore: any
  let calendarCoreInstance: any

  beforeEach(() => {
    vi.spyOn(Temporal.Now, 'plainDateISO').mockReturnValue(mockDate)
    vi.spyOn(Temporal.Now, 'plainDateTimeISO').mockReturnValue(mockDateTime)
    const mockZonedDateTime =
      Temporal.Now.zonedDateTimeISO(mockTimeZone).withCalendar('gregory')
    vi.spyOn(Temporal.Now, 'zonedDateTimeISO').mockReturnValue(
      mockZonedDateTime,
    )

    mockStore = {
      subscribe: vi.fn(),
      state: {
        currentPeriod: mockDate,
        activeDate: mockDate,
        viewMode: { value: 1, unit: 'month' },
      },
    }

    calendarCoreInstance = {
      getDaysWithEvents: vi.fn().mockReturnValue([]),
      getDaysNames: vi.fn().mockReturnValue([]),
      goToPreviousPeriod: vi.fn(),
      goToNextPeriod: vi.fn(),
      goToCurrentPeriod: vi.fn(),
      goToSpecificPeriod: vi.fn(),
      changeViewMode: vi.fn(),
      getEventProps: vi.fn().mockReturnValue({}),
      groupDaysBy: vi.fn().mockReturnValue([]),
      store: mockStore,
    }
    ;(CalendarCore as Mock).mockImplementation(() => calendarCoreInstance)
    ;(useStore as Mock).mockImplementation((store) => store.state)
  })

  test('should initialize CalendarCore with provided options', () => {
    renderHook(() =>
      useCalendar({
        events,
        viewMode: { value: 1, unit: 'month' },
        timeZone: mockTimeZone,
      }),
    )

    expect(CalendarCore).toHaveBeenCalledWith({
      events,
      viewMode: { value: 1, unit: 'month' },
      timeZone: mockTimeZone,
    })
  })

  test('should call goToPreviousPeriod on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'month' } }),
    )

    act(() => {
      result.current.goToPreviousPeriod()
    })

    expect(calendarCoreInstance.goToPreviousPeriod).toHaveBeenCalled()
  })

  test('should call goToNextPeriod on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'month' } }),
    )

    act(() => {
      result.current.goToNextPeriod()
    })

    expect(calendarCoreInstance.goToNextPeriod).toHaveBeenCalled()
  })

  test('should call changeViewMode on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'month' } }),
    )

    act(() => {
      result.current.changeViewMode({ value: 1, unit: 'week' })
    })

    expect(calendarCoreInstance.changeViewMode).toHaveBeenCalledWith({
      value: 1,
      unit: 'week',
    })
  })

  test('should call goToSpecificPeriod on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'month' } }),
    )

    const specificDate = '2024-06-01'
    act(() => {
      result.current.goToSpecificPeriod(specificDate)
    })

    expect(calendarCoreInstance.goToSpecificPeriod).toHaveBeenCalledWith(
      specificDate,
    )
  })

  test('should call goToCurrentPeriod on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'month' } }),
    )

    act(() => {
      result.current.goToNextPeriod()
      result.current.goToCurrentPeriod()
    })

    expect(calendarCoreInstance.goToCurrentPeriod).toHaveBeenCalled()
  })

  test('should call getEventProps on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'week' } }),
    )

    act(() => {
      result.current.getEventProps('1')
    })

    expect(calendarCoreInstance.getEventProps).toHaveBeenCalledWith('1')
  })

  test('should call getDaysNames on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({
        events,
        viewMode: { value: 1, unit: 'month' },
        locale: 'en-US',
      }),
    )

    act(() => {
      result.current.getDaysNames('short')
    })

    expect(calendarCoreInstance.getDaysNames).toHaveBeenCalledWith('short')
  })

  test('should call groupDaysBy on CalendarCore instance', () => {
    const { result } = renderHook(() =>
      useCalendar({ events, viewMode: { value: 1, unit: 'month' } }),
    )

    act(() => {
      result.current.groupDaysBy({ days: [], unit: 'month' })
    })

    expect(calendarCoreInstance.groupDaysBy).toHaveBeenCalledWith({
      days: [],
      unit: 'month',
    })
  })
})
