import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { Temporal } from '@js-temporal/polyfill'
import { useDatePicker } from '@tanstack/react-time'
import { isDateInRange } from '@tanstack/time'
import './index.css'

export default function App() {
  const today = Temporal.Now.plainDateISO()
  const rangeStart = today.subtract({ months: 1 })
  const rangeEnd = today.add({ months: 6 })
  const selectableRange = {
    start: rangeStart.toString(),
    end: rangeEnd.toString(),
  }

  const {
    changeViewMode,
    getDaysNames,
    days,
    viewMode,
    isPending,
    goToPreviousPeriod,
    goToNextPeriod,
    goToCurrentPeriod,
    canGoPreviousPeriod,
    canGoNextPeriod,
    currentPeriod,
    selectedDates,
    selectDate,
    getSelectedDates,
    groupDaysBy,
  } = useDatePicker({
    viewMode: { value: 1, unit: 'month' },
    locale: 'en-US',
    range: selectableRange,
    mode: 'range',
  })

  const daysNames = getDaysNames('short')

  const groupedWeeks = groupDaysBy({
    days: days,
    unit: 'week',
    fillMissingDays: true,
  })

  const selectedDatesList = getSelectedDates()

  return (
    <div className="p-5 font-sans max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">
        TanStack Time Date Picker Example
      </h1>

      <div className="mb-5 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Selected Dates:</h2>
        {selectedDatesList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedDatesList.map((date) => (
              <span
                key={date}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                {Temporal.PlainDate.from(date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No dates selected</p>
        )}
      </div>

      <div className="mb-5">
        <div className="flex gap-2.5 items-center">
          <button
            onClick={goToPreviousPeriod}
            disabled={isPending || !canGoPreviousPeriod()}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={goToCurrentPeriod}
            disabled={isPending}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextPeriod}
            disabled={isPending || !canGoNextPeriod()}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
          <div className="ml-5 text-lg font-bold">
            {Temporal.PlainDate.from(currentPeriod).toLocaleString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        <div className="mt-2.5 flex gap-2.5">
          <button
            onClick={() => changeViewMode({ value: 1, unit: 'month' })}
            className={`px-3 py-1.5 text-xs rounded border border-gray-300 transition-colors ${
              viewMode.unit === 'month'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => changeViewMode({ value: 1, unit: 'week' })}
            className={`px-3 py-1.5 text-xs rounded border border-gray-300 transition-colors ${
              viewMode.unit === 'week'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid gap-px bg-gray-300 border border-gray-300">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${daysNames.length}, 1fr)`,
          }}
        >
          {daysNames.map((dayName: string) => (
            <div
              key={dayName}
              className="p-2.5 bg-white text-center font-bold text-xs"
            >
              {dayName}
            </div>
          ))}
        </div>

        {groupedWeeks.map(
          (week: Array<(typeof days)[0] | null>, weekIndex: number) => (
            <div
              key={weekIndex}
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${daysNames.length}, 1fr)`,
              }}
            >
              {week.map((day: (typeof days)[0] | null) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIndex}`}
                      className="min-h-[100px] p-2 bg-gray-50 border border-gray-200"
                    />
                  )
                }

                const dateStr = day.date.toString()
                const isToday = day.isToday
                const isInCurrentPeriod = day.isInCurrentPeriod
                const isSelected = selectedDates.includes(dateStr)
                const isDisabled =
                  selectableRange.start || selectableRange.end
                    ? !isDateInRange({
                        date: day.date,
                        range: {
                          start: rangeStart,
                          end: rangeEnd,
                        },
                      })
                    : false

                return (
                  <button
                    key={dateStr}
                    onClick={() => !isDisabled && selectDate(dateStr)}
                    disabled={isDisabled}
                    className={`min-h-[100px] p-2 text-left transition-colors ${
                      isDisabled
                        ? 'bg-gray-100 border border-gray-200 opacity-30 cursor-not-allowed'
                        : isSelected
                          ? 'bg-blue-500 text-white border-2 border-blue-700 hover:bg-blue-600'
                          : isToday
                            ? 'bg-blue-50 border-2 border-blue-500 hover:bg-blue-100'
                            : isInCurrentPeriod
                              ? 'bg-white border border-gray-200 hover:bg-gray-50'
                              : 'bg-gray-100 border border-gray-200 opacity-50 hover:bg-gray-150'
                    }`}
                  >
                    <div className="text-sm mb-1">{day.date.day}</div>
                  </button>
                )
              })}
            </div>
          ),
        )}
      </div>

      {isPending && (
        <div className="mt-2.5 text-gray-600 text-sm">Loading...</div>
      )}
    </div>
  )
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
