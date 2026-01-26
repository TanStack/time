import { useCalendar } from '@tanstack/react-time'
import ReactDOM from 'react-dom/client'
import type { Day, Event, Resource } from '@tanstack/time'
import './index.css'

function formatPeriodDate(dateString: string): string {
  const datePart = dateString.split('[')[0]
  if (!datePart) return dateString

  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return formatter.format(date)
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getSampleEvents(): Array<Event<Resource>> {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)

  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)

  const fourDaysLater = new Date(today)
  fourDaysLater.setDate(today.getDate() + 4)

  return [
    {
      id: '1',
      title: 'Team Meeting',
      start: `${formatDateToISO(tomorrow)}T10:00:00`,
      end: `${formatDateToISO(tomorrow)}T11:00:00`,
    },
    {
      id: '2',
      title: 'Project Review',
      start: `${formatDateToISO(dayAfterTomorrow)}T14:00:00`,
      end: `${formatDateToISO(dayAfterTomorrow)}T15:30:00`,
    },
    {
      id: '3',
      title: 'Multi-day Conference',
      start: `${formatDateToISO(threeDaysLater)}T09:00:00`,
      end: `${formatDateToISO(fourDaysLater)}T17:00:00`,
    },
    {
      id: '4',
      title: 'Lunch Break',
      start: `${formatDateToISO(threeDaysLater)}T12:00:00`,
      end: `${formatDateToISO(threeDaysLater)}T13:00:00`,
    },
  ]
}

const sampleEvents = getSampleEvents()

