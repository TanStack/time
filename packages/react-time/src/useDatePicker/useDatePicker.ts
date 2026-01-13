import { useCallback, useMemo, useState, useTransition } from 'react'
import { useStore } from '@tanstack/react-store'
import { DatePickerCore } from '@tanstack/time'
import type { DatePickerOptions } from '@tanstack/time'

export const useDatePicker = (options: DatePickerOptions) => {
  const [datePickerCore] = useState(() => new DatePickerCore(options))
  const state = useStore(datePickerCore.store)
  const selectedDatesKeys = useStore(datePickerCore.datePickerStore, (s) =>
    Array.from(s.selectedDates.keys()).sort().join(','),
  )
  const [isPending, startTransition] = useTransition()

  const goToPreviousPeriod = useCallback<
    typeof datePickerCore.goToPreviousPeriod
  >(() => {
    startTransition(() => {
      datePickerCore.goToPreviousPeriod()
    })
  }, [datePickerCore, startTransition])

  const goToNextPeriod = useCallback<
    typeof datePickerCore.goToNextPeriod
  >(() => {
    startTransition(() => {
      datePickerCore.goToNextPeriod()
    })
  }, [datePickerCore, startTransition])

  const goToCurrentPeriod = useCallback<
    typeof datePickerCore.goToCurrentPeriod
  >(() => {
    startTransition(() => {
      datePickerCore.goToCurrentPeriod()
    })
  }, [datePickerCore, startTransition])

  const goToSpecificPeriod = useCallback(
    (date: string | number | Date) => {
      startTransition(() => {
        datePickerCore.goToSpecificPeriod(date)
      })
    },
    [datePickerCore, startTransition],
  )

  const changeViewMode = useCallback<typeof datePickerCore.changeViewMode>(
    (newViewMode) => {
      startTransition(() => {
        datePickerCore.changeViewMode(newViewMode)
      })
    },
    [datePickerCore, startTransition],
  )

  const getEventProps = useCallback(() => null, [])

  const groupDaysByCallback = useCallback(
    (props: {
      days: ReturnType<typeof datePickerCore.getDaysWithEvents>
      unit: 'week' | 'month' | 'day'
      fillMissingDays?: boolean
    }) => {
      const unit = props.unit === 'day' ? 'week' : props.unit
      return datePickerCore.groupDaysBy({
        ...props,
        unit: unit as 'week' | 'month',
      })
    },
    [datePickerCore, selectedDatesKeys],
  )

  const getDaysNames = useCallback<typeof datePickerCore.getDaysNames>(
    (props) => datePickerCore.getDaysNames(props),
    [datePickerCore],
  )

  const canGoPreviousPeriod = useCallback<
    typeof datePickerCore.canGoPreviousPeriod
  >(() => datePickerCore.canGoPreviousPeriod(), [datePickerCore])

  const canGoNextPeriod = useCallback<typeof datePickerCore.canGoNextPeriod>(
    () => datePickerCore.canGoNextPeriod(),
    [datePickerCore],
  )

  const selectDate = useCallback(
    (date: string) => {
      startTransition(() => {
        datePickerCore.selectDate(date)
      })
    },
    [datePickerCore, startTransition],
  )

  const getSelectedDates = useCallback(() => {
    return datePickerCore.getSelectedDates()
  }, [datePickerCore])

  const days = useMemo(
    () => datePickerCore.getDaysWithEvents(),
    [datePickerCore, selectedDatesKeys, state.currentPeriod, state.viewMode],
  )

  return {
    activeDate: state.activeDate.toString(),
    currentPeriod: state.currentPeriod.toString(),
    viewMode: state.viewMode,
    days,
    getDaysNames,
    goToPreviousPeriod,
    goToNextPeriod,
    goToCurrentPeriod,
    goToSpecificPeriod,
    canGoPreviousPeriod,
    canGoNextPeriod,
    changeViewMode,
    getEventProps,
    isPending,
    groupDaysBy: groupDaysByCallback,
    selectDate,
    getSelectedDates,
  }
}
