---
title: Calendar Core
id: calendar-core
---

## `CalendarCore`

```tsx
export class CalendarCore<TEvent extends Event> {
  constructor(options: CalendarCoreOptions<TEvent>);
}
```

The `CalendarCore` class provides a set of functionalities for managing calendar events, view modes, and period navigation. This class is designed to be used in various calendar applications where precise date management and event handling are required.

### Parameters

- `weekStartsOn?: number`
An optional number that specifies the day of the week that the calendar should start on. It defaults to 1 (Monday).
- `events?: TEvent[]`
An optional array of events that the calendar should display.
- `viewMode: ViewMode`
An object that specifies the initial view mode of the calendar.
- `locale?: Parameters<Temporal.PlainDate['toLocaleString']>['0']`
An optional string that specifies the locale to use for formatting dates and times.
- `timeZone?: Temporal.TimeZoneLike`
Optional time zone specification for the calendar.
- `calendar?: Temporal.CalendarLike`
Optional calendar system to be used.
- `resources?: TResource[]`
Optional resources to be used in the calendar.
- `range?: DateRange`
Optional range of dates to be used in the calendar.

### Returns

- `getDaysWithEvents(): Array<Day<TEvent>>`
Returns an array of days in the current period with their associated events.
- `getDaysNames(): string[]`
Returns an array of strings representing the names of the days of the week based on the locale and week start day.
- `changeViewMode(newViewMode: CalendarStore['viewMode']): void`
Changes the view mode of the calendar.
- `goToPreviousPeriod(): void`
Navigates to the previous period based on the current view mode.
- `goToNextPeriod(): void`
Navigates to the next period based on the current view mode.
- `goToCurrentPeriod(): void`
Navigates to the current period.
- `goToSpecificPeriod(date: Temporal.PlainDate): void`
Navigates to a specific period based on the provided date.
- `updateCurrentTime(): void`
Updates the current time.
- `getEventProps(id: Event['id']): { style: CSSProperties } | null`
Retrieves the style properties for a specific event based on its ID.
- `getCurrentTimeMarkerProps(): { style: CSSProperties; currentTime: string | undefined }`
Retrieves the style properties and current time for the current time marker.
- `groupDaysBy(props: Omit<GroupDaysByProps<TEvent>, 'weekStartsOn'>): (Day<TEvent> | null)[][]`
Groups the days in the current period by a specified unit. The fillMissingDays parameter can be used to fill in missing days with previous or next month's days.

### Example Usage

```ts
import { CalendarCore, Event } from '@tanstack/time';
import { Temporal } from '@js-temporal/polyfill';

interface MyEvent extends Event {
  location: string;
}

const events: MyEvent[] = [
  {
    id: '1',
    startDate: Temporal.PlainDateTime.from('2024-06-10T09:00'),
    endDate: Temporal.PlainDateTime.from('2024-06-10T10:00'),
    title: 'Event 1',
    location: 'Room 101',
  },
  {
    id: '2',
    startDate: Temporal.PlainDateTime.from('2024-06-12T11:00'),
    endDate: Temporal.PlainDateTime.from('2024-06-12T12:00'),
    title: 'Event 2',
    location: 'Room 202',
  },
];

const calendarCore = new CalendarCore<MyEvent>({
  viewMode: { value: 1, unit: 'month' },
  events,
  locale: 'en-US',
  timeZone: 'America/New_York',
  calendar: 'gregory',
});

// Get days with events
const daysWithEvents = calendarCore.getDaysWithEvents();
console.log(daysWithEvents);

// Change view mode to week
calendarCore.changeViewMode({ value: 1, unit: 'week' });

// Navigate to the next period
calendarCore.goToNextPeriod();

// Update current time
calendarCore.updateCurrentTime();

// Get event properties
const eventProps = calendarCore.getEventProps('1');
console.log(eventProps);

// Get current time marker properties
const currentTimeMarkerProps = calendarCore.getCurrentTimeMarkerProps();
console.log(currentTimeMarkerProps);

// Group days by week
const groupedDays = calendarCore.groupDaysBy({ days: daysWithEvents, unit: 'week' });
console.log(groupedDays);
```
