---
id: CalendarCore
title: CalendarCore
---

# Class: CalendarCore\<TFeatures, TResource, TEvent\>

Defined in: [calendar/calendar.ts:203](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L203)

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

Defined in: [calendar/calendar.ts:251](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L251)

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

Defined in: [calendar/date-core.ts:107](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L107)

#### Inherited from

[`DateCore`](DateCore.md).[`calendarId`](DateCore.md#calendarid)

***

### formatters

```ts
formatters: object;
```

Defined in: [calendar/date-core.ts:109](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L109)

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

Defined in: [calendar/calendar.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L211)

#### Overrides

[`DateCore`](DateCore.md).[`options`](DateCore.md#options)

***

### store

```ts
store: Store<CalendarStore>;
```

Defined in: [calendar/date-core.ts:104](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L104)

#### Inherited from

[`DateCore`](DateCore.md).[`store`](DateCore.md#store)

***

### timeZoneId

```ts
timeZoneId: string;
```

Defined in: [calendar/date-core.ts:108](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L108)

#### Inherited from

[`DateCore`](DateCore.md).[`timeZoneId`](DateCore.md#timezoneid)

## Accessors

### activeDatePlain

#### Get Signature

```ts
get protected activeDatePlain(): PlainDate;
```

Defined in: [calendar/date-core.ts:170](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L170)

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

Defined in: [calendar/date-core.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L174)

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

Defined in: [calendar/calendar.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L225)

##### Returns

[`ComposedApi`](../type-aliases/ComposedApi.md)\<`TFeatures`, `TResource`, `TEvent`\>

## Methods

### addEvent()

```ts
addEvent(event, options?): Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:1143](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1143)

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

Defined in: [calendar/date-core.ts:525](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L525)

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

Defined in: [calendar/date-core.ts:494](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L494)

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

Defined in: [calendar/date-core.ts:343](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L343)

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

Defined in: [calendar/calendar.ts:927](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L927)

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

Defined in: [calendar/calendar.ts:948](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L948)

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

Defined in: [calendar/calendar.ts:1207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1207)

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

Defined in: [calendar/calendar.ts:763](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L763)

#### Returns

`void`

***

### fetchEventsForRange()

```ts
fetchEventsForRange(start, end): Promise<void>;
```

Defined in: [calendar/calendar.ts:823](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L823)

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

Defined in: [calendar/calendar.ts:841](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L841)

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

Defined in: [calendar/date-core.ts:203](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L203)

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

Defined in: [calendar/date-core.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L211)

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

Defined in: [calendar/date-core.ts:186](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L186)

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

Defined in: [calendar/calendar.ts:827](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L827)

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

Defined in: [calendar/date-core.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L207)

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

Defined in: [calendar/calendar.ts:883](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L883)

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

Defined in: [calendar/calendar.ts:648](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L648)

#### Returns

`PlainDate`[]

#### Overrides

[`DateCore`](DateCore.md).[`getCalendarDays`](DateCore.md#getcalendardays)

***

### getDateParts()

```ts
getDateParts(date, options?): DateParts;
```

Defined in: [calendar/date-core.ts:178](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L178)

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

Defined in: [calendar/calendar.ts:779](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L779)

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

Defined in: [calendar/date-core.ts:326](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L326)

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

Defined in: [calendar/calendar.ts:775](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L775)

#### Returns

`object`[]

***

### getEvents()

```ts
getEvents(): TEvent[];
```

Defined in: [calendar/calendar.ts:1012](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1012)

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

Defined in: [calendar/calendar.ts:871](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L871)

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

Defined in: [calendar/date-core.ts:215](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L215)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfMonth`](DateCore.md#getfirstdayofmonth)

***

### getFirstDayOfWeek()

```ts
protected getFirstDayOfWeek(): PlainDate;
```

Defined in: [calendar/date-core.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L223)

#### Returns

`PlainDate`

#### Inherited from

[`DateCore`](DateCore.md).[`getFirstDayOfWeek`](DateCore.md#getfirstdayofweek)

***

### getLoadedRanges()

```ts
getLoadedRanges(): readonly object[];
```

Defined in: [calendar/calendar.ts:819](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L819)

#### Returns

readonly `object`[]

***

### getTimeSlots()

```ts
getTimeSlots(options?): TimeSlot[];
```

Defined in: [calendar/calendar.ts:867](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L867)

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

Defined in: [calendar/date-core.ts:230](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L230)

#### Returns

`number`

#### Inherited from

[`DateCore`](DateCore.md).[`getWeekStartsOn`](DateCore.md#getweekstartson)

***

### goToCurrentPeriod()

```ts
goToCurrentPeriod(): void;
```

Defined in: [calendar/date-core.ts:453](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L453)

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

Defined in: [calendar/date-core.ts:405](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L405)

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

Defined in: [calendar/date-core.ts:357](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L357)

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

Defined in: [calendar/date-core.ts:473](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L473)

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

Defined in: [calendar/calendar.ts:848](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L848)

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

Defined in: [calendar/calendar.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L229)

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

Defined in: [calendar/calendar.ts:1320](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1320)

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

Defined in: [calendar/calendar.ts:1340](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1340)

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

Defined in: [calendar/calendar.ts:1334](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1334)

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

Defined in: [calendar/date-core.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/date-core.ts#L166)

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

Defined in: [calendar/calendar.ts:1022](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L1022)

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
