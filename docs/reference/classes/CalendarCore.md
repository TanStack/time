---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TFeatures, TResource, TEvent\>

Defined in: [calendar/calendar.ts:188](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L188)

## Extends

- [`DateCore`](DateCore.md)

## Type Parameters

### TFeatures

`TFeatures` *extends* [`CalendarFeatureList`](../type-aliases/CalendarFeatureList.md)

### TResource

`TResource` *extends* [`Resource`](../interfaces/Resource.md) = [`Resource`](../interfaces/Resource.md)

### TEvent

`TEvent` *extends* [`Event`](../interfaces/Event.md)\<`TResource`\> = [`Event`](../interfaces/Event.md)\<`TResource`\>

## Implements

- `CalendarActions`\<`TResource`, `TEvent`\>

## Constructors

### Constructor

```ts
new CalendarCore<TFeatures, TResource, TEvent>(options): CalendarCore<TFeatures, TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:235](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L235)

#### Parameters

##### options

[`CalendarCoreOptions`](../interfaces/CalendarCoreOptions.md)\<`TFeatures`, `TResource`, `TEvent`\>

#### Returns

`CalendarCore`\<`TFeatures`, `TResource`, `TEvent`\>

#### Overrides

[`DateCore`](DateCore.md).[`constructor`](DateCore.md#constructor)

## Properties

### calendarId

```ts
calendarId: string;
```

Defined in: [calendar/date-core.ts:103](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L103)

#### Inherited from

[`DateCore`](DateCore.md).[`calendarId`](DateCore.md#calendarid)

***

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:105](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L105)

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
options: ParsedCalendarCoreOptions<TFeatures, TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:196](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L196)

#### Overrides

[`DateCore`](DateCore.md).[`options`](DateCore.md#options)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:100](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L100)

#### Inherited from

[`DateCore`](DateCore.md).[`store`](DateCore.md#store)

***

### timeZoneId

```ts
timeZoneId: string;
```

Defined in: [calendar/date-core.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L104)

#### Inherited from

[`DateCore`](DateCore.md).[`timeZoneId`](DateCore.md#timezoneid)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L166)

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

Defined in: [calendar/date-core.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L170)

##### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`currentPeriodPlain`](DateCore.md#currentperiodplain)

***

### featureApi

#### Get Signature

```ts
get featureApi(): ComposedApi<TFeatures, TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L210)

##### Returns

[`ComposedApi`](../type-aliases/ComposedApi.md)\<`TFeatures`, `TResource`, `TEvent`\>

## Methods

### addEvent()

```ts
addEvent(event, options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1058](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1058)

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

Defined in: [calendar/date-core.ts:499](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L499)

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

Defined in: [calendar/date-core.ts:468](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L468)

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

Defined in: [calendar/date-core.ts:319](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L319)

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

Defined in: [calendar/calendar.ts:874](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L874)

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

Defined in: [calendar/calendar.ts:892](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L892)

#### Parameters

##### id

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

#### Returns

`void`

***

### editEvent()

```ts
editEvent(
   eventId, 
   updates, 
options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1120)

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

Defined in: [calendar/calendar.ts:713](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L713)

#### Returns

`void`

***

### fetchEventsForRange()

```ts
fetchEventsForRange(start, end): Promise<void>;
```

Defined in: [calendar/calendar.ts:770](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L770)

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

Defined in: [calendar/calendar.ts:788](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L788)

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

Defined in: [calendar/date-core.ts:194](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L194)

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

Defined in: [calendar/date-core.ts:202](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L202)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

#### Returns

`string`

#### Inherited from

[`DateCore`](DateCore.md).[`formatDateTime`](DateCore.md#formatdatetime)

***

### formatPeriod()

```ts
formatPeriod(date?, options?): string;
```

Defined in: [calendar/date-core.ts:182](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L182)

#### Parameters

##### date?

[`DateInput`](../type-aliases/DateInput.md)

##### options?

[`FormatPeriodOptions`](../interfaces/FormatPeriodOptions.md)

#### Returns

`string`

#### Implementation of

```ts
CalendarActions.formatPeriod
```

#### Inherited from

[`DateCore`](DateCore.md).[`formatPeriod`](DateCore.md#formatperiod)

***

### formatPeriodLabel()

```ts
formatPeriodLabel(options?): string;
```

Defined in: [calendar/calendar.ts:774](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L774)

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

Defined in: [calendar/date-core.ts:198](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L198)

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

Defined in: [calendar/calendar.ts:830](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L830)

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

Defined in: [calendar/calendar.ts:604](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L604)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDateParts()

```ts
getDateParts(date, options?): DateParts;
```

Defined in: [calendar/date-core.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L174)

#### Parameters

##### date

[`DateInput`](../type-aliases/DateInput.md)

##### options?

[`GetDatePartsOptions`](../interfaces/GetDatePartsOptions.md)

#### Returns

[`DateParts`](../interfaces/DateParts.md)

#### Implementation of

```ts
CalendarActions.getDateParts
```

#### Inherited from

[`DateCore`](DateCore.md).[`getDateParts`](DateCore.md#getdateparts)

***

### getDaysInRange()

```ts
getDaysInRange(start, end): object[];
```

Defined in: [calendar/calendar.ts:729](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L729)

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

Defined in: [calendar/date-core.ts:302](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L302)

#### Parameters

##### weekday

`"short"` | `"long"`

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

Defined in: [calendar/calendar.ts:725](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L725)

#### Returns

`object`[]

***

### getEvents()

```ts
getEvents(): TEvent[];
```

Defined in: [calendar/calendar.ts:947](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L947)

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

Defined in: [calendar/calendar.ts:818](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L818)

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

Defined in: [calendar/date-core.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L206)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfMonth`](DateCore.md#getfirstdayofmonth)

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L212)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfWeek`](DateCore.md#getfirstdayofweek)

***

### getLoadedRanges()

```ts
getLoadedRanges(): readonly object[];
```

Defined in: [calendar/calendar.ts:766](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L766)

#### Returns

readonly `object`[]

***

### getTimeSlots()

```ts
getTimeSlots(options?): TimeSlot[];
```

Defined in: [calendar/calendar.ts:814](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L814)

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

### getWeekStartsOn()

```ts
getWeekStartsOn(): number;
```

Defined in: [calendar/date-core.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L216)

#### Returns

`number`

#### Inherited from

[`DateCore`](DateCore.md).[`getWeekStartsOn`](DateCore.md#getweekstartson)

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:429](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L429)

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

Defined in: [calendar/date-core.ts:381](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L381)

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

Defined in: [calendar/date-core.ts:333](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L333)

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

Defined in: [calendar/date-core.ts:449](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L449)

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

Defined in: [calendar/calendar.ts:795](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L795)

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

### hasFeature()

```ts
hasFeature(name): boolean;
```

Defined in: [calendar/calendar.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L214)

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### removeEvent()

```ts
removeEvent(id): void;
```

Defined in: [calendar/calendar.ts:1227](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1227)

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

### setEvents()

```ts
setEvents(events): void;
```

Defined in: [calendar/calendar.ts:1247](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1247)

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

Defined in: [calendar/calendar.ts:1241](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1241)

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

Defined in: [calendar/date-core.ts:162](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L162)

#### Parameters

##### isoDate

`string`

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`toPlainDate`](DateCore.md#toplaindate)

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

Defined in: [calendar/calendar.ts:957](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L957)

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
