---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:272](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L272)

## Extends

- `CalendarActions`\<`TResource`, `TEvent`\>.`CalendarState`\<`TResource`, `TEvent`\>

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

Defined in: [calendar/calendar.ts:269](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L269)

#### Inherited from

```ts
CalendarState.activeDate
```

***

### addEvent()

```ts
addEvent: (event, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:168](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L168)

#### Parameters

##### event

`TEvent`

##### options?

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Inherited from

```ts
CalendarActions.addEvent
```

***

### canGoNextPeriod()

```ts
canGoNextPeriod: () => boolean;
```

Defined in: [calendar/calendar.ts:126](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L126)

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

Defined in: [calendar/calendar.ts:124](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L124)

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canGoPreviousPeriod
```

***

### canRedo()

```ts
canRedo: () => boolean;
```

Defined in: [calendar/calendar.ts:226](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L226)

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canRedo
```

***

### canUndo()

```ts
canUndo: () => boolean;
```

Defined in: [calendar/calendar.ts:224](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L224)

#### Returns

`boolean`

#### Inherited from

```ts
CalendarActions.canUndo
```

***

### changeViewMode()

```ts
changeViewMode: (newViewMode) => void;
```

Defined in: [calendar/calendar.ts:137](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L137)

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

### createDependency()

```ts
createDependency: (sourceId, targetId, type?) => object;
```

Defined in: [calendar/calendar.ts:241](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L241)

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### type?

[`DependencyType`](../type-aliases/DependencyType.md)

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

#### Inherited from

```ts
CalendarActions.createDependency
```

***

### currentPeriod

```ts
currentPeriod: string;
```

Defined in: [calendar/calendar.ts:263](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L263)

#### Inherited from

```ts
CalendarState.currentPeriod
```

***

### days

```ts
days: Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:267](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L267)

#### Inherited from

```ts
CalendarState.days
```

***

### editEvent()

```ts
editEvent: (eventId, updates, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:173](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L173)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options?

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Inherited from

```ts
CalendarActions.editEvent
```

***

### editRecurringEvent()

```ts
editRecurringEvent: (eventId, updates, options) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:179](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L179)

#### Parameters

##### eventId

`string`

##### updates

`Partial`\<`Omit`\<`TEvent`, `"id"`\>\>

##### options

###### dependsOn?

[`EventDependency`](EventDependency.md)[]

###### occurrenceStart?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

###### scope

[`RecurrenceEditScope`](../type-aliases/RecurrenceEditScope.md)

#### Returns

`Promise`\<[`SaveEventResult`](../type-aliases/SaveEventResult.md)\>

#### Inherited from

```ts
CalendarActions.editRecurringEvent
```

***

### fetchEventsForRange()

```ts
fetchEventsForRange: (start, end) => Promise<void>;
```

Defined in: [calendar/calendar.ts:247](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L247)

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

```ts
CalendarActions.fetchEventsForRange
```

***

### formatCurrentPeriod()

```ts
formatCurrentPeriod: (options?) => string;
```

Defined in: [calendar/calendar.ts:212](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L212)

#### Parameters

##### options?

###### locale?

`string`

#### Returns

`string`

#### Inherited from

```ts
CalendarActions.formatCurrentPeriod
```

***

### formatPeriodLabel()

```ts
formatPeriodLabel: (options?) => string;
```

Defined in: [calendar/calendar.ts:210](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L210)

#### Parameters

##### options?

###### locale?

`string`

#### Returns

`string`

#### Inherited from

```ts
CalendarActions.formatPeriodLabel
```

***

### getAllDayEventsByDate()

```ts
getAllDayEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/calendar.ts:166](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L166)

#### Parameters

##### date

`string`

#### Returns

`TEvent`[]

#### Inherited from

```ts
CalendarActions.getAllDayEventsByDate
```

***

### getDaysInRange()

```ts
getDaysInRange: (start, end) => Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:216](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L216)

#### Parameters

##### start

`string`

##### end

`string`

#### Returns

[`Day`](../type-aliases/Day.md)\<`TResource`, `TEvent`\>[]

#### Inherited from

```ts
CalendarActions.getDaysInRange
```

***

### getDaysNames()

```ts
getDaysNames: (weekday?) => string[];
```

