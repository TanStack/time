---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L126)

## Extends

- `CalendarActions`\<`TResource`, `TEvent`\>.`ConvertTemporalToString`\<`CalendarState`\<`TResource`, `TEvent`\>\>

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](Resource.md)

### TEvent

`TEvent` *extends* [`Event`](Event.md)\<`TResource`\>

## Properties

### activeDate

```ts
activeDate: string;
```

Defined in: [calendar/calendar.ts:119](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L119)

The currently active date in the calendar.

#### Inherited from

```ts
ConvertTemporalToString.activeDate
```

***

### addEvent()

```ts
addEvent: (event) => void;
```

Defined in: [calendar/calendar.ts:93](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L93)

Adds a new event to the calendar.

#### Parameters

##### event

`TEvent`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.addEvent
```

***

### canGoNextPeriod()

```ts
canGoNextPeriod: () => boolean;
```

Defined in: [calendar/calendar.ts:62](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L62)

Checks if navigation to the next period is allowed within the range.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canGoNextPeriod
```

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod: () => boolean;
```

Defined in: [calendar/calendar.ts:60](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L60)

Checks if navigation to the previous period is allowed within the range.

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canGoPreviousPeriod
```

***

### changeViewMode()

```ts
changeViewMode: (newViewMode) => void;
```

Defined in: [calendar/calendar.ts:64](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L64)

Changes the current view mode of the calendar.

#### Parameters

##### newViewMode

[`ViewMode`](ViewMode.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.changeViewMode
```

***

### currentPeriod

```ts
currentPeriod: string;
```

Defined in: [calendar/calendar.ts:113](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L113)

The currently focused date period in the calendar.

#### Inherited from

```ts
ConvertTemporalToString.currentPeriod
```

***

### days

```ts
days: Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:117](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L117)

An array of days, each potentially containing events.

#### Inherited from

```ts
ConvertTemporalToString.days
```

***

### getDaysNames()

```ts
getDaysNames: (weekday?) => string[];
```

Defined in: [calendar/calendar.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L79)

Retrieves the names of the days of the week, based on the current locale.

#### Parameters

##### weekday?

`"long"` | `"short"`

#### Returns

`string`[]

#### Inherited from

```ts
CalendarActions.getDaysNames
```

***

### getEventProps()

```ts
getEventProps: (event) => object;
```

Defined in: [calendar/calendar.ts:66](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L66)

Retrieves styling properties for a specific event.

#### Parameters

##### event

`TEvent`

#### Returns

`object`

##### end

```ts
end: string;
```

##### isSplitEvent

```ts
isSplitEvent: boolean;
```

##### overlappingEvents

```ts
overlappingEvents: TEvent[];
```

##### start

```ts
start: string;
```

##### style?

```ts
optional style: object;
```

###### style.height

```ts
height: string;
```

###### style.left

```ts
left: string;
```

###### style.top

```ts
top: string;
```

###### style.width

```ts
width: string;
```

#### Inherited from

```ts
CalendarActions.getEventProps
```

***

### getEventsByDate()

```ts
getEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/calendar.ts:91](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L91)

Retrieves events for a specific date.

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Inherited from

```ts
CalendarActions.getEventsByDate
```

***

### getTimeSlots()

```ts
getTimeSlots: (options?) => TimeSlot[];
```

Defined in: [calendar/calendar.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L87)

Retrieves time slots for day view with configurable intervals.

#### Parameters

##### options?

`TimeSlotOptions`

#### Returns

[`TimeSlot`](TimeSlot.md)[]

#### Inherited from

```ts
CalendarActions.getTimeSlots
```

***

### getUnavailableRanges()

```ts
getUnavailableRanges: (date, options?) => UnavailableRange[];
```

Defined in: [calendar/calendar.ts:99](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L99)

Retrieves unavailable time ranges for a specific date based on resource availability.

#### Parameters

##### date

`string`

##### options?

###### containerHeight?

`number`

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

[`UnavailableRange`](UnavailableRange.md)[]

#### Inherited from

```ts
CalendarActions.getUnavailableRanges
```

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod: () => void;
```

Defined in: [calendar/calendar.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L56)

Resets the view to the current period based on today's date.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToCurrentPeriod
```

***

### goToNextPeriod()

```ts
goToNextPeriod: () => void;
```

Defined in: [calendar/calendar.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L54)

Navigates to the next period according to the current view mode.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToNextPeriod
```

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod: () => void;
```

Defined in: [calendar/calendar.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L52)

Navigates to the previous period according to the current view mode.

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToPreviousPeriod
```

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod: (date) => void;
```

Defined in: [calendar/calendar.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L58)

Navigates to a specific date.

#### Parameters

##### date

`string`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToSpecificPeriod
```

***

### groupDaysBy()

```ts
groupDaysBy: (props) => (Day<TResource, TEvent> | null)[][];
```

Defined in: [calendar/calendar.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L81)

Groups days by a specified unit.

#### Parameters

##### props

###### days

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[]

###### fillMissingDays?

`boolean`

###### unit

`"week"` \| `"workWeek"`

#### Returns

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[][]

#### Inherited from

```ts
CalendarActions.groupDaysBy
```

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/calendar.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L97)

Removes an event by ID.

#### Parameters

##### id

`string`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.removeEvent
```

***

### updateEvent()

```ts
updateEvent: (id, updates) => void;
```

Defined in: [calendar/calendar.ts:95](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L95)

Updates an existing event by ID.

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.updateEvent
```

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/calendar.ts:115](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L115)

The current view mode of the calendar.

#### Inherited from

```ts
ConvertTemporalToString.viewMode
```
