---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TFeatures, TResource, TEvent\>

Defined in: [calendar/calendar.ts:179](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L179)

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

Defined in: [calendar/calendar.ts:227](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L227)

#### Parameters

##### options

[`CalendarCoreOptions`](../interfaces/CalendarCoreOptions.md)\<`TFeatures`, `TResource`, `TEvent`\>

#### Returns

`CalendarCore`\<`TFeatures`, `TResource`, `TEvent`\>

#### Overrides

[`DateCore`](DateCore.md).[`constructor`](DateCore.md#constructor)

## Properties

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:83](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L83)

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

Defined in: [calendar/calendar.ts:187](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L187)

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

Defined in: [calendar/date-core.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L138)

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

Defined in: [calendar/date-core.ts:142](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L142)

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

Defined in: [calendar/calendar.ts:201](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L201)

##### Returns

[`ComposedApi`](../type-aliases/ComposedApi.md)\<`TFeatures`, `TResource`, `TEvent`\>

## Methods

### addEvent()

```ts
addEvent(event, options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:983](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L983)

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

Defined in: [calendar/date-core.ts:466](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L466)

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

Defined in: [calendar/date-core.ts:435](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L435)

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

Defined in: [calendar/date-core.ts:286](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L286)

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

Defined in: [calendar/calendar.ts:801](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L801)

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

Defined in: [calendar/calendar.ts:813](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L813)

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

Defined in: [calendar/calendar.ts:1037](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1037)

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

Defined in: [calendar/calendar.ts:634](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L634)

#### Returns

`void`

***

### fetchEventsForRange()

```ts
fetchEventsForRange(start, end): Promise<void>;
```

Defined in: [calendar/calendar.ts:692](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L692)

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

Defined in: [calendar/calendar.ts:715](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L715)

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

Defined in: [calendar/date-core.ts:146](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L146)

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

Defined in: [calendar/date-core.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L154)

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

Defined in: [calendar/calendar.ts:696](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L696)

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

Defined in: [calendar/date-core.ts:150](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L150)

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

Defined in: [calendar/calendar.ts:762](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L762)

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

Defined in: [calendar/calendar.ts:519](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L519)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDaysInRange()

```ts
getDaysInRange(start, end): object[];
```

Defined in: [calendar/calendar.ts:650](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L650)

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

Defined in: [calendar/date-core.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L269)

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

Defined in: [calendar/calendar.ts:646](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L646)

#### Returns

`object`[]

***

### getEvents()

```ts
getEvents(): TEvent[];
```

Defined in: [calendar/calendar.ts:868](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L868)

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

Defined in: [calendar/calendar.ts:750](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L750)

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

Defined in: [calendar/date-core.ts:158](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L158)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfMonth`](DateCore.md#getfirstdayofmonth)

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L166)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfWeek`](DateCore.md#getfirstdayofweek)

***

### getLoadedRanges()

```ts
getLoadedRanges(): readonly object[];
```

Defined in: [calendar/calendar.ts:688](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L688)

#### Returns

readonly `object`[]

***

### getTimeSlots()

```ts
getTimeSlots(options?): TimeSlot[];
```

Defined in: [calendar/calendar.ts:746](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L746)

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

Defined in: [calendar/date-core.ts:173](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L173)

#### Returns

`number`

#### Inherited from

[`DateCore`](DateCore.md).[`getWeekStartsOn`](DateCore.md#getweekstartson)

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:396](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L396)

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

Defined in: [calendar/date-core.ts:348](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L348)

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

Defined in: [calendar/date-core.ts:300](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L300)

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

Defined in: [calendar/date-core.ts:414](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L414)

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

Defined in: [calendar/calendar.ts:728](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L728)

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

Defined in: [calendar/calendar.ts:205](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L205)

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

Defined in: [calendar/calendar.ts:1135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1135)

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

Defined in: [calendar/calendar.ts:1155](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1155)

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

Defined in: [calendar/calendar.ts:1149](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1149)

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

Defined in: [calendar/date-core.ts:134](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L134)

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

Defined in: [calendar/calendar.ts:878](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L878)

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
