---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L235)

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

Defined in: [calendar/calendar.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L255)

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

Defined in: [calendar/calendar.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L242)

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

Defined in: [calendar/calendar.ts:649](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L649)

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

Defined in: [calendar/date-core.ts:446](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L446)

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

Defined in: [calendar/date-core.ts:415](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L415)

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

Defined in: [calendar/date-core.ts:266](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L266)

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

### createDependency()

```ts
createDependency(sourceId, targetId): object;
```

Defined in: [calendar/calendar.ts:1183](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1183)

Creates a dependency link from source to target event.
If the target event starts before the source event ends, it will optionally reschedule the target.

#### Parameters

##### sourceId

`string`

##### targetId

`string`

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### error?

```ts
optional error: ResizeError;
```

#### Implementation of

```ts
CalendarActions.createDependency
```

***

### ensureRangeLoaded()

```ts
ensureRangeLoaded(): void;
```

Defined in: [calendar/calendar.ts:493](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L493)

Triggers the lazy-loading flow if the current viewport haven't been fetched yet.
This is intended to be used by side-effect hooks (like useEffect in React)
to avoid triggering fetches during the render cycle.

#### Returns

`void`

***

### formatDate()

```ts
formatDate(date): string;
```

Defined in: [calendar/date-core.ts:132](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L132)

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

Defined in: [calendar/date-core.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L140)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

#### Inherited from

[`DateCore`](DateCore.md).[`formatDateTime`](DateCore.md#formatdatetime)

***

### formatPeriodLabel()

```ts
formatPeriodLabel(options?): string;
```

Defined in: [calendar/calendar.ts:587](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L587)

Returns a human-readable label for the currently visible date range.

#### Parameters

##### options?

###### locale?

`string`

#### Returns

`string`

#### Implementation of

```ts
CalendarActions.formatPeriodLabel
```

***

### formatTime()

```ts
formatTime(date): string;
```

Defined in: [calendar/date-core.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L136)

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

Defined in: [calendar/calendar.ts:385](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L385)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDaysNames()

```ts
getDaysNames(weekday): string[];
```

Defined in: [calendar/date-core.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L255)

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

Defined in: [calendar/calendar.ts:560](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L560)

#### Returns

`object`[]

***

### getEventProps()

```ts
getEventProps(event): object;
```

Defined in: [calendar/calendar.ts:606](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L606)

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

### getEvents()

```ts
getEvents(): TEvent[];
```

Defined in: [calendar/calendar.ts:1014](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1014)

Returns a snapshot of all events currently managed by the calendar (including those outside the visible range).

#### Returns

`TEvent`[]

#### Implementation of

```ts
CalendarActions.getEvents
```

***

### getEventsByDate()

```ts
getEventsByDate(date): TEvent[];
```

Defined in: [calendar/calendar.ts:639](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L639)

Retrieves events for a specific date.
Uses _dateIndex for O(1) date lookup, then resolves each id via _eventMap.
Multi-day events that span onto this date are still found via getEventMap.

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

### getEventsByResource()

```ts
getEventsByResource(): Map<TResource["id"], TEvent[]>;
```

Defined in: [calendar/calendar.ts:1523](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1523)

Groups visible events by resource, merging multi-day segments back to full-span events.

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

#### Implementation of

```ts
CalendarActions.getEventsByResource
```

***

### getFirstDayOfMonth()

```ts
protected getFirstDayOfMonth(): PlainDate;
```

Defined in: [calendar/date-core.ts:144](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L144)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfMonth`](DateCore.md#getfirstdayofmonth)

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L152)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfWeek`](DateCore.md#getfirstdayofweek)

***

### getLoadedRanges()

```ts
getLoadedRanges(): readonly object[];
```

Defined in: [calendar/calendar.ts:583](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L583)

Returns the list of date ranges that have already been fetched. Useful for testing.

#### Returns

readonly `object`[]

***

### getTimelineLayout()

```ts
getTimelineLayout(): TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:1527](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1527)

Computes horizontal timeline layout with event positions, lane assignments, and current time marker.

#### Returns

[`TimelineLayout`](../interfaces/TimelineLayout.md)\<`TResource`, `TEvent`\>

#### Implementation of

```ts
CalendarActions.getTimelineLayout
```

***

### getTimeSlots()

```ts
getTimeSlots(options?): TimeSlot[];
```

Defined in: [calendar/calendar.ts:630](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L630)

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

Defined in: [calendar/calendar.ts:1395](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1395)

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

Defined in: [calendar/calendar.ts:1283](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1283)

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

Defined in: [calendar/date-core.ts:159](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L159)

#### Returns

`number`

#### Inherited from

[`DateCore`](DateCore.md).[`getWeekStartsOn`](DateCore.md#getweekstartson)

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:376](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L376)

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

Defined in: [calendar/date-core.ts:328](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L328)

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

Defined in: [calendar/date-core.ts:280](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L280)

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

Defined in: [calendar/date-core.ts:394](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L394)

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

Defined in: [calendar/calendar.ts:612](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L612)

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

Defined in: [calendar/calendar.ts:1257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1257)

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

Defined in: [calendar/calendar.ts:670](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L670)

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

***

### validateEventDependencies()

```ts
validateEventDependencies(event, dependsOn): object;
```

Defined in: [calendar/calendar.ts:1147](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1147)

Validates if placing an event with a specific start time satisfies all dependency constraints.

#### Parameters

##### event

###### end

`string`

###### id?

`string`

###### start

`string`

###### title

`string`

##### dependsOn

`string`[]

#### Returns

`object`

##### error?

```ts
optional error: ResizeError;
```

##### valid

```ts
valid: boolean;
```

#### Implementation of

```ts
CalendarActions.validateEventDependencies
```

***

### validateMove()

```ts
validateMove(
   eventId, 
   newStart, 
   newEnd, 
   newResources?): object;
```

Defined in: [calendar/calendar.ts:1026](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1026)

Validates whether moving `eventId` to `[newStart, newEnd]` and cascading
all finish-to-start dependents would violate any resource availability.

Returns `{ blocked: false }` when the move is safe, or
`{ blocked: true, message, blockedEventTitle }` when it would land in
an unavailable zone (either for the event itself or for a downstream dependent).

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

##### newResources?

`TResource`[]

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### blockedEventTitle?

```ts
optional blockedEventTitle: string;
```

##### message?

```ts
optional message: string;
```

#### Implementation of

```ts
CalendarActions.validateMove
```

***

### validateResize()

```ts
validateResize(options): ValidateResizeResult;
```

Defined in: [calendar/calendar.ts:1821](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1821)

#### Parameters

##### options

[`ValidateResizeOptions`](../interfaces/ValidateResizeOptions.md)

#### Returns

[`ValidateResizeResult`](../interfaces/ValidateResizeResult.md)