Defined in: [calendar/calendar.ts:152](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L152)

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
getEventProps: (event, layoutOptions?) => object;
```

Defined in: [calendar/calendar.ts:139](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L139)

#### Parameters

##### event

`TEvent`

##### layoutOptions?

[`LayoutOptions`](LayoutOptions.md)

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

#### Inherited from

```ts
CalendarActions.getEventProps
```

***

### getEvents()

```ts
getEvents: () => TEvent[];
```

Defined in: [calendar/calendar.ts:218](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L218)

#### Returns

`TEvent`[]

#### Inherited from

```ts
CalendarActions.getEvents
```

***

### getEventsByDate()

```ts
getEventsByDate: (date) => TEvent[];
```

Defined in: [calendar/calendar.ts:164](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L164)

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

### getEventsByResource()

```ts
getEventsByResource: () => Map<TResource["id"], TEvent[]>;
```

Defined in: [calendar/calendar.ts:206](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L206)

#### Returns

`Map`\<`TResource`\[`"id"`\], `TEvent`[]\>

#### Inherited from

```ts
CalendarActions.getEventsByResource
```

***

### getEventSegmentInfo()

```ts
getEventSegmentInfo: (event) => SegmentInfo;
```

Defined in: [calendar/calendar.ts:214](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L214)

#### Parameters

##### event

`TEvent`

#### Returns

[`SegmentInfo`](SegmentInfo.md)

#### Inherited from

```ts
CalendarActions.getEventSegmentInfo
```

***

### getMasterEvent()

```ts
getMasterEvent: (event) => TEvent;
```

Defined in: [calendar/calendar.ts:135](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L135)

#### Parameters

##### event

`TEvent`

#### Returns

`TEvent`

#### Inherited from

```ts
CalendarActions.getMasterEvent
```

***

### getTimelineLayout()

```ts
getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
```

Defined in: [calendar/calendar.ts:208](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L208)

#### Returns

[`TimelineLayout`](TimelineLayout.md)\<`TResource`, `TEvent`\>

#### Inherited from

```ts
CalendarActions.getTimelineLayout
```

***

### getTimeSlots()

```ts
getTimeSlots: (options?) => TimeSlot[];
```

Defined in: [calendar/calendar.ts:160](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L160)

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

Defined in: [calendar/calendar.ts:199](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L199)

#### Parameters

##### date

`string`

##### options?

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

Defined in: [calendar/calendar.ts:120](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L120)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToCurrentPeriod
```

***

### goToNextOccurrence()

```ts
goToNextOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/calendar.ts:128](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L128)

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToNextOccurrence
```

***

### goToNextPeriod()

```ts
goToNextPeriod: () => void;
```

Defined in: [calendar/calendar.ts:118](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L118)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToNextPeriod
```

***

### goToPreviousOccurrence()

```ts
goToPreviousOccurrence: (eventId, fromDate?) => void;
```

Defined in: [calendar/calendar.ts:130](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L130)

#### Parameters

##### eventId

`string`

##### fromDate?

[`EventDateTimeInput`](../type-aliases/EventDateTimeInput.md)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.goToPreviousOccurrence
```

***

### goToPreviousPeriod()

```ts
goToPreviousPeriod: () => void;
```

Defined in: [calendar/calendar.ts:116](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L116)

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

Defined in: [calendar/calendar.ts:122](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L122)

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

Defined in: [calendar/calendar.ts:154](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L154)

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

### redo()

```ts
redo: () => void;
```

Defined in: [calendar/calendar.ts:222](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L222)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.redo
```

***

### removeEvent()

```ts
removeEvent: (id) => void;
```

Defined in: [calendar/calendar.ts:197](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L197)

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

### removeRecurringEvent()

```ts
removeRecurringEvent: (eventId, options) => void;
```

Defined in: [calendar/calendar.ts:189](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L189)

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

#### Inherited from

```ts
CalendarActions.removeRecurringEvent
```

***

### setEvents()

```ts
setEvents: (events) => void;
```

Defined in: [calendar/calendar.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L256)

#### Parameters

##### events

`TEvent`[] | `null`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.setEvents
```

***

### setResources()

```ts
setResources: (resources) => void;
```

Defined in: [calendar/calendar.ts:255](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L255)

#### Parameters

##### resources

`TResource`[] | `null`

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.setResources
```

***

### undo()

```ts
undo: () => void;
```

Defined in: [calendar/calendar.ts:220](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L220)

#### Returns

`void`

#### Inherited from

```ts
CalendarActions.undo
```

***

### validateEventDependencies()

```ts
validateEventDependencies: (event, dependsOn) => object;
```

Defined in: [calendar/calendar.ts:236](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L236)

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

[`EventDependency`](EventDependency.md)[]

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

#### Inherited from

```ts
CalendarActions.validateEventDependencies
```

***

### validateEventPlacement()

```ts
validateEventPlacement: (event) => object;
```

Defined in: [calendar/calendar.ts:249](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L249)

#### Parameters

##### event

###### end

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

#### Inherited from

```ts
CalendarActions.validateEventPlacement
```

***

### validateMove()

```ts
validateMove: (eventId, newStart, newEnd, newResources?, newConsumption?) => object;
```

Defined in: [calendar/calendar.ts:228](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L228)

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

#### Inherited from

```ts
CalendarActions.validateMove
```

***

### viewMode

```ts
viewMode: ViewMode;
```

Defined in: [calendar/calendar.ts:265](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L265)

#### Inherited from

```ts
CalendarState.viewMode
```
