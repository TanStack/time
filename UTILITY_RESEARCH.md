# Utility Research: d3-time & date-fns

## Already Implemented ✅

- `startOf` / `endOf` - Start/end of units
- `add` / `subtract` - Date arithmetic
- `round` - Round to nearest unit
- `isBefore` / `isAfter` - Comparisons
- `equals` - Equality with unit
- `isSameOrBefore` / `isSameOrAfter` - Comparison with unit
- `isBetween` / `intersects` - Range operations
- `since` / `until` - Duration calculations
- `format` - Date formatting

## Recommended Additions

### 1. Rounding & Boundaries (from d3-time)

#### `ceil(date, unit)` - Round up to nearest unit ✅

- **Use case**: "Next Monday", "Next hour", "Next month"
- **Example**: `ceil('2024-03-15T14:30:00Z', { unit: 'hour' })` → `'2024-03-15T15:00:00Z'`
- **Status**: High priority - complements `round` and `startOf`

#### `floor(date, unit)` - Round down to nearest unit ✅

- **Use case**: Similar to `startOf` but more explicit naming
- **Note**: Could be alias for `startOf` or separate implementation
- **Status**: Medium priority - `startOf` already covers this

### 2. Range Generation (from d3-time & date-fns)

#### `range(start, end, unit, step?)` - Generate array of dates

- **Use case**: Generate dates for calendars, charts, time series
- **Example**: `range('2024-03-01', '2024-03-31', { unit: 'day' })` → array of all days in March
- **Example**: `range('2024-03-01T00:00:00Z', '2024-03-01T23:00:00Z', { unit: 'hour', step: 2 })` → every 2 hours
- **Status**: High priority - very useful for UI components

#### `eachDayOfInterval(range)` - Generate days in range

- **Use case**: Calendar views, date pickers
- **Status**: Medium priority - can use `range` with `unit: 'day'`

#### `eachWeekOfInterval(range)` - Generate weeks in range

- **Use case**: Week-based views
- **Status**: Medium priority - can use `range` with `unit: 'week'`

### 3. Interval Counting (from d3-time)

#### `count(start, end, unit)` - Count intervals between dates

- **Use case**: "How many days/months/weeks between two dates?"
- **Example**: `count('2024-03-01', '2024-03-31', { unit: 'day' })` → `30`
- **Note**: Different from `until` which returns duration - this counts discrete intervals
- **Status**: High priority - common use case

### 4. Date Clamping (from date-fns)

#### `clamp(date, range)` - Ensure date is within range

- **Use case**: Date picker min/max constraints, validation
- **Example**: `clamp('2024-05-01', { start: '2024-03-01', end: '2024-04-30' })` → `'2024-04-30'`
- **Status**: High priority - essential for date pickers

### 5. Relative Time Checks (from date-fns)

#### `isToday(date)` - Check if date is today

- **Use case**: UI highlighting, relative formatting
- **Status**: Medium priority - convenience function

#### `isYesterday(date)` / `isTomorrow(date)` - Relative day checks

- **Use case**: Relative date formatting ("yesterday", "tomorrow")
- **Status**: Low priority - can be built with `isSameDay` + date arithmetic

#### `isPast(date)` / `isFuture(date)` - Relative to now

- **Use case**: Validation, conditional rendering
- **Status**: Medium priority - common use case

### 6. Day/Week Helpers (from date-fns)

#### `isWeekend(date)` / `isWeekday(date)` - Day type checks

- **Use case**: Business logic, calendar highlighting
- **Status**: Medium priority - useful utility

#### `isSameDay(date1, date2)` / `isSameMonth(date1, date2)` / `isSameYear(date1, date2)`

- **Use case**: Convenience wrappers around `equals` with specific units
- **Status**: Low priority - `equals` with unit already covers this

### 7. Getters (from date-fns)

#### `getDayOfYear(date)` - Get day of year (1-365/366)

- **Use case**: Analytics, progress tracking
- **Status**: Medium priority - niche but useful

#### `getWeek(date)` - Get ISO week number

- **Use case**: Week-based reporting, ISO 8601 compliance
- **Status**: Medium priority - depends on week calculation needs

#### `getWeeksInMonth(date)` - Count weeks in month

