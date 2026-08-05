---
id: CalendarApi
title: CalendarApi
---

# Interface: CalendarApi\<TResource, TEvent\>

Defined in: [calendar/calendar.ts:273](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L273)

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

Defined in: [calendar/calendar.ts:270](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L270)

#### Inherited from

```ts
CalendarState.activeDate
```

***

### addEvent()

```ts
addEvent: (event, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:169](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L169)

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

Defined in: [calendar/calendar.ts:127](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L127)

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

Defined in: [calendar/calendar.ts:125](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L125)

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

Defined in: [calendar/calendar.ts:227](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L227)

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

Defined in: [calendar/calendar.ts:225](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L225)

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

Defined in: [calendar/calendar.ts:138](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L138)

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

Defined in: [calendar/calendar.ts:242](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L242)

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

Defined in: [calendar/calendar.ts:264](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L264)

#### Inherited from

```ts
CalendarState.currentPeriod
```

***

### days

```ts
days: Day<TResource, TEvent>[];
```

Defined in: [calendar/calendar.ts:268](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L268)

#### Inherited from

```ts
CalendarState.days
```

***

### editEvent()

```ts
editEvent: (eventId, updates, options?) => Promise<SaveEventResult>;
```

Defined in: [calendar/calendar.ts:174](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L174)

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

Defined in: [calendar/calendar.ts:180](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L180)

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

Defined in: [calendar/calendar.ts:248](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L248)

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

Defined in: [calendar/calendar.ts:213](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L213)

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

Defined in: [calendar/calendar.ts:211](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L211)

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

Defined in: [calendar/calendar.ts:167](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L167)

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

Defined in: [calendar/calendar.ts:217](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L217)

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

Defined in: [calendar/calendar.ts:153](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L153)

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

Defined in: [calendar/calendar.ts:140](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L140)

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

Defined in: [calendar/calendar.ts:219](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L219)

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

Defined in: [calendar/calendar.ts:165](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L165)

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

Defined in: [calendar/calendar.ts:207](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L207)

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

Defined in: [calendar/calendar.ts:215](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L215)

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

Defined in: [calendar/calendar.ts:136](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L136)

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

Defined in: [calendar/calendar.ts:209](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L209)

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

Defined in: [calendar/calendar.ts:161](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L161)

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

Defined in: [calendar/calendar.ts:200](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L200)

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

Defined in: [calendar/calendar.ts:121](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L121)

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

Defined in: [calendar/calendar.ts:129](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L129)

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

Defined in: [calendar/calendar.ts:119](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L119)

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

Defined in: [calendar/calendar.ts:131](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L131)

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

Defined in: [calendar/calendar.ts:117](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L117)

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

Defined in: [calendar/calendar.ts:123](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L123)

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

Defined in: [calendar/calendar.ts:155](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L155)

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

Defined in: [calendar/calendar.ts:223](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L223)

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

Defined in: [calendar/calendar.ts:198](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L198)

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

Defined in: [calendar/calendar.ts:190](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L190)

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

Defined in: [calendar/calendar.ts:257](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L257)

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

Defined in: [calendar/calendar.ts:256](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L256)

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

Defined in: [calendar/calendar.ts:221](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L221)

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

Defined in: [calendar/calendar.ts:237](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L237)

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

Defined in: [calendar/calendar.ts:250](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L250)

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

Defined in: [calendar/calendar.ts:229](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L229)

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

Defined in: [calendar/calendar.ts:266](https://github.com/TanStack/time/blob/main/packages/time/src/calendar/calendar.ts#L266)

#### Inherited from

```ts
CalendarState.viewMode
```
