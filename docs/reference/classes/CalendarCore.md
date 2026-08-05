---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:291](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L291)

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

Defined in: [calendar/calendar.ts:350](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L350)

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

Defined in: [calendar/date-core.ts:82](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L82)

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

Defined in: [calendar/calendar.ts:298](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L298)

#### Overrides

[`DateCore`](DateCore.md).[`options`](DateCore.md#options)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:80](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L80)

#### Inherited from

[`DateCore`](DateCore.md).[`store`](DateCore.md#store)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:137](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L137)

##### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`activeDatePlain`](DateCore.md#activedateplain)

***

### currentPeriodPlain

#### Get Signature

```ts
get protected currentPeriodPlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:141](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L141)

##### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`currentPeriodPlain`](DateCore.md#currentperiodplain)

## Methods

### addEvent()

```ts
addEvent(event, options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1338](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1338)

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

Defined in: [calendar/date-core.ts:459](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L459)

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

Defined in: [calendar/date-core.ts:428](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L428)

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

Defined in: [calendar/calendar.ts:889](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L889)

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

Defined in: [calendar/calendar.ts:885](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L885)

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

Defined in: [calendar/date-core.ts:279](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L279)

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

Defined in: [calendar/calendar.ts:938](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L938)

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

Defined in: [calendar/calendar.ts:950](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L950)

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

Defined in: [calendar/calendar.ts:1512](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1512)

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### type

[`DependencyType`](../type-aliases/DependencyType.md) = `"FS"`

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

Defined in: [calendar/calendar.ts:1156](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1156)

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

Defined in: [calendar/calendar.ts:1392](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1392)

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

### editRecurringEvent()

```ts
editRecurringEvent(
   eventId, 
   updates, 
options): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1490](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1490)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options

###### dependsOn?

[`EventDependency`](../interfaces/EventDependency.md)[]

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Implementation of

```ts
CalendarActions.editRecurringEvent
```

***

### ensureRangeLoaded()

```ts
ensureRangeLoaded(): void;
```

Defined in: [calendar/calendar.ts:610](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L610)

#### Returns

`void`

***

### fetchEventsForRange()

```ts
fetchEventsForRange(start, end): Promise<void>;
```

Defined in: [calendar/calendar.ts:720](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L720)

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

Defined in: [calendar/calendar.ts:791](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L791)

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

Defined in: [calendar/date-core.ts:145](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L145)

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

Defined in: [calendar/date-core.ts:153](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L153)

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

Defined in: [calendar/calendar.ts:772](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L772)

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

Defined in: [calendar/date-core.ts:149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L149)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

#### Inherited from

[`DateCore`](DateCore.md).[`formatTime`](DateCore.md#formattime)

***

### getAllDayEventsByDate()

```ts
getAllDayEventsByDate(date): TEvent[];
```

Defined in: [calendar/calendar.ts:846](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L846)

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Implementation of

```ts
CalendarActions.getAllDayEventsByDate
```

***

### getCalendarDays()

```ts
protected getCalendarDays(): PlainDate[];
```

Defined in: [calendar/calendar.ts:557](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L557)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDaysInRange()

```ts
getDaysInRange(start, end): object[];
```

Defined in: [calendar/calendar.ts:678](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L678)

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

Defined in: [calendar/date-core.ts:268](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L268)

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

Defined in: [calendar/calendar.ts:674](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L674)

#### Returns

`object`[]

***

### getEventProps()

```ts
getEventProps(event, layoutOptions?): EventProps<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:808](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L808)

#### Parameters

##### event

`TEvent`

##### layoutOptions?

[`LayoutOptions`](../interfaces/LayoutOptions.md)

#### Returns

[`EventProps`](../interfaces/EventProps.md)\<`TResource`, `TEvent`\>

#### Implementation of

```ts
CalendarActions.getEventProps
```

***

### getEvents()

```ts
getEvents(): TEvent[];
```

Defined in: [calendar/calendar.ts:1101](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1101)

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

Defined in: [calendar/calendar.ts:834](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L834)

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

Defined in: [calendar/calendar.ts:1607](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1607)

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

Defined in: [calendar/calendar.ts:804](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L804)

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

Defined in: [calendar/date-core.ts:157](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L157)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfMonth`](DateCore.md#getfirstdayofmonth)

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:165](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L165)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfWeek`](DateCore.md#getfirstdayofweek)

***

### getLoadedRanges()

```ts
getLoadedRanges(): readonly object[];
```

Defined in: [calendar/calendar.ts:716](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L716)

#### Returns

readonly `object`[]

***

### getMasterEvent()

```ts
getMasterEvent(event): TEvent;
```

Defined in: [calendar/calendar.ts:1095](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1095)

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

Defined in: [calendar/calendar.ts:1611](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1611)

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

Defined in: [calendar/calendar.ts:830](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L830)

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

Defined in: [calendar/calendar.ts:1576](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1576)

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

Defined in: [calendar/calendar.ts:1534](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1534)

#### Parameters

##### date

`string`

##### options?

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

Defined in: [calendar/date-core.ts:172](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L172)

#### Returns

`number`

#### Inherited from

[`DateCore`](DateCore.md).[`getWeekStartsOn`](DateCore.md#getweekstartson)

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:389](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L389)

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

Defined in: [calendar/calendar.ts:1148](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1148)

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

Defined in: [calendar/date-core.ts:341](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L341)

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

Defined in: [calendar/calendar.ts:1152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1152)

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

Defined in: [calendar/date-core.ts:293](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L293)

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

Defined in: [calendar/date-core.ts:407](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L407)

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

Defined in: [calendar/calendar.ts:812](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L812)

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

Defined in: [calendar/calendar.ts:931](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L931)

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

Defined in: [calendar/calendar.ts:1520](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1520)

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

### removeRecurringEvent()

```ts
removeRecurringEvent(eventId, options): void;
```

Defined in: [calendar/calendar.ts:1502](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1502)

#### Parameters

##### eventId

`string`

##### options

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.removeRecurringEvent
```

***

### setEvents()

```ts
setEvents(events): void;
```

Defined in: [calendar/calendar.ts:2118](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2118)

#### Parameters

##### events

`TEvent`[] | `null`

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.setEvents
```

***

### setResources()

```ts
setResources(resources): void;
```

Defined in: [calendar/calendar.ts:2111](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2111)

#### Parameters

##### resources

`TResource`[] | `null`

#### Returns

`void`

#### Implementation of

```ts
CalendarActions.setResources
```

***

### toPlainDate()

```ts
protected toPlainDate(isoDate): PlainDate;
```

Defined in: [calendar/date-core.ts:133](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L133)

#### Parameters

##### isoDate

`string`

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`toPlainDate`](DateCore.md#toplaindate)

***

### undo()

```ts
undo(): void;
```

Defined in: [calendar/calendar.ts:924](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L924)

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

Defined in: [calendar/calendar.ts:1290](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1290)

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

Defined in: [calendar/calendar.ts:1297](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1297)

#### Parameters

##### event

###### consumption?

`number`[]

###### end

`string`

###### id?

`string`

###### resources?

(`string` \| `TResource`)[]

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

Defined in: [calendar/calendar.ts:1162](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1162)

#### Parameters

##### eventId

`string`

##### newStart

`string`

##### newEnd

`string`

##### newResources?

(`string` \| `TResource`)[]

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

Defined in: [calendar/calendar.ts:1665](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1665)

#### Parameters

##### options

[`ValidateResizeOptions`](../interfaces/ValidateResizeOptions.md)

#### Returns

[`ValidateResizeResult`](../interfaces/ValidateResizeResult.md)