- **Use case**: Calendar layout calculations
- **Status**: Low priority - can be calculated

### 8. Setters (from date-fns)

#### `set(date, { year?, month?, day?, hour?, ... })` - Set date components

- **Use case**: Date manipulation, form inputs
- **Example**: `set('2024-03-15T14:00:00Z', { month: 5, day: 1 })` → `'2024-06-01T14:00:00Z'`
- **Status**: High priority - very useful for date manipulation

#### `setDate(date, day)` / `setMonth(date, month)` / `setYear(date, year)` - Individual setters

- **Use case**: Convenience setters
- **Status**: Medium priority - can use `set` with single property

### 9. Min/Max Operations (from date-fns)

#### `min(dates[])` - Find earliest date

- **Use case**: Finding earliest date in array
- **Status**: Medium priority - useful utility

#### `max(dates[])` - Find latest date

- **Use case**: Finding latest date in array
- **Status**: Medium priority - useful utility

### 10. Calendar Differences (from date-fns)

#### `differenceInCalendarDays(date1, date2)` - Calendar day difference

- **Use case**: "How many calendar days apart?" vs duration
- **Note**: Different from `until` - counts calendar boundaries, not duration
- **Status**: Medium priority - useful distinction from duration

#### `differenceInCalendarMonths(date1, date2)` / `differenceInCalendarYears(date1, date2)`

- **Use case**: Calendar-based differences
- **Status**: Medium priority - similar to calendar days

### 11. Offset/Step Operations (from d3-time)

#### `offset(date, unit, step)` - Advance by step intervals

- **Use case**: "Next 3 Mondays", "Every 15 minutes"
- **Example**: `offset('2024-03-15T14:00:00Z', { unit: 'day', step: 7 })` → next week same time
- **Status**: Medium priority - can use `add` with duration

#### `every(unit, step)` - Create filtered interval

- **Use case**: "Every 15 minutes", "Every 2 weeks"
- **Status**: Low priority - advanced use case

### 12. Conversion Helpers (from date-fns)

#### `toDate(dateInput)` - Convert to Date object

- **Use case**: Interop with Date-based libraries
- **Status**: Low priority - `asDate()` already exists on results

#### `fromUnixTime(timestamp)` - Create date from Unix timestamp

- **Use case**: API responses, database timestamps
- **Status**: Medium priority - common conversion

#### `getUnixTime(date)` - Get Unix timestamp

- **Use case**: API requests, database storage
- **Status**: Medium priority - common conversion

## Priority Recommendations

### High Priority (Implement Soon)

1. **`ceil`** - Round up to nearest unit (complements `round`)
2. **`range`** - Generate date arrays (essential for calendars/charts)
3. **`count`** - Count intervals between dates (common use case)
4. **`clamp`** - Date clamping (essential for date pickers)
5. **`set`** - Set date components (very useful for manipulation)

### Medium Priority (Consider Adding)

1. **`isPast` / `isFuture`** - Relative time checks
2. **`isWeekend` / `isWeekday`** - Day type checks
3. **`min` / `max`** - Array operations
4. **`differenceInCalendarDays`** - Calendar differences
5. **`fromUnixTime` / `getUnixTime`** - Unix timestamp conversion
6. **`getDayOfYear`** - Day of year getter
7. **`getWeek`** - ISO week number

### Low Priority (Nice to Have)

1. **`isToday` / `isYesterday` / `isTomorrow`** - Can be built from existing functions
2. **`isSameDay` / `isSameMonth`** - Convenience wrappers around `equals`
3. **`eachDayOfInterval`** - Can use `range` with `unit: 'day'`
4. **`setDate` / `setMonth`** - Can use `set` with single property
5. **`every`** - Advanced interval filtering

## Implementation Notes

- All functions should follow existing patterns:
  - Accept `DateInput` (string | number | Date | ZonedDateTime)
  - Support `DateOptions` (timeZone, calendar)
  - Use Temporal API internally
  - Return appropriate types (boolean, number, array, etc.)

- Consider creating a `range` function that's flexible enough to replace multiple "each\*" functions

- `ceil` should mirror `round` but always round up instead of nearest

- `clamp` should work with the existing `Range` type
