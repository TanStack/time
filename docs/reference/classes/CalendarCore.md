---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:147](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L147)

## Extends

- [`DateCore`](DateCore.md)

## Type Parameters

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\>

## Implements

- `CalendarActions`\<`TResource`, `TEvent`\>

## Constructors

### Constructor

```ts
new CalendarCore<TResource, TEvent>(options): CalendarCore<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:156](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L156)

#### Parameters

##### options

[`CalendarCoreOptions`](../interfaces/CalendarCoreOptions.md)\<`TResource`, `TEvent`\>

#### Returns

`CalendarCore`\<`TResource`, `TEvent`\>

#### Overrides

[`DateCore`](DateCore.md).[`constructor`](DateCore.md#constructor)

## Properties

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:81](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L81)

#### date

```ts
date: DateTimeFormat;
```

#### dateTime

```ts
dateTime: DateTimeFormat;
```

#### time

```ts
time: DateTimeFormat;
```

#### Inherited from

[`DateCore`](DateCore.md).[`formatters`](DateCore.md#formatters)

***

### options

```ts
options: ParsedCalendarCoreOptions<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L154)

#### Overrides

[`DateCore`](DateCore.md).[`options`](DateCore.md#options)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:79](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L79)

#### Inherited from

[`DateCore`](DateCore.md).[`store`](DateCore.md#store)

## Methods

### addEvent()

```ts
addEvent(event): void;
```

Defined in: [calendar/calendar.ts:259](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L259)

Adds a new event to the calendar.

#### Parameters

##### event

`TEvent`

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.addEvent
```

***

### canGoNextPeriod()

```ts
canGoNextPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:445](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L445)

#### Returns

`boolean`

#### Implementation of

```ts
CalendarActions.canGoNextPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`canGoNextPeriod`](DateCore.md#cangonextperiod)

***

### canGoPreviousPeriod()

```ts
canGoPreviousPeriod(): boolean;
```

Defined in: [calendar/date-core.ts:414](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L414)

#### Returns

`boolean`

#### Implementation of

```ts
CalendarActions.canGoPreviousPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`canGoPreviousPeriod`](DateCore.md#cangopreviousperiod)

***

### changeViewMode()

```ts
changeViewMode(newViewMode): void;
```

Defined in: [calendar/date-core.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L265)

#### Parameters

##### newViewMode

[`ViewMode`](../interfaces/ViewMode.md)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.changeViewMode
```

#### Inherited from

[`DateCore`](DateCore.md).[`changeViewMode`](DateCore.md#changeviewmode)

***

### formatDate()

```ts
formatDate(date): string;
```

Defined in: [calendar/date-core.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L131)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

#### Inherited from

[`DateCore`](DateCore.md).[`formatDate`](DateCore.md#formatdate)

***

### formatDateTime()

```ts
formatDateTime(date): string;
```

Defined in: [calendar/date-core.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L139)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

#### Inherited from

[`DateCore`](DateCore.md).[`formatDateTime`](DateCore.md#formatdatetime)

***

### formatTime()

```ts
formatTime(date): string;
```

Defined in: [calendar/date-core.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L135)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

#### Inherited from

[`DateCore`](DateCore.md).[`formatTime`](DateCore.md#formattime)

***

### getCalendarDays()

```ts
protected getCalendarDays(): PlainDate[];
```

Defined in: [calendar/calendar.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L164)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:254](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L254)

#### Parameters

##### weekday

`"long"` | `"short"`

#### Returns

`string`[]

#### Implementation of

```ts
CalendarActions.getDaysNames
```

#### Inherited from

[`DateCore`](DateCore.md).[`getDaysNames`](DateCore.md#getdaysnames)

***

### getDaysWithEvents()

```ts
getDaysWithEvents(): object[];
```

Defined in: [calendar/calendar.ts:201](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L201)

#### Returns

`object`[]

***

### getEventProps()

```ts
getEventProps(event): object;
```

Defined in: [calendar/calendar.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L223)

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

#### Implementation of

```ts
CalendarActions.getEventProps
```

***

### getEventsByDate()

```ts
getEventsByDate(date): TEvent[];
```

Defined in: [calendar/calendar.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L251)

Retrieves events for a specific date.

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Implementation of

```ts
CalendarActions.getEventsByDate
```

***

### getFirstDayOfMonth()

```ts
protected getFirstDayOfMonth(): PlainDate;
```

Defined in: [calendar/date-core.ts:143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L143)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfMonth`](DateCore.md#getfirstdayofmonth)

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:151](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L151)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfWeek`](DateCore.md#getfirstdayofweek)

***

### getTimeSlots()

```ts
getTimeSlots(options?): TimeSlot[];
```

Defined in: [calendar/calendar.ts:247](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L247)

Retrieves time slots for day view with configurable intervals.

#### Parameters

##### options?

`TimeSlotOptions`

#### Returns

[`TimeSlot`](../interfaces/TimeSlot.md)[]

#### Implementation of

```ts
CalendarActions.getTimeSlots
```

***

### getUnavailabilityDetails()

```ts
getUnavailabilityDetails(
   date, 
   startMinutes, 
   endMinutes, 
   options?): object[];
```

Defined in: [calendar/calendar.ts:437](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L437)

Get detailed unavailability information for a specific time range on a date
Returns which resources are unavailable and why

#### Parameters

##### date

`string`

##### startMinutes

`number`

##### endMinutes

`number`

##### options?

###### resourceIds?

`TResource`\[`"id"`\][]

#### Returns

`object`[]

***

### getUnavailableRanges()

```ts
getUnavailableRanges(date, options?): UnavailableRange[];
```

Defined in: [calendar/calendar.ts:325](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L325)

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

[`UnavailableRange`](../interfaces/UnavailableRange.md)[]

#### Implementation of

```ts
CalendarActions.getUnavailableRanges
```

***

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L158)

#### Returns

`number`

#### Inherited from

[`DateCore`](DateCore.md).[`getWeekStartsOn`](DateCore.md#getweekstartson)

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:375](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L375)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.goToCurrentPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`goToCurrentPeriod`](DateCore.md#gotocurrentperiod)

***

### goToNextPeriod()

```ts
goToNextPeriod(): void;
```

Defined in: [calendar/date-core.ts:327](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L327)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.goToNextPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`goToNextPeriod`](DateCore.md#gotonextperiod)

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod(): void;
```

Defined in: [calendar/date-core.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L279)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.goToPreviousPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`goToPreviousPeriod`](DateCore.md#gotopreviousperiod)

***

### goToSpecificPeriod()

```ts
goToSpecificPeriod(date): void;
```

Defined in: [calendar/date-core.ts:393](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L393)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.goToSpecificPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`goToSpecificPeriod`](DateCore.md#gotospecificperiod)

***

### groupDaysBy()

```ts
groupDaysBy(__namedParameters): (Day<TResource, TEvent> | null)[][];
```

Defined in: [calendar/calendar.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L229)

Groups days by a specified unit.

#### Parameters

##### \_\_namedParameters

###### days

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[]

###### fillMissingDays?

`boolean` = `true`

###### unit

`"week"` \| `"workWeek"`

#### Returns

([`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\> \| `null`)[][]

#### Implementation of

```ts
CalendarActions.groupDaysBy
```

***

### removeEvent()

```ts
removeEvent(id): void;
```

Defined in: [calendar/calendar.ts:302](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L302)

Removes an event by ID.

#### Parameters

##### id

`string`

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.removeEvent
```

***

### updateEvent()

```ts
updateEvent(id, updates): void;
```

Defined in: [calendar/calendar.ts:277](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L277)

Updates an existing event by ID.

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.updateEvent
```
