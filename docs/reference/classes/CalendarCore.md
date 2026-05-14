---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:314](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L314)

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

Defined in: [calendar/calendar.ts:345](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L345)

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

Defined in: [calendar/calendar.ts:321](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L321)

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
addEvent(event, options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1810](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1810)

Fetches events for the event's date range, validates placement
constraints, and adds the event if valid. Returns a result
indicating success or a validation error.

#### Parameters

##### event

`TEvent`

##### options?

###### dependsOn?

[`EventDependency`](../interfaces/EventDependency.md)[]

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

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

### canRedo()

```ts
canRedo(): boolean;
```

Defined in: [calendar/calendar.ts:878](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L878)

Returns true when there is at least one action to redo.

#### Returns

`boolean`

#### Implementation of

```ts
CalendarActions.canRedo
```

***

### canUndo()

```ts
canUndo(): boolean;
```

Defined in: [calendar/calendar.ts:874](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L874)

Returns true when there is at least one action to undo.

#### Returns

`boolean`

#### Implementation of

```ts
CalendarActions.canUndo
```

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

### commitAdd()

```ts
commitAdd(event): void;
```

Defined in: [calendar/calendar.ts:925](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L925)

#### Parameters

##### event

`TEvent`

#### Returns

`void`

***

### commitUpdate()

```ts
commitUpdate(id, updates): void;
```

Defined in: [calendar/calendar.ts:947](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L947)

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

***

### createDependency()

```ts
createDependency(
   sourceId, 
   targetId, 
   type): object;
```

Defined in: [calendar/calendar.ts:1962](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1962)

Creates a dependency link from source to target event.
If the target event starts before the source event ends, it will optionally reschedule the target.

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### type

[`DependencyType`](../type-aliases/DependencyType.md) = `'FS'`

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

### createResizeController()

```ts
createResizeController(options): ResizeController<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:1497](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1497)

#### Parameters

##### options

[`ResizeControllerOptions`](../interfaces/ResizeControllerOptions.md) = `{}`

#### Returns

[`ResizeController`](ResizeController.md)\<`TResource`, `TEvent`\>

***

### editEvent()

```ts
editEvent(
   eventId, 
   updates, 
options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1864](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1864)

Fetches events for the event's date range, validates move constraints
(and cascading dependents), and updates the event if valid.
Returns a result indicating success or a validation error.

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options?

###### dependsOn?

[`EventDependency`](../interfaces/EventDependency.md)[]

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Implementation of

```ts
CalendarActions.editEvent
```

***

### ensureRangeLoaded()

```ts
ensureRangeLoaded(): void;
```

Defined in: [calendar/calendar.ts:619](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L619)

#### Returns

`void`

***

### fetchEventsForRange()

```ts
fetchEventsForRange(start, end): Promise<void>;
```

Defined in: [calendar/calendar.ts:726](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L726)

Fetches events for an arbitrary date range from the configured
`fetchEvents` callback and merges them into the calendar.
Resolves immediately if `fetchEvents` is not configured or the range
is already loaded.

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

```ts
CalendarActions.fetchEventsForRange
```

***

### formatCurrentPeriod()

```ts
formatCurrentPeriod(options?): string;
```

Defined in: [calendar/calendar.ts:796](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L796)

Formats the current period as a human-readable "Month Year" string (e.g. "January 2024").

#### Parameters

##### options?

###### locale?

`string`

#### Returns

`string`

#### Implementation of

```ts
CalendarActions.formatCurrentPeriod
```

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

Defined in: [calendar/calendar.ts:777](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L777)

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

Defined in: [calendar/calendar.ts:527](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L527)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDaysInRange()

```ts
getDaysInRange(start, end): object[];
```

Defined in: [calendar/calendar.ts:690](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L690)

Returns Day objects for every date between `start` and `end` (inclusive),
derived freshly from the current event state. Use this when rendering a
buffered range that spans multiple periods (e.g. infinite scroll) so
mutations (add/edit/remove) are reflected without manual cache invalidation.

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

`object`[]

#### Implementation of

```ts
CalendarActions.getDaysInRange
```

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

Defined in: [calendar/calendar.ts:680](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L680)

#### Returns

`object`[]

***

### getEventProps()

```ts
getEventProps(event): object;
```

Defined in: [calendar/calendar.ts:822](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L822)

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

Defined in: [calendar/calendar.ts:1436](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1436)

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

Defined in: [calendar/calendar.ts:850](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L850)

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