function ScheduleView({
  calendar,
  days,
}: {
  calendar: ReturnType<typeof useCalendar<Resource, Event<Resource>>>
  days: Array<Day<Resource, Event<Resource>>>
}) {
  const timeSlots = calendar.getTimeSlots()

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="w-20 border-r border-gray-200 bg-gray-50">
        <div className="h-12 border-b border-gray-200"></div>
        {timeSlots.map((slot) => (
          <div
            key={`${slot.hour}-${slot.minute}`}
            className="h-[60px] border-b border-gray-100 px-2 py-1 text-xs text-gray-500"
          >
            {slot.label}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-x-auto">
        <div
          className="grid min-w-full"
          style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
        >
          <div className="contents">
            {days.map((day) => {
              const dayName = new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
              }).format(
                new Date(day.date.year, day.date.month - 1, day.date.day),
              )
              return (
                <div
                  key={day.date.toString()}
                  className="border-r border-gray-200 last:border-r-0"
                >
                  <div className="h-12 border-b border-gray-200 bg-gray-50 px-3 py-2 text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      {dayName}
                    </div>
                    <div className="text-xs text-gray-500">{day.date.day}</div>
                  </div>
                  <div className="relative h-[1440px]">
                    {day.events.map((event, eventIndex) => {
                      const eventProps = calendar.getEventProps(event)
                      if (!eventProps) return null
                      const { style } = eventProps
                      return (
                        <div
                          key={`${event.id}-${eventIndex}`}
                          className="absolute bg-blue-500 text-white rounded px-2 py-1 text-xs font-medium cursor-pointer overflow-hidden"
                          title={event.title}
                          style={style}
                        >
                          <div className="font-semibold">{event.title}</div>
                          {style && parseFloat(style.height) > 2 && (
                            <div className="text-xs opacity-90 mt-0.5">
                              {new Date(eventProps.start).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                },
                              )}
                              {' - '}
                              {new Date(eventProps.end).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                },
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarView() {
  const calendar = useCalendar<Resource, Event<Resource>>({
    viewMode: { value: 1, unit: 'month' },
    events: sampleEvents,

    timeZone: 'UTC',
  })

  const dayNames = calendar.getDaysNames('short')
  const groupedDays = calendar.groupDaysBy({
    days: calendar.days,
    unit: 'week',
    fillMissingDays: true,
  })

  const isScheduleView =
    calendar.viewMode.unit === 'week' || calendar.viewMode.unit === 'day'
  const scheduleDays: Array<Day<Resource, Event<Resource>>> = isScheduleView
    ? calendar.viewMode.unit === 'day'
      ? calendar.days.filter((day) => {
          const currentDateStr = calendar.currentPeriod.split('[')[0]
          return day.date.toString({ calendarName: 'never' }) === currentDateStr
        })
      : calendar.days
    : []

  return (
    <div className="p-5 font-sans max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="m-0 mb-4 text-[28px] font-semibold">
          TanStack Time - Calendar Example
        </h1>

        <div className="flex gap-3 items-center mb-4">
          <button
            onClick={calendar.goToPreviousPeriod}
            disabled={!calendar.canGoPreviousPeriod() || calendar.isPending}
            className={`px-4 py-2 border border-gray-300 rounded-md bg-white ${
              calendar.canGoPreviousPeriod() && !calendar.isPending
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={calendar.goToCurrentPeriod}
            disabled={calendar.isPending}
            className={`px-4 py-2 border border-gray-300 rounded-md bg-white ${
              calendar.isPending
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer opacity-100'
            }`}
          >
            Today
          </button>

          <button
            onClick={calendar.goToNextPeriod}
            disabled={!calendar.canGoNextPeriod() || calendar.isPending}
            className={`px-4 py-2 border border-gray-300 rounded-md bg-white ${
              calendar.canGoNextPeriod() && !calendar.isPending
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            Next →
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'month' })
              }
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                calendar.viewMode.unit === 'month'
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() =>
                calendar.changeViewMode({ value: 1, unit: 'week' })
              }
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                calendar.viewMode.unit === 'week'
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => calendar.changeViewMode({ value: 1, unit: 'day' })}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                calendar.viewMode.unit === 'day'
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        <div className="text-lg font-medium text-gray-700">
          {formatPeriodDate(calendar.currentPeriod)}
        </div>
      </div>

      {isScheduleView ? (
        <ScheduleView calendar={calendar} days={scheduleDays} />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div
            className="grid border-b-2 border-gray-200 bg-gray-50"
            style={{ gridTemplateColumns: `repeat(${dayNames.length}, 1fr)` }}
          >
            {dayNames.map((dayName: string, index: number) => (
              <div
                key={index}
                className={`py-3 text-center font-semibold text-sm text-gray-500 ${
                  index < dayNames.length - 1 ? 'border-r border-gray-200' : ''
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${dayNames.length}, 1fr)` }}
          >
            {groupedDays.map(
              (
                week: Array<Day<Resource, Event<Resource>> | null>,
                weekIndex: number,
              ) =>
                week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className={`min-h-[120px] bg-gray-50 ${
                          dayIndex < dayNames.length - 1
                            ? 'border-r border-gray-200'
                            : ''
                        } ${
                          weekIndex < groupedDays.length - 1
                            ? 'border-b border-gray-200'
                            : ''
                        }`}
                      />
                    )
                  }

                  const isToday = day.isToday
                  const isInCurrentPeriod = day.isInCurrentPeriod

                  return (
                    <div
                      key={day.date.toString()}
                      className={`min-h-[120px] p-2 relative ${
                        dayIndex < dayNames.length - 1
                          ? 'border-r border-gray-200'
                          : ''
                      } ${
                        weekIndex < groupedDays.length - 1
                          ? 'border-b border-gray-200'
                          : ''
                      } ${
                        isToday
                          ? 'bg-blue-50'
                          : isInCurrentPeriod
                            ? 'bg-white'
                            : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className={`text-sm mb-1 ${
                          isToday
                            ? 'font-bold text-blue-500'
                            : isInCurrentPeriod
                              ? 'font-medium text-gray-900'
                              : 'font-medium text-gray-400'
                        }`}
                      >
                        {day.date.day}
                      </div>
                      <div className="flex flex-col gap-1">
                        {day.events.map((event) => (
                          <div
                            key={event.id}
                            className="px-1.5 py-1 bg-blue-500 text-white rounded text-xs font-medium cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }),
            )}
          </div>
        </div>
      )}

      {calendar.isPending && (
        <div className="fixed top-5 right-5 px-5 py-3 bg-blue-500 text-white rounded-md text-sm font-medium shadow-lg">
          Loading...
        </div>
      )}
    </div>
  )
}

function App() {
  return <CalendarView />
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
