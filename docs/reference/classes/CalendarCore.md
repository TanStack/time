---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:319](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L319)

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

Defined in: [calendar/calendar.ts:375](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L375)

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

Defined in: [calendar/calendar.ts:326](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L326)

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

Defined in: [calendar/calendar.ts:1372](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1372)

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

Defined in: [calendar/calendar.ts:923](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L923)

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

Defined in: [calendar/calendar.ts:919](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L919)

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

Defined in: [calendar/calendar.ts:972](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L972)

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

Defined in: [calendar/calendar.ts:984](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L984)

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

Defined in: [calendar/calendar.ts:1546](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1546)

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

Defined in: [calendar/calendar.ts:1190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1190)

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

Defined in: [calendar/calendar.ts:1426](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1426)

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

Defined in: [calendar/calendar.ts:1524](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1524)

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

Defined in: [calendar/calendar.ts:619](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L619)

#### Returns

`void`

***

### fetchEventsForRange()

```ts
fetchEventsForRange(start, end): Promise<void>;
```

Defined in: [calendar/calendar.ts:729](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L729)

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

Defined in: [calendar/calendar.ts:800](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L800)

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

Defined in: [calendar/calendar.ts:781](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L781)

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

Defined in: [calendar/calendar.ts:880](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L880)

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

Defined in: [calendar/calendar.ts:566](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L566)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDaysInRange()

```ts
getDaysInRange(start, end): object[];
```

Defined in: [calendar/calendar.ts:687](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L687)

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

Defined in: [calendar/calendar.ts:683](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L683)

#### Returns

`object`[]

***

### getEventProps()

```ts
getEventProps(event, layoutOptions?): object;
```

Defined in: [calendar/calendar.ts:826](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L826)

#### Parameters

##### event

`TEvent`

##### layoutOptions?

[`LayoutOptions`](../interfaces/LayoutOptions.md)

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

##### layout?

```ts
optional layout: EventLayout;
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
optional style: LayoutStyle;
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

Defined in: [calendar/calendar.ts:1135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1135)

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

Defined in: [calendar/calendar.ts:868](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L868)

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

Defined in: [calendar/calendar.ts:1669](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1669)

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

Defined in: [calendar/calendar.ts:813](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L813)

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

Defined in: [calendar/calendar.ts:725](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L725)

#### Returns

readonly `object`[]

***

### getMasterEvent()

```ts
getMasterEvent(event): TEvent;
```

Defined in: [calendar/calendar.ts:1129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1129)

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

Defined in: [calendar/calendar.ts:1673](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1673)

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

Defined in: [calendar/calendar.ts:864](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L864)

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

Defined in: [calendar/calendar.ts:1610](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1610)

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

Defined in: [calendar/calendar.ts:1568](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1568)

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

Defined in: [calendar/calendar.ts:1182](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1182)

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

Defined in: [calendar/calendar.ts:1186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1186)

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

Defined in: [calendar/calendar.ts:846](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L846)

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

Defined in: [calendar/calendar.ts:965](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L965)

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

Defined in: [calendar/calendar.ts:1554](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1554)

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

Defined in: [calendar/calendar.ts:1536](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1536)

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

Defined in: [calendar/calendar.ts:2228](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2228)

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

Defined in: [calendar/calendar.ts:2221](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L2221)

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

Defined in: [calendar/calendar.ts:958](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L958)

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

Defined in: [calendar/calendar.ts:1324](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1324)

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

Defined in: [calendar/calendar.ts:1331](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1331)

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

Defined in: [calendar/calendar.ts:1196](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1196)

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

Defined in: [calendar/calendar.ts:1775](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1775)

#### Parameters

##### options

[`ValidateResizeOptions`](../interfaces/ValidateResizeOptions.md)

#### Returns

[`ValidateResizeResult`](../interfaces/ValidateResizeResult.md)