### getEventsByResource()

```ts
getEventsByResource(): Map<TResource["id"], TEvent[]>;
```

Defined in: [calendar/calendar.ts:2282](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2282)

Groups visible events by resource, merging multi-day segments back to full-span events.

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

#### Implementation of

```ts
CalendarActions.getEventsByResource
```

***

### getEventSegmentInfo()

```ts
getEventSegmentInfo(event): SegmentInfo;
```

Defined in: [calendar/calendar.ts:809](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L809)

Returns segment info (split/occurrence metadata) for an event, normalising flexible datetime inputs.

#### Parameters

##### event

`TEvent`

#### Returns

[`SegmentInfo`](../interfaces/SegmentInfo.md)

#### Implementation of

```ts
CalendarActions.getEventSegmentInfo
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

Defined in: [calendar/calendar.ts:722](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L722)

#### Returns

readonly `object`[]

***

### getMasterEvent()

```ts
getMasterEvent(event): TEvent;
```

Defined in: [calendar/calendar.ts:1431](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1431)

Returns the master event for a given occurrence (or the event itself if it is already the master).

#### Parameters

##### event

`TEvent`

#### Returns

`TEvent`

#### Implementation of

```ts
CalendarActions.getMasterEvent
```

***

### getTimelineLayout()

```ts
getTimelineLayout(): TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:2286](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2286)

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

Defined in: [calendar/calendar.ts:846](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L846)

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

Defined in: [calendar/calendar.ts:2167](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2167)

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

Defined in: [calendar/calendar.ts:2078](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2078)

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

### goToNextOccurrence()

```ts
goToNextOccurrence(eventId, fromDate?): void;
```

Defined in: [calendar/calendar.ts:1448](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1448)

Navigates to the next occurrence of a recurring event after fromDate (defaults to activeDate).
No-op when the event is not recurring or has no future occurrences.

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.goToNextOccurrence
```

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

### goToPreviousOccurrence()

```ts
goToPreviousOccurrence(eventId, fromDate?): void;
```

Defined in: [calendar/calendar.ts:1472](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1472)

Navigates to the previous occurrence of a recurring event before fromDate (defaults to activeDate).
No-op when the event is not recurring or is already at the first occurrence.

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.goToPreviousOccurrence
```

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

Defined in: [calendar/calendar.ts:828](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L828)

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

### redo()

```ts
redo(): void;
```

Defined in: [calendar/calendar.ts:916](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L916)

Re-applies the last undone action.

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.redo
```

***

### removeEvent()

```ts
removeEvent(id): void;
```

Defined in: [calendar/calendar.ts:2051](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2051)

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

### undo()

```ts
undo(): void;
```

Defined in: [calendar/calendar.ts:907](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L907)

Reverts the last mutating action (commitAdd, commitUpdate, removeEvent).

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.undo
```

***

### validateEventDependencies()

```ts
validateEventDependencies(event, dependsOn): object;
```

Defined in: [calendar/calendar.ts:1712](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1712)

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

[`EventDependency`](../interfaces/EventDependency.md)[]

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

### validateEventPlacement()

```ts
validateEventPlacement(event): object;
```

Defined in: [calendar/calendar.ts:1769](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1769)

Validates whether a new event (not yet added to the calendar) can be
placed at the given time slot without violating resource availability.
Use this for standalone validation before manually committing events.

#### Parameters

##### event

###### consumption?

`number`[]

###### end

`string`

###### id?

`string`

###### resources?

`TResource`[]

###### start

`string`

###### title

`string`

#### Returns

`object`

##### blocked

```ts
blocked: boolean;
```

##### message?

```ts
optional message: string;
```

#### Implementation of

```ts
CalendarActions.validateEventPlacement
```

***

### validateMove()

```ts
validateMove(
   eventId, 
   newStart, 
   newEnd, 
   newResources?, 
   newConsumption?): object;
```

Defined in: [calendar/calendar.ts:1503](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1503)

Checks whether moving `eventId` to `[newStart, newEnd]` — and cascading
all finish-to-start dependents — would violate any resource availability.

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

##### newResources?

`TResource`[]

##### newConsumption?

`number`[]

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

Defined in: [calendar/calendar.ts:2572](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2572)

#### Parameters

##### options

[`ValidateResizeOptions`](../interfaces/ValidateResizeOptions.md)

#### Returns

[`ValidateResizeResult`](../interfaces/ValidateResizeResult.md)
