---
title: Use Calendar
id: useCalendar
---

## `useCalendar`

```tsx
export function useCalendar({
  weekStartsOn,
  events,
  viewMode,
  locale,
  onChangeViewMode,
}: UseCalendarProps)
```

`useCalendar` is a hook that provides a comprehensive set of functionalities for managing calendar events, view modes, and period navigation.

### Parameters

- `events?: TEvent[] | null`
An optional array of events to be handled by the calendar.
- `viewMode: CalendarStore['viewMode']`
The initial view mode configuration of the calendar.
- `locale?: Intl.UnicodeBCP47LocaleIdentifier`
Optional locale for date formatting. Uses a BCP 47 language tag.
- `timeZone?: Temporal.TimeZoneLike`
Optional time zone specification for the calendar.
- `calendar?: Temporal.CalendarLike`
Optional calendar system to be used.
- `resources?: TResource[] | null`
Optional resources to be used in the calendar.
- `range?: DateRange`
Optional range of dates to be used in the calendar.

### Returns

- `firstDayOfPeriod: Temporal.PlainDate`
This value represents the first day of the current period displayed by the calendar.
- `currentPeriod: string`
This value represents a string that describes the current period displayed by the calendar.
- `goToPreviousPeriod: () => void`
This function navigates to the previous period.
- `goToNextPeriod: () => void`
This function navigates to the next period.
- `goToCurrentPeriod: () => void`
This function navigates to the current period.
- `goToSpecificPeriod: (date: string) => void`
This function navigates to a specific period based on the provided date.
- `days: Day<TResource, TEvent>[]`
This value represents an array of days in the current period displayed by the calendar.
- `getDaysNames: (weekday?: 'long' | 'short') => string[]`
This function is used to retrieve the names of the days of the week, based on the current locale.
- `viewMode: CalendarStore['viewMode']`
This value represents the current view mode of the calendar.
- `changeViewMode: (newViewMode: CalendarStore['viewMode']) => void`
This function is used to change the view mode of the calendar.
- `getEventProps: (id: Event['id']) => { isSplitEvent: boolean, overlappingEvents: TEvent[] } | null`
This function is used to retrieve the properties for a specific event based on its ID.
- `groupDaysBy: (props: Omit<GroupDaysByProps<TResource, TEvent>, 'weekStartsOn' | 'locale'>) => (Day<TResource, TEvent> | null)[][]`
This function is used to group the days in the current period by a specified unit. The fillMissingDays parameter can be used to fill in missing days with previous or next month's days.
- `canGoPreviousPeriod: () => boolean`
This function is used to check if the previous period is available.
- `canGoNextPeriod: () => boolean`
This function is used to check if the next period is available.
- `isPending: boolean`
This value represents whether the calendar is in a pending state.

### Example Usage

```tsx
const CalendarComponent = ({ events }) => {
  const {
    firstDayOfPeriod,
    currentPeriod,
    goToPreviousPeriod,
    goToNextPeriod,
    goToCurrentPeriod,
    goToSpecificPeriod,
    changeViewMode,
    days,
    daysNames,
    viewMode,
    getEventProps,
    getCurrentTimeMarkerProps,
    groupDaysBy,
  } = useCalendar({
    viewMode: { value: 1, unit: 'month' },
    events,
    locale: 'en-US',
    timeZone: 'America/New_York',
    calendar: 'gregory',
  });

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPreviousPeriod}>Previous</button>
        <button onClick={goToCurrentPeriod}>Today</button>
        <button onClick={goToNextPeriod}>Next</button>
      </div>
      <div className="calendar-view-mode">
        <button onClick={() => changeViewMode({ value: 1, unit: 'month' })}>Month View</button>
        <button onClick={() => changeViewMode({ value: 1, unit: 'week' })}>Week View</button>
        <button onClick={() => changeViewMode({ value: 3, unit: 'day' })}>3-Day View</button>
        <button onClick={() => changeViewMode({ value: 1, unit: 'day' })}>1-Day View</button>
      </div>
      <table className="calendar-table">
        {viewMode.unit === 'month' && (
          groupDaysBy(days, 'months').map((month, monthIndex) => (
            <tbody key={monthIndex} className="calendar-month">
              <tr>
                <th colSpan={7} className="calendar-month-name">
                  {month[0]?.date.toLocaleString('default', { month: 'long' })}{' '}
                  {month[0]?.date.year}
                </th>
              </tr>
              <tr>
                {daysNames.map((dayName, index) => (
                  <th key={index} className="calendar-day-name">
                    {dayName}
                  </th>
                ))}
              </tr>
              {groupDaysBy(month, 'weeks').map((week, weekIndex) => (
                <tr key={weekIndex} className="calendar-week">
                  {week.map((day) => (
                    <td
                      key={day.date.toString()}
                      className={`calendar-day ${day.isToday ? 'today' : ''
                        } ${day.isInCurrentPeriod ? 'current' : 'not-current'}`}
                    >
                      <div className="calendar-date">{day.date.day}</div>
                      <div className="calendar-events">
                        {day.events.map((event) => (
                          <div
                            key={event.id}
                            className="calendar-event"
                            style={getEventProps(event.id)?.style}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))
        )}

        {viewMode.unit === 'week' && (
          <tbody className="calendar-week">
            <tr>
              {daysNames.map((dayName, index) => (
                <th key={index} className="calendar-day-name">
                  {dayName}
                </th>
              ))}
            </tr>
            {groupDaysBy(days, 'weeks').map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day) => (
                  <td
                    key={day.date.toString()}
                    className={`calendar-day ${day.isToday ? 'today' : ''
                      } ${day.isInCurrentPeriod ? 'current' : 'not-current'}`}
                  >
                    <div className="calendar-date">{day.date.day}</div>
                    <div className="calendar-events">
                      {day.events.map((event) => (
                        <div
                          key={event.id}
                          className="calendar-event"
                          style={getEventProps(event.id)?.style}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}

        {viewMode.unit === 'day' && (
          <tbody className="calendar-day">
            <tr>
              {daysNames.map((dayName, index) => (
                <th key={index} className="calendar-day-name">
                  {dayName}
                </th>
              ))}
            </tr>
            <tr>
              {days.map((day) => (
                <td
                  key={day.date.toString()}
                  className={`calendar-day ${day.isToday ? 'today' : ''
                    } ${day.isInCurrentPeriod ? 'current' : 'not-current'}`}
                >
                  <div className="calendar-date">{day.date.day}</div>
                  <div className="calendar-events">
                    {day.events.map((event) => (
                      <div
                        key={event.id}
                        className="calendar-event"
                        style={getEventProps(event.id)?.style}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};
```
