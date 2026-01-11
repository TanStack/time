import { useCallback, useState, useTransition } from 'react'
import { useStore } from '@tanstack/react-store'
import { Temporal } from '@js-temporal/polyfill'
import { DatePickerCore } from '@tanstack/time'
import { groupDaysBy } from '@tanstack/time'
import type { DatePickerOptions } from '@tanstack/time'

export const useDatePicker = (options: DatePickerOptions) => {
  const [datePickerCore] = useState(() => new DatePickerCore(options))
  const state = useStore(datePickerCore.store)
  const datePickerState = useStore(datePickerCore.datePickerStore)
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

  const goToSpecificPeriod = useCallback<
    typeof datePickerCore.goToSpecificPeriod
  >(
    (date) => {
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
      days: Array<{
        date: Temporal.PlainDate
        events: never[]
        isToday: boolean
        isInCurrentPeriod: boolean
      }>
      unit: 'week' | 'month' | 'day'
      fillMissingDays?: boolean
    }) => {
      const daysWithMetadata = props.days.map((day) => ({
        date: day.date,
        events: [],
        isToday: day.isToday,
        isInCurrentPeriod: day.isInCurrentPeriod,
      }))
      const unit =
        props.unit === 'day'
          ? 'week'
          : props.unit === 'month'
            ? 'month'
            : 'week'
      return groupDaysBy({
        days: daysWithMetadata,
        unit: unit as 'month' | 'week' | 'workWeek',
        fillMissingDays: props.fillMissingDays ?? true,
        weekStartsOn: datePickerCore.getWeekStartsOn(),
        locale: datePickerCore.options.locale,
      } as any)
    },
    [datePickerCore],
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
      datePickerCore.selectDate(Temporal.PlainDate.from(date))
    },
    [datePickerCore],
  )

  const getSelectedDates = useCallback(() => {
    return datePickerCore.getSelectedDates().map((date) => date.toString())
  }, [datePickerCore])

  return {
    activeDate: state.activeDate.toString(),
    currentPeriod: state.currentPeriod.toString(),
    viewMode: state.viewMode,
    days: datePickerCore.getDaysWithEvents(),
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
    selectedDates: Array.from(datePickerState.selectedDates.keys()),
    selectDate,
    getSelectedDates,
  }
}
