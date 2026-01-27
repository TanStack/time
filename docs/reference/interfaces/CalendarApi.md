---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:110](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L110)

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

Defined in: [calendar/calendar.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L103)

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

Defined in: [calendar/calendar.ts:85](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L85)

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

Defined in: [calendar/calendar.ts:54](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L54)

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

Defined in: [calendar/calendar.ts:52](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L52)

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

Defined in: [calendar/calendar.ts:56](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L56)

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

Defined in: [calendar/calendar.ts:97](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L97)

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

Defined in: [calendar/calendar.ts:101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L101)

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

Defined in: [calendar/calendar.ts:71](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L71)

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

Defined in: [calendar/calendar.ts:58](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L58)

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

Defined in: [calendar/calendar.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L83)

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

Defined in: [calendar/calendar.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L79)

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

### goToCurrentPeriod()

```ts
goToCurrentPeriod: () => void;
```

Defined in: [calendar/calendar.ts:48](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L48)

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

Defined in: [calendar/calendar.ts:46](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L46)

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

Defined in: [calendar/calendar.ts:44](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L44)

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

Defined in: [calendar/calendar.ts:50](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L50)

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

Defined in: [calendar/calendar.ts:73](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L73)

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

Defined in: [calendar/calendar.ts:89](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L89)

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

Defined in: [calendar/calendar.ts:87](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L87)

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

Defined in: [calendar/calendar.ts:99](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L99)

The current view mode of the calendar.

#### Inherited from

```ts
ConvertTemporalToString.viewMode
```
