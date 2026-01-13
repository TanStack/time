---
title: DatePicker Core
id: date-picker-core
---

### `CalendarCore`
```ts
export class DatePickerCore extends CalendarCore {
  constructor(options: DatePickerCoreOptions);
}
```

The `DatePicker` class extends `CalendarCore` to provide additional functionalities for managing date selection, including single-date, multiple-date, and range selection modes. This class is designed to be used in various date picker applications where precise date management and selection are required.

#### Parameters

- `weekStartsOn?: number`
  - An optional number that specifies the day of the week that the calendar should start on. It defaults to 1 (Monday).
- `events?: TEvent[]`
  - An optional array of events that the calendar should display.
- `viewMode: ViewMode`
  - An object that specifies the initial view mode of the calendar.
- `locale?: Parameters<Temporal.PlainDate['toLocaleString']>['0']`
  - An optional string that specifies the locale to use for formatting dates and times.
- `minDate?: Temporal.PlainDate`
  - An optional date that specifies the minimum selectable date.
- `maxDate?: Temporal.PlainDate`
  - An optional date that specifies the maximum selectable date.
- `selectedDates?: Temporal.PlainDate[]`
  - An optional array of dates that are initially selected.
- `multiple?: boolean`
  - An optional boolean that allows multiple dates to be selected if set to true.
- `range?: boolean`
  - An optional boolean that allows a range of dates to be selected if set to true.

#### Returns

- `getSelectedDates(): Temporal.PlainDate[]`
  - Returns an array of selected dates.
- `selectDate(date: Temporal.PlainDate): void`
  - Selects a date. Depending on the configuration, this can handle single, multiple, or range selections.
- `getDaysWithEvents(): Array<Day<TEvent>>`
  - Returns an array of days in the current period with their associated events.
- `getDaysNames(): string[]`
  - Returns an array of strings representing the names of the days of the week based on the locale and week start day.
- `changeViewMode(newViewMode: ViewMode): void`
  - Changes the view mode of the calendar.
- `goToPreviousPeriod(): void`
  - Navigates to the previous period based on the current view mode.
- `goToNextPeriod(): void`
  - Navigates to the next period based on the current view mode.
- `goToCurrentPeriod(): void`
  - Navigates to the current period.
- `goToSpecificPeriod(date: Temporal.PlainDate): void`
  - Navigates to a specific period based on the provided date.
- `updateCurrentTime(): void`
  - Updates the current time.
- `getEventProps(id: Event['id']): { style: CSSProperties } | null`
  - Retrieves the style properties for a specific event based on its ID.
- `getCurrentTimeMarkerProps(): { style: CSSProperties; currentTime: string | undefined }`
  - Retrieves the style properties and current time for the current time marker.
- `groupDaysBy(props: Omit<GroupDaysByProps<TEvent>, 'weekStartsOn'>): (Day<TEvent> | null)[][]`
  - Groups the days in the current period by a specified unit. The fillMissingDays parameter can be used to fill in missing days with previous or next month's days.


#### Example Usage
```ts
import { DatePickerCore, Event } from '@tanstack/time';
import { Temporal } from '@js-temporal/polyfill';

const datePickerCore = new DatePickerCore({
  weekStartsOn: 1,
  viewMode: { value: 1, unit: 'month' },
  events,
  locale: 'en-US',
  minDate: Temporal.PlainDate.from('2024-01-01'),
  maxDate: Temporal.PlainDate.from('2024-12-31'),
  selectedDates: [Temporal.PlainDate.from('2024-06-10')],
  multiple: true,
});

// Get selected dates
const selectedDates = datePickerCore.getSelectedDates();
console.log(selectedDates);

// Select a date
datePickerCore.selectDate(Temporal.PlainDate.from('2024-06-15'));

// Change view mode to week
datePickerCore.changeViewMode({ value: 1, unit: 'week' });

// Navigate to the next period
datePickerCore.goToNextPeriod();

// Update current time
datePickerCore.updateCurrentTime();

// Get event properties
const eventProps = datePickerCore.getEventProps('1');
console.log(eventProps);

// Get current time marker properties
const currentTimeMarkerProps = datePickerCore.getCurrentTimeMarkerProps();
console.log(currentTimeMarkerProps);

// Group days by week
const groupedDays = datePickerCore.groupDaysBy({ days: daysWithSelection, unit: 'week' });
console.log(groupedDays);
```
